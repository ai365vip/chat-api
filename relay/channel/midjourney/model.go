package midjourney

import "encoding/json"

type MidjourneyRequest struct {
	Prompt       string          `json:"prompt"`
	NotifyHook   string          `json:"notifyHook"`
	Action       string          `json:"action"`
	Index        int             `json:"index"`
	State        string          `json:"state"`
	Mode         string          `json:"mode"`
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

type MidjourneyUploadsResponse struct {
	Code        int      `json:"code"`
	Description string   `json:"description"`
	Result      []string `json:"result"`
}
type Midjourney struct {
	MjId        string          `json:"id"`
	Action      string          `json:"action"`
	Prompt      string          `json:"prompt"`
	PromptEn    string          `json:"promptEn"`
	Description string          `json:"description"`
	State       string          `json:"state"`
	Mode        string          `json:"mode"`
	SubmitTime  int64           `json:"submitTime"`
	StartTime   int64           `json:"startTime"`
	FinishTime  int64           `json:"finishTime"`
	ImageUrl    string          `json:"imageUrl"`
	Status      string          `json:"status"`
	Progress    string          `json:"progress"`
	FailReason  string          `json:"failReason"`
	Properties  json.RawMessage `json:"properties"`
	Buttons     json.RawMessage `json:"buttons"`
}

type TaskMidjourney struct {
	MjId        string          `json:"id"`
	Action      string          `json:"action"`
	Prompt      string          `json:"prompt"`
	PromptEn    string          `json:"promptEn"`
	Description string          `json:"description"`
	State       string          `json:"state"`
	SubmitTime  int64           `json:"submitTime"`
	StartTime   int64           `json:"startTime"`
	FinishTime  int64           `json:"finishTime"`
	ImageUrl    string          `json:"imageUrl"`
	Status      string          `json:"status"`
	Progress    string          `json:"progress"`
	FailReason  string          `json:"failReason"`
	Properties  json.RawMessage `json:"properties"`
	Buttons     json.RawMessage `json:"buttons"`
}

type MidjourneyImageSeed struct {
	ImageSeed json.RawMessage `json:"image_seed"`
}

type MidjourneyStatus struct {
	Status int `json:"status"`
}
type MidjourneyWithoutStatus struct {
	Id          int             `json:"id"`
	Code        int             `json:"code"`
	UserId      int             `json:"user_id" gorm:"index"`
	Action      string          `json:"action"`
	MjId        string          `json:"mj_id" gorm:"index"`
	Prompt      string          `json:"prompt"`
	PromptEn    string          `json:"prompt_en"`
	Description string          `json:"description"`
	State       string          `json:"state"`
	Mode        string          `json:"mode"`
	SubmitTime  int64           `json:"submit_time"`
	StartTime   int64           `json:"start_time"`
	FinishTime  int64           `json:"finish_time"`
	ImageUrl    string          `json:"image_url"`
	Progress    string          `json:"progress"`
	FailReason  string          `json:"fail_reason"`
	Properties  json.RawMessage `json:"properties"`
	Buttons     json.RawMessage `json:"buttons"`
	ChannelId   int             `json:"channel_id"`
}
type Condition struct {
	IDs []string `json:"ids"`
}
