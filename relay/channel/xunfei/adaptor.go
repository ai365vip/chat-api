package xunfei

import (
	"errors"
	"io"
	"net/http"
	"one-api/relay/channel"
	"one-api/relay/channel/openai"
	"one-api/relay/model"
	"one-api/relay/util"
	"strings"

	"github.com/gin-gonic/gin"
)

type Adaptor struct {
	request *model.GeneralOpenAIRequest
}

func (a *Adaptor) Init(meta *util.RelayMeta) {

}

func (a *Adaptor) GetRequestURL(meta *util.RelayMeta) (string, error) {
	return "", nil
}

func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Request, meta *util.RelayMeta) error {
	channel.SetupCommonRequestHeader(c, req, meta)
	// check DoResponse for auth part
	return nil
}

func (a *Adaptor) ConvertRequest(c *gin.Context, meta *util.RelayMeta, request *model.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	a.request = request
	return nil, nil
}

func (a *Adaptor) DoRequest(c *gin.Context, meta *util.RelayMeta, requestBody io.Reader) (*http.Response, error) {
	// xunfei's request is not http request, so we don't need to do anything here
	dummyResp := &http.Response{}
	dummyResp.StatusCode = http.StatusOK
	return dummyResp, nil
}
func (a *Adaptor) ConvertImageRequest(request *model.ImageRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	return request, nil
}
func (a *Adaptor) DoResponse(c *gin.Context, resp *http.Response, meta *util.RelayMeta) (aitext string, usage *model.Usage, err *model.ErrorWithStatusCode) {
	splits := strings.Split(meta.APIKey, "|")
	var responseText string
	if len(splits) != 3 {
		return "", nil, openai.ErrorWrapper(errors.New("invalid auth"), "invalid_auth", http.StatusBadRequest)
	}
	if a.request == nil {
		return "", nil, openai.ErrorWrapper(errors.New("request is nil"), "request_is_nil", http.StatusBadRequest)
	}
	if meta.IsStream {
		err, _, responseText = StreamHandler(c, meta, *a.request, splits[0], splits[1], splits[2])
		usage = openai.ResponseText2Usage(responseText, meta.ActualModelName, meta.PromptTokens)

	} else {
		err, usage = Handler(c, meta, *a.request, splits[0], splits[1], splits[2])
	}
	return
}

func (a *Adaptor) GetModelList() []string {
	return ModelList
}

func (a *Adaptor) GetChannelName() string {
	return "讯飞星火"
}
