package controller

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/ctxkey"
	"one-api/middleware"
	"one-api/model"
	"one-api/relay/constant"
	"one-api/relay/helper"
	relaymodel "one-api/relay/model"
	"one-api/relay/util"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type BotResponse struct {
	Model string `json:"model"`
	Usage struct {
		PromptTokens        int `json:"prompt_tokens"`
		CompletionTokens    int `json:"completion_tokens"`
		TotalTokens         int `json:"total_tokens"`
		PromptTokensDetails *struct {
			CachedTokens int `json:"cached_tokens"`
			AudioTokens  int `json:"audio_tokens"`
		} `json:"prompt_tokens_details,omitempty"`
		CompletionTokensDetails *struct {
			ReasoningTokens          int `json:"reasoning_tokens"`
			AudioTokens              int `json:"audio_tokens"`
			AcceptedPredictionTokens int `json:"accepted_prediction_tokens"`
			RejectedPredictionTokens int `json:"rejected_prediction_tokens"`
		} `json:"completion_tokens_details,omitempty"`
	} `json:"usage"`
}

func testChannel(channel *model.Channel, modelTest string) (err error, openaiErr *relaymodel.Error) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = &http.Request{
		Method: "POST",
		URL:    &url.URL{Path: "/v1/chat/completions"},
		Body:   nil,
		Header: make(http.Header),
	}
	c.Request.Header.Set("Authorization", "Bearer "+channel.Key)
	c.Request.Header.Set("Content-Type", "application/json")
	modelHeaders := channel.GetModelHeaders()

	// 遍历modelHeaders，并将这些头部信息添加到请求中
	for headerKey, headerValue := range modelHeaders {
		c.Request.Header.Set(headerKey, headerValue)
	}

	c.Set("channel", channel.Type)
	c.Set("base_url", channel.GetBaseURL())
	cfg, _ := channel.LoadConfig()
	c.Set(ctxkey.Config, cfg)
	middleware.SetupContextForSelectedChannel(c, channel, "", "")
	meta := util.GetRelayMeta(c)
	apiType := constant.ChannelType2APIType(channel.Type)
	adaptor := helper.GetAdaptor(apiType)
	if adaptor == nil {
		return fmt.Errorf("invalid api type: %d, adaptor is nil", apiType), nil
	}
	adaptor.Init(meta)
	request := buildTestRequest(modelTest)
	request.Model, _ = util.GetMappedModelName(request.Model, meta.ModelMapping)
	meta.OriginModelName, meta.ActualModelName = modelTest, modelTest
	convertedRequest, err := adaptor.ConvertRequest(c, meta, request)
	if err != nil {
		return err, nil
	}
	jsonData, err := json.Marshal(convertedRequest)
	if err != nil {
		return err, nil
	}
	requestBody := bytes.NewBuffer(jsonData)
	c.Request.Body = io.NopCloser(requestBody)
	resp, err := adaptor.DoRequest(c, meta, requestBody)
	if err != nil {
		return err, nil
	}
	if resp != nil && resp.StatusCode != http.StatusOK {
		err := util.RelayErrorHandler(resp)
		return fmt.Errorf("status code %d: %s", resp.StatusCode, err.Error.Message), &err.Error
	}

	if meta.ChannelType == common.ChannelTypeCustom ||
		meta.ChannelType == common.ChannelTypeOpenAI {
		// 读取并保存原始响应内容
		responseBody, err := io.ReadAll(resp.Body)
		if err != nil {
			return fmt.Errorf("failed to read response body: %v", err), nil
		}
		resp.Body = io.NopCloser(bytes.NewBuffer(responseBody))

		// 验证模型映射
		modelMap := map[string]string{
			"gpt-3.5-turbo":              "gpt-3.5-turbo-0125",
			"gpt-3.5-turbo-1106":         "gpt-3.5-turbo-1106",
			"gpt-3.5-turbo-0125":         "gpt-3.5-turbo-0125",
			"gpt-3.5-turbo-16k":          "gpt-3.5-turbo-16k-0613",
			"gpt-4":                      "gpt-4-0613",
			"gpt-4-0613":                 "gpt-4-0613",
			"gpt-4-1106-preview":         "gpt-4-1106-preview",
			"gpt-4-0125-preview":         "gpt-4-0125-preview",
			"gpt-4-turbo-preview":        "gpt-4-0125-preview",
			"gpt-4-turbo":                "gpt-4-turbo-2024-04-09",
			"gpt-4-turbo-2024-04-09":     "gpt-4-turbo-2024-04-09",
			"gpt-4o":                     "gpt-4o-2024-08-06",
			"gpt-4o-2024-08-06":          "gpt-4o-2024-08-06",
			"gpt-4o-2024-11-20":          "gpt-4o-2024-11-20",
			"gpt-4o-2024-05-13":          "gpt-4o-2024-05-13",
			"chatgpt-4o-latest":          "chatgpt-4o-latest",
			"gpt-4o-mini":                "gpt-4o-mini-2024-07-18",
			"gpt-4o-mini-2024-07-18":     "gpt-4o-mini-2024-07-18",
			"o1-preview-2024-09-12":      "o1-preview-2024-09-12",
			"o1-preview":                 "o1-preview-2024-09-12",
			"o1-mini-2024-09-12":         "o1-mini-2024-09-12",
			"o1-mini":                    "o1-mini-2024-09-12",
			"o3-mini-2024-09-12":         "o3-mini-2025-01-31",
			"o3-mini":                    "o3-mini-2025-01-31",
			"o1":                         "o1-2024-12-17",
			"o1-2024-12-17":              "o1-2024-12-17",
			"gpt-4.5-preview-2025-02-27": "gpt-4.5-preview-2025-02-27",
			"gpt-4.5-preview":            "gpt-4.5-preview-2025-02-27",
			"gpt-4.1":                    "gpt-4.1-2025-04-14",
			"gpt-4.1-2025-04-14":         "gpt-4.1-2025-04-14",
			"gpt-4.1-mini":               "gpt-4.1-mini-2025-04-14",
			"gpt-4.1-mini-2025-04-14":    "gpt-4.1-mini-2025-04-14",
			"gpt-4.1-nano":               "gpt-4.1-nano-2025-04-14",
			"gpt-4.1-nano-2025-04-14":    "gpt-4.1-nano-2025-04-14",
			"o4-mini":                    "o4-mini-2025-04-16",
			"o4-mini-2025-04-16":         "o4-mini-2025-04-16",
			"o3":                         "o3-2025-04-16",
			"o3-2025-04-16":              "o3-2025-04-16",
		}

		// 检查模型映射
		if expectedModel, exists := modelMap[modelTest]; exists {
			// 先尝试解析是否为字符串包装的JSON
			var jsonString string
			err := json.Unmarshal(responseBody, &jsonString)
			if err == nil {
				// 如果成功解析为字符串，说明JSON被包装了，需要再次解析
				responseBody = []byte(jsonString)
			}

			// 解析为通用map
			var fullResponseMap map[string]interface{}
			if err := json.Unmarshal(responseBody, &fullResponseMap); err != nil {
				common.SysLog(fmt.Sprintf("Failed to parse response for model %s: %s", modelTest, string(responseBody)))
				return fmt.Errorf("failed to parse response: %v", err), nil
			}

			var warnings []string
			// 检查模型匹配
			model, _ := fullResponseMap["model"].(string)
			if expectedModel != model {
				warnings = append(warnings, fmt.Sprintf("模型不匹配：期望 %s，实际返回 %s", expectedModel, model))
			}

			// 获取 usage 部分
			usage, ok := fullResponseMap["usage"].(map[string]interface{})
			if !ok {
				return fmt.Errorf("response missing usage field"), nil
			}

			if promptDetails, ok := usage["prompt_tokens_details"].(map[string]interface{}); !ok {
				warnings = append(warnings, "Usage 中缺少 prompt_tokens_details 信息")
			} else if len(promptDetails) < 2 { // 应该有 cached_tokens 和 audio_tokens 两个字段
				warnings = append(warnings, "prompt_tokens_details 数据不完整")
			}

			// 检查 completion_tokens_details
			if completionDetails, ok := usage["completion_tokens_details"].(map[string]interface{}); !ok {
				warnings = append(warnings, "Usage 中缺少 completion_tokens_details 信息")
			} else if len(completionDetails) < 4 { // 应该有 reasoning_tokens, audio_tokens, accepted_prediction_tokens, rejected_prediction_tokens 四个字段
				warnings = append(warnings, "completion_tokens_details 数据不完整")
			}

			if len(warnings) > 0 {
				warningMessage := strings.Join(warnings, "; ")
				common.SysLog(fmt.Sprintf("Response warnings for model %s: %s", modelTest, warningMessage))
				return fmt.Errorf("模型可用，但有警告: %s", warningMessage), nil
			}
		}
	}

	_, usage, respErr := adaptor.DoResponse(c, resp, meta)
	if respErr != nil {
		return fmt.Errorf("%s", respErr.Error.Message), &respErr.Error
	}
	if usage == nil {
		return errors.New("usage is nil"), nil
	}
	return nil, nil
}

func buildTestRequest(modelTest string) *relaymodel.GeneralOpenAIRequest {
	testRequest := &relaymodel.GeneralOpenAIRequest{
		Stream: false,
		Model:  modelTest,
	}
	if strings.HasPrefix(modelTest, "o1") || strings.HasPrefix(modelTest, "o3") {
		testRequest.MaxCompletionTokens = 5
	} else {
		testRequest.MaxTokens = 5
	}
	//content, _ := json.Marshal("hi")
	testMessage := relaymodel.Message{
		Role:    "user",
		Content: "hi",
	}
	testRequest.Messages = append(testRequest.Messages, testMessage)
	return testRequest
}

func TestChannel(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	channel, err := model.GetChannelById(id, true)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	modelTest := ""
	testModel := c.Query("model")
	if testModel != "" {
		modelTest = testModel
	} else {
		modelTest = channel.ModelTest
		if modelTest == "" {
			modelTest = "gpt-3.5-turbo"
		}
	}

	tik := time.Now()
	err, _ = testChannel(channel, modelTest)
	tok := time.Now()
	milliseconds := tok.Sub(tik).Milliseconds()
	go channel.UpdateResponseTime(milliseconds)
	consumedTime := float64(milliseconds) / 1000.0
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
			"time":    consumedTime,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"time":    consumedTime,
	})
	return
}

var testAllChannelsLock sync.Mutex
var testAllChannelsRunning bool = false

// disableChannel 禁用通道并发送通知
func disableChannel(channelId int, channelName string, reason string) {
	notificationEmail := config.OptionMap["NotificationEmail"]
	if notificationEmail == "" {
		// 如果没有设置专门的通知邮箱，则尝试获取 RootUserEmail
		if config.RootUserEmail == "" {
			config.RootUserEmail = model.GetRootUserEmail()
		}
		notificationEmail = config.RootUserEmail
	}
	// 更新通道状态
	model.UpdateChannelStatusById(channelId, common.ChannelStatusAutoDisabled)

	// 准备通知内容
	subject := fmt.Sprintf("通道「%s」（#%d）已被禁用", channelName, channelId)
	content := fmt.Sprintf("通道「%s」（#%d）已被禁用，原因：%s", channelName, channelId, reason)

	// 发送电子邮件通知
	emailNotifEnabled, _ := strconv.ParseBool(config.OptionMap["EmailNotificationsEnabled"])
	if emailNotifEnabled {
		err := common.SendEmail(subject, notificationEmail, content)
		if err != nil {
			common.SysError(fmt.Sprintf("failed to send email: %s", err.Error()))
		}
	}

	// 发送WxPusher通知
	wxNotifEnabled, _ := strconv.ParseBool(config.OptionMap["WxPusherNotificationsEnabled"])
	if wxNotifEnabled {
		err := SendWxPusherNotification(subject, content)
		if err != nil {
			common.SysError(fmt.Sprintf("无法发送WxPusher通知: %s", err))
		}
	}
}

func testAllChannels(notify bool) error {
	notificationEmail := config.OptionMap["NotificationEmail"]
	if notificationEmail == "" {
		// 如果没有设置专门的通知邮箱，则尝试获取 RootUserEmail
		if config.RootUserEmail == "" {
			config.RootUserEmail = model.GetRootUserEmail()
		}
		notificationEmail = config.RootUserEmail
	}
	testAllChannelsLock.Lock()
	if testAllChannelsRunning {
		testAllChannelsLock.Unlock()
		return errors.New("测试已在运行中")
	}
	testAllChannelsRunning = true
	testAllChannelsLock.Unlock()
	channels, err := model.GetAllChannels(0, 0, true, false)
	if err != nil {
		return err
	}

	var disableThreshold = int64(config.ChannelDisableThreshold * 1000)
	if disableThreshold == 0 {
		disableThreshold = 10000000 // a impossible value
	}
	go func() {
		for _, channel := range channels {
			if channel.Status != common.ChannelStatusEnabled && channel.Status != common.ChannelStatusAutoDisabled {
				continue
			}
			tik := time.Now()
			// 检查modelTest字段是否为空，如果为空则设置为默认值"gpt-3.5-turbo"
			modelTest := channel.ModelTest
			if modelTest == "" {
				modelTest = "gpt-3.5-turbo"
			}
			err, openaiErr := testChannel(channel, modelTest)
			tok := time.Now()
			milliseconds := tok.Sub(tik).Milliseconds()

			// ban := false
			// 标记是否应该禁用通道
			ban := (openaiErr != nil || milliseconds > disableThreshold) && util.ShouldDisableChannel(openaiErr, -1, *channel.AutoBan)

			if milliseconds > disableThreshold {
				err = errors.New(fmt.Sprintf("响应时间 %.2fs 超过阈值 %.2fs", float64(milliseconds)/1000.0, float64(disableThreshold)/1000.0))
				ban = true
			}
			if openaiErr != nil {
				err = errors.New(fmt.Sprintf("type %s, code %v, message %s", openaiErr.Type, openaiErr.Code, openaiErr.Message))
				ban = true
			}
			// parse *int to bool
			if channel.AutoBan != nil && *channel.AutoBan == 0 {
				ban = false
			}
			if ban {
				// 如果满足禁用条件，则禁用通道
				if channel.Status != common.ChannelStatusAutoDisabled {
					disableChannel(channel.Id, channel.Name, err.Error())
				}
			} else {
				// 测试成功且未被标记为禁用，检查是否需要重新启用
				if channel.Status == common.ChannelStatusAutoDisabled {
					model.UpdateChannelStatusById(channel.Id, common.ChannelStatusEnabled) // 启用通道
					notifyChannelEnabled(channel)                                          // 发送通知邮箱
					notifyWxPusherEnabled(channel)                                         // 发送通知wxpusher
				}
			}
			channel.UpdateResponseTime(milliseconds)
			time.Sleep(common.RequestInterval)
		}
		testAllChannelsLock.Lock()
		testAllChannelsRunning = false
		testAllChannelsLock.Unlock()
		if notify {
			// 发送电子邮件通知
			emailNotifEnabled, _ := strconv.ParseBool(config.OptionMap["EmailNotificationsEnabled"])
			if emailNotifEnabled {
				err := common.SendEmail("通道测试完成", notificationEmail, "通道测试完成，如果没有收到禁用通知，说明所有通道都正常")
				if err != nil {
					common.SysError(fmt.Sprintf("failed to send email: %s", err.Error()))
				}
			}

			// 发送WxPusher通知
			wxNotifEnabled, _ := strconv.ParseBool(config.OptionMap["WxPusherNotificationsEnabled"])
			if wxNotifEnabled {
				err = SendWxPusherNotification("通道测试完成", "通道测试完成，如果没有收到禁用通知，说明所有通道都正常")
				if err != nil {
					common.SysError(fmt.Sprintf("无法发送WxPusher通知: %s", err))
				}
			}
		}
	}()
	return nil
}

func TestAllChannels(c *gin.Context) {
	err := testAllChannels(true)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})
	return
}

func AutomaticallyTestDisabledChannels(frequency int) {
	//common.SysLog("Starting the auto-disabled channels testing goroutine")
	ticker := time.NewTicker(time.Duration(frequency) * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		//common.SysLog("Testing all auto-disabled channels")
		channels, err := model.GetAllChannels(0, 0, true, false)
		if err != nil {
			common.SysError(fmt.Sprintf("Error retrieving channels: %s", err.Error()))
			continue
		}

		currentTime := time.Now()
		for _, channel := range channels {
			// 如果通道状态为自动禁用并且TestedTime不为空则执行测试
			if channel.Status == common.ChannelStatusAutoDisabled && channel.TestedTime != nil && *channel.TestedTime > 0 {
				testInterval := time.Duration(*channel.TestedTime) * time.Second // 解引用并转换到time.Duration

				// 执行测试并更新下一次测试的预定时间
				go testChannelAndHandleResult(channel, testInterval, currentTime)
			}
		}
	}
}

func testChannelAndHandleResult(channel *model.Channel, testInterval time.Duration, lastTestTime time.Time) {
	modelTest := channel.ModelTest
	if modelTest == "" {
		modelTest = "gpt-3.5-turbo"
	}

	// 调用testChannel函数使用确定好的模型进行测试
	err, _ := testChannel(channel, modelTest)

	// 如果通道当前是自动禁用状态
	if channel.Status == common.ChannelStatusAutoDisabled {
		// 检查是否是"模型可用，但有警告"的情况
		isModelWarning := err != nil && strings.HasPrefix(err.Error(), "模型可用，但有警告")

		if err == nil || isModelWarning {
			// 测试通过或仅是模型警告，更新通道状态为启用
			model.UpdateChannelStatusById(channel.Id, common.ChannelStatusEnabled)
			notifyChannelEnabled(channel)  // 发送通知
			notifyWxPusherEnabled(channel) // 发送通知wxpusher

			if isModelWarning {
				// 记录警告信息但不影响通道启用
				common.SysLog(fmt.Sprintf("Channel #%d enabled with model warnings: %s", channel.Id, err.Error()))
			}
		} else {
			// 测试失败且是其他错误，记录错误
			common.SysError(fmt.Sprintf("Error testing channel #%d: %s", channel.Id, err.Error()))
		}
	}
}

// notifyChannelEnabled发送通道已重新启用的通知
func notifyChannelEnabled(channel *model.Channel) {
	emailNotifEnabled, _ := strconv.ParseBool(config.OptionMap["EmailNotificationsEnabled"])
	if emailNotifEnabled {
		notificationEmail := config.OptionMap["NotificationEmail"]
		if notificationEmail == "" {
			// 如果没有设置专门的通知邮箱，则尝试获取 RootUserEmail
			if config.RootUserEmail == "" {
				config.RootUserEmail = model.GetRootUserEmail()
			}
			notificationEmail = config.RootUserEmail
		}
		subject := fmt.Sprintf("通道「%s」（#%d）已恢复启用", channel.Name, channel.Id)
		content := "通道成功通过了测试，并已重新启用。"
		err := common.SendEmail(subject, notificationEmail, content)
		if err != nil {
			common.SysError(fmt.Sprintf("failed to send email notification: %s", err.Error()))
		}
	}
}

func notifyWxPusherEnabled(channel *model.Channel) {
	wxNotifEnabled, _ := strconv.ParseBool(config.OptionMap["WxPusherNotificationsEnabled"])
	if wxNotifEnabled {
		subject := fmt.Sprintf("通道「%s」（#%d）已恢复启用", channel.Name, channel.Id)
		content := "通道成功通过了测试，并已重新启用。"
		err := SendWxPusherNotification(subject, content)
		if err != nil {
			common.SysError(fmt.Sprintf("无法发送WxPusher通知: %s", err))
		}
	}
}

func AutomaticallyTestChannels(frequency int) {
	for {
		time.Sleep(time.Duration(frequency) * time.Minute)
		common.SysLog("testing all channels")
		_ = testAllChannels(false)
		common.SysLog("channel test finished")
	}
}
