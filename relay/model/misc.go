package model

type Usage struct {
	PromptTokens            int                      `json:"prompt_tokens"`
	CompletionTokens        int                      `json:"completion_tokens"`
	TotalTokens             int                      `json:"total_tokens"`
	PromptTokensDetails     *PromptTokensDetails     `json:"prompt_tokens_details"`
	CompletionTokensDetails *CompletionTokensDetails `json:"completion_tokens_details"`

	SysTokensDetails SysTokensDetails `json:"-"`
}

type PromptTokensDetails struct {
	CachedTokens         int `json:"cached_tokens"`
	AudioTokens          int `json:"audio_tokens"`
	TextTokens           int `json:"text_tokens,omitempty"`
	ImageTokens          int `json:"image_tokens,omitempty"`
	CachedTokensInternal int `json:"cached_tokens_internal,omitempty"`
}

type CompletionTokensDetails struct {
	ReasoningTokens int `json:"reasoning_tokens"`
	AudioTokens     int `json:"audio_tokens"`
	AcceptedTokens  int `json:"accepted_prediction_tokens"`
	RejectedTokens  int `json:"rejected_prediction_tokens"`
	TextTokens      int `json:"text_tokens,omitempty"`
}
type SysTokensDetails struct {
	CachedTokens      int `json:"cached_tokens,omitempty"`
	InputAudioTokens  int `json:"input_audio_tokens,omitempty"`
	InputTextTokens   int `json:"input_text_tokens,omitempty"`
	OutputAudioTokens int `json:"output_audio_tokens,omitempty"`
	OutputTextTokens  int `json:"output_text_tokens,omitempty"`
}
type Error struct {
	Message string `json:"message"`
	Type    string `json:"type"`
	Param   string `json:"param"`
	Code    any    `json:"code"`
}

type ErrorWithStatusCode struct {
	Error
	StatusCode int `json:"status_code"`
}
