package anthropic

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"one-api/relay/channel"
	"one-api/relay/channel/openai"
	"one-api/relay/model"
	"one-api/relay/util"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

type Adaptor struct {
}

func (a *Adaptor) Init(meta *util.RelayMeta) {

}

func (a *Adaptor) GetRequestURL(meta *util.RelayMeta) (string, error) {
	return fmt.Sprintf("%s/v1/messages", meta.BaseURL), nil
}

func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Request, meta *util.RelayMeta) error {
	channel.SetupCommonRequestHeader(c, req, meta)
	req.Header.Set("x-api-key", meta.APIKey)
	anthropicVersion := c.Request.Header.Get("anthropic-version")
	if anthropicVersion == "" {
		anthropicVersion = "2023-06-01"
	}
	req.Header.Set("anthropic-version", anthropicVersion)
	return nil
}

func (a *Adaptor) ConvertRequest(c *gin.Context, relayMode int, request *model.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}

	// 获取model参数确认是否为指定的处理类型
	modelValue, exists := c.Get("model")
	Model, ok := modelValue.(string)
	if !exists || !ok || Model != "claude-3-opus" {
		return ConvertRequest(*request), nil
	}

	// 正则表达式用于识别URL
	urlRegex := regexp.MustCompile(`https?:\/\/[^\s]+`)

	var newMessages []NewMessage // 将用于新请求的消息列表
	for _, msg := range request.Messages {

		if msg.Role == "user" {
			contentString := msg.Content.(string) // 将原始消息转换为字符串

			// 使用正则找出所有URL
			urls := urlRegex.FindAllString(contentString, -1)

			// 构建新消息类型
			newContent := []NewMessageType{}

			for _, url := range urls {
				// 对于每个URL，添加一个image类型的消息
				newContent = append(newContent, NewMessageType{
					Type: "image",
					Source: &Source{
						Type:      "base64", // 注意这里使用base64可能不正确，除非您确实将URL转换成了base64编码的图像数据
						MediaType: "image/jpg",
						Data:      url, // 这里应该是图像数据，如果您保持Data为URL，那么Type应该反映这个事实
					},
				})
			}

			// 移除文本中的所有URL
			remainingText := urlRegex.ReplaceAllString(contentString, "")

			// 如果存在非URL文本，将其作为一个独立的text类型消息添加
			if strings.TrimSpace(remainingText) != "" {
				newContent = append(newContent, NewMessageType{
					Type: "text",
					Text: remainingText,
				})
			}

			// 将完整的新内容添加到新消息列表
			newMessages = append(newMessages, NewMessage{
				Role:    "user",
				Content: newContent,
			})
		} else if msg.Role == "assistant" {
			// 将json.RawMessage（实质上是[]byte）转换成string
			contentString := msg.Content.(string)
			newMessages = append(newMessages, NewMessage{
				Role: "assistant",
				Content: []NewMessageType{{
					Type: "text",
					Text: contentString, // 现在是正确的string类型
				}},
			})
		}
	}
	newRequest := *request
	newRequest.Model = "claude-3-opus-20240229"
	newRequest.Messages = []model.Message{}

	// 转换新Messages格式为原始格式
	for _, newMsg := range newMessages {
		msgBytes, err := json.Marshal(newMsg.Content)
		if err != nil {
			return nil, err // 错误处理
		}
		newRequest.Messages = append(newRequest.Messages, model.Message{
			Role:    newMsg.Role,
			Content: json.RawMessage(msgBytes),
		})
	}
	return ConvertRequest(newRequest), nil
}

func (a *Adaptor) DoRequest(c *gin.Context, meta *util.RelayMeta, requestBody io.Reader) (*http.Response, error) {
	return channel.DoRequestHelper(a, c, meta, requestBody)
}

func (a *Adaptor) DoResponse(c *gin.Context, resp *http.Response, meta *util.RelayMeta) (aitext string, usage *model.Usage, err *model.ErrorWithStatusCode) {
	if meta.IsStream {
		var responseText string
		err, responseText = StreamHandler(c, resp)
		aitext = responseText
		usage = openai.ResponseText2Usage(responseText, meta.ActualModelName, meta.PromptTokens)
	} else {
		err, usage, aitext = Handler(c, resp, meta.PromptTokens, meta.ActualModelName)
	}
	return
}

func (a *Adaptor) GetModelList() []string {
	return ModelList
}

func (a *Adaptor) GetChannelName() string {
	return "authropic"
}
