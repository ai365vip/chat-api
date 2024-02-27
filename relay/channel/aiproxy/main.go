package aiproxy

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"one-api/common"
	"one-api/common/helper"
	"one-api/common/logger"
	"one-api/relay/channel/openai"
	"one-api/relay/constant"
	"one-api/relay/model"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// https://docs.aiproxy.io/dev/library#使用已经定制好的知识库进行对话问答

func ConvertRequest(request model.GeneralOpenAIRequest) *LibraryRequest {
	query := ""
	if len(request.Messages) != 0 {
		query = request.Messages[len(request.Messages)-1].StringContent()
	}
	return &LibraryRequest{
		Model:  request.Model,
		Stream: request.Stream,
		Query:  query,
	}
}

func aiProxyDocuments2Markdown(documents []LibraryDocument) string {
	if len(documents) == 0 {
		return ""
	}
	content := "\n\n参考文档：\n"
	for i, document := range documents {
		content += fmt.Sprintf("%d. [%s](%s)\n", i+1, document.Title, document.URL)
	}
	return content
}

func responseAIProxyLibrary2OpenAI(response *LibraryResponse) *openai.TextResponse {
	content, _ := json.Marshal(response.Answer + aiProxyDocuments2Markdown(response.Documents))
	choice := openai.TextResponseChoice{
		Index: 0,
		Message: model.Message{
			Role:    "assistant",
			Content: content,
		},
		FinishReason: "stop",
	}
	fullTextResponse := openai.TextResponse{
		Id:      fmt.Sprintf("chatcmpl-%s", helper.GetUUID()),
		Object:  "chat.completion",
		Created: helper.GetTimestamp(),
		Choices: []openai.TextResponseChoice{choice},
	}
	return &fullTextResponse
}

func documentsAIProxyLibrary(documents []LibraryDocument) *openai.ChatCompletionsStreamResponse {
	var choice openai.ChatCompletionsStreamResponseChoice
	choice.Delta.Content = aiProxyDocuments2Markdown(documents)
	choice.FinishReason = &constant.StopFinishReason
	return &openai.ChatCompletionsStreamResponse{
		Id:      fmt.Sprintf("chatcmpl-%s", helper.GetUUID()),
		Object:  "chat.completion.chunk",
		Created: helper.GetTimestamp(),
		Model:   "",
		Choices: []openai.ChatCompletionsStreamResponseChoice{choice},
	}
}

func streamResponseAIProxyLibrary2OpenAI(response *LibraryStreamResponse) *openai.ChatCompletionsStreamResponse {
	var choice openai.ChatCompletionsStreamResponseChoice
	choice.Delta.Content = response.Content
	return &openai.ChatCompletionsStreamResponse{
		Id:      fmt.Sprintf("chatcmpl-%s", helper.GetUUID()),
		Object:  "chat.completion.chunk",
		Created: helper.GetTimestamp(),
		Model:   response.Model,
		Choices: []openai.ChatCompletionsStreamResponseChoice{choice},
	}
}

func StreamHandler(c *gin.Context, resp *http.Response) (*model.ErrorWithStatusCode, *model.Usage, string) {
	var usage model.Usage
	responseText := ""
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
			if len(data) < 5 { // ignore blank line or wrong format
				continue
			}
			if data[:5] != "data:" {
				continue
			}
			data = data[5:]
			dataChan <- data
		}
		stopChan <- true
	}()
	common.SetEventStreamHeaders(c)
	var documents []LibraryDocument
	c.Stream(func(w io.Writer) bool {
		select {
		case data := <-dataChan:
			var AIProxyLibraryResponse LibraryStreamResponse
			err := json.Unmarshal([]byte(data), &AIProxyLibraryResponse)
			if err != nil {
				logger.SysError("error unmarshalling stream response: " + err.Error())
				return true
			}
			if len(AIProxyLibraryResponse.Documents) != 0 {
				documents = AIProxyLibraryResponse.Documents
			}
			response := streamResponseAIProxyLibrary2OpenAI(&AIProxyLibraryResponse)
			jsonResponse, err := json.Marshal(response)
			if err != nil {
				logger.SysError("error marshalling stream response: " + err.Error())
				return true
			}
			c.Render(-1, common.CustomEvent{Data: "data: " + string(jsonResponse)})
			responseText += AIProxyLibraryResponse.Content
			return true
		case <-stopChan:
			response := documentsAIProxyLibrary(documents)
			jsonResponse, err := json.Marshal(response)
			if err != nil {
				logger.SysError("error marshalling stream response: " + err.Error())
				return true
			}
			c.Render(-1, common.CustomEvent{Data: "data: " + string(jsonResponse)})
			c.Render(-1, common.CustomEvent{Data: "data: [DONE]"})
			return false
		}
	})
	err := resp.Body.Close()
	if err != nil {
		return openai.ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError), nil, responseText
	}
	return nil, &usage, responseText
}

func Handler(c *gin.Context, resp *http.Response) (*model.ErrorWithStatusCode, *model.Usage, string) {
	var AIProxyLibraryResponse LibraryResponse
	responseText := ""
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return openai.ErrorWrapper(err, "read_response_body_failed", http.StatusInternalServerError), nil, responseText
	}
	err = resp.Body.Close()
	if err != nil {
		return openai.ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError), nil, responseText
	}
	err = json.Unmarshal(responseBody, &AIProxyLibraryResponse)
	if err != nil {
		return openai.ErrorWrapper(err, "unmarshal_response_body_failed", http.StatusInternalServerError), nil, responseText
	}
	if AIProxyLibraryResponse.ErrCode != 0 {
		return &model.ErrorWithStatusCode{
			Error: model.Error{
				Message: AIProxyLibraryResponse.Message,
				Type:    strconv.Itoa(AIProxyLibraryResponse.ErrCode),
				Code:    AIProxyLibraryResponse.ErrCode,
			},
			StatusCode: resp.StatusCode,
		}, nil, responseText
	}
	fullTextResponse := responseAIProxyLibrary2OpenAI(&AIProxyLibraryResponse)

	jsonResponse, err := json.Marshal(fullTextResponse)
	if err != nil {
		return openai.ErrorWrapper(err, "marshal_response_body_failed", http.StatusInternalServerError), nil, responseText
	}
	c.Writer.Header().Set("Content-Type", "application/json")
	c.Writer.WriteHeader(resp.StatusCode)
	_, err = c.Writer.Write(jsonResponse)
	if err != nil {
		return openai.ErrorWrapper(err, "write_response_body_failed", http.StatusInternalServerError), nil, responseText
	}
	return nil, &fullTextResponse.Usage, responseText
}
