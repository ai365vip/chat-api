package openai

import (
	"fmt"
	"one-api/common"
	"one-api/relay/constant"
	"one-api/relay/model"
	"one-api/relay/util"
	"strings"

	"github.com/gin-gonic/gin"
)

func ErrorWrapper(err error, code string, statusCode int) *model.ErrorWithStatusCode {
	text := err.Error()
	// 定义一个正则表达式匹配URL
	if strings.Contains(text, "Post") {
		common.SysLog(fmt.Sprintf("error: %s", text))
		text = "请求上游地址失败"
	}
	Error := model.Error{
		Message: text,
		Type:    "chat_api_error",
		Code:    code,
	}
	return &model.ErrorWithStatusCode{
		Error:      Error,
		StatusCode: statusCode,
	}
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
	}
	err = util.ValidateTextRequest(textRequest, relayMode)
	if err != nil {
		return nil, err
	}
	return textRequest, nil
}
