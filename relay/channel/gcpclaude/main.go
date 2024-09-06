package gcpclaude

import (
	"encoding/json"
	"fmt"
	"log"
	"one-api/common/image"
	"one-api/relay/channel/anthropic"
	"one-api/relay/model"
	"strings"
)

func ConvertRequest(textRequest model.GeneralOpenAIRequest) *Request {
	claudeRequest := createBaseRequest(textRequest)

	if len(textRequest.Tools) > 0 {
		claudeRequest.Tools = convertToolsLegacy(textRequest.Tools)
		claudeRequest.ToolChoice = convertToolChoice(textRequest.ToolChoice)
	}

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

	return claudeRequest
}

// 共享的辅助函数

func createBaseRequest(request model.GeneralOpenAIRequest) *Request {
	claudeRequest := &Request{
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
	if claudeRequest.AnthropicVersion == "" {
		claudeRequest.AnthropicVersion = "vertex-2023-10-16"
	}
	return claudeRequest
}

func convertToolsLegacy(tools []model.Tool) []anthropic.Tool {
	claudeTools := make([]anthropic.Tool, 0, len(tools))
	for _, tool := range tools {
		if params, ok := tool.Function.Parameters.(map[string]any); ok {
			claudeTools = append(claudeTools, anthropic.Tool{
				Name:        tool.Function.Name,
				Description: tool.Function.Description,
				InputSchema: anthropic.InputSchema{
					Type:       params["type"].(string),
					Properties: params["properties"],
					Required:   params["required"],
				},
			})
		}
	}
	return claudeTools
}

func convertTools(tools []model.Tool) ([]anthropic.Tool, error) {
	claudeTools := make([]anthropic.Tool, 0, len(tools))
	for _, tool := range tools {
		params, ok := tool.Function.Parameters.(map[string]interface{})
		if !ok {
			return nil, fmt.Errorf("invalid parameters format in function")
		}
		toolType, ok := params["type"].(string)
		if !ok {
			return nil, fmt.Errorf("invalid tool type")
		}
		claudeTools = append(claudeTools, anthropic.Tool{
			Name:        tool.Function.Name,
			Description: tool.Function.Description,
			InputSchema: anthropic.InputSchema{
				Type:       toolType,
				Properties: params["properties"],
				Required:   params["required"],
			},
		})
	}
	return claudeTools, nil
}

func convertToolChoice(toolChoice any) *struct {
	Type string `json:"type"`
	Name string `json:"name,omitempty"`
} {
	if toolChoice == nil {
		return nil
	}

	claudeToolChoice := &struct {
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

// 原有的 ConvertRequest 中的消息转换逻辑
func convertMessagesLegacy(messages []model.Message, system *string) []anthropic.Message {
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

	var claudeMessages []anthropic.Message

	for _, message := range formatMessages {
		if message.Role == "system" && *system == "" {
			*system = message.StringContent()
			continue
		}
		claudeMessage := anthropic.Message{
			Role: message.Role,
		}
		var content anthropic.Content
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
				toolUseContent := anthropic.Content{
					Type:  "tool_use",
					Id:    message.ToolCalls[i].Id,
					Name:  message.ToolCalls[i].Function.Name,
					Input: inputParam,
				}
				claudeMessage.Content = append(claudeMessage.Content, toolUseContent)
			}
			claudeMessages = append(claudeMessages, claudeMessage)
			continue
		}
		var contents []anthropic.Content
		openaiContent := message.ParseContent()

		for _, part := range openaiContent {
			var content anthropic.Content
			if part.Type == model.ContentTypeText {
				content.Type = "text"
				content.Text = part.Text
			} else if part.Type == model.ContentTypeImageURL {
				content.Type = "image"
				content.Source = &anthropic.ImageSource{
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
func convertMessages(messages []model.Message) ([]anthropic.Message, error) {
	var formatMessages []anthropic.Message
	var lastMessage *anthropic.Message

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

		fmtMessage := anthropic.Message{
			Role:    message.Role,
			Content: claudeContent,
		}

		// 检查是否应该合并消息
		if lastMessage != nil && (lastMessage.Role == fmtMessage.Role) &&
			isStringContent(lastMessage.Content) && isStringContent(fmtMessage.Content) {
			content := strings.Trim(fmt.Sprintf("%s %s", getStringContent(lastMessage.Content), getStringContent(fmtMessage.Content)), "\"")
			fmtMessage.Content = []anthropic.Content{{Type: "text", Text: content}}

			// 删除上一条消息
			formatMessages = formatMessages[:len(formatMessages)-1]
		}

		// 处理 Content 为空的情况
		if len(fmtMessage.Content) == 0 {
			fmtMessage.Content = []anthropic.Content{{Type: "text", Text: "..."}}
		}

		// 添加新的或修改后的消息到列表
		formatMessages = append(formatMessages, fmtMessage)

		lastMessage = &fmtMessage // 更新 lastMessage 为当前处理的消息
	}

	return formatMessages, nil
}

func convertContent(content interface{}) ([]anthropic.Content, error) {
	switch c := content.(type) {
	case string:
		return []anthropic.Content{{Type: "text", Text: c}}, nil
	case []interface{}:
		var claudeContents []anthropic.Content
		for _, item := range c {
			if contentMap, ok := item.(map[string]interface{}); ok {
				claudeContent := anthropic.Content{
					Type: contentMap["type"].(string),
				}
				if text, ok := contentMap["text"].(string); ok {
					claudeContent.Text = text
				}
				if source, ok := contentMap["source"].(map[string]interface{}); ok {
					claudeContent.Source = &anthropic.ImageSource{
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
func isStringContent(content []anthropic.Content) bool {
	return len(content) == 1 && content[0].Type == "text"
}

// 辅助函数：获取字符串内容
func getStringContent(content []anthropic.Content) string {
	if isStringContent(content) {
		return content[0].Text
	}
	return ""
}
