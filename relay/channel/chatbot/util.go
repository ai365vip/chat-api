package chatbot

import (
	"fmt"
	"one-api/common"

	"github.com/pkoukk/tiktoken-go"
)

func ErrorWrapper(err error, code string, statusCode int) *ErrorWithStatusCode {
	Error := Error{
		Message: err.Error(),
		Type:    "chat_api_error",
		Code:    code,
	}
	return &ErrorWithStatusCode{
		Error:      Error,
		StatusCode: statusCode,
	}
}

func CountTokenText(text string, model string) int {
	tokenEncoder := getTokenEncoder(model)
	return getTokenNum(tokenEncoder, text)
}

var tokenEncoderMap = map[string]*tiktoken.Tiktoken{}
var defaultTokenEncoder *tiktoken.Tiktoken

func getTokenEncoder(model string) *tiktoken.Tiktoken {
	tokenEncoder, ok := tokenEncoderMap[model]
	if ok && tokenEncoder != nil {
		return tokenEncoder
	}
	if ok {
		tokenEncoder, err := tiktoken.EncodingForModel(model)
		if err != nil {
			common.SysError(fmt.Sprintf("failed to get token encoder for model %s: %s, using encoder for gpt-3.5-turbo", model, err.Error()))
			tokenEncoder = defaultTokenEncoder
		}
		tokenEncoderMap[model] = tokenEncoder
		return tokenEncoder
	}
	return defaultTokenEncoder
}

func getTokenNum(tokenEncoder *tiktoken.Tiktoken, text string) int {
	return len(tokenEncoder.Encode(text, nil, nil))
}
