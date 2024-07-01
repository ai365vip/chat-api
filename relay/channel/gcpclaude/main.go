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
	claudeRequest := Request{
		MaxTokens:        textRequest.MaxTokens,
		Stream:           textRequest.Stream,
		Temperature:      textRequest.Temperature,
		TopP:             textRequest.TopP,
		TopK:             textRequest.TopK,
		System:           textRequest.System,
		AnthropicVersion: textRequest.AnthropicVersion,
	}
	if claudeRequest.MaxTokens == 0 {
		claudeRequest.MaxTokens = 4096
	}
	if claudeRequest.AnthropicVersion == "" {
		claudeRequest.AnthropicVersion = "vertex-2023-10-16"
	}
	formatMessages := make([]model.Message, 0)
	var lastMessage *model.Message
	for i, message := range textRequest.Messages {
		if message.Role == "system" {
			if i != 0 {
				message.Role = "user"
			}
		}
		if message.Role == "" {
			message.Role = "user"
		}

		// 创建新的消息结构
		fmtMessage := model.Message{
			Role:    message.Role,
			Content: message.Content,
		}

		// 检查是否应该合并消息
		if lastMessage != nil && (lastMessage.Role == message.Role) &&
			lastMessage.IsStringContent() && message.IsStringContent() {
			content := strings.Trim(fmt.Sprintf("%s %s", lastMessage.StringContent(), message.StringContent()), "\"")
			fmtMessage.Content = content

			// 删除上一条消息
			formatMessages = formatMessages[:len(formatMessages)-1]
		}

		// 处理 Content 为 nil 的情况
		if fmtMessage.Content == nil {
			content, _ := json.Marshal("...")
			fmtMessage.Content = content
		}

		// 添加新的或修改后的消息到列表
		formatMessages = append(formatMessages, fmtMessage)

		lastMessage = &fmtMessage // 更新 lastMessage 为当前处理的消息
	}
	for _, message := range formatMessages {

		if message.Role == "system" && claudeRequest.System == "" {
			claudeRequest.System = message.StringContent()
			continue
		}
		claudeMessage := anthropic.Message{
			Role: message.Role,
		}
		var content anthropic.Content
		if message.IsStringContent() {
			content.Type = "text"
			content.Text = message.StringContent()
			claudeMessage.Content = append(claudeMessage.Content, content)
			claudeRequest.Messages = append(claudeRequest.Messages, claudeMessage)
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
		claudeRequest.Messages = append(claudeRequest.Messages, claudeMessage)
	}
	return &claudeRequest
}
