package middleware

import (
	"fmt"
	"net/http"
	"one-api/common"
	"one-api/common/ctxkey"
	"one-api/model"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type ModelRequest struct {
	Model string `json:"model" form:"model"`
}

func Distribute() func(c *gin.Context) {
	return func(c *gin.Context) {
		tokenGroup, _ := c.Get("group")
		modelName, _ := c.Get("model")
		channelId, ok := c.Get("channelId")

		var channel *model.Channel
		var err error

		if ok {
			channel, err = getChannelById(channelId.(string), tokenGroup.(string), modelName.(string))
			if err != nil {
				abortWithMessage(c, http.StatusBadRequest, err.Error())
				return
			}
		} else {
			channel, err = selectChannelForUser(c, tokenGroup.(string), modelName.(string))
			if err != nil {
				abortWithMessage(c, http.StatusServiceUnavailable, err.Error())
				return
			}
		}
		SetupContextForSelectedChannel(c, channel, modelName.(string), "")
		c.Next()
	}
}

func getChannelById(channelId string, tokenGroup string, modelName string) (*model.Channel, error) {
	id, err := strconv.Atoi(channelId)
	if err != nil {
		return nil, fmt.Errorf("无效的渠道 Id")
	}

	channel, err := model.GetChannelById(id, true)
	if err != nil {
		return nil, fmt.Errorf("无效的渠道 Id")
	}

	// 优先检查渠道状态
	if channel.Status != common.ChannelStatusEnabled {
		return nil, fmt.Errorf("该渠道已被禁用")
	}

	// 检查用户分组是否匹配
	if !isGroupMatched(channel.Group, tokenGroup) {
		return nil, fmt.Errorf("指定的渠道不属于当前用户分组")
	}

	// 检查模型是否支持
	if !isModelSupported(channel.Models, modelName) {
		return nil, fmt.Errorf("指定的渠道不支持所请求的模型")
	}

	return channel, nil
}

func selectChannelForUser(c *gin.Context, tokenGroup string, modelName string) (*model.Channel, error) {
	value, _ := c.Get("is_tools")
	isTools, ok := value.(bool)
	if !ok {
		return nil, fmt.Errorf("is_tools value is not of type bool")
	}
	claudeoriginalrequest := c.GetBool("claude_original_request")
	failedChannelIds := []int{}
	channel, err := model.CacheGetRandomSatisfiedChannel(tokenGroup, modelName, false, isTools, claudeoriginalrequest, failedChannelIds, 0)
	if err != nil {
		message := fmt.Sprintf("当前分组 %s 下对于模型 %s 无可用渠道", tokenGroup, modelName)
		if channel != nil {
			common.SysError(fmt.Sprintf("渠道不存在：%d", channel.Id))
			message = "数据库一致性已被破坏，请联系管理员"
		}
		return nil, fmt.Errorf(message)
	}

	return channel, nil
}

func isGroupMatched(channelGroups string, tokenGroup string) bool {
	groups := strings.Split(channelGroups, ",")
	for _, group := range groups {
		if group == tokenGroup {
			return true
		}
	}
	return false
}

func isModelSupported(channelModels string, modelName string) bool {
	models := strings.Split(channelModels, ",")
	for _, m := range models {
		if m == modelName {
			return true
		}
	}
	return false
}

func SetupContextForSelectedChannel(c *gin.Context, channel *model.Channel, modelName string, attemptsLog string) {
	c.Set("channel", channel.Type)
	c.Set("channel_id", channel.Id)
	c.Set("channel_name", channel.Name)
	if channel.ProxyURL != nil {
		c.Set("proxy_url", *channel.ProxyURL)
	}
	c.Set(ctxkey.ContentType, c.Request.Header.Get("Content-Type"))
	c.Set("headers", channel.GetModelHeaders())
	c.Set(ctxkey.OriginalModel, modelName)
	c.Set("attemptsLog", attemptsLog)
	ban := true
	if channel.AutoBan != nil && *channel.AutoBan == 0 {
		ban = false
	}
	c.Set("auto_ban", ban)
	c.Set("model_mapping", channel.GetModelMapping())
	c.Set("status_code_mapping", channel.GetStatusCodeMapping())
	c.Set("original_model", modelName)
	c.Request.Header.Set("Authorization", fmt.Sprintf("Bearer %s", channel.Key))
	c.Set("base_url", channel.GetBaseURL())
	cfg, _ := channel.LoadConfig()
	// 兼容旧版本
	if cfg.APIVersion == "" {
		cfg.APIVersion = channel.Other
	}
	c.Set(ctxkey.Config, cfg)
}
