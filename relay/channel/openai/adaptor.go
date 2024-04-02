package openai

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"one-api/common"
	"one-api/relay/channel"
	"one-api/relay/model"
	"one-api/relay/util"
	"regexp"

	"strings"

	"github.com/gin-gonic/gin"
)

type Adaptor struct {
	ChannelType int
}

func (a *Adaptor) Init(meta *util.RelayMeta) {
	a.ChannelType = meta.ChannelType
}

func (a *Adaptor) GetRequestURL(meta *util.RelayMeta) (string, error) {
	if meta.ChannelType == common.ChannelTypeAzure {
		// https://learn.microsoft.com/en-us/azure/cognitive-services/openai/chatgpt-quickstart?pivots=rest-api&tabs=command-line#rest-api
		requestURL := strings.Split(meta.RequestURLPath, "?")[0]
		requestURL = fmt.Sprintf("%s?api-version=%s", requestURL, meta.APIVersion)

		task := strings.TrimPrefix(requestURL, "/v1/")
		model_ := meta.ActualModelName
		model_ = strings.Replace(model_, ".", "", -1)

		requestURL = fmt.Sprintf("/openai/deployments/%s/%s", model_, task)
		return util.GetFullRequestURL(meta.BaseURL, requestURL, meta.ChannelType), nil
	}
	return util.GetFullRequestURL(meta.BaseURL, meta.RequestURLPath, meta.ChannelType), nil
}

func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Request, meta *util.RelayMeta) error {
	channel.SetupCommonRequestHeader(c, req, meta)
	if meta.ChannelType == common.ChannelTypeAzure {
		req.Header.Set("api-key", meta.APIKey)
		return nil
	} else if meta.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+meta.APIKey)
		return nil
	}
	if meta.ChannelType == common.ChannelTypeOpenRouter {
		req.Header.Set("X-Title", "One API")
	}
	return nil
}

func (a *Adaptor) ConvertRequest(c *gin.Context, relayMode int, request *model.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	return request, nil
}

func (a *Adaptor) DoRequest(c *gin.Context, meta *util.RelayMeta, requestBody io.Reader) (*http.Response, error) {
	Model, _ := c.Get("model")
	if Model == "gpt-4-vision" {
		// 序列化原始请求体
		var buf bytes.Buffer
		_, err := buf.ReadFrom(c.Request.Body)
		if err != nil {
			return nil, fmt.Errorf("failed to read request body: %v", err)
		}
		originalRequestBody := buf.Bytes()

		// 反序列化到TextRequest结构体
		var textRequest model.GeneralOpenAIRequest
		if err := json.Unmarshal(originalRequestBody, &textRequest); err != nil {
			return nil, fmt.Errorf("failed to unmarshal request body: %v", err)
		}

		updatedTextRequest, err := updateTextRequestForVision(&textRequest)
		if err != nil {
			return nil, fmt.Errorf("failed to update text request for vision: %v", err)
		}
		textRequest = *updatedTextRequest
		// 将更新后的TextRequest重新序列化
		updatedRequestBody, err := json.Marshal(textRequest)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal updated request body: %v", err)
		}

		// 使用新的请求体创建reader
		requestBodyReader := bytes.NewReader(updatedRequestBody)

		// 调用DoRequestHelper函数，传入新的请求体
		return channel.DoRequestHelper(a, c, meta, requestBodyReader)
	} else {
		return channel.DoRequestHelper(a, c, meta, requestBody)
	}

}

// 更新TextRequest为gpt-4-vision使用
func updateTextRequestForVision(textRequest *model.GeneralOpenAIRequest) (*model.GeneralOpenAIRequest, error) {
	textRequest.Model = "gpt-4-vision-preview"
	textRequest.MaxTokens = 4096
	for i, msg := range textRequest.Messages {
		// 假设msg.Content就是string，或者你需要根据Content的实际结构来调整
		contentStr := msg.Content.(string)
		// 正则查找URL并构建新的消息内容
		newContent, err := createNewContentWithImages(contentStr)
		if err != nil {
			log.Printf("Create new content error: %v\n", err)
			continue
		}
		newContentBytes, err := json.Marshal(newContent)
		if err != nil {
			return nil, fmt.Errorf("cannot marshal new content: %v", err)
		}
		textRequest.Messages[i].Content = json.RawMessage(newContentBytes)
	}
	return textRequest, nil
}

// 正则查找URL并构建新的消息内容
func createNewContentWithImages(contentStr string) ([]interface{}, error) {
	re := regexp.MustCompile(`http[s]?:\/\/[^\s]+`)
	matches := re.FindAllString(contentStr, -1)
	description := re.ReplaceAllString(contentStr, "")

	newContent := []interface{}{
		OpenAIMessageContent{Type: "text", Text: strings.TrimSpace(description)},
	}
	// 如果没有找到匹配的URL，直接返回已有结果和nil错误
	if len(matches) == 0 {
		return newContent, nil
	}

	for _, url := range matches {
		newContent = append(newContent, MediaMessageImage{
			Type:     "image_url",
			ImageUrl: MessageImageUrl{Url: url},
		})
	}
	return newContent, nil
}

func (a *Adaptor) DoResponse(c *gin.Context, resp *http.Response, meta *util.RelayMeta) (aitext string, usage *model.Usage, err *model.ErrorWithStatusCode) {
	aitext = ""
	if meta.IsStream {
		var responseText string

		err, responseText = StreamHandler(c, resp, meta.Mode, meta.FixedContent)
		aitext = responseText
		usage = ResponseText2Usage(responseText, meta.ActualModelName, meta.PromptTokens)
	} else {
		err, usage, aitext = Handler(c, resp, meta.PromptTokens, meta.ActualModelName)
	}
	return
}

func (a *Adaptor) GetModelList() []string {
	_, modelList := GetCompatibleChannelMeta(a.ChannelType)
	return modelList
}

func (a *Adaptor) GetChannelName() string {
	channelName, _ := GetCompatibleChannelMeta(a.ChannelType)
	return channelName
}
