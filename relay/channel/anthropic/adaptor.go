package anthropic

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"one-api/common/config"
	"one-api/relay/channel"
	"one-api/relay/channel/openai"
	"one-api/relay/model"
	"one-api/relay/util"

	"github.com/gin-gonic/gin"
)

type Adaptor struct {
}

func (a *Adaptor) Init(meta *util.RelayMeta) {

}

func (a *Adaptor) GetRequestURL(meta *util.RelayMeta) (string, error) {
	return fmt.Sprintf("%s/v1/messages", meta.BaseURL), nil
}

func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Request, meta *util.RelayMeta) error {
	channel.SetupCommonRequestHeader(c, req, meta)
	req.Header.Set("x-api-key", meta.APIKey)
	anthropicVersion := c.Request.Header.Get("anthropic-version")
	if anthropicVersion == "" {
		anthropicVersion = "2023-06-01"
	}
	req.Header.Set("anthropic-version", anthropicVersion)
	req.Header.Set("anthropic-beta", "messages-2023-12-15")
	return nil
}
func (a *Adaptor) ConvertImageRequest(request *model.ImageRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	return request, nil
}
func (a *Adaptor) ConvertRequest(c *gin.Context, meta *util.RelayMeta, request *model.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	var claudeReq any
	valueclaudeoriginalrequest, _ := c.Get("claude_original_request")
	isclaudeoriginalrequest, _ := valueclaudeoriginalrequest.(bool)
	if isclaudeoriginalrequest {
		claudeReq = ConverClaudeRequest(*request)
	} else {
		claudeReq = ConvertRequest(*request)
	}
	return claudeReq, nil

}

func (a *Adaptor) DoRequest(c *gin.Context, meta *util.RelayMeta, requestBody io.Reader) (*http.Response, error) {
	return channel.DoRequestHelper(a, c, meta, requestBody)
}

func (a *Adaptor) DoResponse(c *gin.Context, resp *http.Response, meta *util.RelayMeta) (aitext string, usage *model.Usage, err *model.ErrorWithStatusCode) {
	if !meta.IsClaude {
		if meta.IsStream {
			var responseText string
			err, usage, responseText = StreamHandler(c, resp)
			if usage == nil {
				usage = openai.ResponseText2Usage(responseText, meta.ActualModelName, meta.PromptTokens)
			}
			if usage.TotalTokens != 0 && usage.CompletionTokens == 0 || usage.PromptTokens == 0 { // some channels don't return prompt tokens & completion tokens
				usage.PromptTokens = meta.PromptTokens
				usage.CompletionTokens = usage.TotalTokens - meta.PromptTokens
			}

			if usage.CompletionTokens == 0 {
				if config.BlankReplyRetryEnabled {
					return "", nil, &model.ErrorWithStatusCode{
						Error: model.Error{
							Message: "No completion tokens generated",
							Type:    "chat_api_error",
							Param:   "completionTokens",
							Code:    500,
						},
						StatusCode: 500,
					}
				}
			}
			aitext = responseText
		} else {
			err, usage, aitext = Handler(c, resp, meta.PromptTokens, meta.ActualModelName)
		}
	} else {
		if meta.IsStream {
			var responseText string
			err, usage, responseText = ClaudeStreamHandler(c, resp)
			if usage == nil {
				usage = openai.ResponseText2Usage(responseText, meta.ActualModelName, meta.PromptTokens)
			}
			if usage.TotalTokens != 0 && usage.CompletionTokens == 0 || usage.PromptTokens == 0 { // some channels don't return prompt tokens & completion tokens
				usage.PromptTokens = meta.PromptTokens
				usage.CompletionTokens = usage.TotalTokens - meta.PromptTokens
			}
			if usage.CompletionTokens == 0 {
				if config.BlankReplyRetryEnabled {
					return "", nil, &model.ErrorWithStatusCode{
						Error: model.Error{
							Message: "No completion tokens generated",
							Type:    "chat_api_error",
							Param:   "completionTokens",
							Code:    500,
						},
						StatusCode: 500,
					}
				}
			}
			aitext = responseText
		} else {
			err, usage, aitext = ClaudeHandler(c, resp, meta.PromptTokens, meta.ActualModelName)
		}
	}
	return
}

func (a *Adaptor) GetModelList() []string {
	return ModelList
}

func (a *Adaptor) GetChannelName() string {
	return "Anthropic Claude"
}
