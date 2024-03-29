package middleware

import (
	"fmt"
	"net/http"
	"one-api/common"
	"one-api/model"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type ModelRequest struct {
	Model string `json:"model"`
}

func Distribute() func(c *gin.Context) {
	return func(c *gin.Context) {
		var channel *model.Channel
		tokenGroup, exists := c.Get("group")
		if !exists || tokenGroup == nil || tokenGroup == "" {
			//log.Printf("无法获取 token 分组信息，tokenGroup: %#v, exists: %t\n", tokenGroup, exists)
			userId := c.GetInt("id")
			userGroup, _ := model.GetUserGroup(userId)
			tokenGroup = userGroup
			c.Set("group", tokenGroup)
		}
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

			channel, err = model.CacheGetRandomSatisfiedChannel(tokenGroup.(string), Model.(string), false)
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
		SetupContextForSelectedChannel(c, channel, Model.(string))
		c.Next()
	}
}
func SetupContextForSelectedChannel(c *gin.Context, channel *model.Channel, modelName string) {
	c.Set("channel", channel.Type)
	c.Set("channel_id", channel.Id)
	c.Set("channel_name", channel.Name)
	c.Set("headers", channel.GetModelHeaders())
	ban := true
	// parse *int to bool
	if channel.AutoBan != nil && *channel.AutoBan == 0 {
		ban = false
	}
	c.Set("auto_ban", ban)
	c.Set("model_mapping", channel.GetModelMapping())
	c.Set("original_model", modelName) // for retry
	c.Request.Header.Set("Authorization", fmt.Sprintf("Bearer %s", channel.Key))
	c.Set("base_url", channel.GetBaseURL())
	// this is for backward compatibility
	switch channel.Type {
	case common.ChannelTypeAzure:
		c.Set(common.ConfigKeyAPIVersion, channel.Other)
	case common.ChannelTypeStability:
		c.Set(common.ConfigKeyAPIVersion, channel.Other)
	case common.ChannelTypeXunfei:
		c.Set(common.ConfigKeyAPIVersion, channel.Other)
	case common.ChannelTypeGemini:
		c.Set(common.ConfigKeyAPIVersion, channel.Other)
	case common.ChannelTypeAIProxyLibrary:
		c.Set(common.ConfigKeyLibraryID, channel.Other)
	case common.ChannelTypeAli:
		c.Set(common.ConfigKeyPlugin, channel.Other)
	}
	cfg, _ := channel.LoadConfig()
	for k, v := range cfg {
		c.Set(common.ConfigKeyPrefix+k, v)
	}
}
