package controller

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"one-api/common"
	"one-api/model"
	"one-api/relay/channel/openai"
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
	Error        openai.Error `json:"error"`
	FinishReason interface{}  `json:"finish_reason,omitempty"`
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
func testChannel(channel *model.Channel, request openai.ChatRequest, gptVersion string) (err error, openaiErr *openai.Error) {
	type RequestType struct {
		Model     string
		Messages  []map[string]string
		MaxTokens int
	}

	type RequestTypeChatBot struct {
		Model    json.RawMessage     `json:"model"`
		Messages []map[string]string `json:"messages"`
	}

	switch channel.Type {
	case common.ChannelTypePaLM:
		fallthrough
	case common.ChannelTypeAnthropic:
		fallthrough
	case common.ChannelTypeBaidu:
		fallthrough
	case common.ChannelTypeZhipu:
		fallthrough
	case common.ChannelTypeAli:
		fallthrough
	case common.ChannelType360:
		fallthrough
	case common.ChannelTypeGemini:
		fallthrough
	case common.ChannelTypeXunfei:
		return errors.New("该渠道类型当前版本不支持测试，请手动测试"), nil
	case common.ChannelTypeAzure:
		request.Model = "gpt-35-turbo"
		defer func() {
			if err != nil {
				err = errors.New("请确保已在 Azure 上创建了 gpt-35-turbo 模型，并且 apiVersion 已正确填写！")
			}
		}()
	default:
		if gptVersion != "" {
			request.Model = gptVersion
		} else {
			request.Model = "gpt-3.5-turbo"
		}

	}

	var jsonData []byte

	requestURL := common.ChannelBaseURLs[channel.Type]
	if channel.Type == common.ChannelTypeAzure {
		requestURL = fmt.Sprintf("%s/openai/deployments/%s/chat/completions?api-version=2023-03-15-preview", channel.GetBaseURL(), request.Model)
		jsonData, err = json.Marshal(request)
	} else if channel.Type == common.ChannelTypeChatBot {
		requestURL = channel.GetBaseURL()
		messagesMap := make([]map[string]string, len(request.Messages))
		for i, msg := range request.Messages {
			var contentString string
			if content, ok := msg.Content.(string); ok {
				contentString = content
			} else {
				// 处理错误或执行一个合适的动作（比如设置一个默认字符串）
				contentString = "hi"
			}
			messagesMap[i] = map[string]string{
				"role":    msg.Role,
				"content": contentString,
			}
		}

		requestChatbot := RequestTypeChatBot{
			Model:    json.RawMessage(`{"id":"gpt-4"}`),
			Messages: messagesMap,
		}
		jsonData, err = json.Marshal(requestChatbot)

	} else {
		if baseURL := channel.GetBaseURL(); len(baseURL) > 0 {
			requestURL = baseURL
		}

		requestURL = util.GetFullRequestURL(requestURL, "/v1/chat/completions", channel.Type)
		jsonData, err = json.Marshal(request)
	}

	if err != nil {
		return err, nil
	}
	// 打印JSON数据
	//fmt.Println(bytes.NewBuffer(jsonData))

	req, err := http.NewRequest("POST", requestURL, bytes.NewBuffer(jsonData))
	messagesMap := make([]map[string]string, len(request.Messages))
	if err != nil {
		return err, nil
	}
	if channel.Key != "" {
		if channel.Type == common.ChannelTypeAzure {
			req.Header.Set("api-key", channel.Key)
		} else if channel.Type == common.ChannelTypeOpenAI {
			req.Header.Set("Authorization", "Bearer "+channel.Key)
		} else if channel.Type == common.ChannelTypeChatBot {
			req.Header.Set("Cache-Control", "no-cache")
			req.Header.Set("Proxy-Connection", "keep-alive")
		} else {
			req.Header.Set("Authorization", "Bearer "+channel.Key)
		}
	}

	completionTokens := calculateCompletionTokens(messagesMap)
	req.Header.Set("Content-Type", "application/json")
	resp, err := util.HTTPClient.Do(req)

	if err != nil {
		return err, nil
	}

	var response BotResponse

	if channel.Type == common.ChannelTypeChatBot {
		if resp.StatusCode == http.StatusOK {
			responseBody, err := io.ReadAll(resp.Body)
			if err != nil {
				return err, nil
			}
			bodyStr := string(responseBody)
			//fmt.Println(bodyStr)

			promptTokens := calculatePromptTokens(bodyStr) // 根据bodyStr的值计算
			completionTokens += promptTokens
			totalTokens := calculateTotalTokens(promptTokens, completionTokens) // 这两个值相加

			response.Usage = BotUsage{
				PromptTokens:     promptTokens,
				CompletionTokens: completionTokens,
				TotalTokens:      totalTokens,
			}
		}
	} else {
		err = json.NewDecoder(resp.Body).Decode(&response)
		if err != nil {
			return err, nil
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		if response.Usage.CompletionTokens == 0 {
			return errors.New(fmt.Sprintf("type %s, code %v, message %s", response.Error.Type, response.Error.Code, response.Error.Message)), &response.Error
		}
	}

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

func buildTestRequest() *openai.ChatRequest {
	testRequest := &openai.ChatRequest{
		Model:     "", // this will be set later
		MaxTokens: 1,
	}
	content, _ := json.Marshal("hi")
	testMessage := openai.Message{
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
	testRequest := buildTestRequest()
	modelTest := channel.ModelTest
	if modelTest == "" {
		modelTest = "gpt-3.5-turbo"
	}
	tik := time.Now()
	err, _ = testChannel(channel, *testRequest, modelTest)
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
	testRequest := buildTestRequest()
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
			err, openaiErr := testChannel(channel, *testRequest, modelTest)
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
	testRequest := buildTestRequest()

	// 检查modelTest字段是否为空，如果为空则设置为默认值"gpt-3.5-turbo"
	modelTest := channel.ModelTest
	if modelTest == "" {
		modelTest = "gpt-3.5-turbo"
	}

	// 调用testChannel函数使用确定好的模型进行测试
	err, _ := testChannel(channel, *testRequest, modelTest)

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
