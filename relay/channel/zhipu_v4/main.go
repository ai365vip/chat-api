package zhipu_v4

import (
	"bufio"
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"one-api/common"
	"one-api/relay/channel/openai"
	"one-api/relay/model"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
)

// https://open.bigmodel.cn/doc/api#chatglm_std
// chatglm_std, chatglm_lite
// https://open.bigmodel.cn/api/paas/v3/model-api/chatglm_std/invoke
// https://open.bigmodel.cn/api/paas/v3/model-api/chatglm_std/sse-invoke

var zhipuTokens sync.Map
var expSeconds int64 = 24 * 3600

func requestOpenAI2Zhipu(request model.GeneralOpenAIRequest) *model.GeneralOpenAIRequest {
	messages := make([]model.Message, 0, len(request.Messages))
	for _, message := range request.Messages {
		messages = append(messages, model.Message{
			Role:       message.Role,
			Content:    message.Content,
			ToolCalls:  message.ToolCalls,
			ToolCallId: message.ToolCallId,
		})
	}

	str, ok := request.Stop.(string)
	var Stop []string
	if ok {
		Stop = []string{str}
	} else {
		Stop, _ = request.Stop.([]string)
	}
	topP := request.TopP
	if topP == 1 {
		topP = 0.99
	} else if topP == 0 {
		topP = 0.01
	}
	return &model.GeneralOpenAIRequest{
		Model:       request.Model,
		Stream:      request.Stream,
		Messages:    messages,
		Temperature: request.Temperature,
		TopP:        topP,
		MaxTokens:   request.MaxTokens,
		Stop:        Stop,
		Tools:       request.Tools,
		ToolChoice:  request.ToolChoice,
	}
}

//	func responseZhipu2OpenAI(response *dto.OpenAITextResponse) *dto.OpenAITextResponse {
//		fullTextResponse := dto.OpenAITextResponse{
//			Id:      response.Id,
//			Object:  "chat.completion",
//			Created: common.GetTimestamp(),
//			Choices: make([]dto.OpenAITextResponseChoice, 0, len(response.TextResponseChoices)),
//			Usage:   response.Usage,
//		}
//		for i, choice := range response.TextResponseChoices {
//			content, _ := json.Marshal(strings.Trim(choice.Content, "\""))
//			openaiChoice := dto.OpenAITextResponseChoice{
//				Index: i,
//				Message: dto.Message{
//					Role:    choice.Role,
//					Content: content,
//				},
//				FinishReason: "",
//			}
//			if i == len(response.TextResponseChoices)-1 {
//				openaiChoice.FinishReason = "stop"
//			}
//			fullTextResponse.Choices = append(fullTextResponse.Choices, openaiChoice)
//		}
//		return &fullTextResponse
//	}

func getZhipuToken(apikey string) string {
	data, ok := zhipuTokens.Load(apikey)
	if ok {
		tokenData := data.(tokenData)
		if time.Now().Before(tokenData.ExpiryTime) {
			return tokenData.Token
		}
	}

	split := strings.Split(apikey, ".")
	if len(split) != 2 {
		common.SysError("invalid zhipu key: " + apikey)
		return ""
	}

	id := split[0]
	secret := split[1]

	expMillis := time.Now().Add(time.Duration(expSeconds)*time.Second).UnixNano() / 1e6
	expiryTime := time.Now().Add(time.Duration(expSeconds) * time.Second)

	timestamp := time.Now().UnixNano() / 1e6

	payload := jwt.MapClaims{
		"api_key":   id,
		"exp":       expMillis,
		"timestamp": timestamp,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, payload)

	token.Header["alg"] = "HS256"
	token.Header["sign_type"] = "SIGN"

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return ""
	}

	zhipuTokens.Store(apikey, tokenData{
		Token:      tokenString,
		ExpiryTime: expiryTime,
	})

	return tokenString
}

func streamResponseZhipu2OpenAI(zhipuResponse *ZhipuV4StreamResponse) *ChatCompletionsStreamResponse {
	var choice ChatCompletionsStreamResponseChoice
	choice.Delta.Content = zhipuResponse.Choices[0].Delta.Content
	choice.Delta.Role = zhipuResponse.Choices[0].Delta.Role
	choice.Delta.ToolCalls = zhipuResponse.Choices[0].Delta.ToolCalls
	choice.Index = zhipuResponse.Choices[0].Index
	choice.FinishReason = zhipuResponse.Choices[0].FinishReason
	response := ChatCompletionsStreamResponse{
		Id:      zhipuResponse.Id,
		Object:  "chat.completion.chunk",
		Created: zhipuResponse.Created,
		Model:   "glm-4",
		Choices: []ChatCompletionsStreamResponseChoice{choice},
	}
	return &response
}

func lastStreamResponseZhipuV42OpenAI(zhipuResponse *ZhipuV4StreamResponse) (*ChatCompletionsStreamResponse, *model.Usage) {
	response := streamResponseZhipu2OpenAI(zhipuResponse)
	return response, &zhipuResponse.Usage
}

func zhipuStreamHandler(c *gin.Context, resp *http.Response) (*model.ErrorWithStatusCode, *model.Usage, string) {
	var usage *model.Usage
	aitext := ""

	scanner := bufio.NewScanner(resp.Body)
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
		for scanner.Scan() {
			data := scanner.Text()
			if len(data) < 6 { // ignore blank line or wrong format
				continue
			}
			if data[:6] != "data: " {
				continue
			}
			dataChan <- data[6:] // Send without "data: " prefix
		}
		close(dataChan) // Ensure to close the channel after the loop
	}()
	common.SetEventStreamHeaders(c)
	c.Stream(func(w io.Writer) bool {
		select {
		case data, ok := <-dataChan:
			if !ok {
				return false // Stop streaming if channel is closed
			}

			// 一些实现可能在数据末尾添加了 \r，需要去除
			data = strings.TrimSuffix(data, "\r")
			if data == "[DONE]" {
				return false // Handle the special "[DONE]" message
			}

			var streamResponse ZhipuV4StreamResponse
			err := json.Unmarshal([]byte(data), &streamResponse)
			if err != nil {
				common.SysError("error unmarshalling stream response: " + err.Error())
				return false // Consider stopping the stream on JSON error
			}
			var response *ChatCompletionsStreamResponse
			if strings.Contains(data, "prompt_tokens") {
				response, usage = lastStreamResponseZhipuV42OpenAI(&streamResponse)
			} else {
				response = streamResponseZhipu2OpenAI(&streamResponse)
			}

			jsonResponse, err := json.Marshal(response)
			if err != nil {
				common.SysError("error marshalling stream response: " + err.Error())
				return false
			}
			c.Render(-1, common.CustomEvent{Data: "data: " + string(jsonResponse)})
			return true
		case <-stopChan:
			return false
		}
	})
	err := resp.Body.Close()
	if err != nil {
		return openai.ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	return nil, usage, aitext
}

func zhipuHandler(c *gin.Context, resp *http.Response) (*model.ErrorWithStatusCode, *model.Usage, string) {
	var textResponse ZhipuV4Response
	aitext := ""
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return openai.ErrorWrapper(err, "read_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	err = resp.Body.Close()
	if err != nil {
		return openai.ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	err = json.Unmarshal(responseBody, &textResponse)
	if err != nil {
		return openai.ErrorWrapper(err, "unmarshal_response_body_failed", http.StatusInternalServerError), nil, ""
	}
	if textResponse.Error.Type != "" {
		return &model.ErrorWithStatusCode{
			Error: model.Error{
				Code: textResponse.Error,
			},
			StatusCode: resp.StatusCode,
		}, nil, ""
	}
	// 累加每个选择的内容到 aitext
	for _, choice := range textResponse.TextResponseChoices {
		var contentStr string
		err := json.Unmarshal(choice.Content, &contentStr)
		if err != nil {
			// 处理错误或跳过
			continue
		}
		aitext = contentStr
	}
	// Reset response body
	resp.Body = io.NopCloser(bytes.NewBuffer(responseBody))

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

	return nil, &textResponse.Usage, aitext
}
