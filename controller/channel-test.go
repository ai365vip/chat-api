package controller

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"net/http/httptest"
	"net/url"
	"one-api/common"
	"one-api/model"
	"one-api/relay/constant"
	"one-api/relay/helper"
	dbmodel "one-api/relay/model"
	relaymodel "one-api/relay/model"
	"one-api/relay/util"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type BotResponse struct {
	ID      string        `json:"id"`
	Created int64         `json:"created"`
	Object  string        `json:"object"`
	Choices []interface{} `json:"choices"`
	Usage   BotUsage      `json:"usage"`
	Model   string        `json:"model"`
	// added Error field here
	Error        dbmodel.Error `json:"error"`
	FinishReason interface{}   `json:"finish_reason,omitempty"`
}

type BotUsage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

func calculatePromptTokens(str string) int {
	return len([]rune(str))
}

func calculateCompletionTokens(messagesMap []map[string]string) int {
	// adjust the calculation according to your requirements
	return len(messagesMap)
}

func calculateTotalTokens(promptTokens int, completionTokens int) int {
	return promptTokens + completionTokens
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
	// 获取model的自定义头部信息
	modelHeaders := channel.GetModelHeaders()

	// 遍历modelHeaders，并将这些头部信息添加到请求中
	for headerKey, headerValue := range modelHeaders {
		c.Request.Header.Set(headerKey, headerValue)
	}
	meta := util.GetRelayMeta(c)

	apiType := constant.ChannelType2APIType(channel.Type)
	if meta.ChannelType == common.ChannelTypeAzure {

		meta.APIVersion = channel.Other
	}
	adaptor := helper.GetAdaptor(apiType)
	if adaptor == nil {
		return fmt.Errorf("invalid api type: %d, adaptor is nil", apiType), nil
	}
	adaptor.Init(meta)
	request := buildTestRequest(modelTest)
	request.Model = modelTest
	meta.OriginModelName, meta.ActualModelName = modelTest, modelTest
	convertedRequest, err := adaptor.ConvertRequest(c, constant.RelayModeChatCompletions, request)
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
	if resp.StatusCode != http.StatusOK {
		err := util.RelayErrorHandler(resp)
		return fmt.Errorf("status code %d: %s", resp.StatusCode, err.Error.Message), &err.Error
	}
	_, usage, respErr := adaptor.DoResponse(c, resp, meta)
	if respErr != nil {
		return fmt.Errorf("%s", respErr.Error.Message), &respErr.Error
	}
	if usage == nil {
		return errors.New("usage is nil"), nil
	}
	//result := w.Result()
	// print result.Body
	//respBody, err := io.ReadAll(result.Body)
	//if err != nil {
	//	return err, nil
	//}
	//common.SysLog(fmt.Sprintf("testing channel #%d, response: \n%s", channel.Id, string(respBody)))
	return nil, nil
}

func randomID() string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	var seededRand *rand.Rand = rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, 10)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return "chatcmpl-" + string(b)
}

func buildTestRequest(modelTest string) *relaymodel.GeneralOpenAIRequest {
	testRequest := &relaymodel.GeneralOpenAIRequest{
		MaxTokens: 1,
		Stream:    false,
		Model:     modelTest,
	}
	content, _ := json.Marshal("hi")
	testMessage := relaymodel.Message{
		Role:    "user",
		Content: content,
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
	notificationEmail := common.OptionMap["NotificationEmail"]
	if notificationEmail == "" {
		// 如果没有设置专门的通知邮箱，则尝试获取 RootUserEmail
		if common.RootUserEmail == "" {
			common.RootUserEmail = model.GetRootUserEmail()
		}
		notificationEmail = common.RootUserEmail
	}
	// 更新通道状态
	model.UpdateChannelStatusById(channelId, common.ChannelStatusAutoDisabled)

	// 准备通知内容
	subject := fmt.Sprintf("通道「%s」（#%d）已被禁用", channelName, channelId)
	content := fmt.Sprintf("通道「%s」（#%d）已被禁用，原因：%s", channelName, channelId, reason)

	// 发送电子邮件通知
	emailNotifEnabled, _ := strconv.ParseBool(common.OptionMap["EmailNotificationsEnabled"])
	if emailNotifEnabled {
		err := common.SendEmail(subject, notificationEmail, content)
		if err != nil {
			common.SysError(fmt.Sprintf("failed to send email: %s", err.Error()))
		}
	}

	// 发送WxPusher通知
	wxNotifEnabled, _ := strconv.ParseBool(common.OptionMap["WxPusherNotificationsEnabled"])
	if wxNotifEnabled {
		err := SendWxPusherNotification(subject, content)
		if err != nil {
			common.SysError(fmt.Sprintf("无法发送WxPusher通知: %s", err))
		}
	}
}

func testAllChannels(notify bool) error {
	notificationEmail := common.OptionMap["NotificationEmail"]
	if notificationEmail == "" {
		// 如果没有设置专门的通知邮箱，则尝试获取 RootUserEmail
		if common.RootUserEmail == "" {
			common.RootUserEmail = model.GetRootUserEmail()
		}
		notificationEmail = common.RootUserEmail
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

	var disableThreshold = int64(common.ChannelDisableThreshold * 1000)
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
			ban := (openaiErr != nil || milliseconds > disableThreshold) && util.ShouldDisableChannel(openaiErr, -1)

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
			emailNotifEnabled, _ := strconv.ParseBool(common.OptionMap["EmailNotificationsEnabled"])
			if emailNotifEnabled {
				err := common.SendEmail("通道测试完成", notificationEmail, "通道测试完成，如果没有收到禁用通知，说明所有通道都正常")
				if err != nil {
					common.SysError(fmt.Sprintf("failed to send email: %s", err.Error()))
				}
			}

			// 发送WxPusher通知
			wxNotifEnabled, _ := strconv.ParseBool(common.OptionMap["WxPusherNotificationsEnabled"])
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

	// 检查modelTest字段是否为空，如果为空则设置为默认值"gpt-3.5-turbo"
	modelTest := channel.ModelTest
	if modelTest == "" {
		modelTest = "gpt-3.5-turbo"
	}

	// 调用testChannel函数使用确定好的模型进行测试
	err, _ := testChannel(channel, modelTest)

	if err == nil && channel.Status == common.ChannelStatusAutoDisabled {
		// 测试通过，更新通道状态为启用
		model.UpdateChannelStatusById(channel.Id, common.ChannelStatusEnabled)
		notifyChannelEnabled(channel)  // 发送通知
		notifyWxPusherEnabled(channel) // 发送通知wxpusher
	} else if err != nil {
		// 测试失败，记录错误
		common.SysError(fmt.Sprintf("Error testing channel #%d: %s", channel.Id, err.Error()))
	}
}

// notifyChannelEnabled发送通道已重新启用的通知
func notifyChannelEnabled(channel *model.Channel) {
	emailNotifEnabled, _ := strconv.ParseBool(common.OptionMap["EmailNotificationsEnabled"])
	if emailNotifEnabled {
		notificationEmail := common.OptionMap["NotificationEmail"]
		if notificationEmail == "" {
			// 如果没有设置专门的通知邮箱，则尝试获取 RootUserEmail
			if common.RootUserEmail == "" {
				common.RootUserEmail = model.GetRootUserEmail()
			}
			notificationEmail = common.RootUserEmail
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
	wxNotifEnabled, _ := strconv.ParseBool(common.OptionMap["WxPusherNotificationsEnabled"])
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
