package util

import (
	"errors"
	"math"
	"one-api/common"
	"one-api/relay/constant"
	"one-api/relay/model"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

func ValidateTextRequest(textRequest *model.GeneralOpenAIRequest, relayMode int) error {
	if textRequest.MaxTokens < 0 || textRequest.MaxTokens > math.MaxInt32/2 {
		return errors.New("max_tokens is invalid")
	}
	if textRequest.Model == "" {
		return errors.New("model is required")
	}
	switch relayMode {
	case constant.RelayModeCompletions:
		if textRequest.Prompt == "" {
			return errors.New("field prompt is required")
		}
	case constant.RelayModeChatCompletions:
		if textRequest.Messages == nil || len(textRequest.Messages) == 0 {
			return errors.New("field messages is required")
		}
	case constant.RelayModeEmbeddings:
	case constant.RelayModeModerations:
		if textRequest.Input == "" {
			return errors.New("field input is required")
		}
	case constant.RelayModeEdits:
		if textRequest.Instruction == "" {
			return errors.New("field instruction is required")
		}
	}
	return nil
}

func WssString(c *gin.Context, ws *websocket.Conn, str string) error {
	if ws == nil {
		common.LogError(c, "websocket connection is nil")
		return errors.New("websocket connection is nil")
	}
	//common.LogInfo(c, fmt.Sprintf("sending message: %s", str))
	return ws.WriteMessage(1, []byte(str))
}
