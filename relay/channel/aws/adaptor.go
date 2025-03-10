package aws

import (
	"io"
	"net/http"
	"strings"

	"one-api/common/config"
	"one-api/common/ctxkey"
	"one-api/relay/channel"
	"one-api/relay/channel/anthropic"
	"one-api/relay/channel/openai"
	"one-api/relay/model"
	"one-api/relay/util"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/bedrockruntime"
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
)

var _ channel.Adaptor = new(Adaptor)

type Adaptor struct {
	meta      *util.RelayMeta
	awsClient *bedrockruntime.Client
}

func (a *Adaptor) Init(meta *util.RelayMeta) {
	a.meta = meta
	a.awsClient = bedrockruntime.New(bedrockruntime.Options{
		Region:      meta.Config.Region,
		Credentials: aws.NewCredentialsCache(credentials.NewStaticCredentialsProvider(meta.Config.AK, meta.Config.SK, "")),
	})
}
func (a *Adaptor) GetRequestURL(meta *util.RelayMeta) (string, error) {
	return "", nil
}

func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Request, meta *util.RelayMeta) error {
	return nil
}

func (a *Adaptor) ConvertRequest(c *gin.Context, meta *util.RelayMeta, request *model.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}

	// 检查是否是 Cohere 模型
	if strings.HasPrefix(request.Model, "command") {
		messages := request.Messages
		var prompt string
		for _, msg := range messages {
			prompt += msg.Role + ": " + msg.Content.(string) + "\n"
		}

		// 从请求中获取值，如果没有则使用默认值
		maxTokens := request.MaxTokens
		if maxTokens <= 0 {
			maxTokens = 2048
		}

		temperature := 0.7
		if request.Temperature != nil {
			temperature = *request.Temperature
		}

		cohereReq := &CohereRequest{
			Message:     prompt,
			MaxTokens:   int(maxTokens),
			Temperature: temperature,
		}
		c.Set(ctxkey.Cross, meta.Config.Cross)
		c.Set(ctxkey.RequestModel, request.Model)
		c.Set(ctxkey.ConvertedRequest, cohereReq)
		return cohereReq, nil
	}

	// 原有的 Claude 处理逻辑
	var claudeReq any
	valueclaudeoriginalrequest, _ := c.Get("claude_original_request")
	isclaudeoriginalrequest, _ := valueclaudeoriginalrequest.(bool)
	if isclaudeoriginalrequest {
		claudeReq = anthropic.ConverClaudeRequest(*request)
	} else {
		claudeReq = anthropic.ConvertRequest(*request)
	}
	if strings.HasSuffix(request.Model, "-thinking") {
		request.Model = strings.TrimSuffix(request.Model, "-thinking")
	}
	c.Set(ctxkey.Cross, meta.Config.Cross)
	c.Set(ctxkey.RequestModel, request.Model)
	c.Set(ctxkey.ConvertedRequest, claudeReq)
	return claudeReq, nil
}

func (a *Adaptor) ConvertImageRequest(request *model.ImageRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	return request, nil
}

func (a *Adaptor) DoRequest(c *gin.Context, meta *util.RelayMeta, requestBody io.Reader) (*http.Response, error) {
	return nil, nil
}

func (a *Adaptor) DoResponse(c *gin.Context, resp *http.Response, meta *util.RelayMeta) (aitext string, usage *model.Usage, err *model.ErrorWithStatusCode) {
	if strings.HasPrefix(meta.ActualModelName, "command") {
		if meta.IsStream {
			err, usage, aitext = StreamCohereHandler(c, a.awsClient)
		} else {
			err, usage, aitext = CohereHandler(c, a.awsClient, meta.ActualModelName)
		}
		return
	}

	// 原有的 Claude 处理逻辑
	if !meta.IsClaude {
		if meta.IsStream {
			var responseText string
			err, usage, responseText = StreamHandler(c, a.awsClient)
			if usage == nil {
				usage = openai.ResponseText2Usage(responseText, meta.ActualModelName, meta.PromptTokens)
			}
			if usage.TotalTokens != 0 && usage.CompletionTokens == 0 || usage.PromptTokens == 0 { // some channels don't return prompt tokens & completion tokens
				usage.PromptTokens = meta.PromptTokens
				usage.CompletionTokens = usage.TotalTokens - meta.PromptTokens
			}
			if usage.CompletionTokens == 0 && err == nil {
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
			err, usage, aitext = Handler(c, a.awsClient, meta.ActualModelName)
		}
	} else {
		if meta.IsStream {
			var responseText string
			err, usage, responseText = StreamClaudeHandler(c, a.awsClient)
			if usage == nil {
				usage = openai.ResponseText2Usage(responseText, meta.ActualModelName, meta.PromptTokens)
			}
			if usage.TotalTokens != 0 && usage.CompletionTokens == 0 || usage.PromptTokens == 0 { // some channels don't return prompt tokens & completion tokens
				usage.PromptTokens = meta.PromptTokens
				usage.CompletionTokens = usage.TotalTokens - meta.PromptTokens
			}
			if usage.CompletionTokens == 0 && err == nil {
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
			err, usage, aitext = ClaudeHandler(c, a.awsClient, meta.OriginModelName)
		}
	}
	return
}

func (a *Adaptor) GetModelList() (models []string) {
	for n := range awsModelIDMap {
		models = append(models, n)
	}

	return
}

func (a *Adaptor) GetChannelName() string {
	return "aws"
}
