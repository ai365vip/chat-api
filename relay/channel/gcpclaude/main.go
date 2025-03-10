package gcpclaude

import (
	"one-api/relay/channel/anthropic"
	"one-api/relay/model"
)

func ConvertRequest(textRequest model.GeneralOpenAIRequest) *Request {
	claudeRequest := createBaseRequest(textRequest)
	var err error
	if len(textRequest.Tools) > 0 {
		claudeRequest.Tools = anthropic.ConvertToolsLegacy(textRequest.Tools)
		if err != nil {
			return nil
		}
		claudeRequest.ToolChoice = anthropic.ConvertToolChoice(textRequest.ToolChoice)
	}
	var systemMessage string
	claudeRequest.Messages = anthropic.ConvertMessagesLegacy(textRequest.Messages, &systemMessage)
	// 将转换后的 system 消息赋值给 claudeRequest.System
	claudeRequest.System = systemMessage
	return claudeRequest
}

func ConverClaudeRequest(request model.GeneralOpenAIRequest) *Request {
	claudeRequest := createBaseRequest(request)
	var err error
	claudeRequest.Messages, err = anthropic.ConvertMessages(request.Messages)
	if err != nil {
		return nil
	}
	if len(request.Tools) > 0 {
		claudeRequest.Tools = anthropic.ConvertTools(request.Tools)
		claudeRequest.ToolChoice = anthropic.ConvertToolChoice(request.ToolChoice)
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

// 辅助函数：检查内容是否为字符串
func isStringContent(content []anthropic.Content) bool {
	return len(content) == 1 && content[0].Type == "text"
}
