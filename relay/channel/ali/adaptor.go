package ali

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"one-api/relay/channel"
	"one-api/relay/constant"
	"one-api/relay/model"
	"one-api/relay/util"

	"github.com/gin-gonic/gin"
)

// https://help.aliyun.com/zh/dashscope/developer-reference/api-details

type Adaptor struct {
	meta *util.RelayMeta
}

func (a *Adaptor) Init(meta *util.RelayMeta) {

	a.meta = meta
}

func (a *Adaptor) GetRequestURL(meta *util.RelayMeta) (string, error) {
	fullRequestURL := fmt.Sprintf("%s/api/v1/services/aigc/text-generation/generation", meta.BaseURL)
	if meta.Mode == constant.RelayModeEmbeddings {
		fullRequestURL = fmt.Sprintf("%s/api/v1/services/embeddings/text-embedding/text-embedding", meta.BaseURL)
	}
	return fullRequestURL, nil
}

func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Request, meta *util.RelayMeta) error {
	channel.SetupCommonRequestHeader(c, req, meta)
	req.Header.Set("Authorization", "Bearer "+meta.APIKey)
	if meta.IsStream {
		req.Header.Set("X-DashScope-SSE", "enable")
	}
	if a.meta.Config.Plugin != "" {
		req.Header.Set("X-DashScope-Plugin", a.meta.Config.Plugin)
	}
	return nil
}

func (a *Adaptor) ConvertRequest(c *gin.Context, meta *util.RelayMeta, request *model.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	switch meta.Mode {
	case constant.RelayModeEmbeddings:
		baiduEmbeddingRequest := ConvertEmbeddingRequest(*request)
		return baiduEmbeddingRequest, nil
	default:
		baiduRequest := ConvertRequest(*request)
		return baiduRequest, nil
	}
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
		err, usage = StreamHandler(c, resp)
	} else {
		switch meta.Mode {
		case constant.RelayModeEmbeddings:
			err, usage = EmbeddingHandler(c, resp)
		default:
			err, usage = Handler(c, resp)
		}
	}
	return
}

func (a *Adaptor) GetModelList() []string {
	return ModelList
}

func (a *Adaptor) GetChannelName() string {
	return "ali"
}
