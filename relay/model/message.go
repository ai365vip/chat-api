package model

import (
	"encoding/json"
	"log"
)

type VisionMessage struct {
	Role    string  `json:"role"`
	Content any     `json:"content"`
	Name    *string `json:"name,omitempty"`
}

type MediaMessage struct {
	Type     string `json:"type"`
	Text     string `json:"text"`
	ImageUrl any    `json:"image_url,omitempty"`
}

type Message struct {
	Role             string  `json:"role"`
	Content          any     `json:"content"`
	ReasoningContent string  `json:"reasoning_content,omitempty"`
	Name             *string `json:"name,omitempty"`
	ToolCalls        []Tool  `json:"tool_calls,omitempty"`
	ToolCallId       string  `json:"tool_call_id,omitempty"`
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
	_, ok := m.Content.(string)
	return ok
}

type StreamOptions struct {
	IncludeUsage bool `json:"include_usage,omitempty"`
}

func (m Message) StringContent() string {
	content, ok := m.Content.(string)
	if ok {
		return content
	}
	contentList, ok := m.Content.([]any)
	if ok {
		var contentStr string
		for _, contentItem := range contentList {
			contentMap, ok := contentItem.(map[string]any)
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
	}
	return ""
}

func (m Message) ParseContent() []MediaMessage {
	var contentList []MediaMessage

	switch content := m.Content.(type) {
	case string:
		contentList = append(contentList, MediaMessage{
			Type: ContentTypeText,
			Text: content,
		})
		return contentList
	case []any:
		for _, contentItem := range content {
			contentMap, ok := contentItem.(map[string]any)
			if !ok {
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

	default:

		bytes, err := json.Marshal(content)

		if err != nil {
			log.Printf("Failed to serialize content: %v", err)
			return nil
		}

		// 定义一个可以接受解析后内容的变量
		var parsedContent []map[string]any
		err = json.Unmarshal(bytes, &parsedContent)
		if err != nil {
			log.Printf("Failed to parse bytes back into structure: %v", err)
			return nil
		}

		// 现在可以遍历 parsedContent，它是一个 map 的切片
		var contentList []MediaMessage
		for _, contentMap := range parsedContent {
			// 你可以直接访问 contentMap，因为它已经是 map[string]any 类型
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

}
