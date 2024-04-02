package anthropic

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"one-api/common"

	"one-api/common/helper"
	"one-api/common/image"

	"one-api/common/logger"
	"one-api/relay/channel/openai"
	"one-api/relay/model"
	"strings"

	"github.com/gin-gonic/gin"
)

func stopReasonClaude2OpenAI(reason string) string {
	switch reason {
	case "stop_sequence":
		return "stop"
	case "max_tokens":
		return "length"
	default:
		return reason
	}
}

func ConvertRequest(textRequest model.GeneralOpenAIRequest) *Request {
	claudeRequest := Request{
		Model:         textRequest.Model,
		Messages:      []Message{},
		System:        "",
		MaxTokens:     textRequest.MaxTokens,
		StopSequences: nil,
		Temperature:   textRequest.Temperature,
		TopP:          textRequest.TopP,
		Stream:        textRequest.Stream,
	}
	if claudeRequest.MaxTokens == 0 {
		claudeRequest.MaxTokens = 4096
	}
	for _, message := range textRequest.Messages {
		if message.Role == "system" {
			claudeRequest.System = message.Content.(string)
			continue
		}
		content := Message{
			Role:    convertRole(message.Role),
			Content: []MessageContent{},
		}
		openaiContent := message.ParseContent()
		for _, part := range openaiContent {
			switch part.Type {
			case "text":
				content.Content = append(content.Content, MessageContent{
					Type: "text",
					Text: part.Text,
				})
			case "image":
				imageInfo, ok := part.ImageUrl.(model.MessageImageUrl)
				if !ok {
					log.Println("ImageUrl 类型断言失败")
					return nil
				}
				mimeType, data, err := image.GetImageClaudeUrl(imageInfo.Url)
				if err != nil {
					log.Println("图片URL无效或处理错误", err)
					return nil
				}
				content.Content = append(content.Content, MessageContent{
					Type: "image",
					Source: &ContentSource{
						Type:      "base64",
						MediaType: mimeType,
						Data:      data,
					},
				})
			}
		}
		claudeRequest.Messages = append(claudeRequest.Messages, content)
	}

	return &claudeRequest
}

func streamResponseClaude2OpenAI(claudeResponse *Response) *openai.ChatCompletionsStreamResponse {
	var choice openai.ChatCompletionsStreamResponseChoice
	choice.Delta.Content = claudeResponse.Content[0].Text
	finishReason := stopReasonClaude2OpenAI(claudeResponse.StopReason)
	if finishReason != "null" {
		choice.FinishReason = &finishReason
	}
	var response openai.ChatCompletionsStreamResponse
	response.Object = "chat.completion.chunk"
	response.Model = claudeResponse.Model
	response.Choices = []openai.ChatCompletionsStreamResponseChoice{choice}
	return &response
}

func responseClaude2OpenAI(claudeResponse *Response) *openai.TextResponse {
	content, _ := json.Marshal(strings.TrimPrefix(claudeResponse.Content[0].Text, " "))
	choice := openai.TextResponseChoice{
		Index: 0,
		Message: model.Message{
			Role:    "assistant",
			Content: content,
			Name:    nil,
		},
		FinishReason: stopReasonClaude2OpenAI(claudeResponse.StopReason),
	}
	fullTextResponse := openai.TextResponse{
		Id:      fmt.Sprintf("chatcmpl-%s", helper.GetUUID()),
		Object:  "chat.completion",
		Created: helper.GetTimestamp(),
		Choices: []openai.TextResponseChoice{choice},
	}
	return &fullTextResponse
}

func StreamHandler(c *gin.Context, resp *http.Response) (*model.ErrorWithStatusCode, string) {
	responseId := fmt.Sprintf("chatcmpl-%s", helper.GetUUID())
	createdTime := helper.GetTimestamp()
	scanner := bufio.NewScanner(resp.Body)
	responseText := ""
	dataChan := make(chan string)
	stopChan := make(chan bool)

	var modelName string // 存储模型名称
	var stopReason = ""  // 默认停止原因

	go func() {
		for scanner.Scan() {
			line := scanner.Text()
			if strings.HasPrefix(line, "data: ") {
				jsonData := line[6:] // 移除"data: "前缀以提取JSON字符串
				var event map[string]interface{}
				err := json.Unmarshal([]byte(jsonData), &event)
				if err != nil {
					log.Printf("Error unmarshalling event data: %v", err)
					continue
				}
				eventType, ok := event["type"].(string)
				if !ok {
					log.Printf("Event type not found or invalid")
					continue
				}

				switch eventType {
				case "message_start":
					// 从message_start事件获取模型名称
					if message, ok := event["message"].(map[string]interface{}); ok {
						if model, ok := message["model"].(string); ok {
							modelName = model // 更新模型名称变量
						}
					}
				case "content_block_delta":
					dataChan <- jsonData
				case "message_stop":
					stopReason = "stop"
					stopChan <- true
				}

			}
		}
		if err := scanner.Err(); err != nil {
			log.Printf("Error reading stream: %v", err)
		}

	}()

	common.SetEventStreamHeaders(c)
	c.Stream(func(w io.Writer) bool {
		select {
		case data := <-dataChan:
			data = strings.TrimSuffix(data, "\r")

			var contentBlockDelta map[string]interface{}
			err := json.Unmarshal([]byte(data), &contentBlockDelta)
			if err != nil {
				logger.SysError("error unmarshalling content block delta: " + err.Error())
				return true
			}

			delta, ok := contentBlockDelta["delta"].(map[string]interface{})
			if !ok {
				logger.SysError("invalid delta format")
				return true
			}

			text, ok := delta["text"].(string)
			if !ok {
				logger.SysError("text not found in delta")
				return true
			}

			// 根据接收到的delta更新Response结构
			claudeResponse := Response{
				Id:         responseId,
				Model:      modelName, // 使用从message_start事件获取的模型名称
				Content:    []ResContent{{Text: text}},
				StopReason: stopReason, // 使用从message_stop事件获取的停止原因
			}
			responseText += claudeResponse.Content[0].Text
			response := streamResponseClaude2OpenAI(&claudeResponse)
			response.Id = responseId
			response.Created = createdTime
			jsonStr, err := json.Marshal(response)
			if err != nil {
				logger.SysError("error marshalling stream response: " + err.Error())
				return true
			}
			c.Render(-1, common.CustomEvent{Data: "data: " + string(jsonStr)})
			return true
		case <-stopChan:
			// 在流结束时发送具有"stop" FinishReason的响应
			claudeResponse := Response{
				Id:         responseId,
				Model:      modelName, // 使用收集到的模型名称
				Content:    []ResContent{{Text: ""}},
				StopReason: stopReason,
			}

			response := streamResponseClaude2OpenAI(&claudeResponse)
			response.Id = responseId
			response.Created = createdTime
			jsonStr, err := json.Marshal(response)
			if err != nil {
				logger.SysError("error marshalling final stop response: " + err.Error())
				return false
			}
			c.Render(-1, common.CustomEvent{Data: "data: " + string(jsonStr)})

			// 然后发送结束信号
			c.Render(-1, common.CustomEvent{Data: "data: [DONE]"})
			return false
		}
	})

	err := resp.Body.Close()
	if err != nil {
		return openai.ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError), ""
	}
	return nil, responseText
}

func Handler(c *gin.Context, resp *http.Response, promptTokens int, modelName string) (*model.ErrorWithStatusCode, *model.Usage, string) {
	responseBody, err := io.ReadAll(resp.Body)
	aitext := ""
	if err != nil {
		return openai.ErrorWrapper(err, "read_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	err = resp.Body.Close()
	if err != nil {
		return openai.ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	var claudeResponse Response
	err = json.Unmarshal(responseBody, &claudeResponse)
	if err != nil {
		return openai.ErrorWrapper(err, "unmarshal_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	if claudeResponse.Error.Type != "" {
		return &model.ErrorWithStatusCode{
			Error: model.Error{
				Message: claudeResponse.Error.Message,
				Type:    claudeResponse.Error.Type,
				Param:   "",
				Code:    claudeResponse.Error.Type,
			},
			StatusCode: resp.StatusCode,
		}, nil, ""
	}
	fullTextResponse := responseClaude2OpenAI(&claudeResponse)
	fullTextResponse.Model = modelName
	completionTokens := openai.CountTokenText(claudeResponse.Content[0].Text, modelName)
	aitext = claudeResponse.Content[0].Text
	usage := model.Usage{
		PromptTokens:     promptTokens,
		CompletionTokens: completionTokens,
		TotalTokens:      promptTokens + completionTokens,
	}
	fullTextResponse.Usage = usage
	jsonResponse, err := json.Marshal(fullTextResponse)
	if err != nil {
		return openai.ErrorWrapper(err, "marshal_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	c.Writer.Header().Set("Content-Type", "application/json")
	c.Writer.WriteHeader(resp.StatusCode)
	_, err = c.Writer.Write(jsonResponse)
	return nil, &usage, aitext
}

func convertRole(role string) string {
	switch role {
	case "user":
		return "user"
	default:
		return "assistant"
	}
}
