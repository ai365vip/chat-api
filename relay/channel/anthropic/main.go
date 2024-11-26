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
	"github.com/google/uuid"
)

func stopReasonClaude2OpenAI(reason *string) string {
	if reason == nil {
		return ""
	}
	switch *reason {
	case "end_turn":
		return "stop"
	case "stop_sequence":
		return "stop"
	case "max_tokens":
		return "length"
	default:
		return *reason
	}
}
func handleError(scanner *bufio.Scanner) *model.ErrorWithStatusCode {
	if !scanner.Scan() {
		return createGenericError()
	}

	errorData := scanner.Text()
	if !strings.HasPrefix(errorData, "data: ") {
		return createGenericError()
	}

	errorData = strings.TrimPrefix(errorData, "data: ")
	var errorResponse struct {
		Error struct {
			Type    string `json:"type"`
			Message string `json:"message"`
		} `json:"error"`
	}

	if err := json.Unmarshal([]byte(errorData), &errorResponse); err != nil {
		return createGenericError()
	}

	statusCode := http.StatusInternalServerError
	if errorResponse.Error.Type == "overloaded_error" {
		statusCode = 529
	}

	return &model.ErrorWithStatusCode{
		Error: model.Error{
			Message: errorResponse.Error.Message,
			Type:    errorResponse.Error.Type,
			Code:    statusCode,
		},
		StatusCode: statusCode,
	}
}
func createGenericError() *model.ErrorWithStatusCode {
	return &model.ErrorWithStatusCode{
		Error: model.Error{
			Message: "An error occurred",
			Type:    "unknown_error",
			Code:    http.StatusInternalServerError,
		},
		StatusCode: http.StatusInternalServerError,
	}
}

func ConvertRequest(textRequest model.GeneralOpenAIRequest) *Request {
	claudeRequest := createBaseRequest(textRequest)
	if len(textRequest.Tools) > 0 {
		claudeRequest.Tools = ConvertToolsLegacy(textRequest.Tools)
		claudeRequest.ToolChoice = ConvertToolChoice(textRequest.ToolChoice)
	}
	claudeRequest = ApplyLegacyModelMapping(claudeRequest)
	claudeRequest.Messages = ConvertMessagesLegacy(textRequest.Messages, &claudeRequest.System)
	return claudeRequest
}

func ConverClaudeRequest(request model.GeneralOpenAIRequest) *Request {
	claudeRequest := createBaseRequest(request)
	var err error
	claudeRequest.Messages, err = ConvertMessages(request.Messages)
	if err != nil {
		return nil
	}
	if len(request.Tools) > 0 {
		claudeRequest.Tools = ConvertTools(request.Tools)
		claudeRequest.ToolChoice = ConvertToolChoice(request.ToolChoice)
	}
	return claudeRequest
}

// 共享的辅助函数

func createBaseRequest(request model.GeneralOpenAIRequest) *Request {
	claudeRequest := &Request{
		Model:       request.Model,
		MaxTokens:   request.MaxTokens,
		Stream:      request.Stream,
		Temperature: request.Temperature,
		TopP:        request.TopP,
		TopK:        request.TopK,
		System:      request.System,
	}
	if claudeRequest.MaxTokens == 0 {
		claudeRequest.MaxTokens = 4096
	}
	return claudeRequest
}

func ConvertToolsLegacy(tools []model.Tool) []Tool {
	claudeTools := make([]Tool, 0, len(tools))
	for _, tool := range tools {
		if params, ok := tool.Function.Parameters.(map[string]any); ok {
			claudeTools = append(claudeTools, Tool{
				Name:        tool.Function.Name,
				Description: tool.Function.Description,
				InputSchema: InputSchema{
					Type:       params["type"].(string),
					Properties: params["properties"],
					Required:   params["required"],
				},
			})
		}
	}
	return claudeTools
}

func ConvertTools(tools []model.Tool) []Tool {
	claudeTools := make([]Tool, 0, len(tools))
	for _, tool := range tools {
		// 不进行类型断言，直接转换
		claudeTool := Tool{
			Name:        tool.Name,
			Description: tool.Description,
			InputSchema: convertInputSchema(tool.InputSchema),
		}
		claudeTools = append(claudeTools, claudeTool)
	}
	return claudeTools
}

func convertInputSchema(modelSchema model.InputSchema) InputSchema {
	return InputSchema{
		Type:       modelSchema.Type,
		Properties: modelSchema.Properties,
		Required:   modelSchema.Required,
	}
}

func ConvertToolChoice(toolChoice any) map[string]interface{} {
	claudeToolChoice := map[string]interface{}{
		"type": "none",
	}

	if choice, ok := toolChoice.(map[string]any); ok {
		if function, ok := choice["function"].(map[string]any); ok {
			claudeToolChoice["type"] = "tool_use"
			claudeToolChoice["name"] = function["name"].(string)

			// 解析 arguments 字符串为 JSON 对象
			if args, ok := function["arguments"].(string); ok {
				var inputArgs map[string]interface{}
				if err := json.Unmarshal([]byte(args), &inputArgs); err == nil {
					claudeToolChoice["input"] = inputArgs
				}
			}

			// 生成唯一 ID
			claudeToolChoice["id"] = "toolu_" + uuid.New().String()
		}
	} else if toolChoiceType, ok := toolChoice.(string); ok && toolChoiceType == "any" {
		claudeToolChoice["type"] = "tool_use"
	}

	return claudeToolChoice
}

func ApplyLegacyModelMapping(request *Request) *Request {
	switch request.Model {
	case "claude-instant-1":
		request.Model = "claude-instant-1.1"
	case "claude-2":
		request.Model = "claude-2.1"
	}
	return request
}

// 原有的 ConvertRequest 中的消息转换逻辑
func ConvertMessagesLegacy(messages []model.Message, system *string) []Message {
	formatMessages := make([]model.Message, 0)
	for i, message := range messages {
		if message.Role == "system" {
			if i != 0 {
				message.Role = "user"
			}
		}
		if message.Role == "" {
			message.Role = "user"
		}

		fmtMessage := model.Message{
			Role: message.Role,
		}

		if message.Content == nil || (message.IsStringContent() && message.StringContent() == "") {
			// 如果内容为空，使用 "_" 作为占位符
			fmtMessage.Content = "_"
		} else {
			// 保持原始内容
			fmtMessage.Content = message.Content
		}

		formatMessages = append(formatMessages, fmtMessage)

		// 如果当前消息是用户消息，且不是最后一条，添加一个空的助手回复
		if fmtMessage.Role == "user" && i < len(messages)-1 && messages[i+1].Role != "assistant" {
			formatMessages = append(formatMessages, model.Message{
				Role:    "assistant",
				Content: "_",
			})
		}

	}

	// 确保最后一条消息是用户消息
	if len(formatMessages) > 0 && formatMessages[len(formatMessages)-1].Role != "user" {
		formatMessages = append(formatMessages, model.Message{
			Role:    "user",
			Content: "_",
		})
	}

	var claudeMessages []Message
	for _, message := range formatMessages {
		if message.Role == "system" && *system == "" {
			*system = message.StringContent()
			continue
		}
		claudeMessage := Message{
			Role: message.Role,
		}
		var content Content
		if message.IsStringContent() {
			content.Type = "text"
			content.Text = message.StringContent()
			if message.Role == "tool" {
				claudeMessage.Role = "user"
				content.Type = "tool_result"
				content.Content = content.Text
				content.Text = ""
				content.ToolUseId = message.ToolCallId
			}
			claudeMessage.Content = append(claudeMessage.Content, content)
			for i := range message.ToolCalls {
				inputParam := make(map[string]any)
				_ = json.Unmarshal([]byte(message.ToolCalls[i].Function.Arguments.(string)), &inputParam)
				claudeMessage.Content = append(claudeMessage.Content, Content{
					Type:  "tool_use",
					Id:    message.ToolCalls[i].Id,
					Name:  message.ToolCalls[i].Function.Name,
					Input: inputParam,
				})
			}
			claudeMessages = append(claudeMessages, claudeMessage)
			continue
		}
		var contents []Content
		openaiContent := message.ParseContent()

		for _, part := range openaiContent {
			var content Content
			if part.Type == model.ContentTypeText {
				content.Type = "text"
				content.Text = part.Text
			} else if part.Type == model.ContentTypeImageURL {
				content.Type = "image"
				content.Source = &ImageSource{
					Type: "base64",
				}
				imageInfo, ok := part.ImageUrl.(model.MessageImageUrl)
				if !ok {
					log.Println("ImageUrl 类型断言失败")
					return nil
				}
				mimeType, data, _ := image.GetImageFromUrl(imageInfo.Url)
				content.Source.MediaType = mimeType
				content.Source.Data = data
			}
			contents = append(contents, content)
		}
		claudeMessage.Content = contents
		claudeMessages = append(claudeMessages, claudeMessage)
	}
	return claudeMessages
}

func ConvertMessages(messages []model.Message) ([]Message, error) {

	var formatMessages []Message

	for i, message := range messages {
		// 处理角色
		if message.Role == "system" {
			if i != 0 {
				message.Role = "user"
			}
		}
		if message.Role == "" {
			message.Role = "user"
		}

		// 转换 Content
		var content []Content
		switch v := message.Content.(type) {
		case string:
			content = []Content{{Type: "text", Text: v}}
		case []interface{}:
			for _, item := range v {
				if c, ok := item.(map[string]interface{}); ok {
					content = append(content, convertToContent(c))
				}
			}
		case []Content:
			content = v
		default:
			return nil, fmt.Errorf("unsupported content type for message %d", i)
		}

		fmtMessage := Message{
			Role:    message.Role,
			Content: content,
		}

		formatMessages = append(formatMessages, fmtMessage)
	}
	return formatMessages, nil
}

func convertToContent(c map[string]interface{}) Content {
	content := Content{}
	for key, value := range c {
		switch key {
		case "type":
			content.Type = value.(string)
		case "text":
			if text, ok := value.(string); ok {
				content.Text = text
			}
		case "id":
			content.Id = value.(string)
		case "name":
			content.Name = value.(string)
		case "input":
			content.Input = value
		case "content":
			if contentArray, ok := value.([]interface{}); ok {
				var contentSlice []Content
				for _, item := range contentArray {
					if contentMap, ok := item.(map[string]interface{}); ok {
						contentSlice = append(contentSlice, convertToContent(contentMap))
					}
				}
				content.Content = contentSlice
			} else {
				content.Content = value
			}
		case "tool_use_id":
			content.ToolUseId = value.(string)
		case "tool_result":
			if tr, ok := value.(map[string]interface{}); ok {
				toolResult := &ToolResult{
					ToolUseID: tr["tool_use_id"].(string),
					Content:   []Content{},
				}
				if trc, ok := tr["content"].([]interface{}); ok {
					for _, item := range trc {
						if trci, ok := item.(map[string]interface{}); ok {
							toolResult.Content = append(toolResult.Content, convertToContent(trci))
						}
					}
				}
				content.ToolResult = toolResult
			}
		case "source":
			if sourceMap, ok := value.(map[string]interface{}); ok {
				content.Source = &ImageSource{
					Data:      sourceMap["data"].(string),
					MediaType: sourceMap["media_type"].(string),
					Type:      sourceMap["type"].(string),
				}
			}
		}
	}

	return content
}

func ResponseClaude2OpenAI(claudeResponse *Response) *openai.TextResponse {
	// 打印接收到的 Claude 响应
	fmt.Printf("接收到的 Claude 响应:\n%+v\n", claudeResponse)

	var responseText string
	var toolCalls []model.Tool

	// 处理 Content
	if len(claudeResponse.Content) > 0 {
		for _, content := range claudeResponse.Content {
			if content.Type == "text" {
				responseText += content.Text
			} else if content.Type == "tool_use" {
				arguments, err := json.Marshal(content.Input)
				if err != nil {
					log.Printf("Error marshaling tool input: %v", err)
					arguments = []byte("{}")
				}
				toolCall := model.Tool{
					Id:   content.Id,
					Type: "function",
					Function: model.Function{
						Name:      content.Name,
						Arguments: string(arguments),
					},
				}
				toolCalls = append(toolCalls, toolCall)
			}
		}
	}

	choice := openai.TextResponseChoice{
		Index: 0,
		Message: model.Message{
			Role:      "assistant",
			Content:   responseText,
			Name:      nil,
			ToolCalls: toolCalls,
		},
		FinishReason: stopReasonClaude2OpenAI(claudeResponse.StopReason),
	}

	fullTextResponse := openai.TextResponse{
		Id:      fmt.Sprintf("chatcmpl-%s", claudeResponse.Id),
		Model:   claudeResponse.Model,
		Object:  "chat.completion",
		Created: helper.GetTimestamp(),
		Choices: []openai.TextResponseChoice{choice},
		Usage: model.Usage{
			PromptTokens:     claudeResponse.Usage.InputTokens,
			CompletionTokens: claudeResponse.Usage.OutputTokens,
			TotalTokens:      claudeResponse.Usage.InputTokens + claudeResponse.Usage.OutputTokens,
		},
	}

	// 打印返回的 OpenAI 格式响应
	fmt.Printf("返回的 OpenAI 格式响应:\n%+v\n", fullTextResponse)

	return &fullTextResponse
}

// https://docs.anthropic.com/claude/reference/messages-streaming
func StreamResponseClaude2OpenAI(claudeResponse *StreamResponse) (*openai.ChatCompletionsStreamResponse, *Response) {
	var response *Response
	var responseText string
	var stopReason string
	switch claudeResponse.Type {
	case "message_start":
		return nil, claudeResponse.Message
	case "content_block_start":
		if claudeResponse.ContentBlock != nil {
			responseText = claudeResponse.ContentBlock.Text
		}
	case "content_block_delta":
		if claudeResponse.Delta != nil {
			responseText = claudeResponse.Delta.Text
		}
	case "message_delta":
		if claudeResponse.Usage != nil {
			response = &Response{
				Usage: *claudeResponse.Usage,
			}
		}
		if claudeResponse.Delta != nil && claudeResponse.Delta.StopReason != nil {
			stopReason = *claudeResponse.Delta.StopReason
		}
	}
	var choice openai.ChatCompletionsStreamResponseChoice
	choice.Delta.Content = responseText
	choice.Delta.Role = "assistant"
	finishReason := stopReasonClaude2OpenAI(&stopReason)
	if finishReason != "null" {
		choice.FinishReason = &finishReason
	}
	var openaiResponse openai.ChatCompletionsStreamResponse
	openaiResponse.Object = "chat.completion.chunk"
	openaiResponse.Choices = []openai.ChatCompletionsStreamResponseChoice{choice}
	return &openaiResponse, response
}

func responseClaude2OpenAI(claudeResponse *Response) *openai.TextResponse {
	var responseText string
	if len(claudeResponse.Content) > 0 {
		responseText = claudeResponse.Content[0].Text
	}
	choice := openai.TextResponseChoice{
		Index: 0,
		Message: model.Message{
			Role:    "assistant",
			Content: responseText,
			Name:    nil,
		},
		FinishReason: stopReasonClaude2OpenAI(claudeResponse.StopReason),
	}
	fullTextResponse := openai.TextResponse{
		Id:      fmt.Sprintf("chatcmpl-%s", claudeResponse.Id),
		Model:   claudeResponse.Model,
		Object:  "chat.completion",
		Created: helper.GetTimestamp(),
		Choices: []openai.TextResponseChoice{choice},
	}
	return &fullTextResponse
}

func StreamHandler(c *gin.Context, resp *http.Response) (*model.ErrorWithStatusCode, *model.Usage, string) {
	createdTime := helper.GetTimestamp()
	scanner := bufio.NewScanner(resp.Body)
	var responseTextBuilder strings.Builder
	scanner.Split(func(data []byte, atEOF bool) (advance int, token []byte, err error) {
		if atEOF && len(data) == 0 {
			return 0, nil, nil
		}
		if i := strings.Index(string(data), "\n"); i >= 0 {
			return i + 1, data[0:i], nil
		}
		if atEOF {
			return len(data), data, nil
		}
		return 0, nil, nil
	})
	dataChan := make(chan string)
	stopChan := make(chan bool)
	errorChan := make(chan *model.ErrorWithStatusCode, 1)
	go func() {
		for scanner.Scan() {
			data := scanner.Text()
			if strings.HasPrefix(data, "event: error") {
				errorChan <- handleError(scanner)
				return
			}
			if len(data) < 6 {
				continue
			}
			if !strings.HasPrefix(data, "data: ") {
				continue
			}
			data = strings.TrimPrefix(data, "data: ")
			dataChan <- data
		}
		stopChan <- true
	}()
	common.SetEventStreamHeaders(c)
	var usage model.Usage
	var modelName string
	var id string
	var streamError *model.ErrorWithStatusCode
	c.Stream(func(w io.Writer) bool {
		select {
		case data := <-dataChan:
			// some implementations may add \r at the end of data
			data = strings.TrimSuffix(data, "\r")
			var claudeResponse StreamResponse
			err := json.Unmarshal([]byte(data), &claudeResponse)
			if err != nil {
				logger.SysError("error unmarshalling stream response: " + err.Error())
				return true
			}
			response, meta := StreamResponseClaude2OpenAI(&claudeResponse)
			if meta != nil {
				usage.PromptTokens += meta.Usage.InputTokens
				usage.CompletionTokens += meta.Usage.OutputTokens
				modelName = meta.Model
				id = fmt.Sprintf("chatcmpl-%s", meta.Id)
				return true
			}
			if response == nil {
				return true
			}
			responsePart := response.Choices[0].Delta.Content.(string)
			responseTextBuilder.WriteString(responsePart)
			response.Id = id
			response.Model = modelName
			response.Created = createdTime
			jsonStr, err := json.Marshal(response)

			if err != nil {
				logger.SysError("error marshalling stream response: " + err.Error())
				return true
			}
			c.Render(-1, common.CustomEvent{Data: "data: " + string(jsonStr)})
			return true
		case <-stopChan:
			c.Render(-1, common.CustomEvent{Data: "data: [DONE]"})
			return false
		case err := <-errorChan:
			streamError = err
			// 直接渲染错误响应
			return false
		}
	})
	_ = resp.Body.Close()
	return streamError, &usage, responseTextBuilder.String()
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

	if len(claudeResponse.Content) > 0 && claudeResponse.Content[0].Text != "" {
		aitext = claudeResponse.Content[0].Text
	}
	usage := model.Usage{
		PromptTokens:     claudeResponse.Usage.InputTokens,
		CompletionTokens: claudeResponse.Usage.OutputTokens,
		TotalTokens:      claudeResponse.Usage.InputTokens + claudeResponse.Usage.OutputTokens,
	}
	fullTextResponse.Usage = usage
	jsonResponse, err := json.Marshal(fullTextResponse)
	if err != nil {
		return openai.ErrorWrapper(err, "marshal_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	c.Writer.Header().Set("Content-Type", "application/json")
	c.Writer.WriteHeader(resp.StatusCode)
	_, _ = c.Writer.Write(jsonResponse)
	return nil, &usage, aitext
}

func ClaudeStreamHandler(c *gin.Context, resp *http.Response) (*model.ErrorWithStatusCode, *model.Usage, string) {
	scanner := bufio.NewScanner(resp.Body)
	defer resp.Body.Close()
	// 设置适合流式传输的响应头
	common.SetEventStreamHeaders(c)
	var responseTextBuilder strings.Builder
	var usage model.Usage
	responseText := ""
	sendStopMessage := false

	for scanner.Scan() {
		line := scanner.Text() + "\n"

		if strings.HasPrefix(line, "event: error") {
			// 读取下一行,应该包含错误数据
			if scanner.Scan() {
				errorData := scanner.Text()
				if strings.HasPrefix(errorData, "data: ") {
					errorData = strings.TrimPrefix(errorData, "data: ")
					var errorResponse struct {
						Type  string `json:"type"`
						Error struct {
							Type    string `json:"type"`
							Message string `json:"message"`
						} `json:"error"`
					}
					if err := json.Unmarshal([]byte(errorData), &errorResponse); err == nil {
						// 根据错误类型返回相应的错误
						switch errorResponse.Error.Type {
						case "overloaded_error":
							return &model.ErrorWithStatusCode{
								Error: model.Error{
									Message: errorResponse.Error.Message,
									Type:    errorResponse.Error.Type,
									Code:    529,
								},
								StatusCode: 529,
							}, &usage, responseText
						// 可以在这里添加其他错误类型的处理
						default:
							return &model.ErrorWithStatusCode{
								Error: model.Error{
									Message: errorResponse.Error.Message,
									Type:    errorResponse.Error.Type,
									Code:    http.StatusInternalServerError,
								},
								StatusCode: http.StatusInternalServerError,
							}, &usage, responseText
						}
					}
				}
			}
		}

		// 直接将原始行写入到响应流中
		if _, writeErr := c.Writer.Write([]byte(line)); writeErr != nil {
			// 记录错误，并考虑是否中断处理
			logger.SysError("Error writing to stream: " + writeErr.Error())
			sendStopMessage = true // 发生错误时发送停止消息
			break
		}
		// 确保响应是即时发送的
		c.Writer.Flush()

		// 对data行进行额外的解析和处理
		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")
			// 处理data
			var claudeResponse StreamResponse
			if err := json.Unmarshal([]byte(data), &claudeResponse); err != nil {
				logger.SysError("Error unmarshalling stream response: " + err.Error())
				continue // 或者处理错误
			}

			response, meta := StreamResponseClaude2OpenAI(&claudeResponse)
			if meta != nil {
				usage.PromptTokens += meta.Usage.InputTokens
				usage.CompletionTokens += meta.Usage.OutputTokens
			}
			if response != nil {
				responsePart := response.Choices[0].Delta.Content.(string)
				responseTextBuilder.WriteString(responsePart)
			}
		}
	}

	// 发生错误时，发送结束消息
	if sendStopMessage {
		sendStreamStopMessage(c)
	}

	return nil, &usage, responseTextBuilder.String()
}

// 修改 sendStreamStopMessage 函数
func sendStreamStopMessage(c *gin.Context) {
	messageStop := "event: message_stop\ndata: {\"type\": \"message_stop\"}\n\n"
	c.Writer.Write([]byte(messageStop))
	c.Writer.Flush()
}
func ClaudeHandler(c *gin.Context, resp *http.Response, promptTokens int, modelName string) (*model.ErrorWithStatusCode, *model.Usage, string) {
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

	aitext = claudeResponse.Content[0].Text
	usage := model.Usage{
		PromptTokens:     claudeResponse.Usage.InputTokens,
		CompletionTokens: claudeResponse.Usage.OutputTokens,
		TotalTokens:      claudeResponse.Usage.InputTokens + claudeResponse.Usage.OutputTokens,
	}

	if err != nil {
		return openai.ErrorWrapper(err, "marshal_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	c.Writer.Header().Set("Content-Type", "application/json")
	c.Writer.WriteHeader(resp.StatusCode)
	_, err = c.Writer.Write(responseBody)
	return nil, &usage, aitext
}
