package zhipu

import (
	"errors"
	"fmt"
	"io"
	"math"
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
	APIVersion string
}

func (a *Adaptor) Init(meta *util.RelayMeta) {

}

func (a *Adaptor) SetVersionByModeName(modelName string) {
	if strings.HasPrefix(modelName, "glm-") {
		a.APIVersion = "v4"
	} else {
		a.APIVersion = "v3"
	}
}

func (a *Adaptor) GetRequestURL(meta *util.RelayMeta) (string, error) {
	a.SetVersionByModeName(meta.ActualModelName)
	if a.APIVersion == "v4" {
		return fmt.Sprintf("%s/api/paas/v4/chat/completions", meta.BaseURL), nil
	}
	if meta.Mode == constant.RelayModeEmbeddings {
		return fmt.Sprintf("%s/api/paas/v4/embeddings", meta.BaseURL), nil
	}
	method := "invoke"
	if meta.IsStream {
		method = "sse-invoke"
	}
	return fmt.Sprintf("%s/api/paas/v3/model-api/%s/%s", meta.BaseURL, meta.ActualModelName, method), nil
}

func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Request, meta *util.RelayMeta) error {
	channel.SetupCommonRequestHeader(c, req, meta)
	token := GetToken(meta.APIKey)
	req.Header.Set("Authorization", token)
	return nil
}

func (a *Adaptor) ConvertRequest(c *gin.Context, meta *util.RelayMeta, request *model.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	switch meta.Mode {
	case constant.RelayModeEmbeddings:
		baiduEmbeddingRequest, err := ConvertEmbeddingRequest(*request)
		return baiduEmbeddingRequest, err
	default:
		// TopP (0.0, 1.0)
		request.TopP = math.Min(0.99, request.TopP)
		request.TopP = math.Max(0.01, request.TopP)

		// Temperature (0.0, 1.0)
		request.Temperature = math.Min(0.99, request.Temperature)
		request.Temperature = math.Max(0.01, request.Temperature)
		a.SetVersionByModeName(request.Model)
		if a.APIVersion == "v4" {
			return request, nil
		}
		return ConvertRequest(*request), nil
	}
}

func (a *Adaptor) DoRequest(c *gin.Context, meta *util.RelayMeta, requestBody io.Reader) (*http.Response, error) {

	return channel.DoRequestHelper(a, c, meta, requestBody)

}

func (a *Adaptor) DoResponseV4(c *gin.Context, resp *http.Response, meta *util.RelayMeta) (aitext string, usage *model.Usage, err *model.ErrorWithStatusCode) {
	if meta.IsStream {
		var responseText string
		var toolCount int
		err, responseText, toolCount, usage = openai.StreamHandler(c, resp, meta.Mode, meta.ActualModelName, meta.FixedContent)
		aitext = responseText
		usage = openai.ResponseText2Usage(responseText, meta.ActualModelName, meta.PromptTokens)
		usage.CompletionTokens += toolCount * 7
	} else {
		if meta.Mode == constant.RelayModeEmbeddings {
			err, usage = EmbeddingsHandler(c, resp)
		} else {
			err, usage, aitext = openai.Handler(c, resp, meta.PromptTokens, meta.ActualModelName)
		}
	}
	return
}
func (a *Adaptor) ConvertImageRequest(request *model.ImageRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	return request, nil
}
func (a *Adaptor) DoResponse(c *gin.Context, resp *http.Response, meta *util.RelayMeta) (aitext string, usage *model.Usage, err *model.ErrorWithStatusCode) {
	if a.APIVersion == "v4" {
		return a.DoResponseV4(c, resp, meta)
	}
	if meta.IsStream {
		err, usage = StreamHandler(c, resp)
	} else {
		err, usage = Handler(c, resp)
	}
	return
}

func (a *Adaptor) GetModelList() []string {
	return ModelList
}

func (a *Adaptor) GetChannelName() string {
	return "zhipu"
}

func ConvertEmbeddingRequest(request model.GeneralOpenAIRequest) (*EmbeddingRequest, error) {
	inputs := request.ParseInput()
	if len(inputs) != 1 {
		return nil, errors.New("invalid input length, zhipu only support one input")
	}
	return &EmbeddingRequest{
		Model: request.Model,
		Input: inputs[0],
	}, nil
}
