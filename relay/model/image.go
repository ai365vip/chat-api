package model

type ImageRequest struct {
	Model          string `json:"model" form:"model"`
	Prompt         string `json:"prompt" binding:"required" form:"prompt"`
	N              int    `json:"n,omitempty" form:"n"`
	Size           string `json:"size,omitempty" form:"size"`
	Quality        string `json:"quality,omitempty" form:"quality"`
	ResponseFormat string `json:"response_format,omitempty" form:"response_format"`
	Style          string `json:"style,omitempty" form:"style"`
	User           string `json:"user,omitempty" form:"user"`
}
type ImageTokenUsage struct {
	InputTokens       int `json:"input_tokens"`
	InputTokenDetails struct {
		ImageTokens int `json:"image_tokens"`
		TextTokens  int `json:"text_tokens"`
	} `json:"input_tokens_details"`
	OutputTokens int `json:"output_tokens"`
	TotalTokens  int `json:"total_tokens"`
}
