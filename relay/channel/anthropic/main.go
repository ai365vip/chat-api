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

// Thinking 定义了 Claude 模型的思考功能配置
type Thinking struct {
	Type         string `json:"type"`
	BudgetTokens int    `json:"budget_tokens"`
}

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
	// 创建一个临时的 string 变量来存储 system 消息
	var systemMessage string
	claudeRequest.Messages = ConvertMessagesLegacy(textRequest.Messages, &systemMessage)
	// 将转换后的 system 消息赋值给 claudeRequest.System
	claudeRequest.System = systemMessage
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
		Thinking:    request.Thinking,
		Temperature: request.Temperature,
		TopP:        request.TopP,
		TopK:        request.TopK,
		System:      request.System,
	}
	if strings.HasSuffix(request.Model, "-thinking") {

		if claudeRequest.MaxTokens == 0 {
			claudeRequest.MaxTokens = 8192
		}

		if claudeRequest.MaxTokens < 1280 {
			claudeRequest.MaxTokens = 1280
		}
		claudeRequest.TopP = 0
		claudeRequest.Thinking = &Thinking{
			Type:         "enabled",
			BudgetTokens: int(float64(claudeRequest.MaxTokens) * 0.8),
		}
		claudeRequest.Model = strings.TrimSuffix(request.Model, "-thinking")
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
			InputSchema: convertInputSchema(*tool.InputSchema),
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

	switch v := toolChoice.(type) {
	case string:
		if v == "auto" || v == "any" {
			claudeToolChoice["type"] = "tool_use"
		}
	case map[string]any:
		if function, ok := v["function"].(map[string]any); ok {
			claudeToolChoice["type"] = "tool_use"
			claudeToolChoice["name"] = function["name"].(string)

			// 生成唯一 ID
			toolUseId := "toolu_" + uuid.New().String()
			claudeToolChoice["id"] = toolUseId

			// 处理 arguments
			if args, ok := function["arguments"].(string); ok {
				var inputArgs map[string]interface{}
				if err := json.Unmarshal([]byte(args), &inputArgs); err == nil {
					claudeToolChoice["input"] = inputArgs
				}
			}
		}
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
	var claudeMessages []Message
	lastRole := ""

	for _, message := range messages {
		// Handle system message
		if message.Role == "system" {
			*system = message.StringContent()
			continue
		}

		claudeMessage := Message{
			Role: message.Role,
		}

		// Handle tool calls
		if len(message.ToolCalls) > 0 {
			claudeMessage.Role = "assistant"
			for _, toolCall := range message.ToolCalls {
				inputParam := make(map[string]any)
				if args, ok := toolCall.Function.Arguments.(string); ok {
					_ = json.Unmarshal([]byte(args), &inputParam)
				}
				claudeMessage.Content = []Content{{
					Type:  "tool_use",
					Id:    toolCall.Id,
					Name:  toolCall.Function.Name,
					Input: inputParam,
				}}
			}
			claudeMessages = append(claudeMessages, claudeMessage)
			lastRole = "assistant"
			continue
		}

		// Handle tool responses
		if message.Role == "tool" {
			if lastRole != "user" {
				claudeMessages = append(claudeMessages, Message{
					Role: "user",
					Content: []Content{{
						Type: "text",
						Text: "_",
					}},
				})
			}

			claudeMessage.Role = "assistant"
			claudeMessage.Content = []Content{{
				Type:      "tool_result",
				Content:   message.StringContent(),
				ToolUseId: message.ToolCallId,
			}}
			claudeMessages = append(claudeMessages, claudeMessage)
			lastRole = "assistant"
			continue
		}

		// Handle regular messages
		if message.Role == "" {
			claudeMessage.Role = "user"
		}

		// Add intermediate message if needed
		if lastRole == claudeMessage.Role && lastRole != "" {
			intermediateRole := "assistant"
			if lastRole == "assistant" {
				intermediateRole = "user"
			}
			claudeMessages = append(claudeMessages, Message{
				Role: intermediateRole,
				Content: []Content{{
					Type: "text",
					Text: "_",
				}},
			})
		}

		// Handle message content
		if message.IsStringContent() {
			content := message.StringContent()
			if content == "" {
				content = "_"
			}
			claudeMessage.Content = []Content{{
				Type: "text",
				Text: content,
			}}
		} else if message.Content != nil {
			var contents []Content
			openaiContent := message.ParseContent()
			for _, part := range openaiContent {
				switch part.Type {
				case model.ContentTypeText:
					text := part.Text
					if text == "" {
						text = "_"
					}
					contents = append(contents, Content{
						Type: "text",
						Text: text,
					})
				case model.ContentTypeImageURL:
					if imageInfo, ok := part.ImageUrl.(model.MessageImageUrl); ok {
						mimeType, data, _ := image.GetImageFromUrl(imageInfo.Url)
						contents = append(contents, Content{
							Type: "image",
							Source: &ImageSource{
								Type:      "base64",
								MediaType: mimeType,
								Data:      data,
							},
						})
					}
				}
			}
			if len(contents) > 0 {
				claudeMessage.Content = contents
			}
		}

		if len(claudeMessage.Content) > 0 {
			claudeMessages = append(claudeMessages, claudeMessage)
			lastRole = claudeMessage.Role
		}
	}

	// Ensure last message is from user
	if len(claudeMessages) > 0 && lastRole != "user" {
		claudeMessages = append(claudeMessages, Message{
			Role: "user",
			Content: []Content{{
				Type: "text",
				Text: "_",
			}},
		})
	}

	return claudeMessages
}

// 新的 ConverClaudeRequest 中的消息转换逻辑
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

	var responseText string
	var toolCalls []model.Tool
	var thinkingText string

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
			} else if content.Type == "thinking" {
				// 处理思考内容
				thinkingText = content.Thinking
			}
		}
	}

	// 如果有思考内容，添加到响应文本前面
	if thinkingText != "" {
		responseText = "<think>" + thinkingText + "</think>\n\n" + responseText
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

	// 生成默认ID如果不存在
	responseId := claudeResponse.Id
	if responseId == "" {
		responseId = helper.GetUUID()
	}

	fullTextResponse := openai.TextResponse{
		Id:      fmt.Sprintf("chatcmpl-%s", responseId),
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

	return &fullTextResponse
}

// https://docs.anthropic.com/claude/reference/messages-streaming
func StreamResponseClaude2OpenAI(claudeResponse *StreamResponse) (*openai.ChatCompletionsStreamResponse, *Response) {
	var response *Response
	var responseText string
	var stopReason string
	tools := make([]model.Tool, 0)

	switch claudeResponse.Type {
	case "message_start":
		if claudeResponse.Message != nil {
			response = &Response{
				Usage: Usage{
					InputTokens:  claudeResponse.Message.Usage.InputTokens,
					OutputTokens: 0,
				},
			}
		}
		return nil, response
	case "content_block_start":
		if claudeResponse.ContentBlock != nil {
			if claudeResponse.ContentBlock.Type == "thinking" {
				responseText = "<think>"
			} else {
				responseText = claudeResponse.ContentBlock.Text
			}
			if claudeResponse.ContentBlock.Type == "tool_use" {
				tools = append(tools, model.Tool{
					Id:   claudeResponse.ContentBlock.Id,
					Type: "function",
					Function: model.Function{
						Name:      claudeResponse.ContentBlock.Name,
						Arguments: "",
					},
				})
			}
		}
	case "content_block_delta":
		if claudeResponse.Delta != nil {
			if claudeResponse.Delta.Type == "thinking_delta" {
				responseText = claudeResponse.Delta.Thinking
			} else if claudeResponse.Delta.Type == "signature_delta" {
				responseText = "</think>\n\n"
			} else if claudeResponse.Delta.Type == "text_delta" {
				responseText = claudeResponse.Delta.Text
			} else if claudeResponse.Delta.Type == "input_json_delta" {
				tools = append(tools, model.Tool{
					Function: model.Function{
						Arguments: claudeResponse.Delta.PartialJson,
					},
				})
			}
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
	if len(tools) > 0 {
		choice.Delta.Content = nil // compatible with other OpenAI derivative applications, like LobeOpenAICompatibleFactory ...
		choice.Delta.ToolCalls = tools
	}
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
	var lastToolCallChoice openai.ChatCompletionsStreamResponseChoice
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
				if len(meta.Id) > 0 { // only message_start has an id, otherwise it's a finish_reason event.
					id = fmt.Sprintf("chatcmpl-%s", meta.Id)
					return true
				} else { // finish_reason case
					ProcessToolCalls(&lastToolCallChoice, response)
				}
			}
			if response == nil {
				return true
			}
			if response != nil && len(response.Choices) > 0 {
				choice := response.Choices[0]
				if choice.Delta.Content != nil {
					if content, ok := choice.Delta.Content.(string); ok {
						responseTextBuilder.WriteString(content)
					} else if content, ok := choice.Delta.Content.(map[string]interface{}); ok {
						// 处理其他可能的内容类型
						if textContent, exists := content["text"].(string); exists {
							responseTextBuilder.WriteString(textContent)
						}
					}
				}
			}
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
			if responseTextBuilder.String() != "" {
				c.Render(-1, common.CustomEvent{Data: "data: [DONE]"})
			}
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
	fullTextResponse := ResponseClaude2OpenAI(&claudeResponse)
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

	if len(claudeResponse.Content) > 0 {
		var thinkingText string
		var responseText string

		for _, content := range claudeResponse.Content {
			if content.Type == "thinking" {
				thinkingText = content.Thinking
			} else if content.Type == "text" {
				responseText = content.Text
			}
		}

		if thinkingText != "" {
			aitext = "<think>" + thinkingText + "</think>\n\n" + responseText
		} else {
			aitext = responseText
		}
	}
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
func ProcessToolCalls(lastToolCallChoice *openai.ChatCompletionsStreamResponseChoice, response *openai.ChatCompletionsStreamResponse) {
	if len(lastToolCallChoice.Delta.ToolCalls) > 0 {
		lastToolCall := &lastToolCallChoice.Delta.ToolCalls[len(lastToolCallChoice.Delta.ToolCalls)-1]
		if lastToolCall != nil && lastToolCall.Function.Arguments == nil {
			lastToolCall.Function.Arguments = "{}"
			response.Choices[len(response.Choices)-1].Delta.Content = nil
			response.Choices[len(response.Choices)-1].Delta.ToolCalls = lastToolCallChoice.Delta.ToolCalls
		}
	}
}
