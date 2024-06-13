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
		var channel *model.Channel
		tokenGroup, _ := c.Get("group")

		Model, _ := c.Get("model")

		channelId, ok := c.Get("channelId")

		if ok {
			id, err := strconv.Atoi(channelId.(string))
			if err != nil {
				abortWithMessage(c, http.StatusBadRequest, "无效的渠道 Id")
				return
			}
			channel, err = model.GetChannelById(id, true)
			if err != nil {
				abortWithMessage(c, http.StatusBadRequest, "无效的渠道 Id")
				return
			}

			// 从上下文获取 tokenGroup
			tokenGroup, groupExists := c.Get("group")
			if !groupExists || tokenGroup == nil || tokenGroup == "" {
				abortWithMessage(c, http.StatusForbidden, "无法获取有效的用户分组信息")
				return
			}
			// 将 channel.Group 分割成多个分组
			channelGroups := strings.Split(channel.Group, ",")
			isGroupMatched := false
			for _, group := range channelGroups {
				if group == tokenGroup.(string) {
					isGroupMatched = true
					break
				}
			}

			// 如果用户分组不在渠道的分组列表中
			if !isGroupMatched {
				abortWithMessage(c, http.StatusForbidden, "指定的渠道不属于当前用户分组")
				return
			}
			// 将 channels.models 分割成多个模型
			supportedModels := strings.Split(channel.Models, ",")
			modelSupported := false
			for _, m := range supportedModels {
				if m == Model {
					modelSupported = true
					break
				}
			}
			//log.Printf("请求模型: %#v", Model)

			// 如果请求的模型不在渠道支持的模型列表中
			if !modelSupported {
				abortWithMessage(c, http.StatusForbidden, "指定的渠道不支持所请求的模型")
				return
			}

			if channel.Status != common.ChannelStatusEnabled {
				abortWithMessage(c, http.StatusForbidden, "该渠道已被禁用")
				return
			}
		} else {
			// Select a channel for the user
			var err error

			value, _ := c.Get("is_tools")

			// 尝试将值转换为bool类型
			isTools, ok := value.(bool)
			if !ok {
				// 如果转换失败，处理类型不匹配的情况
				fmt.Println("is_tools value is not of type bool")
				return
			}
			failedChannelIds := []int{}
			channel, err = model.CacheGetRandomSatisfiedChannel(tokenGroup.(string), Model.(string), false, isTools, failedChannelIds, 0)
			if err != nil {
				message := fmt.Sprintf("当前分组 %s 下对于模型 %s 无可用渠道", tokenGroup, Model)
				if channel != nil {
					common.SysError(fmt.Sprintf("渠道不存在：%d", channel.Id))
					message = "数据库一致性已被破坏，请联系管理员"
				}
				abortWithMessage(c, http.StatusServiceUnavailable, message)
				return
			}
		}
		SetupContextForSelectedChannel(c, channel, Model.(string), "")
		c.Next()
	}
}
func SetupContextForSelectedChannel(c *gin.Context, channel *model.Channel, modelName string, attemptsLog string) {
	c.Set("channel", channel.Type)
	c.Set("channel_id", channel.Id)
	c.Set("channel_name", channel.Name)
	c.Set(ctxkey.ContentType, c.Request.Header.Get("Content-Type"))
	c.Set("headers", channel.GetModelHeaders())
	c.Set(ctxkey.OriginalModel, modelName)
	c.Set("attemptsLog", attemptsLog)
	ban := true
	// parse *int to bool
	if channel.AutoBan != nil && *channel.AutoBan == 0 {
		ban = false
	}
	c.Set("auto_ban", ban)
	c.Set("model_mapping", channel.GetModelMapping())
	c.Set("status_code_mapping", channel.GetStatusCodeMapping())
	c.Set("original_model", modelName) // for retry
	c.Request.Header.Set("Authorization", fmt.Sprintf("Bearer %s", channel.Key))
	c.Set("base_url", channel.GetBaseURL())
	cfg, _ := channel.LoadConfig()
	// this is for backward compatibility
	switch channel.Type {
	case common.ChannelTypeAzure:
		if cfg.APIVersion == "" {
			cfg.APIVersion = channel.Other
		}
	case common.ChannelTypeStability:
		if cfg.APIVersion == "" {
			cfg.APIVersion = channel.Other
		}
	case common.ChannelTypeXunfei:
		if cfg.APIVersion == "" {
			cfg.APIVersion = channel.Other
		}
	case common.ChannelTypeGemini:
		if cfg.APIVersion == "" {
			cfg.APIVersion = channel.Other
		}
	case common.ChannelTypeAIProxyLibrary:
		if cfg.APIVersion == "" {
			cfg.APIVersion = channel.Other
		}
	case common.ChannelTypeAli:
		if cfg.APIVersion == "" {
			cfg.APIVersion = channel.Other
		}
	}
	c.Set(ctxkey.Config, cfg)
}
