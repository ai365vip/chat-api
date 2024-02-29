package zhipu_v4

import (
	"encoding/json"
	"one-api/relay/model"
	"time"
)

type ZhipuV4StreamResponse struct {
	Id      string                                `json:"id"`
	Created int64                                 `json:"created"`
	Choices []ChatCompletionsStreamResponseChoice `json:"choices"`
	Usage   model.Usage                           `json:"usage"`
}

type ZhipuV4Response struct {
	Id                  string                     `json:"id"`
	Created             int64                      `json:"created"`
	Model               string                     `json:"model"`
	TextResponseChoices []OpenAITextResponseChoice `json:"choices"`
	Usage               model.Usage                `json:"usage"`
	Error               model.Error                `json:"error"`
}

type tokenData struct {
	Token      string
	ExpiryTime time.Time
}
type OpenAITextResponseChoice struct {
	Index        int `json:"index"`
	Message      `json:"message"`
	FinishReason string `json:"finish_reason"`
}

type Message struct {
	Role       string          `json:"role"`
	Content    json.RawMessage `json:"content"`
	Name       *string         `json:"name,omitempty"`
	ToolCalls  any             `json:"tool_calls,omitempty"`
	ToolCallId string          `json:"tool_call_id,omitempty"`
}

type ChatCompletionsStreamResponseChoice struct {
	Delta struct {
		Content   string `json:"content"`
		Role      string `json:"role,omitempty"`
		ToolCalls any    `json:"tool_calls,omitempty"`
	} `json:"delta"`
	FinishReason *string `json:"finish_reason,omitempty"`
	Index        int     `json:"index,omitempty"`
}

type ChatCompletionsStreamResponse struct {
	Id      string                                `json:"id"`
	Object  string                                `json:"object"`
	Created int64                                 `json:"created"`
	Model   string                                `json:"model"`
	Choices []ChatCompletionsStreamResponseChoice `json:"choices"`
}
