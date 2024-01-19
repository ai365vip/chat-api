package openai

import (
	"fmt"
	"one-api/common"
	"strings"
)

func ErrorWrapper(err error, code string, statusCode int) *ErrorWithStatusCode {
	text := err.Error()
	// 定义一个正则表达式匹配URL
	if strings.Contains(text, "Post") {
		common.SysLog(fmt.Sprintf("error: %s", text))
		text = "请求上游地址失败"
	}
	Error := Error{
		Message: text,
		Type:    "chat_api_error",
		Code:    code,
	}
	return &ErrorWithStatusCode{
		Error:      Error,
		StatusCode: statusCode,
	}
}
