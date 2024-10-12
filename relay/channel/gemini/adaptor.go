package gemini

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"one-api/relay/channel"
	"one-api/relay/channel/openai"
	"one-api/relay/constant"
	"one-api/relay/model"
	"one-api/relay/util"
	"strings"

	"github.com/gin-gonic/gin"
)

type Adaptor struct {
}

func (a *Adaptor) Init(meta *util.RelayMeta) {

}

func (a *Adaptor) GetRequestURL(meta *util.RelayMeta) (string, error) {
	version := "v1"
	action := ""

	// 将 meta.Config.GeminiModel 分割成模型列表
	geminiModels := strings.Split(meta.Config.GeminiModel, ",")

	// 检查当前模型是否在 GeminiModel 列表中
	for _, model := range geminiModels {
		if strings.TrimSpace(model) == meta.ActualModelName {
			version = "v1beta"
			break
		}
	}

	switch meta.Mode {
	case constant.RelayModeEmbeddings:
		action = "batchEmbedContents"
	default:
		action = "generateContent"
	}
	if meta.IsStream {
		action = "streamGenerateContent?alt=sse"
	}
	return fmt.Sprintf("%s/%s/models/%s:%s", meta.BaseURL, version, meta.ActualModelName, action), nil
}

func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Request, meta *util.RelayMeta) error {
	channel.SetupCommonRequestHeader(c, req, meta)
	req.Header.Set("x-goog-api-key", meta.APIKey)
	return nil
}

func (a *Adaptor) ConvertRequest(c *gin.Context, meta *util.RelayMeta, request *model.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	switch meta.Mode {
	case constant.RelayModeEmbeddings:
		geminiEmbeddingRequest := ConvertEmbeddingRequest(*request)
		return geminiEmbeddingRequest, nil
	default:
		geminiRequest := ConvertRequest(*request)
		return geminiRequest, nil
	}
}

func (a *Adaptor) DoRequest(c *gin.Context, meta *util.RelayMeta, requestBody io.Reader) (*http.Response, error) {
	return channel.DoRequestHelper(a, c, meta, requestBody)

}
func (a *Adaptor) ConvertImageRequest(request *model.ImageRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	return request, nil
}
func (a *Adaptor) DoResponse(c *gin.Context, resp *http.Response, meta *util.RelayMeta) (aitext string, usage *model.Usage, err *model.ErrorWithStatusCode) {
	if meta.IsStream {
		var responseText string
		err, responseText = StreamHandler(c, resp)
		aitext = responseText
		usage = openai.ResponseText2Usage(responseText, meta.ActualModelName, meta.PromptTokens)
	} else {

		switch meta.Mode {
		case constant.RelayModeEmbeddings:
			err, usage = EmbeddingHandler(c, resp)
		default:
			err, usage, aitext = Handler(c, resp, meta.PromptTokens, meta.ActualModelName)
		}
	}
	return
}

func (a *Adaptor) GetModelList() []string {
	return ModelList
}

func (a *Adaptor) GetChannelName() string {
	return "google gemini"
}
