package stability

// Stability AI的响应结构体
type StabilityResponse struct {
	Artifacts []Artifact `json:"artifacts"`
}

type Artifact struct {
	Base64       string `json:"base64"`
	Seed         uint32 `json:"seed"`
	FinishReason string `json:"finishReason"`
}

// 错误响应结构体
type ErrorResponse struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Message string `json:"message"`
}

type ChatCompletionsStreamResponseChoice struct {
	Delta struct {
		Content string `json:"content"`
	} `json:"delta"`
	FinishReason *string `json:"finish_reason,omitempty"`
}

type ChatCompletionsStreamResponse struct {
	Id      string                                `json:"id"`
	Object  string                                `json:"object"`
	Created int64                                 `json:"created"`
	Model   string                                `json:"model"`
	Choices []ChatCompletionsStreamResponseChoice `json:"choices"`
}

type CompletionsStreamResponse struct {
	Choices []struct {
		Text         string `json:"text"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
}
type UploadRequest struct {
	Base64Array []string `json:"base64Array"`
}
