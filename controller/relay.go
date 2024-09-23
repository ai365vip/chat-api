package controller

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/ctxkey"
	"one-api/middleware"
	"one-api/model"
	"one-api/relay/channel/midjourney"
	"one-api/relay/constant"
	"one-api/relay/controller"
	dbmodel "one-api/relay/model"
	"one-api/relay/util"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func relay(c *gin.Context, relayMode int) *dbmodel.ErrorWithStatusCode {
	var err *dbmodel.ErrorWithStatusCode
	switch relayMode {
	case constant.RelayModeImagesGenerations,
		constant.RelayModeEdits:
		err = controller.RelayImageHelper(c, relayMode)

	case constant.RelayModeAudioSpeech:
		fallthrough
	case constant.RelayModeAudioTranslation:
		fallthrough
	case constant.RelayModeAudioTranscription:
		err = controller.RelayAudioHelper(c, relayMode)
	case constant.RelayModeMessages:
		err = controller.RelayClaude(c)
	default:
		err = controller.RelayTextHelper(c)
	}
	return err
}

func Relay(c *gin.Context) {
	ctx := c.Request.Context()
	relayMode := constant.Path2RelayMode(c.Request.URL.Path)
	bizErr := relay(c, relayMode)
	if bizErr == nil {
		return
	}
	channelId := c.GetInt("channel_id")

	lastFailedChannelId := channelId
	channelName := c.GetString("channel_name")
	group := c.GetString("group")
	originalModel := c.GetString(ctxkey.OriginalModel)
	processChannelRelayError(c, channelId, channelName, bizErr)
	requestId := c.GetString("X-Chatapi-Request-Id")
	retryTimes := config.RetryTimes
	if !shouldRetry(c, bizErr.StatusCode) {
		common.Errorf(ctx, "relay error happen, status code is %d, won't retry in this case", bizErr.StatusCode)
		retryTimes = 0
	}
	var attemptsLog []string
	failedChannelIds := []int{channelId}
	for i := retryTimes; i > 0; i-- {
		// 获取并处理上下文值
		valueTools, okTools := c.Get("is_tools")
		valueClaudeOriginalRequest, okClaudeOriginalRequest := c.Get("claude_original_request")
		// 初始化变量为 false
		isTools := false
		isClaudeOriginalRequest := false

		// 如果成功获取上下文值，尝试转换为 bool 类型
		if okTools {
			isTools, _ = valueTools.(bool)
		}

		if okClaudeOriginalRequest {
			isClaudeOriginalRequest, _ = valueClaudeOriginalRequest.(bool)
		}

		// 如果有任何值获取失败，打印日志
		if !okTools || !okClaudeOriginalRequest {
			fmt.Println("Failed to get one or more context values, using default false values")
		}

		channel, err := model.CacheGetRandomSatisfiedChannel(group, originalModel, i != retryTimes, isTools, isClaudeOriginalRequest, failedChannelIds, i)
		if err != nil {
			common.Errorf(ctx, "CacheGetRandomSatisfiedChannel failed: %w", err)
			break
		}

		attemptsLog = append(attemptsLog, fmt.Sprintf("重试次数 #%d: 上次使用渠道「%d」, 错误信息: %v, 重试id:「%d」\n", retryTimes-i+1, lastFailedChannelId, bizErr, channel.Id))
		common.Infof(ctx, "%s", attemptsLog)
		if channel.Id == lastFailedChannelId {
			continue
		}

		middleware.SetupContextForSelectedChannel(c, channel, originalModel, strings.Join(attemptsLog, "\n"))
		requestBody, _ := common.GetRequestBody(c)

		c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
		bizErr = relay(c, relayMode)
		if bizErr == nil {
			return
		}
		channelId := c.GetInt("channel_id")
		lastFailedChannelId = channelId
		failedChannelIds = append(failedChannelIds, channelId) // 更新失败的Channel ID列表
		channelName := c.GetString("channel_name")
		processChannelRelayError(c, channelId, channelName, bizErr)
	}
	if bizErr != nil {
		if bizErr.StatusCode == http.StatusTooManyRequests {
			bizErr.Error.Message = "当前分组上游负载已饱和，请稍后再试"
		}
		bizErr.Error.Message = common.MessageWithRequestId(bizErr.Error.Message, requestId)
		c.JSON(bizErr.StatusCode, gin.H{
			"error": bizErr.Error,
		})
	}
}

func RelayMidjourney(c *gin.Context) {
	relayMode := constant.MidjourneyRelayMode(c.Request.URL.Path)

	var err *midjourney.MidjourneyResponse
	switch relayMode {
	case constant.RelayModeMidjourneyNotify:
		err = midjourney.RelayMidjourneyNotify(c)
	case constant.RelayModeMidjourneyImageSeed:
		err = midjourney.RelayMidjourneyImageSeed(c)
	case constant.RelayModeMidjourneyTaskFetch, constant.RelayModeMidjourneyTaskFetchByCondition:
		err = midjourney.RelayMidjourneyTask(c, relayMode)
	default:
		err = midjourney.RelayMidjourneySubmit(c, relayMode)
	}
	//err = relayMidjourneySubmit(c, relayMode)
	if err != nil {
		retryTimesStr := c.Query("retry")
		retryTimes, _ := strconv.Atoi(retryTimesStr)
		if retryTimesStr == "" {
			retryTimes = config.RetryTimes
		}
		if retryTimes > 0 {
			c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s?retry=%d", c.Request.URL.Path, retryTimes-1))
		} else {
			if err.Code == 30 {
				err.Result = "当前分组负载已饱和，请稍后再试，或升级账户以提升服务质量。"
			}
			c.JSON(400, gin.H{
				"error": err.Description + " " + err.Result,
			})
		}
		channelId := c.GetInt("channel_id")
		common.SysError(fmt.Sprintf("relay error (channel #%d): %+v", channelId, err))

	}
}
func processChannelRelayError(ctx *gin.Context, channelId int, channelName string, err *dbmodel.ErrorWithStatusCode) {
	common.Errorf(ctx, "relay error (channel #%d): %s", channelId, err.Message)
	// https://platform.openai.com/docs/guides/error-codes/api-errors
	if util.ShouldDisableChannel(&err.Error, err.StatusCode) {
		disableChannel(channelId, channelName, err.Message)
	}
}

func RelayNotImplemented(c *gin.Context) {
	err := dbmodel.Error{
		Message: "API not implemented",
		Type:    "chat_api_error",
		Param:   "",
		Code:    "api_not_implemented",
	}
	c.JSON(http.StatusNotImplemented, gin.H{
		"error": err,
	})
}

func RelayNotFound(c *gin.Context) {
	err := dbmodel.Error{
		Message: fmt.Sprintf("Invalid URL (%s %s)", c.Request.Method, c.Request.URL.Path),
		Type:    "invalid_request_error",
		Param:   "",
		Code:    "",
	}
	c.JSON(http.StatusNotFound, gin.H{
		"error": err,
	})
}
func shouldRetry(c *gin.Context, statusCode int) bool {

	if _, ok := c.Get("specific_channel_id"); ok {

		return false

	}
	if statusCode == http.StatusTooManyRequests {
		return true
	}
	if statusCode/100 == 5 {
		return true
	}
	if statusCode == http.StatusBadRequest {
		return false
	}
	if statusCode/100 == 2 {
		return false
	}
	return true
}
