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
		// 即使关闭失败，也尝试继续处理，因为响应体可能已成功读取
		common.SysError("error closing response body (read_response_body_failed): " + err.Error())
	}

	err = json.Unmarshal(responseBody, &textResponse)
	if err != nil {
		return ErrorWrapper(err, "unmarshal_response_body_failed", http.StatusInternalServerError), nil, ""
	}

	if textResponse.Error.Type != "" {
		// 直接将原始错误信息透传回去，因为已经是JSON格式
		// 不需要重新封装 ErrorWithStatusCode，除非需要修改状态码
		// 但这里resp.StatusCode应该是原始错误的状态码
		sendHTTPResponse(c, resp.StatusCode, resp.Header, bytes.NewBuffer(responseBody))
		return &model.ErrorWithStatusCode{ // 仍然返回一个错误标记，但响应已发送
			Error:      textResponse.Error,
			StatusCode: resp.StatusCode,
		}, nil, ""
	}

	// 为特定模型预先构建 responseText
	if strings.HasPrefix(modelName, "gpt") ||
		strings.HasPrefix(modelName, "o3") ||
		strings.HasPrefix(modelName, "o4") ||
		strings.HasPrefix(modelName, "o1") ||
		strings.HasPrefix(modelName, "chatgpt") ||
		strings.HasPrefix(modelName, "claude") {
		for _, choice := range textResponse.Choices {
			if choice.Message.ReasoningContent != "" {
				responseText = "<think>" + choice.Message.ReasoningContent + "</think>\\n\\n"
			}
			responseText += choice.Message.StringContent()
		}
	}

	needReasoningModify := false
	for _, choice := range textResponse.Choices {
		if choice.Message.ReasoningContent != "" {
			needReasoningModify = true
			break
		}
	}

	if needReasoningModify {
		for i, choice := range textResponse.Choices {
			content := choice.Message.StringContent()
			if choice.Message.ReasoningContent != "" {
				content = "<think>" + choice.Message.ReasoningContent + "</think>\\n\\n" + content
				textResponse.Choices[i].Message.Content = content
				textResponse.Choices[i].Message.ReasoningContent = ""
			}
		}

		modifiedResponseBody, err := json.Marshal(textResponse)
		if err != nil {
			return ErrorWrapper(err, "remarshal_response_body_failed_reasoning", http.StatusInternalServerError), nil, ""
		}
		// 更新原始resp的Header，因为sendHTTPResponse会用到
		resp.Header.Set("Content-Length", strconv.Itoa(len(modifiedResponseBody)))
		sendHTTPResponse(c, resp.StatusCode, resp.Header, bytes.NewBuffer(modifiedResponseBody))
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

	if fixedContent != "" && strings.HasPrefix(modelName, "gpt") {
		for i, choice := range textResponse.Choices {
			modifiedContent := choice.Message.StringContent() + "\\n\\n" + fixedContent
			encodedContent, err := json.Marshal(modifiedContent)
			if err != nil {
				return ErrorWrapper(err, "encode_modified_content_failed", http.StatusInternalServerError), nil, ""
			}
			textResponse.Choices[i].Message.Content = json.RawMessage(encodedContent)
		}

		modifiedResponseBody, err := json.Marshal(textResponse)
		if err != nil {
			return ErrorWrapper(err, "remarshal_response_body_failed_fixedcontent", http.StatusInternalServerError), nil, ""
		}
		resp.Header.Set("Content-Length", strconv.Itoa(len(modifiedResponseBody)))
		sendHTTPResponse(c, resp.StatusCode, resp.Header, bytes.NewBuffer(modifiedResponseBody))
		// responseText 在这种情况下可能不是最新的，但我们主要关心的是响应体
		// 如果需要，可以在这里更新 responseText
		return nil, &textResponse.Usage, responseText // or generate new responseText if needed
	}

	// 如果没有任何修改，则发送原始响应体
	sendHTTPResponse(c, resp.StatusCode, resp.Header, bytes.NewBuffer(responseBody))
	return nil, &textResponse.Usage, responseText
}

// sendHTTPResponse 是一个辅助函数，用于将响应发送给客户端
func sendHTTPResponse(c *gin.Context, statusCode int, headers http.Header, body io.Reader) {
	for k, v := range headers {
		if len(v) > 0 { // 确保v有元素
			c.Writer.Header().Set(k, v[0])
		}
	}
	c.Writer.WriteHeader(statusCode)
	_, err := io.Copy(c.Writer, body)
	if err != nil {
		// 记录复制响应体到Writer时的错误
		common.SysError("error copying response body to writer: " + err.Error())
		// 此时可能无法向客户端发送更多信息，因为头部可能已发送
	}
	// 如果body实现了io.Closer，例如*os.File，理论上应该关闭它
	// 但这里传入的是bytes.NewBuffer，其NopCloser的Close是无操作的。
	// 而原始的resp.Body已经在Handler的开头关闭了。
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
