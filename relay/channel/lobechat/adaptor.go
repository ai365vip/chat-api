package lobechat

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"one-api/common"
	"one-api/relay/channel"
	"one-api/relay/model"
	"one-api/relay/util"

	"github.com/gin-gonic/gin"
)

type Adaptor struct {
	ChannelType int
}

func (a *Adaptor) Init(meta *util.RelayMeta) {
	a.ChannelType = meta.ChannelType
}

func (a *Adaptor) GetRequestURL(meta *util.RelayMeta) (string, error) {

	fullRequestURL := fmt.Sprintf("%s/api/chat/openai", meta.BaseURL)
	return fullRequestURL, nil
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
	aitext = ""
	if meta.IsStream {
		var responseText string

		err, responseText = StreamHandler(c, resp, meta.Mode, meta.FixedContent)
		aitext = responseText
		usage = ResponseText2Usage(responseText, meta.ActualModelName, meta.PromptTokens)
	} else {
		err, usage, aitext = LobeHandler(c, resp, meta.PromptTokens, meta.ActualModelName)
	}
	return
}

func (a *Adaptor) GetModelList() []string {
	return nil
}

func (a *Adaptor) GetChannelName() string {
	return "openai"
}
