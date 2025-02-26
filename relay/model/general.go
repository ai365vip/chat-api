package model

type GeneralOpenAIRequest struct {
	Model               string         `json:"model,omitempty"`
	Messages            []Message      `json:"messages,omitempty"`
	Prompt              any            `json:"prompt,omitempty"`
	Stream              bool           `json:"stream,omitempty"`
	System              any            `json:"system,omitempty"`
	Thinking            any            `json:"thinking,omitempty"`
	MaxTokens           uint           `json:"max_tokens,omitempty"`
	MaxCompletionTokens uint           `json:"max_completion_tokens,omitempty"`
	Temperature         *float64       `json:"temperature,omitempty"`
	Stop                any            `json:"stop,omitempty"`
	TopP                float64        `json:"top_p,omitempty"`
	TopK                int            `json:"top_k,omitempty"`
	N                   int            `json:"n,omitempty"`
	StreamOptions       *StreamOptions `json:"stream_options,omitempty"`
	Input               any            `json:"input,omitempty"`
	Instruction         string         `json:"instruction,omitempty"`
	Size                string         `json:"size,omitempty"`
	Functions           any            `json:"functions,omitempty"`
	FrequencyPenalty    float64        `json:"frequency_penalty,omitempty"`
	PresencePenalty     float64        `json:"presence_penalty,omitempty"`
	ResponseFormat      any            `json:"response_format,omitempty"`
	Seed                float64        `json:"seed,omitempty"`
	Tools               []Tool         `json:"tools,omitempty"`
	ToolChoice          any            `json:"tool_choice,omitempty"`
	FunctionCall        any            `json:"function_call,omitempty"`
	User                string         `json:"user,omitempty"`
	LogProbs            bool           `json:"logprobs,omitempty"`
	TopLogProbs         int            `json:"top_logprobs,omitempty"`
	EncodingFormat      string         `json:"encoding_format,omitempty"`
	Dimensions          int            `json:"dimensions,omitempty"`
	AnthropicVersion    string         `json:"anthropic_version,omitempty"`
}

func (r GeneralOpenAIRequest) ParseInput() []string {
	if r.Input == nil {
		return nil
	}
	var input []string
	switch r.Input.(type) {
	case string:
		input = []string{r.Input.(string)}
	case []any:
		input = make([]string, 0, len(r.Input.([]any)))
		for _, item := range r.Input.([]any) {
			if str, ok := item.(string); ok {
				input = append(input, str)
			}
		}
	}
	return input
}
