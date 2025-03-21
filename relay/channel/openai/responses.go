package openai

import (
	"bufio"
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"one-api/relay/model"
	"strings"

	"github.com/gin-gonic/gin"
)

func ResponsesHandler(c *gin.Context, resp *http.Response, promptTokens int, originModelName string) (*model.ErrorWithStatusCode, *model.Usage, string) {
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return ErrorWrapper(err, "read_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	err = resp.Body.Close()
	if err != nil {
		return ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError), nil, ""
	}

	// 使用通用的 map 解析 JSON
	var responseMap map[string]interface{}
	err = json.Unmarshal(responseBody, &responseMap)
	if err != nil {
		return ErrorWrapper(err, "unmarshal_response_body_failed", http.StatusInternalServerError), nil, ""
	}

	// 提取文本内容
	responseText := ""

	// 尝试从 Anthropic 响应中提取文本
	if output, ok := responseMap["output"].([]interface{}); ok {
		for _, item := range output {
			if itemMap, ok := item.(map[string]interface{}); ok {
				if itemMap["type"] == "message" {
					if content, ok := itemMap["content"].([]interface{}); ok {
						for _, contentItem := range content {
							if contentMap, ok := contentItem.(map[string]interface{}); ok {
								if contentMap["type"] == "output_text" {
									if text, ok := contentMap["text"].(string); ok {
										responseText += text
									}
								}
							}
						}
					}
				}
			}
		}
	}

	// 尝试从 OpenAI 响应中提取文本
	if choices, ok := responseMap["choices"].([]interface{}); ok && len(choices) > 0 {
		if choice, ok := choices[0].(map[string]interface{}); ok {
			if text, ok := choice["text"].(string); ok {
				responseText = text
			} else if message, ok := choice["message"].(map[string]interface{}); ok {
				if content, ok := message["content"].(string); ok {
					responseText = content
				}
			}
		}
	}

	// 重新创建响应体以便后续使用
	resp.Body = io.NopCloser(bytes.NewBuffer(responseBody))

	// 设置响应头
	for k, v := range resp.Header {
		c.Writer.Header().Set(k, v[0])
	}
	c.Writer.WriteHeader(resp.StatusCode)

	// 直接将原始响应体写入响应
	_, err = io.Copy(c.Writer, resp.Body)
	if err != nil {
		return ErrorWrapper(err, "copy_response_body_failed", http.StatusInternalServerError), nil, ""
	}

	err = resp.Body.Close()
	if err != nil {
		return ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError), nil, ""
	}

	// 尝试从 Anthropic 格式中提取 usage 信息
	if usageMap, ok := responseMap["usage"].(map[string]interface{}); ok {
		inputTokens, _ := usageMap["input_tokens"].(float64)
		outputTokens, _ := usageMap["output_tokens"].(float64)
		totalTokens, _ := usageMap["total_tokens"].(float64)

		if totalTokens > 0 {
			return nil, &model.Usage{
				PromptTokens:     int(inputTokens),
				CompletionTokens: int(outputTokens),
				TotalTokens:      int(totalTokens),
			}, responseText
		}
	}

	// 尝试从 OpenAI 格式中提取 usage 信息
	if usageMap, ok := responseMap["usage"].(map[string]interface{}); ok {
		promptTokensFloat, _ := usageMap["prompt_tokens"].(float64)
		completionTokensFloat, _ := usageMap["completion_tokens"].(float64)
		totalTokensFloat, _ := usageMap["total_tokens"].(float64)

		if totalTokensFloat > 0 {
			return nil, &model.Usage{
				PromptTokens:     int(promptTokensFloat),
				CompletionTokens: int(completionTokensFloat),
				TotalTokens:      int(totalTokensFloat),
			}, responseText
		}
	}

	return nil, nil, responseText
}

func ResponsesStreamHandler(c *gin.Context, resp *http.Response, relayMode int, modelName string, fixedContent string, promptTokens int) (*model.ErrorWithStatusCode, string, int64, *model.Usage) {
	responseText := ""
	var toolCount int64 = 0
	var usage *model.Usage

	// 使用更大的缓冲区以处理长行
	scanner := bufio.NewScanner(resp.Body)
	buf := make([]byte, 64*1024)   // 64KB 缓冲区
	scanner.Buffer(buf, 1024*1024) // 允许最大 1MB 的行
	defer resp.Body.Close()

	// 设置响应头
	for k, v := range resp.Header {
		c.Writer.Header().Set(k, v[0])
	}
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.WriteHeader(http.StatusOK)

	// 立即刷新头信息
	c.Writer.Flush()

	// 用于存储最后一个完整响应
	var lastCompleteResponse map[string]interface{}

	for scanner.Scan() {
		line := scanner.Text()

		// 处理空行
		if line == "" {
			c.Writer.Write([]byte("\n"))
			c.Writer.Flush() // 立即刷新
			continue
		}

		// 直接将原始行写入响应
		c.Writer.Write([]byte(line + "\n"))
		c.Writer.Flush() // 立即刷新

		// 如果是数据行，尝试解析
		if strings.HasPrefix(line, "data: ") {
			// 提取 JSON 数据
			jsonData := line[6:] // 跳过 "data: " 前缀

			// 解析 JSON
			var eventData map[string]interface{}
			if err := json.Unmarshal([]byte(jsonData), &eventData); err != nil {
				continue // 跳过无法解析的行
			}

			// 检查是否是完成事件
			if eventType, ok := eventData["type"].(string); ok && eventType == "response.completed" {
				// 保存最后的完整响应
				if responseObj, ok := eventData["response"].(map[string]interface{}); ok {
					lastCompleteResponse = responseObj

					// 从完整响应中提取 usage 信息
					if usageMap, ok := responseObj["usage"].(map[string]interface{}); ok {
						inputTokens, _ := usageMap["input_tokens"].(float64)
						outputTokens, _ := usageMap["output_tokens"].(float64)
						totalTokens, _ := usageMap["total_tokens"].(float64)

						if totalTokens > 0 {
							usage = &model.Usage{
								PromptTokens:     int(inputTokens),
								CompletionTokens: int(outputTokens),
								TotalTokens:      int(totalTokens),
							}
						}
					}
				}
			}

			// 检查是否是文本增量事件
			if eventType, ok := eventData["type"].(string); ok && eventType == "response.output_text.delta" {
				if delta, ok := eventData["delta"].(string); ok {

					responseText += delta
				}
			}
		}
	}

	// 发送最后的空行表示流结束
	c.Writer.Write([]byte("\n"))
	c.Writer.Flush() // 立即刷新

	if err := scanner.Err(); err != nil {
		return ErrorWrapper(err, "read_response_body_failed", http.StatusInternalServerError), responseText, toolCount, usage
	}

	// 如果没有从流中提取到 usage 信息，但有最后的完整响应
	if usage == nil && lastCompleteResponse != nil {
		if usageMap, ok := lastCompleteResponse["usage"].(map[string]interface{}); ok {
			inputTokens, _ := usageMap["input_tokens"].(float64)
			outputTokens, _ := usageMap["output_tokens"].(float64)
			totalTokens, _ := usageMap["total_tokens"].(float64)

			if totalTokens > 0 {
				usage = &model.Usage{
					PromptTokens:     int(inputTokens),
					CompletionTokens: int(outputTokens),
					TotalTokens:      int(totalTokens),
				}
			}
		}
	}

	// 如果仍然没有 usage 信息，则估算
	if usage == nil && responseText != "" {
		completionTokens := CountTokenText(responseText, modelName)
		usage = &model.Usage{
			PromptTokens:     int(promptTokens),
			CompletionTokens: int(completionTokens),
			TotalTokens:      int(promptTokens) + int(completionTokens),
		}
	}

	return nil, responseText, toolCount, usage
}
