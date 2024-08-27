package channel

import (
	"io"
	"net/http"
	"one-api/relay/model"
	"one-api/relay/util"

	"github.com/gin-gonic/gin"
)

type Adaptor interface {
	Init(meta *util.RelayMeta)
	GetRequestURL(meta *util.RelayMeta) (string, error)
	SetupRequestHeader(c *gin.Context, req *http.Request, meta *util.RelayMeta) error
	ConvertRequest(c *gin.Context, meta *util.RelayMeta, request *model.GeneralOpenAIRequest) (any, error)
	ConvertImageRequest(request *model.ImageRequest) (any, error)
	DoRequest(c *gin.Context, meta *util.RelayMeta, requestBody io.Reader) (*http.Response, error)
	DoResponse(c *gin.Context, resp *http.Response, meta *util.RelayMeta) (aitext string, usage *model.Usage, err *model.ErrorWithStatusCode)
	GetModelList() []string
	GetChannelName() string
}
