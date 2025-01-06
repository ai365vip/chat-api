package controller

import (
	"fmt"
	"net/http"
	"one-api/common"
	"one-api/relay/channel/openai"
	dbmodel "one-api/relay/model"
	"one-api/relay/util"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

func WssHelper(c *gin.Context, ws *websocket.Conn) (openaiErr *dbmodel.ErrorWithStatusCode) {
	meta := util.GenRelayInfoWs(c, ws)
	textRequest, err := getAndValidateTextRequest(c, meta.Mode)
	if err != nil {
		return openai.ErrorWrapper(err, "validate_text_request_failed", http.StatusBadRequest)
	}
	meta.OriginModelName = textRequest.Model
	textRequest.Model, _ = util.GetMappedModelName(textRequest.Model, meta.ModelMapping)
	meta.ActualModelName = textRequest.Model
	modelRatio := common.GetModelRatio(textRequest.Model)
	groupRatio := common.GetGroupRatio(meta.Group)
	ratio := modelRatio * groupRatio

	startTime := time.Now()
	c.Set("start_time", startTime)
	resp, err := openai.DoWssRequest(c, meta, nil)
	if err != nil {
		return openai.ErrorWrapper(err, "do_request_failed", http.StatusInternalServerError)
	}
	if resp != nil {
		meta.TargetWs = resp
		defer func() {
			if err := meta.TargetWs.Close(); err != nil {
				common.SysError("failed to close websocket connection: " + err.Error())
			}
		}()
	}
	handlerErr, usage := openai.OpenaiRealtimeHandler(c, meta)
	if handlerErr != nil || usage == nil {
		return openai.ErrorWrapper(
			fmt.Errorf("handler error: %v, usage: %v",
				handlerErr.Error,
				usage),
			"do_request_failed",
			http.StatusInternalServerError)
	}
	duration := int(time.Since(startTime).Seconds())

	go func() {
		PostWssConsumeQuota(c, usage, meta, textRequest, ratio, 0, modelRatio, groupRatio, duration, meta.RelayIp)
	}()

	return nil
}
