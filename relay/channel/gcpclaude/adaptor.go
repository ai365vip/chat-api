package gcpclaude

import (
	"fmt"
	"io"
	"math/rand"
	"net/http"

	"one-api/common/config"
	"one-api/relay/channel"
	"one-api/relay/channel/anthropic"
	"one-api/relay/channel/openai"
	"one-api/relay/model"
	"one-api/relay/util"

	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
)

var _ channel.Adaptor = new(Adaptor)

var gcpModelIDMap = map[string]string{
	"claude-3-sonnet-20240229":   "claude-3-sonnet@20240229",
	"claude-3-5-sonnet-20240620": "claude-3-5-sonnet@20240620",
	"claude-3-opus-20240229":     "claude-3-opus@20240229",
	"claude-3-haiku-20240307":    "claude-3-haiku@20240307",
	"claude-3-5-haiku-20241022":  "claude-3-5-haiku@20241022",
	"claude-3-5-sonnet-20241022": "claude-3-5-sonnet-v2@20241022",
}

var modelLocations = map[string][]string{
	"claude-3-sonnet-20240229":   {"asia-southeast1", "us-central1", "us-east5"},
	"claude-3-5-sonnet-20240620": {"us-east5", "europe-west1"},
	"claude-3-5-sonnet-20241022": {"us-east5"},
	"claude-3-opus-20240229":     {"us-east5"},
	"claude-3-haiku-20240307":    {"europe-west1", "europe-west4", "us-central1", "us-east5"},
	"claude-3-5-haiku-20241022":  {"us-east5"},
}

type Adaptor struct {
}

func (a *Adaptor) Init(meta *util.RelayMeta) {

}

func getRandomLocation(modelName string) (string, error) {
	locations, ok := modelLocations[modelName]
	if !ok {
		return "", fmt.Errorf("no locations available for model: %s", modelName)
	}

	if len(locations) == 0 {
		return "", fmt.Errorf("empty locations list for model: %s", modelName)
	}

	return locations[rand.Intn(len(locations))], nil
}

func (a *Adaptor) GetRequestURL(meta *util.RelayMeta) (string, error) {
	gcpModelID, ok := gcpModelIDMap[meta.ActualModelName]
	if !ok {
		return "", fmt.Errorf("unsupported model: %s", meta.ActualModelName)
	}

	location, err := getRandomLocation(meta.ActualModelName)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("https://%s-aiplatform.googleapis.com/v1/projects/%s/locations/%s/publishers/anthropic/models/%s:streamRawPredict",
		location,
		meta.Config.ProjectId,
		location,
		gcpModelID), nil
}

func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Request, meta *util.RelayMeta) error {
	channel.SetupCommonRequestHeader(c, req, meta)
	req.Header.Set("Authorization", "Bearer "+meta.APIKey)
	req.Header.Del("anthropic-version")
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
	valueclaudeoriginalrequest, _ := c.Get("claude_original_request")
	isclaudeoriginalrequest, _ := valueclaudeoriginalrequest.(bool)
	if !isclaudeoriginalrequest {
		return ConvertRequest(*request), nil
	} else {
		return ConverClaudeRequest(*request), nil
	}

}

func (a *Adaptor) DoRequest(c *gin.Context, meta *util.RelayMeta, requestBody io.Reader) (*http.Response, error) {
	return channel.DoRequestHelper(a, c, meta, requestBody)
}

func (a *Adaptor) DoResponse(c *gin.Context, resp *http.Response, meta *util.RelayMeta) (aitext string, usage *model.Usage, err *model.ErrorWithStatusCode) {
	if !meta.IsClaude {

		if meta.IsStream {

			var responseText string
			err, _, responseText = anthropic.StreamHandler(c, resp)
			usage = openai.ResponseText2Usage(responseText, meta.ActualModelName, meta.PromptTokens)

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
			err, usage, aitext = anthropic.Handler(c, resp, meta.PromptTokens, meta.ActualModelName)
		}
	} else {
		if meta.IsStream {

			var responseText string
			err, _, responseText = anthropic.ClaudeStreamHandler(c, resp)
			usage = openai.ResponseText2Usage(responseText, meta.ActualModelName, meta.PromptTokens)
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
			err, usage, aitext = anthropic.ClaudeHandler(c, resp, meta.PromptTokens, meta.ActualModelName)
		}
	}
	return
}

func (a *Adaptor) GetModelList() []string {
	return anthropic.ModelList
}

func (a *Adaptor) GetChannelName() string {
	return "Anthropic Claude"
}
