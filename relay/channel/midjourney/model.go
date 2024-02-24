package midjourney

import "encoding/json"

type MidjourneyRequest struct {
	Prompt       string          `json:"prompt"`
	NotifyHook   string          `json:"notifyHook"`
	Action       string          `json:"action"`
	Index        int             `json:"index"`
	State        string          `json:"state"`
	TaskId       string          `json:"taskId"`
	Base64Array  []string        `json:"base64Array"`
	Content      string          `json:"content"`
	CustomId     string          `json:"customId"`
	MaskBase64   string          `json:"maskBase64"`
	SourceBase64 string          `json:"sourceBase64"`
	TargetBase64 string          `json:"targetBase64"`
	Buttons      json.RawMessage `json:"buttons"`
	Properties   json.RawMessage `json:"properties"`
}

type MidjourneyResponse struct {
	Code        int         `json:"code"`
	Description string      `json:"description"`
	Properties  interface{} `json:"properties"`
	Result      string      `json:"result"`
}
