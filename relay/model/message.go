package model

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
	Role       string  `json:"role"`
	Content    any     `json:"content"`
	Name       *string `json:"name,omitempty"`
	ToolCalls  []Tool  `json:"tool_calls,omitempty"`
	ToolCallId string  `json:"tool_call_id,omitempty"`
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
	content, ok := m.Content.(string)
	if ok {
		contentList = append(contentList, MediaMessage{
			Type: ContentTypeText,
			Text: content,
		})
		return contentList
	}
	anyList, ok := m.Content.([]any)
	if ok {
		for _, contentItem := range anyList {
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
			case ContentTypeImage:
				if sourceMap, ok := contentMap["source"].(map[string]interface{}); ok {
					data, dataOk := sourceMap["data"].(string)
					mediaType, mediaTypeOk := sourceMap["media_type"].(string)
					if dataOk && mediaTypeOk {
						contentList = append(contentList, MediaMessage{
							Type: ContentTypeImage,
							ImageUrl: MessageImageUrl{
								Url:    data,
								Detail: mediaType,
							},
						})
					}
				}
			}
		}
		return contentList
	}

	return nil
}
