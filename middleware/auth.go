package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"one-api/common"
	"one-api/common/network"
	"one-api/model"
	relaymodel "one-api/relay/model"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

const (
	headerAuthorization        = "Authorization"
	headerSecWebsocketProtocol = "Sec-Websocket-Protocol"
	headerXAPIKey              = "x-api-key"
	headerMJAPISecret          = "mj-api-secret"
	prefixOpenAIInsecureKey    = "openai-insecure-api-key."
	keyMidjourneyProxy         = "midjourney-proxy"
)

func authHelper(c *gin.Context, minRole int) {
	session := sessions.Default(c)
	username := session.Get("username")
	role := session.Get("role")
	id := session.Get("id")
	status := session.Get("status")
	if username == nil {
		// Check access token
		accessToken := c.Request.Header.Get("Authorization")
		if accessToken == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "无权进行此操作，未登录且未提供 access token",
			})
			c.Abort()
			return
		}
		user := model.ValidateAccessToken(accessToken)
		if user != nil && user.Username != "" {
			// Token is valid
			username = user.Username
			role = user.Role
			id = user.Id
			status = user.Status
		} else {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "无权进行此操作，access token 无效",
			})
			c.Abort()
			return
		}
	}
	if status.(int) == common.UserStatusDisabled {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "用户已被封禁",
		})
		c.Abort()
		return
	}
	if role.(int) < minRole {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无权进行此操作，权限不足",
		})
		c.Abort()
		return
	}
	c.Set("username", username)
	c.Set("role", role)
	c.Set("id", id)
	c.Next()
}

func UserAuth() func(c *gin.Context) {
	return func(c *gin.Context) {
		authHelper(c, common.RoleCommonUser)
	}
}

func AdminAuth() func(c *gin.Context) {
	return func(c *gin.Context) {
		authHelper(c, common.RoleAdminUser)
	}
}

func RootAuth() func(c *gin.Context) {
	return func(c *gin.Context) {
		authHelper(c, common.RoleRootUser)
	}
}

// processAuthHeader 处理认证头部并返回key和parts
func processAuthHeader(headerValue string) (string, []string) {
	headerValue = strings.TrimPrefix(headerValue, "Bearer ")
	parts := strings.Split(strings.TrimPrefix(headerValue, "sk-"), "-")
	return parts[0], parts
}

// getModelForPath 根据请求的URL路径返回相应的模型。
func getModelForPath(path string) string {
	// 定义一个路径前缀到模型名称的映射
	pathToModel := map[string]string{
		"/v1/moderations":          "text-moderation-stable",
		"/v1/images/generations":   "dall-e-2",
		"/v1/images/edits":         "dall-e-2",
		"/v1/audio/speech":         "tts-1",
		"/v1/audio/transcriptions": "whisper-1",
		"/v1/audio/translations":   "whisper-1",
		"/v1/realtime":             "gpt-4o-realtime",
	}

	if strings.HasPrefix(path, "/mj-turbo/mj") {
		return "midjourney-turbo"
	} else if strings.HasPrefix(path, "/mj-relax/mj") {
		return "midjourney-relax"
		// 然后判断通用及默认情况
	} else if strings.HasPrefix(path, "/mj") || strings.HasPrefix(path, "/mj-fast/mj") {
		return "midjourney"
	}

	for prefix, model := range pathToModel {
		if strings.HasPrefix(path, prefix) {
			return model
		}
	}

	return ""
}

func TokenAuth() func(c *gin.Context) {
	return func(c *gin.Context) {
		isWebSocket := c.GetHeader("Upgrade") == "websocket"
		key, parts := processAuthHeader(c.Request.Header.Get(headerAuthorization))

		switch {
		case isWebSocket && key == "":
			protocols := c.Request.Header[headerSecWebsocketProtocol]
			if len(protocols) > 0 {
				for _, protocol := range strings.Split(protocols[0], ",") {
					protocol = strings.TrimSpace(protocol)
					if strings.HasPrefix(protocol, prefixOpenAIInsecureKey) {
						key, parts = processAuthHeader(strings.TrimPrefix(protocol, prefixOpenAIInsecureKey))
						break
					}
				}
			}
		case key == "":
			headerKey := headerXAPIKey
			if c.Request.Header.Get(headerMJAPISecret) != "" {
				headerKey = headerMJAPISecret
			}
			key, parts = processAuthHeader(c.Request.Header.Get(headerKey))
		case key == keyMidjourneyProxy:
			key, parts = processAuthHeader(c.Request.Header.Get(headerMJAPISecret))
		}
		c.Set("claude_original_request", false)
		if c.Request.URL.Path == "/v1/messages" {
			c.Set("claude_original_request", true)
		}
		modelRequest := ModelRequest{Model: getModelForPath(c.Request.URL.Path)}
		if !strings.HasPrefix(c.Request.URL.Path, "/v1/audio/transcriptions") && c.Request.Method != http.MethodGet {
			if err := common.UnmarshalBodyReusable(c, &modelRequest); err != nil {
				abortWithMessage(c, http.StatusBadRequest, "无效的请求: "+err.Error())
				return
			}
		}
		if strings.HasSuffix(c.Request.URL.Path, "embeddings") {
			if modelRequest.Model == "" {
				modelRequest.Model = c.Param("model")
			}
		}
		if strings.HasSuffix(c.Request.URL.Path, "realtime") {
			modelRequest.Model = c.Query("model")
			if modelRequest.Model == "" {
				abortWithMessage(c, http.StatusUnauthorized, "model_name_required")
			}
		}
		token, err := model.ValidateUserToken(key, modelRequest.Model)
		if err != nil {
			if token != nil {
				c.Set("id", token.UserId)
			}
			abortWithMessage(c, http.StatusUnauthorized, err.Error())
			return
		}
		userEnabled, err := model.CacheIsUserEnabled(token.UserId)
		if err != nil {
			abortWithMessage(c, http.StatusInternalServerError, err.Error())
			return
		}
		if !userEnabled {
			abortWithMessage(c, http.StatusForbidden, "用户已被封禁")
			return
		}
		c.Set("relayIp", c.ClientIP())
		c.Set("is_tools", false)
		if strings.HasPrefix(c.Request.URL.Path, "/v1/chat/completions") || strings.HasPrefix(c.Request.URL.Path, "/v1/completions") {
			var reqBody relaymodel.GeneralOpenAIRequest
			body, err := ioutil.ReadAll(c.Request.Body)
			if err != nil {
				fmt.Println("Error reading body:", err)
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}

			// 重新设置请求体，以便后续使用
			c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(body))

			// 反序列化请求体到reqBody结构体
			if err := json.Unmarshal(body, &reqBody); err != nil {
				fmt.Println("Error unmarshalling request body:", err)
				c.AbortWithStatus(http.StatusBadRequest)
				return
			}

			// 检查Tools字段是否存在且非空
			if len(reqBody.Tools) > 0 {
				c.Set("is_tools", true)
			}
		}
		if token.Models != "" {
			c.Set("available_models", token.Models)
			if modelRequest.Model != "" && !isModelInList(modelRequest.Model, token.Models) {
				abortWithMessage(c, http.StatusForbidden, fmt.Sprintf("该令牌无权使用模型：%s", modelRequest.Model))
				return
			}
		}
		ctx := c.Request.Context()
		c.Set("id", token.UserId)
		c.Set("token_id", token.Id)
		c.Set("token_name", token.Name)
		c.Set("billing_enabled", token.BillingEnabled)
		if token.Group == "" {
			userGroup, err := model.GetUserGroup(token.UserId)
			if err != nil {
				abortWithMessage(c, http.StatusForbidden, "未能获取用户分组信息")
				return
			}
			c.Set("group", userGroup)
		} else {
			c.Set("group", token.Group)
		}

		c.Set("fixed_content", token.FixedContent)
		c.Set("model", modelRequest.Model)
		c.Set("original_model", modelRequest.Model)

		c.Set("token_unlimited_quota", token.UnlimitedQuota)
		if !token.UnlimitedQuota {
			c.Set("token_quota", token.RemainQuota)
		}
		requestURL := c.Request.URL.String()
		consumeQuota := true
		if strings.HasPrefix(requestURL, "/v1/models") {
			consumeQuota = false
		}
		if token.Subnet != nil && *token.Subnet != "" {
			if !network.IsIpInSubnets(ctx, c.ClientIP(), *token.Subnet) {
				abortWithMessage(c, http.StatusForbidden, fmt.Sprintf("该令牌只能在指定网段使用：%s，当前 ip：%s", *token.Subnet, c.ClientIP()))
				return
			}
		}
		c.Set("consume_quota", consumeQuota)
		if len(parts) > 1 {
			if model.IsAdmin(token.UserId) {
				c.Set("channelId", parts[1])
			} else {
				abortWithMessage(c, http.StatusForbidden, "普通用户不支持指定渠道")
				return
			}
		}
		c.Next()
	}
}
