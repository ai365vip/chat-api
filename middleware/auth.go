package middleware

import (
	"net/http"
	"one-api/common"
	"one-api/model"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
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
		"/v1/audio/speech":         "tts-1",
		"/v1/audio/transcriptions": "whisper-1",
		"/v1/audio/translations":   "whisper-1",
	}

	if strings.HasPrefix(path, "/mj") {
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
		var err error
		key, parts := processAuthHeader(c.Request.Header.Get("Authorization"))
		if key == "" || key == "midjourney-proxy" {
			key, parts = processAuthHeader(c.Request.Header.Get("mj-api-secret"))
		}

		modelRequest := ModelRequest{Model: getModelForPath(c.Request.URL.Path)}
		if !strings.HasPrefix(c.Request.URL.Path, "/v1/audio/transcriptions") && c.Request.Method != http.MethodGet {
			err = common.UnmarshalBodyReusable(c, &modelRequest)
			if err != nil {
				abortWithMessage(c, http.StatusBadRequest, "无效的请求: "+err.Error())
				return
			}
		}
		token, err := model.ValidateUserToken(key, modelRequest.Model)
		if err != nil {
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
		c.Set("id", token.UserId)
		c.Set("token_id", token.Id)
		c.Set("token_name", token.Name)
		c.Set("group", token.Group)
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
