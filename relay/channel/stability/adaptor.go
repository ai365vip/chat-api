package stability

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

	"github.com/gin-gonic/gin"
)

type RequestData struct {
	Body        io.Reader
	ContentType string
}

type Adaptor struct {
}

func (a *Adaptor) Init(meta *util.RelayMeta) {

}
func (a *Adaptor) ConvertImageRequest(request *model.ImageRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	return request, nil
}
func (a *Adaptor) GetRequestURL(meta *util.RelayMeta) (string, error) {
	requestURL := fmt.Sprintf("/v1/generation/%s/text-to-image", meta.Config.APIVersion)
	return util.GetFullRequestURL(meta.BaseURL, requestURL, meta.ChannelType), nil
}

func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Request, meta *util.RelayMeta) error {
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+meta.APIKey)
	return nil
}

func (a *Adaptor) ConvertRequest(c *gin.Context, meta *util.RelayMeta, request *model.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	// 确保请求中有消息
	if len(request.Messages) == 0 {
		return nil, errors.New("no messages found in the request")
	}

	var content string
	// 将Content字段从最后一条消息中解析为字符串
	lastMessageIndex := len(request.Messages) - 1 // 获取最后一条消息的索引

	contentBytes, ok := request.Messages[lastMessageIndex].Content.([]byte)
	if !ok {
		return nil, fmt.Errorf("content is not of type []byte")
	}

	if err := json.Unmarshal(contentBytes, &content); err != nil {
		return nil, err
	}

	Model, _ := c.Get("model")
	if Model == "stable-diffusion-v" {
		requestBody, contentType := prepareMultipartFormData(content)
		if requestBody == nil {
			return nil, errors.New("failed to prepare multipart form data")
		}
		return &RequestData{Body: requestBody, ContentType: contentType}, nil
	} else {
		// 假设 parseContentToStabilityRequest 返回 io.Reader
		body := parseContentToStabilityRequest(content)
		return body, nil
	}
}

func (a *Adaptor) DoRequest(c *gin.Context, meta *util.RelayMeta, requestBody io.Reader) (*http.Response, error) {

	return channel.DoRequestHelper(a, c, meta, requestBody)

}
func (a *Adaptor) DoResponse(c *gin.Context, resp *http.Response, meta *util.RelayMeta) (aitext string, usage *model.Usage, err *model.ErrorWithStatusCode) {

	if meta.IsStream {

		err, aitext = StreamStabilityHandler(c, resp, meta)
		usage = openai.ResponseText2Usage("stability", meta.ActualModelName, meta.PromptTokens)
	} else {
		err, usage, aitext = StabilityHandler(c, resp, meta)
	}
	return
}

func (a *Adaptor) GetModelList() []string {
	return ModelList
}

func (a *Adaptor) GetChannelName() string {
	return "stability"
}
