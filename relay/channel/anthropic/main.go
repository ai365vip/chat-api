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
		claudeRequest.Tools = convertToolsLegacy(textRequest.Tools)
		claudeRequest.ToolChoice = convertToolChoice(textRequest.ToolChoice)
	}
	claudeRequest = applyLegacyModelMapping(claudeRequest)
	claudeRequest.Messages = convertMessagesLegacy(textRequest.Messages, &claudeRequest.System)
	return claudeRequest
}

func ConverClaudeRequest(request model.GeneralOpenAIRequest) *Request {
	claudeRequest := createBaseRequest(request)
	var err error
	claudeRequest.Messages, err = convertMessages(request.Messages)
	if err != nil {
		return nil
	}
	if len(request.Tools) > 0 {
		claudeRequest.Tools, err = convertTools(request.Tools)
		if err != nil {
			return nil
		}
		claudeRequest.ToolChoice = convertToolChoice(request.ToolChoice)
	}

	if err != nil {
		return nil
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

func convertToolsLegacy(tools []model.Tool) []Tool {
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

func convertTools(tools []model.Tool) ([]Tool, error) {
	claudeTools := make([]Tool, 0, len(tools))
	for _, tool := range tools {
		params, ok := tool.Function.Parameters.(map[string]interface{})
		if !ok {
			return nil, fmt.Errorf("invalid parameters format in function")
		}
		toolType, ok := params["type"].(string)
		if !ok {
			return nil, fmt.Errorf("invalid tool type")
		}
		claudeTools = append(claudeTools, Tool{
			Name:        tool.Function.Name,
			Description: tool.Function.Description,
			InputSchema: InputSchema{
				Type:       toolType,
				Properties: params["properties"],
				Required:   params["required"],
			},
		})
	}
	return claudeTools, nil
}

func convertToolChoice(toolChoice any) struct {
	Type string `json:"type"`
	Name string `json:"name,omitempty"`
} {
	claudeToolChoice := struct {
		Type string `json:"type"`
		Name string `json:"name,omitempty"`
	}{Type: "auto"}

	if choice, ok := toolChoice.(map[string]any); ok {
		if function, ok := choice["function"].(map[string]any); ok {
			claudeToolChoice.Type = "tool"
			claudeToolChoice.Name = function["name"].(string)
		}
	} else if toolChoiceType, ok := toolChoice.(string); ok && toolChoiceType == "any" {
		claudeToolChoice.Type = toolChoiceType
	}

	return claudeToolChoice
}

func applyLegacyModelMapping(request *Request) *Request {
	switch request.Model {
	case "claude-instant-1":
		request.Model = "claude-instant-1.1"
	case "claude-2":
		request.Model = "claude-2.1"
	}
	return request
}

// 原有的 ConvertRequest 中的消息转换逻辑
func convertMessagesLegacy(messages []model.Message, system *string) []Message {
	formatMessages := make([]model.Message, 0)
	var lastMessage *model.Message
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
			Role:    message.Role,
			Content: message.Content,
		}

		if lastMessage != nil && (lastMessage.Role == message.Role) &&
			lastMessage.IsStringContent() && message.IsStringContent() {
			content := strings.Trim(fmt.Sprintf("%s %s", lastMessage.StringContent(), message.StringContent()), "\"")
			fmtMessage.Content = content

			formatMessages = formatMessages[:len(formatMessages)-1]
		}

		if fmtMessage.Content == nil {
			content, _ := json.Marshal("...")
			fmtMessage.Content = content
		}

		formatMessages = append(formatMessages, fmtMessage)

		lastMessage = &fmtMessage
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

// 新的 ConverClaudeRequest 中的消息转换逻辑
func convertMessages(messages []model.Message) ([]Message, error) {
	var formatMessages []Message
	var lastMessage *Message

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

		// 转换内容
		claudeContent, err := convertContent(message.Content)
		if err != nil {
			return nil, fmt.Errorf("convert content error for message %d: %v", i, err)
		}

		fmtMessage := Message{
			Role:    message.Role,
			Content: claudeContent,
		}

		// 检查是否应该合并消息
		if lastMessage != nil && (lastMessage.Role == fmtMessage.Role) &&
			isStringContent(lastMessage.Content) && isStringContent(fmtMessage.Content) {
			content := strings.Trim(fmt.Sprintf("%s %s", getStringContent(lastMessage.Content), getStringContent(fmtMessage.Content)), "\"")
			fmtMessage.Content = []Content{{Type: "text", Text: content}}

			// 删除上一条消息
			formatMessages = formatMessages[:len(formatMessages)-1]
		}

		// 处理 Content 为空的情况
		if len(fmtMessage.Content) == 0 {
			fmtMessage.Content = []Content{{Type: "text", Text: "..."}}
		}

		// 添加新的或修改后的消息到列表
		formatMessages = append(formatMessages, fmtMessage)

		lastMessage = &fmtMessage // 更新 lastMessage 为当前处理的消息
	}

	return formatMessages, nil
}

func convertContent(content interface{}) ([]Content, error) {
	switch c := content.(type) {
	case string:
		return []Content{{Type: "text", Text: c}}, nil
	case []interface{}:
		var claudeContents []Content
		for _, item := range c {
			if contentMap, ok := item.(map[string]interface{}); ok {
				claudeContent := Content{
					Type: contentMap["type"].(string),
				}
				if text, ok := contentMap["text"].(string); ok {
					claudeContent.Text = text
				}
				if source, ok := contentMap["source"].(map[string]interface{}); ok {
					claudeContent.Source = &ImageSource{
						Type:      source["type"].(string),
						MediaType: source["media_type"].(string),
						Data:      source["data"].(string),
					}
				}
				claudeContents = append(claudeContents, claudeContent)
			} else {
				return nil, fmt.Errorf("invalid content item type")
			}
		}
		return claudeContents, nil
	default:
		return nil, fmt.Errorf("unsupported content type")
	}
}

// 辅助函数：检查内容是否为字符串
func isStringContent(content []Content) bool {
	return len(content) == 1 && content[0].Type == "text"
}

// 辅助函数：获取字符串内容
func getStringContent(content []Content) string {
	if isStringContent(content) {
		return content[0].Text
	}
	return ""
}

func ResponseClaude2OpenAI(claudeResponse *Response) *openai.TextResponse {
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
