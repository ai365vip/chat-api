package model

import "encoding/json"

type VisionMessage struct {
	Role    string          `json:"role"`
	Content json.RawMessage `json:"content"`
	Name    *string         `json:"name,omitempty"`
}

type MediaMessage struct {
	Type     string `json:"type"`
	Text     string `json:"text"`
	ImageUrl any    `json:"image_url,omitempty"`
}

type Message struct {
	Role    string          `json:"role"`
	Content json.RawMessage `json:"content"`
	Name    *string         `json:"name,omitempty"`
}

type ImageURL struct {
	Url    string `json:"url,omitempty"`
	Detail string `json:"detail,omitempty"`
}

type TextContent struct {
	Type string `json:"type,omitempty"`
	Text string `json:"text,omitempty"`
}

type ImageContent struct {
	Type     string    `json:"type,omitempty"`
	ImageURL *ImageURL `json:"image_url,omitempty"`
}

type OpenAIMessageContent struct {
	Type     string    `json:"type,omitempty"`
	Text     string    `json:"text"`
	ImageURL *ImageURL `json:"image_url,omitempty"`
}

type MessageImageUrl struct {
	Url    string `json:"url"`
	Detail string `json:"detail"`
}

type MediaMessageImage struct {
	Type     string          `json:"type"`
	ImageUrl MessageImageUrl `json:"image_url"`
}

func (m Message) IsStringContent() bool {
	var content interface{}
	if err := json.Unmarshal(m.Content, &content); err != nil {
		return false
	}
	_, ok := content.(string)
	return ok
}

func (m Message) StringContent() string {
	var content interface{}
	if err := json.Unmarshal(m.Content, &content); err != nil {
		return ""
	}

	switch v := content.(type) {
	case string:
		return v
	case []interface{}:
		var contentStr string
		for _, contentItem := range v {
			contentMap, ok := contentItem.(map[string]interface{})
			if !ok {
				continue
			}
			if contentMap["type"] == ContentTypeText {
				if subStr, ok := contentMap["text"].(string); ok {
					contentStr += subStr
				}
			}
		}
		return contentStr
	default:
		return ""
	}
}

func (m Message) ParseContent() []MediaMessage {
	var contentList []MediaMessage
	var stringContent string
	if err := json.Unmarshal(m.Content, &stringContent); err == nil {
		contentList = append(contentList, MediaMessage{
			Type: ContentTypeText,
			Text: stringContent,
		})
		return contentList
	}
	var arrayContent []json.RawMessage
	if err := json.Unmarshal(m.Content, &arrayContent); err == nil {
		for _, contentItem := range arrayContent {
			var contentMap map[string]any
			if err := json.Unmarshal(contentItem, &contentMap); err != nil {
				continue
			}
			switch contentMap["type"] {
			case ContentTypeText:
				if subStr, ok := contentMap["text"].(string); ok {
					contentList = append(contentList, MediaMessage{
						Type: ContentTypeText,
						Text: subStr,
					})
				}
			case ContentTypeImageURL:
				if subObj, ok := contentMap["image_url"].(map[string]any); ok {
					detail, ok := subObj["detail"]
					if ok {
						subObj["detail"] = detail.(string)
					} else {
						subObj["detail"] = "auto"
					}
					contentList = append(contentList, MediaMessage{
						Type: ContentTypeImageURL,
						ImageUrl: MessageImageUrl{
							Url:    subObj["url"].(string),
							Detail: subObj["detail"].(string),
						},
					})
				}
			}
		}
		return contentList
	}

	return nil
}
