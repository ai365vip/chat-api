package chatbot

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"one-api/common"
	"one-api/relay/channel"
	"one-api/relay/constant"
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
	fullRequestURL := fmt.Sprintf("%s", meta.BaseURL)
	return fullRequestURL, nil
}

func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Request, meta *util.RelayMeta) error {
	channel.SetupCommonRequestHeader(c, req, meta)
	if meta.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+meta.APIKey)
		return nil
	}
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Proxy-Connection", "keep-alive")
	return nil
}

func (a *Adaptor) ConvertRequest(c *gin.Context, relayMode int, request *model.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	return request, nil
}

func (a *Adaptor) DoRequest(c *gin.Context, meta *util.RelayMeta, requestBody io.Reader) (*http.Response, error) {
	var modelID struct {
		ID string `json:"id"`
	}

	textRequest, err := getAndValidateTextRequest(c, meta.Mode)
	if err != nil {
		return nil, fmt.Errorf("failed to get and validate text request: %v", err)
	}

	modelID.ID = textRequest.Model

	var tempRequest struct {
		Model    interface{} `json:"model"`
		Messages []Message   `json:"messages"`
	}
	tempRequest.Model = modelID

	var messages []Message
	for _, m := range textRequest.Messages {
		var msg Message
		msg.Role = m.Role
		msg.Content = m.Content
		msg.Name = m.Name
		messages = append(messages, msg)
	}

	tempRequest.Messages = messages

	tempRequest.Messages = messages
	jsonStr, err := json.MarshalIndent(tempRequest, "", "  ")
	if err != nil {
		// 更改为记录错误而不是立即退出，这样做更适合Web服务
		log.Printf("Failed to marshal textRequest: %v", err)
		return nil, err // 返回错误，而不是崩溃
	}

	requestBody = bytes.NewBuffer(jsonStr)

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
		err, usage, aitext = BotHandler(c, resp, meta.PromptTokens, meta.ActualModelName)
	}
	return
}

func (a *Adaptor) GetModelList() []string {
	return nil
}

func (a *Adaptor) GetChannelName() string {
	return "openai"
}
func getAndValidateTextRequest(c *gin.Context, relayMode int) (*model.GeneralOpenAIRequest, error) {
	textRequest := &model.GeneralOpenAIRequest{}
	err := common.UnmarshalBodyReusable(c, textRequest)
	if err != nil {
		return nil, err
	}
	if relayMode == constant.RelayModeModerations && textRequest.Model == "" {
		textRequest.Model = "text-moderation-latest"
	}
	if relayMode == constant.RelayModeEmbeddings && textRequest.Model == "" {
		textRequest.Model = c.Param("model")
		textRequest.Stream = false
	}
	err = util.ValidateTextRequest(textRequest, relayMode)
	if err != nil {
		return nil, err
	}
	return textRequest, nil
}
