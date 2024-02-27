package chatbot

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"one-api/common"
	"one-api/relay/channel/openai"
	dbdodel "one-api/relay/model"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type ChatbotMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

func randomID() string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	var seededRand *rand.Rand = rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, 10)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return "chatcmpl-" + string(b)
}
func calculatePromptTokens(str string) int {
	return len([]rune(str))
}

func CalculateCompletionTokens(messagesMap []map[string]string) int {
	// adjust the calculation according to your requirements
	return len(messagesMap)
}
func streamResponseChatbot2OpenAI(ChatbotResponse string, model string) *ChatCompletionsStreamResponse {
	var choice ChatCompletionsStreamResponseChoice
	choice.Delta.Content = ChatbotResponse
	response := ChatCompletionsStreamResponse{
		Id:      randomID(),
		Object:  "chat.completion.chunk",
		Created: common.GetTimestamp(),
		Model:   model,
		Choices: []ChatCompletionsStreamResponseChoice{choice},
	}
	return &response
}

func StreamHandler(c *gin.Context, resp *http.Response, promptTokens int, model string) (*dbdodel.ErrorWithStatusCode, string) {
	responseText := ""
	scanner := bufio.NewScanner(resp.Body)
	fixedContent := c.GetString("fixed_content")
	modifiedFixedContent := "\n\n" + fixedContent
	var contentBuilder strings.Builder
	scanner.Split(bufio.ScanRunes) // 使用ScanRunes使得每个字符作为一个单独token处理

	dataChan := make(chan string)
	stopChan := make(chan bool)
	go func() {
		for scanner.Scan() {
			char := scanner.Text() //这里接收到的应该是一个字符
			if len(char) > 0 {
				dataChan <- char
			}
		}

		stopChan <- true
	}()

	common.SetEventStreamHeaders(c)
	c.Stream(func(w io.Writer) bool {
		select {
		case data := <-dataChan:
			response := streamResponseChatbot2OpenAI(data, model)

			jsonResponse, err := json.Marshal(response)
			if err != nil {
				common.SysError("error marshalling stream response: " + err.Error())
				return true
			}

			c.Render(-1, common.CustomEvent{Data: "data: " + string(jsonResponse)})
			// 提取 content 的值
			var responseData map[string]interface{}
			if err := json.Unmarshal(jsonResponse, &responseData); err == nil {
				if choices, ok := responseData["choices"].([]interface{}); ok {
					for _, choice := range choices {
						if choiceMap, ok := choice.(map[string]interface{}); ok {
							if delta, ok := choiceMap["delta"].(map[string]interface{}); ok {
								if content, ok := delta["content"].(string); ok {
									contentBuilder.WriteString(content)
									responseText = contentBuilder.String()
								}
							}
						}
					}
				}
			}
			return true

		case <-stopChan:

			jsonResponse0 := map[string]interface{}{
				"id":      randomID(),
				"object":  "chat.completion.chunk",
				"created": int(time.Now().Unix()),
				"model":   model,
				"choices": []map[string]interface{}{
					{
						"index": 0,
						"delta": map[string]string{
							"content": modifiedFixedContent,
							"role":    "",
						},
						"finish_reason": "stop",
					},
				},
			}
			jsonData, err := json.Marshal(jsonResponse0)
			if err != nil {
				// 处理错误，比如打印错误信息并返回
				fmt.Println("error marshalling response: ", err)
				return false
			}
			c.Render(-1, common.CustomEvent{Data: "data: " + string(jsonData)})
			c.Render(-1, common.CustomEvent{Data: "data: [DONE]"})
			return false
		}
	})
	return nil, responseText

}

func BotHandler(c *gin.Context, resp *http.Response, promptTokens int, model string) (*dbdodel.ErrorWithStatusCode, *dbdodel.Usage, string) {
	var textResponse openai.SlimTextResponse
	fixedContent := c.GetString("fixed_content")
	responseBody, err := io.ReadAll(resp.Body)

	if err != nil {
		return openai.ErrorWrapper(err, "read_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	err = resp.Body.Close()
	if err != nil {
		return openai.ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError), nil, ""
	}

	if textResponse.Error.Type != "" {
		return &dbdodel.ErrorWithStatusCode{
			Error:      textResponse.Error,
			StatusCode: resp.StatusCode,
		}, nil, ""
	}
	// Reset response body
	usage := &dbdodel.Usage{
		PromptTokens:     promptTokens,
		CompletionTokens: calculatePromptTokens(string(responseBody)),
		TotalTokens:      promptTokens + calculatePromptTokens(string(responseBody)),
	}

	jsonResponse := map[string]interface{}{
		"id":      randomID(),
		"object":  "chat.completion",
		"created": int(time.Now().Unix()),
		"model":   model,
		"usage":   usage,
		"choices": []map[string]interface{}{
			{
				"index": 0,
				"message": map[string]string{
					"role":    "assistant",
					"content": string(responseBody) + "\n\n" + fixedContent,
				},
				"finish_reason": "stop",
			},
		},
	}
	if err != nil {
		return openai.ErrorWrapper(err, "read_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	err = resp.Body.Close()
	if err != nil {
		return openai.ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError), nil, ""
	}

	jsonData, err := json.Marshal(jsonResponse)
	if err != nil {
		return openai.ErrorWrapper(err, "marshal_response_body_failed", http.StatusInternalServerError), nil, ""
	}

	// Reset response body
	resp.Body = io.NopCloser(bytes.NewBuffer(jsonData))

	err = json.Unmarshal(jsonData, &textResponse)
	if err != nil {
		return openai.ErrorWrapper(err, "unmarshal_response_body_failed", http.StatusInternalServerError), nil, ""
	}

	for k, v := range resp.Header {
		c.Writer.Header().Set(k, v[0])
	}
	c.Writer.WriteHeader(resp.StatusCode)
	_, err = io.Copy(c.Writer, resp.Body)
	if err != nil {
		return openai.ErrorWrapper(err, "copy_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	err = resp.Body.Close()
	if err != nil {
		return openai.ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	if textResponse.Usage.TotalTokens == 0 {
		completionTokens := openai.CountTokenText(string(responseBody), model)

		textResponse.Usage = dbdodel.Usage{
			PromptTokens:     promptTokens,
			CompletionTokens: completionTokens,
			TotalTokens:      promptTokens + completionTokens,
		}
	}

	return nil, &textResponse.Usage, string(responseBody)
}
