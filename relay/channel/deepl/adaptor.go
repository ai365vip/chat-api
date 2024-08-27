package deepl

import (
	"errors"
	"fmt"
	"io"
	"net/http"

	"one-api/relay/channel"
	"one-api/relay/model"
	"one-api/relay/util"

	"github.com/gin-gonic/gin"
)

type Adaptor struct {
	meta       *util.RelayMeta
	promptText string
}

func (a *Adaptor) Init(meta *util.RelayMeta) {
	a.meta = meta
}

func (a *Adaptor) GetRequestURL(meta *util.RelayMeta) (string, error) {
	return fmt.Sprintf("%s/v2/translate", meta.BaseURL), nil
}

func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Request, meta *util.RelayMeta) error {
	channel.SetupCommonRequestHeader(c, req, meta)
	req.Header.Set("Authorization", "DeepL-Auth-Key "+meta.APIKey)
	return nil
}

func (a *Adaptor) ConvertRequest(c *gin.Context, meta *util.RelayMeta, request *model.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	convertedRequest, text := ConvertRequest(*request)
	a.promptText = text
	return convertedRequest, nil
}

func (a *Adaptor) ConvertImageRequest(request *model.ImageRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	return request, nil
}

func (a *Adaptor) DoRequest(c *gin.Context, meta *util.RelayMeta, requestBody io.Reader) (*http.Response, error) {
	return channel.DoRequestHelper(a, c, meta, requestBody)
}

func (a *Adaptor) DoResponse(c *gin.Context, resp *http.Response, meta *util.RelayMeta) (aitext string, usage *model.Usage, err *model.ErrorWithStatusCode) {
	if meta.IsStream {
		err = StreamHandler(c, resp, meta.ActualModelName)
	} else {
		err = Handler(c, resp, meta.ActualModelName)
	}
	promptTokens := len(a.promptText)
	usage = &model.Usage{
		PromptTokens: promptTokens,
		TotalTokens:  promptTokens,
	}
	return
}

func (a *Adaptor) GetModelList() []string {
	return ModelList
}

func (a *Adaptor) GetChannelName() string {
	return "deepl"
}
