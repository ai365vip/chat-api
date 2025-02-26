package openai

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"one-api/common"
	"one-api/relay/constant"
	"one-api/relay/model"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func StreamHandler(c *gin.Context, resp *http.Response, relayMode int, modelName string, fixedContent string) (*model.ErrorWithStatusCode, string, int, *model.Usage) {
	responseText := ""
	toolCount := 0
	var usage *model.Usage
	scanner := bufio.NewScanner(resp.Body)
	var isProcessingReasoning = false
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

	go func() {
		var needInjectFixedContent = false // 标志是否需要注入固定内容

		for scanner.Scan() {
			data := scanner.Text()

			if len(data) < 6 { // 忽略空白行或格式不正确的行
				continue
			}

			// 检查是否为结束标记
			if data == "data: [DONE]" {
				break // 如果是结束标记，则跳出循环
			}

			// 在暂存stop消息前进行relayMode的逻辑处理
			if strings.HasPrefix(data, "data: ") {
				jsonData := data[6:]

				switch relayMode {
				case constant.RelayModeChatCompletions:
					var streamResponse ChatCompletionsStreamResponse
					err := json.Unmarshal([]byte(jsonData), &streamResponse)
					if err != nil {
						log.Println("解析失败:", err)
						continue
					}
					for _, choice := range streamResponse.Choices {

						// 处理 ReasoningContent
						if choice.Delta.ReasoningContent != "" && (choice.Delta.Content == nil || choice.Delta.Content == "") {
							content := choice.Delta.ReasoningContent

							// 只在开始时添加<think>标签
							if !isProcessingReasoning {
								content = "<think>" + content
								isProcessingReasoning = true
							}

							// 创建新的响应对象，保持原始字段
							newResponse := ChatCompletionsStreamResponse{
								Id:      streamResponse.Id,
								Object:  streamResponse.Object,
								Created: streamResponse.Created,
								Model:   streamResponse.Model,
								Choices: []ChatCompletionsStreamResponseChoice{
									{
										Index: choice.Index,
										Delta: model.Message{
											Role:    "",
											Content: content,
										},
									},
								},
								Usage: streamResponse.Usage,
							}

							// 重新序列化修改后的响应
							modifiedResponse, err := json.Marshal(newResponse)
							if err != nil {
								log.Println("修改响应序列化失败:", err)
								continue
							}
							data = "data: " + string(modifiedResponse)
						} else if isProcessingReasoning && (choice.Delta.Content != nil || choice.Delta.Content != "") {
							// 在切换到普通Content之前添加结束标签
							newResponse := ChatCompletionsStreamResponse{
								Id:      streamResponse.Id,
								Object:  streamResponse.Object,
								Created: streamResponse.Created,
								Model:   streamResponse.Model,
								Choices: []ChatCompletionsStreamResponseChoice{
									{
										Index: choice.Index,
										Delta: model.Message{
											Role:    "",
											Content: "</think>",
										},
									},
								},
								Usage: streamResponse.Usage,
							}

							modifiedResponse, err := json.Marshal(newResponse)
							if err != nil {
								log.Println("修改响应序列化失败:", err)
								continue
							}
							data = "data: " + string(modifiedResponse)
							isProcessingReasoning = false
						}
						responseText += common.AsString(choice.Delta.Content)
						if choice.Delta.ToolCalls != nil {
							if len(choice.Delta.ToolCalls) > toolCount {
								toolCount = len(choice.Delta.ToolCalls)
							}
							for _, tool := range choice.Delta.ToolCalls {
								responseText += common.AsString(tool.Function.Name)
								responseText += common.AsString(tool.Function.Arguments)
							}
						}
						if choice.FinishReason != nil && *choice.FinishReason == "stop" && fixedContent != "" {
							needInjectFixedContent = true // 需要注入fixedContent
						}

					}
					if streamResponse.Usage != nil && streamResponse.Usage.TotalTokens != 0 {
						usage = streamResponse.Usage
					}

				case constant.RelayModeCompletions:
					var streamResponse CompletionsStreamResponse
					err := json.Unmarshal([]byte(jsonData), &streamResponse)
					if err != nil {
						log.Println("解析失败:", err)
						continue
					}
					for _, choice := range streamResponse.Choices {
						responseText += choice.Text
						if choice.FinishReason == "stop" && fixedContent != "" {
							needInjectFixedContent = true // 需要注入fixedContent
						}
					}
				}

				if needInjectFixedContent {
					break
				}
			}

			// 如果没有标记需要注入固定内容，那么直接发送
			if !needInjectFixedContent {
				dataChan <- data
			}
		}
		if needInjectFixedContent && fixedContent != "" {
			fixedContentMessage := GenerateFixedContentMessage(fixedContent, modelName)
			dataChan <- fixedContentMessage
		}
		// 只有在有实际内容时才发送 DONE
		if responseText != "" {
			dataChan <- "data: [DONE]"
		}
		stopChan <- true
	}()
	common.SetEventStreamHeaders(c)
	c.Stream(func(w io.Writer) bool {
		select {
		case data := <-dataChan:
			if strings.HasPrefix(data, "data: [DONE]") {
				data = data[:12]
			}
			// some implementations may add \r at the end of data
			data = strings.TrimSuffix(data, "\r")
			c.Render(-1, common.CustomEvent{Data: data})
			return true
		case <-stopChan:
			return false
		}
	})
	err := resp.Body.Close()
	if err != nil {
		return ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError), "", 0, nil
	}
	return nil, responseText, toolCount, usage
}

func Handler(c *gin.Context, resp *http.Response, promptTokens int, modelName string) (*model.ErrorWithStatusCode, *model.Usage, string) {
	var textResponse SlimTextResponse
	var responseText string
	fixedContent := c.GetString("fixed_content")
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return ErrorWrapper(err, "read_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	err = resp.Body.Close()
	if err != nil {
		return ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	err = json.Unmarshal(responseBody, &textResponse)
	if err != nil {
		return ErrorWrapper(err, "unmarshal_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	if textResponse.Error.Type != "" {
		return &model.ErrorWithStatusCode{
			Error:      textResponse.Error,
			StatusCode: resp.StatusCode,
		}, nil, ""
	}
	if strings.HasPrefix(modelName, "gpt") ||
		strings.HasPrefix(modelName, "o3") ||
		strings.HasPrefix(modelName, "o1") ||
		strings.HasPrefix(modelName, "chatgpt") ||
		strings.HasPrefix(modelName, "claude") {
		for _, choice := range textResponse.Choices {
			if choice.Message.ReasoningContent != "" {
				responseText = "<think>" + choice.Message.ReasoningContent + "</think>\n\n"
			}
			responseText += choice.Message.StringContent()
		}
	}
	needModify := false
	for _, choice := range textResponse.Choices {
		if choice.Message.ReasoningContent != "" {
			needModify = true
			break
		}
	}

	if needModify {
		for i, choice := range textResponse.Choices {
			content := choice.Message.StringContent()
			if choice.Message.ReasoningContent != "" {
				content = "<think>" + choice.Message.ReasoningContent + "</think>\n\n" + content
				// 更新 choice 中的内容
				textResponse.Choices[i].Message.Content = content
				// 清空 ReasoningContent
				textResponse.Choices[i].Message.ReasoningContent = ""
			}
		}

		// 重新序列化修改后的响应
		modifiedResponseBody, err := json.Marshal(textResponse)
		if err != nil {
			return ErrorWrapper(err, "remarshal_response_body_failed", http.StatusInternalServerError), nil, ""
		}

		// 更新 Content-Length
		resp.Header.Set("Content-Length", strconv.Itoa(len(modifiedResponseBody)))
		// 重设 resp.Body
		resp.Body = io.NopCloser(bytes.NewBuffer(modifiedResponseBody))

		// 发送修改后的响应
		for k, v := range resp.Header {
			c.Writer.Header().Set(k, v[0])
		}
		c.Writer.WriteHeader(resp.StatusCode)
		_, err = io.Copy(c.Writer, resp.Body)
		if err != nil {
			return ErrorWrapper(err, "write_modified_response_body_failed", http.StatusInternalServerError), nil, ""
		}

		return nil, &textResponse.Usage, responseText
	}
	if textResponse.Usage.TotalTokens == 0 {
		completionTokens := 0
		for _, choice := range textResponse.Choices {
			completionTokens += CountTokenText(choice.Message.StringContent(), modelName)
		}
		textResponse.Usage = model.Usage{
			PromptTokens:     promptTokens,
			CompletionTokens: completionTokens,
			TotalTokens:      promptTokens + completionTokens,
		}
	}

	// 在响应文本中插入固定内容，并构建包含 fixedContent 的 responseText
	if fixedContent != "" && strings.HasPrefix(modelName, "gpt") {
		for i, choice := range textResponse.Choices {
			modifiedContent := choice.Message.StringContent() + "\n\n" + fixedContent

			// 使用json.Marshal确保字符串被正确编码为JSON
			encodedContent, err := json.Marshal(modifiedContent)
			if err != nil {
				return ErrorWrapper(err, "encode_modified_content_failed", http.StatusInternalServerError), nil, ""
			}
			textResponse.Choices[i].Message.Content = json.RawMessage(encodedContent)
		}
		// 将更新后的响应发送给客户端

		modifiedResponseBody, err := json.Marshal(textResponse)
		// 更新 Content-Length
		resp.Header.Set("Content-Length", strconv.Itoa(len(modifiedResponseBody)))
		// 重设 resp.Body
		resp.Body = io.NopCloser(bytes.NewBuffer(modifiedResponseBody))
		if err != nil {
			return ErrorWrapper(err, "remarshal_response_body_failed", http.StatusInternalServerError), nil, ""
		}
		for k, v := range resp.Header {
			c.Writer.Header().Set(k, v[0])
		}
		c.Writer.WriteHeader(resp.StatusCode)
		_, err = io.Copy(c.Writer, resp.Body)
		if err != nil {
			return ErrorWrapper(err, "write_modified_response_body_failed", http.StatusInternalServerError), nil, ""
		}

	} else {
		resp.Body = io.NopCloser(bytes.NewBuffer(responseBody))
		for k, v := range resp.Header {
			c.Writer.Header().Set(k, v[0])
		}
		c.Writer.WriteHeader(resp.StatusCode)
		_, err = io.Copy(c.Writer, resp.Body)
		if err != nil {
			return ErrorWrapper(err, "copy_response_body_failed", http.StatusInternalServerError), nil, ""
		}
		err = resp.Body.Close()
		if err != nil {
			return ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError), nil, ""
		}
	}

	return nil, &textResponse.Usage, responseText
}
func GenerateFixedContentMessage(fixedContent string, modelName string) string {
	// 在 fixedContent 的开始处添加换行符
	modifiedFixedContent := "\n\n" + fixedContent
	content := map[string]interface{}{
		"id":      fmt.Sprintf("chatcmpl-%s", common.GetUUID()),
		"object":  "chat.completion",
		"model":   modelName,
		"created": common.GetTimestamp(), // 这里可能需要根据实际情况动态生成
		"choices": []map[string]interface{}{
			{
				"index":         0,
				"finish_reason": "stop",
				"delta": map[string]string{
					"content": modifiedFixedContent, // 使用修改后的 fixedContent，其中包括前置换行符
					"role":    "",
				},
			},
		},
	}

	// 将 content 转换为 JSON 字符串
	jsonBytes, err := json.Marshal(content)
	if err != nil {
		common.SysError("error marshalling fixed content message: " + err.Error())
		return ""
	}

	return "data: " + string(jsonBytes)
}
