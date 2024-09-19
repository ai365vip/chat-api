package gcpclaude

import "one-api/relay/channel/anthropic"

// Request is the request to AWS Claude
//
// https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages.html
type Request struct {
	Messages         []anthropic.Message `json:"messages"`
	System           string              `json:"system,omitempty"`
	MaxTokens        uint                `json:"max_tokens,omitempty"`
	StopSequences    []string            `json:"stop_sequences,omitempty"`
	Stream           bool                `json:"stream,omitempty"`
	Temperature      float64             `json:"temperature,omitempty"`
	TopP             float64             `json:"top_p,omitempty"`
	TopK             int                 `json:"top_k,omitempty"`
	AnthropicVersion string              `json:"anthropic_version,omitempty"`
	Tools            []anthropic.Tool    `json:"tools,omitempty"`
	ToolChoice       any                 `json:"tool_choice,omitempty"`
}
