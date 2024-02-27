package lobechat

import (
	"one-api/relay/channel/openai"
	"one-api/relay/model"
)

func ResponseText2Usage(responseText string, modeName string, promptTokens int) *model.Usage {
	usage := &model.Usage{}
	usage.PromptTokens = promptTokens
	usage.CompletionTokens = openai.CountTokenText(responseText, modeName)
	usage.TotalTokens = usage.PromptTokens + usage.CompletionTokens
	return usage
}
