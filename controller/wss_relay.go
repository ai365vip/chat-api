package controller

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/ctxkey"
	"one-api/middleware"
	"one-api/model"
	"one-api/relay/constant"
	"one-api/relay/controller"
	dbmodel "one-api/relay/model"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// 定义请求参数结构体
type wssParams struct {
	relayMode     int
	group         string
	originalModel string
}

// 定义重试状态结构体
type retryState struct {
	failedChannelIds    []int
	lastFailedChannelId int
	attemptsLog         []string
}

var upgrader = websocket.Upgrader{
	Subprotocols: []string{"realtime"},
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// WssRelay 处理 WebSocket 连接和消息中继
func WssRelay(c *gin.Context) {
	ctx := c.Request.Context()
	requestId := c.GetString("X-Chatapi-Request-Id")

	// 1. WebSocket 连接初始化
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		common.Errorf(ctx, "websocket upgrade failed: %v", err)
		return
	}
	defer ws.Close()

	// 2. 获取初始参数，添加错误检查
	params := wssParams{
		relayMode:     constant.Path2RelayMode(c.Request.URL.Path),
		group:         c.GetString("group"),
		originalModel: c.GetString(ctxkey.OriginalModel),
	}

	// 检查必要参数
	if params.group == "" || params.originalModel == "" {
		bizErr := &dbmodel.ErrorWithStatusCode{
			Error:      dbmodel.Error{Message: "缺少必要参数"},
			StatusCode: http.StatusBadRequest,
		}
		handleFinalError(c, ws, bizErr, requestId)
		return
	}

	// 3. 首次尝试处理请求
	channel, bizErr := handleInitialRequest(c, ws, params)
	if bizErr == nil {
		return
	}

	// 4. 重试逻辑
	state := &retryState{
		failedChannelIds:    make([]int, 0),
		lastFailedChannelId: -1,
		attemptsLog:         make([]string, 0),
	}

	if channel != nil {
		state.failedChannelIds = append(state.failedChannelIds, channel.Id)
		state.lastFailedChannelId = channel.Id
	}

	bizErr = handleRetries(c, ws, params, state)

	// 5. 处理最终错误
	if bizErr != nil {
		handleFinalError(c, ws, bizErr, requestId)
	}
}

// handleInitialRequest 处理初始请求
func handleInitialRequest(c *gin.Context, ws *websocket.Conn, params wssParams) (*model.Channel, *dbmodel.ErrorWithStatusCode) {
	channel, err := model.CacheGetRandomSatisfiedChannel(
		params.group,
		params.originalModel,
		false, // 首次尝试
		false, // isTools
		false, // isClaudeOriginalRequest
		nil,   // 无失败渠道
		config.RetryTimes,
	)

	if err != nil {
		bizErr := &dbmodel.ErrorWithStatusCode{
			Error:      dbmodel.Error{Message: "无可用渠道"},
			StatusCode: http.StatusServiceUnavailable,
		}
		WssError(c, ws, *bizErr)
		return nil, bizErr
	}

	middleware.SetupContextForSelectedChannel(c, channel, params.originalModel, "")
	bizErr := wssRequest(c, ws, params.relayMode, channel)
	if bizErr != nil {
		processChannelRelayError(c, channel.Id, *channel.AutoBan, c.GetString("channel_name"), bizErr)
	}
	return channel, bizErr
}

// handleRetries 处理重试逻辑
func handleRetries(c *gin.Context, ws *websocket.Conn, params wssParams, state *retryState) *dbmodel.ErrorWithStatusCode {
	ctx := c.Request.Context()
	var lastBizErr *dbmodel.ErrorWithStatusCode

	// 添加基础延迟时间
	baseDelay := 500 * time.Millisecond

	for i := config.RetryTimes - 1; i > 0; i-- {
		// 指数退避等待，给渠道一些恢复时间
		backoffDelay := time.Duration(math.Pow(2, float64(config.RetryTimes-i-1))) * baseDelay
		time.Sleep(backoffDelay)

		channel, err := model.CacheGetRandomSatisfiedChannel(
			params.group,
			params.originalModel,
			true,  // 重试
			false, // isTools
			false, // isClaudeOriginalRequest
			state.failedChannelIds,
			i,
		)

		if err != nil {
			if strings.Contains(err.Error(), "no channels available within rate limits") {
				common.Infof(ctx, "渠道速率受限，等待 %v 后重试", backoffDelay)
				// 如果是速率限制，返回特定错误
				return &dbmodel.ErrorWithStatusCode{
					Error: dbmodel.Error{
						Message: "所有可用渠道当前负载已满，请稍后再试",
						Type:    "rate_limit_error",
					},
					StatusCode: http.StatusTooManyRequests,
				}
			}
			common.Errorf(ctx, "重试获取渠道失败: %v, 已尝试渠道: %v", err, state.failedChannelIds)
			break
		}

		retryLog := fmt.Sprintf(
			"重试 #%d: 等待 %v 后使用渠道「%d」(名称: %s)",
			config.RetryTimes-i,
			backoffDelay,
			channel.Id,
			channel.Name,
		)
		state.attemptsLog = append(state.attemptsLog, retryLog)
		common.Infof(ctx, retryLog)

		// 执行重试请求
		middleware.SetupContextForSelectedChannel(c, channel, params.originalModel, strings.Join(state.attemptsLog, "\n"))

		requestBody, _ := common.GetRequestBody(c)
		c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))

		lastBizErr = wssRequest(c, ws, params.relayMode, channel)
		if lastBizErr == nil {
			return nil
		}

		state.failedChannelIds = append(state.failedChannelIds, channel.Id)
		processChannelRelayError(c, channel.Id, *channel.AutoBan, c.GetString("channel_name"), lastBizErr)
	}

	return lastBizErr
}

// handleFinalError 处理最终错误
func handleFinalError(c *gin.Context, ws *websocket.Conn, bizErr *dbmodel.ErrorWithStatusCode, requestId string) {
	if bizErr.StatusCode == http.StatusTooManyRequests {
		bizErr.Error.Message = "当前分组上游负载已饱和，请稍后再试"
	}
	bizErr.Error.Message = common.MessageWithRequestId(bizErr.Error.Message, requestId)
	WssError(c, ws, *bizErr)
}

// wssRequest 执行 WebSocket 请求
func wssRequest(c *gin.Context, ws *websocket.Conn, relayMode int, channel *model.Channel) *dbmodel.ErrorWithStatusCode {
	requestBody, _ := common.GetRequestBody(c)
	c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
	return controller.WssHelper(c, ws)
}

// WssObject 发送 WebSocket 消息
func WssObject(c *gin.Context, ws *websocket.Conn, object interface{}) error {
	jsonData, err := json.Marshal(object)
	if err != nil {
		return fmt.Errorf("error marshalling object: %w", err)
	}
	if ws == nil {
		common.LogError(c, "websocket connection is nil")
		return errors.New("websocket connection is nil")
	}
	return ws.WriteMessage(1, jsonData)
}

// WssError 发送错误消息
func WssError(c *gin.Context, ws *websocket.Conn, openaiError dbmodel.ErrorWithStatusCode) {
	errorObj := &dbmodel.RealtimeEvent{
		Type:    "error",
		EventId: GetLocalRealtimeID(c),
		Error:   &openaiError.Error,
	}
	_ = WssObject(c, ws, errorObj)
}

// GetLocalRealtimeID 生成本地实时ID
func GetLocalRealtimeID(c *gin.Context) string {
	logID := c.GetString(common.RequestIdKey)
	return fmt.Sprintf("evt_%s", logID)
}
