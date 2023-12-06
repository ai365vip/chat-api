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
	Error        OpenAIError `json:"error"`
	FinishReason interface{} `json:"finish_reason,omitempty"`
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
func testChannel(channel *model.Channel, request ChatRequest, gptVersion string) (err error, openaiErr *OpenAIError) {
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
	case common.ChannelTypePaLM,
		common.ChannelTypeAnthropic,
		common.ChannelTypeBaidu,
		common.ChannelTypeZhipu,
		common.ChannelTypeAli,
		common.ChannelType360,
		common.ChannelTypeXunfei:
		return errors.New("该渠道类型当前版本不支持测试，请手动测试"), nil
	case common.ChannelTypeAzure:
		request.Model = "gpt-35-turbo"
		defer func() {
			if err != nil {
				err = errors.New("请确保已在 Azure 上创建了 gpt-35-turbo 模型，并且 apiVersion 已正确填写！")
			}
		}()
	default:
		if gptVersion == "gpt-3.5-turbo" {
			request.Model = "gpt-3.5-turbo"
		} else {
			request.Model = gptVersion
		}

	}

	var jsonData []byte

	requestURL := common.ChannelBaseURLs[channel.Type]
	if channel.Type == common.ChannelTypeAzure {
		requestURL = fmt.Sprintf("%s/openai/deployments/%s/chat/completions?api-version=2023-03-15-preview", channel.GetBaseURL(), request.Model)
	} else if channel.Type == common.ChannelTypeChatBot {
		requestURL = channel.GetBaseURL()
		messagesMap := make([]map[string]string, len(request.Messages))
		for i, msg := range request.Messages {
			messagesMap[i] = map[string]string{
				"role":    msg.Role,
				"content": string(msg.Content),
			}

		}
		requestChatbot := RequestTypeChatBot{
			Model:    json.RawMessage(`{"id":"gpt-3.5-turbo"}`),
			Messages: messagesMap,
		}
		jsonData, err = json.Marshal(requestChatbot) // 使用新的 struct 的内容进行序列化

	} else {
		requestURL = channel.GetBaseURL() + "/v1/chat/completions"
		jsonData, err = json.Marshal(request)
	}

	if err != nil {
		return err, nil
	}
	// 打印JSON数据
	//fmt.Println(string(jsonData))

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
	resp, err := httpClient.Do(req)
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

func buildTestRequest() *ChatRequest {
	testRequest := &ChatRequest{
		Model:     "", // this will be set later
		MaxTokens: 1,
	}
	content, _ := json.Marshal("hi")
	testMessage := Message{
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
	gptVersion := c.DefaultQuery("version", "gpt-3.5-turbo")
	tik := time.Now()
	err, _ = testChannel(channel, *testRequest, gptVersion)
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

// disable & notify
func disableChannel(channelId int, channelName string, reason string) {
	if common.RootUserEmail == "" {
		common.RootUserEmail = model.GetRootUserEmail()
	}
	model.UpdateChannelStatusById(channelId, common.ChannelStatusAutoDisabled)
	subject := fmt.Sprintf("通道「%s」（#%d）已被禁用", channelName, channelId)
	content := fmt.Sprintf("通道「%s」（#%d）已被禁用，原因：%s", channelName, channelId, reason)
	err := common.SendEmail(subject, common.RootUserEmail, content)
	if err != nil {
		common.SysError(fmt.Sprintf("failed to send email: %s", err.Error()))
	}
}

func testAllChannels(gptVersion string, notify bool) error {
	if common.RootUserEmail == "" {
		common.RootUserEmail = model.GetRootUserEmail()
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
			if channel.Status != common.ChannelStatusEnabled {
				continue
			}
			tik := time.Now()
			err, openaiErr := testChannel(channel, *testRequest, gptVersion)
			tok := time.Now()
			milliseconds := tok.Sub(tik).Milliseconds()

			ban := false
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
			if shouldDisableChannel(openaiErr, -1) && ban {
				disableChannel(channel.Id, channel.Name, err.Error())
			}
			channel.UpdateResponseTime(milliseconds)
			time.Sleep(common.RequestInterval)
		}
		testAllChannelsLock.Lock()
		testAllChannelsRunning = false
		testAllChannelsLock.Unlock()
		if notify {
			err := common.SendEmail("通道测试完成", common.RootUserEmail, "通道测试完成，如果没有收到禁用通知，说明所有通道都正常")
			if err != nil {
				common.SysError(fmt.Sprintf("failed to send email: %s", err.Error()))
			}
		}
	}()
	return nil
}

func TestAllChannels(c *gin.Context) {
	gptVersion := c.DefaultQuery("version", "gpt-3.5-turbo")
	err := testAllChannels(gptVersion, true)
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

func AutomaticallyTestChannels(frequency int, gptVersion string) {
	for {
		time.Sleep(time.Duration(frequency) * time.Minute)
		common.SysLog("testing all channels")
		_ = testAllChannels(gptVersion, false)
		common.SysLog("channel test finished")
	}
}
