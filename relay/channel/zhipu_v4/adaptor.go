package zhipu_v4

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
}

func (a *Adaptor) Init(meta *util.RelayMeta) {

}

func (a *Adaptor) GetRequestURL(meta *util.RelayMeta) (string, error) {
	return fmt.Sprintf("%s/api/paas/v4/chat/completions", meta.BaseURL), nil
}

func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Request, meta *util.RelayMeta) error {
	channel.SetupCommonRequestHeader(c, req, meta)
	req.Header.Set("Authorization", meta.APIKey)
	return nil
}

func (a *Adaptor) ConvertRequest(c *gin.Context, relayMode int, request *model.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	return requestOpenAI2Zhipu(*request), nil
}

func (a *Adaptor) DoRequest(c *gin.Context, meta *util.RelayMeta, requestBody io.Reader) (*http.Response, error) {
	return channel.DoRequestHelper(a, c, meta, requestBody)
}

func (a *Adaptor) DoResponse(c *gin.Context, resp *http.Response, meta *util.RelayMeta) (aitext string, usage *model.Usage, err *model.ErrorWithStatusCode) {
	aitext = ""
	if meta.IsStream {
		err, usage, aitext = zhipuStreamHandler(c, resp)
	} else {
		err, usage, aitext = zhipuHandler(c, resp)
	}
	return
}

func (a *Adaptor) GetModelList() []string {
	return ModelList
}

func (a *Adaptor) GetChannelName() string {
	return "zhipu"
}
