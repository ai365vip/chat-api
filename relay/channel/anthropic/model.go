package anthropic

// https://docs.anthropic.com/claude/reference/messages_post

type Metadata struct {
	UserId string `json:"user_id"`
}

type ImageSource struct {
	Type      string `json:"type"`
	MediaType string `json:"media_type"`
	Data      string `json:"data"`
}

type Content struct {
	Type       string       `json:"type"`
	Text       string       `json:"text,omitempty"`
	Source     *ImageSource `json:"source,omitempty"`
	Id         string       `json:"id,omitempty"`
	Name       string       `json:"name,omitempty"`
	Thinking   string       `json:"thinking,omitempty"`
	Input      any          `json:"input,omitempty"`
	Content    interface{}  `json:"content,omitempty"`
	ToolUseId  string       `json:"tool_use_id,omitempty"`
	ToolUse    *ToolUse     `json:"tool_use,omitempty"`
	ToolResult *ToolResult  `json:"tool_result,omitempty"`
}

type Message struct {
	Role    string    `json:"role"`
	Content []Content `json:"content"`
}

type Request struct {
	Model         string    `json:"model"`
	Messages      []Message `json:"messages"`
	System        any       `json:"system,omitempty"`
	MaxTokens     uint      `json:"max_tokens,omitempty"`
	Thinking      any       `json:"thinking,omitempty"`
	StopSequences []string  `json:"stop_sequences,omitempty"`
	Stream        bool      `json:"stream,omitempty"`
	Temperature   *float64  `json:"temperature,omitempty"`
	TopP          float64   `json:"top_p,omitempty"`
	TopK          int       `json:"top_k,omitempty"`
	Tools         []Tool    `json:"tools,omitempty"`
	ToolChoice    any       `json:"tool_choice,omitempty"`
	//Metadata    `json:"metadata,omitempty"`
}

type Usage struct {
	InputTokens  int `json:"input_tokens"`
	OutputTokens int `json:"output_tokens"`
}

type Error struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

type Response struct {
	Id           string    `json:"id"`
	Type         string    `json:"type"`
	Role         string    `json:"role"`
	Content      []Content `json:"content"`
	Model        string    `json:"model"`
	StopReason   *string   `json:"stop_reason"`
	StopSequence *string   `json:"stop_sequence"`
	Usage        Usage     `json:"usage"`
	Error        Error     `json:"error"`
}

type Delta struct {
	Type         string  `json:"type"`
	Text         string  `json:"text"`
	PartialJson  string  `json:"partial_json,omitempty"`
	StopReason   *string `json:"stop_reason"`
	StopSequence *string `json:"stop_sequence"`
	Thinking     string  `json:"thinking,omitempty"`
}
type Tool struct {
	Name        string      `json:"name"`
	Description string      `json:"description,omitempty"`
	InputSchema InputSchema `json:"input_schema"`
}
type InputSchema struct {
	Type       string `json:"type"`
	Properties any    `json:"properties,omitempty"`
	Required   any    `json:"required,omitempty"`
}
type StreamResponse struct {
	Type         string    `json:"type"`
	Message      *Response `json:"message"`
	Index        int       `json:"index"`
	ContentBlock *Content  `json:"content_block"`
	Delta        *Delta    `json:"delta"`
	Usage        *Usage    `json:"usage"`
}
type EventData struct {
	EventType string
	Data      string
}
type Source struct {
	Type      string `json:"type"`
	MediaType string `json:"media_type"`
	Data      string `json:"data"`
}
type NewMessage struct {
	Role    string           `json:"role"`
	Content []NewMessageType `json:"content"`
}
type NewRequest struct {
	Model     string       `json:"model"`
	MaxTokens int          `json:"max_tokens"`
	Stream    bool         `json:"stream"`
	Messages  []NewMessage `json:"messages"`
}
type NewMessageType struct {
	Type   string  `json:"type"`
	Text   string  `json:"text,omitempty"`
	Source *Source `json:"source,omitempty"`
}
type ToolUse struct {
	ID    string                 `json:"id"`
	Name  string                 `json:"name"`
	Input map[string]interface{} `json:"input"`
}

type ToolResult struct {
	ToolUseID string    `json:"tool_use_id"`
	Content   []Content `json:"content"`
}
