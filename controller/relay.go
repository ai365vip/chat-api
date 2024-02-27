package controller

import (
	"fmt"
	"log"
	"net/http"
	"one-api/common"
	"one-api/middleware"
	"one-api/model"
	"one-api/relay/channel/midjourney"
	"one-api/relay/constant"
	"one-api/relay/controller"
	"one-api/relay/util"
	"strconv"

	dbmodel "one-api/relay/model"

	"github.com/gin-gonic/gin"
)

func relay(c *gin.Context, relayMode int) *dbmodel.ErrorWithStatusCode {
	var err *dbmodel.ErrorWithStatusCode
	switch relayMode {
	case constant.RelayModeImagesGenerations:
		err = controller.RelayImageHelper(c, relayMode)
	case constant.RelayModeAudioSpeech:
		fallthrough
	case constant.RelayModeAudioTranslation:
		fallthrough
	case constant.RelayModeAudioTranscription:
		err = controller.RelayAudioHelper(c, relayMode)
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
	originalModel := c.GetString("original_model")
	go processChannelRelayError(c, channelId, channelName, bizErr)
	requestId := c.GetString("X-Chatapi-Request-Id")
	retryTimes := 0
	_, ok := c.Get("channelId")
	if ok {
		retryTimes = 0
	} else {
		retryTimes = common.RetryTimes
	}

	if !shouldRetry(bizErr.StatusCode) {
		log.Println(ctx, "relay error happen, but status code is %d, won't retry in this case", bizErr.StatusCode)
		retryTimes = 0
	}
	for i := retryTimes; i > 0; i-- {
		channel, err := model.CacheGetRandomSatisfiedChannel(group, originalModel)
		if err != nil {
			common.Errorf(ctx, "CacheGetRandomSatisfiedChannel failed: %w", err)
			break
		}
		common.Infof(ctx, "using channel #%d to retry (remain times %d)", channel.Id, i)
		if channel.Id == lastFailedChannelId {
			continue
		}
		middleware.SetupContextForSelectedChannel(c, channel, originalModel)
		bizErr = relay(c, relayMode)
		if bizErr == nil {
			return
		}
		channelId := c.GetInt("channel_id")
		lastFailedChannelId = channelId
		channelName := c.GetString("channel_name")
		go processChannelRelayError(c, channelId, channelName, bizErr)
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

/*
	func Relay1(c *gin.Context) {
		relayMode := constant.Path2RelayMode(c.Request.URL.Path)
		var err *dbmodel.ErrorWithStatusCode
		switch relayMode {
		case constant.RelayModeImagesGenerations:
			err = controller.RelayImageHelper(c, relayMode)
		case constant.RelayModeAudioSpeech:
			fallthrough
		case constant.RelayModeAudioTranslation:
			fallthrough
		case constant.RelayModeAudioTranscription:
			err = controller.RelayAudioHelper(c, relayMode)
		default:
			err = controller.RelayTextHelper(c)
		}
		if err != nil {
			requestId := c.GetString(common.RequestIdKey)
			retryTimesStr := c.Query("retry")
			retryTimes, _ := strconv.Atoi(retryTimesStr)
			if retryTimesStr == "" {
				retryTimes = common.RetryTimes
			}
			if retryTimes > 0 {
				c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s?retry=%d", c.Request.URL.Path, retryTimes-1))
			} else {
				if err.StatusCode == http.StatusTooManyRequests {
					err.Error.Message = "当前分组上游负载已饱和，请稍后再试"
				}
				err.Error.Message = common.MessageWithRequestId(err.Error.Message, requestId)
				c.JSON(err.StatusCode, gin.H{
					"error": err.Error,
				})
			}
			channelId := c.GetInt("channel_id")
			autoBan := c.GetBool("auto_ban")
			common.LogError(c.Request.Context(), fmt.Sprintf("relay error (channel #%d): %s", channelId, err.Message))
			// https://platform.openai.com/docs/guides/error-codes/api-errors
			if util.ShouldDisableChannel(&err.Error, err.StatusCode) && autoBan {
				channelId := c.GetInt("channel_id")
				channelName := c.GetString("channel_name")
				disableChannel(channelId, channelName, err.Message)
			}
		}
	}
*/
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
	log.Println(err)
	if err != nil {
		retryTimesStr := c.Query("retry")
		retryTimes, _ := strconv.Atoi(retryTimesStr)
		if retryTimesStr == "" {
			retryTimes = common.RetryTimes
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
		common.SysError(fmt.Sprintf("relay error (channel #%d): %s", channelId, err.Result))

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
func shouldRetry(statusCode int) bool {
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
