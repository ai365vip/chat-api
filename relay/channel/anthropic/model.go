package anthropic

type Metadata struct {
	UserId string `json:"user_id"`
}

type Request struct {
	Model         string    `json:"model"`
	System        string    `json:"system,omitempty"`
	Messages      []Message `json:"messages"`
	MaxTokens     int       `json:"max_tokens"`
	StopSequences []string  `json:"stop_sequences,omitempty"`
	Temperature   float64   `json:"temperature,omitempty"`
	TopP          float64   `json:"top_p,omitempty"`
	TopK          int       `json:"top_k,omitempty"`
	//ClaudeMetadata    `json:"metadata,omitempty"`
	Stream bool `json:"stream,omitempty"`
}

type Message struct {
	Role    string           `json:"role"`
	Content []MessageContent `json:"content"`
}
type MessageContent struct {
	Type   string         `json:"type"`
	Text   string         `json:"text,omitempty"`
	Source *ContentSource `json:"source,omitempty"`
}
type ContentSource struct {
	Type      string `json:"type"`
	MediaType string `json:"media_type"`
	Data      string `json:"data"`
}
type Error struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

type Response struct {
	Id           string       `json:"id"`
	Type         string       `json:"type"`
	Role         string       `json:"role"`
	Content      []ResContent `json:"content"`
	Model        string       `json:"model"`
	StopReason   string       `json:"stop_reason,omitempty"`
	StopSequence string       `json:"stop_sequence,omitempty"`
	Usage        Usage        `json:"usage,omitempty"`
	Error        ClaudeError  `json:"error,omitempty"`
}
type ResContent struct {
	Text string `json:"text"`
	Type string `json:"type"`
}
type Usage struct {
	InputTokens  int `json:"input_tokens,omitempty"`
	OutputTokens int `json:"output_tokens,omitempty"`
}
type ClaudeError struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

type ErrorWithStatusCode struct {
	Error
	StatusCode int `json:"status_code"`
}
