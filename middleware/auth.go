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

func TokenAuth() func(c *gin.Context) {
	return func(c *gin.Context) {
		var err error
		key := c.Request.Header.Get("Authorization")
		parts := make([]string, 0)
		key = strings.TrimPrefix(key, "Bearer ")
		if key == "" || key == "midjourney-proxy" {
			key = c.Request.Header.Get("mj-api-secret")
			key = strings.TrimPrefix(key, "Bearer ")
			key = strings.TrimPrefix(key, "sk-")
			parts = strings.Split(key, "-")
			key = parts[0]
		} else {
			key = strings.TrimPrefix(key, "sk-")
			parts = strings.Split(key, "-")
			key = parts[0]
		}
		var modelRequest ModelRequest
		if strings.HasPrefix(c.Request.URL.Path, "/mj") {
			// Midjourney
			if modelRequest.Model == "" {
				modelRequest.Model = "midjourney"
			}
		} else if !strings.HasPrefix(c.Request.URL.Path, "/v1/audio/transcriptions") {
			err = common.UnmarshalBodyReusable(c, &modelRequest)
		}
		if err != nil {
			abortWithMessage(c, http.StatusBadRequest, "无效的请求: "+err.Error())
			return
		}
		if strings.HasPrefix(c.Request.URL.Path, "/v1/moderations") {
			if modelRequest.Model == "" {
				modelRequest.Model = "text-moderation-stable"
			}
		}
		if strings.HasSuffix(c.Request.URL.Path, "embeddings") {
			if modelRequest.Model == "" {
				modelRequest.Model = c.Param("model")
			}
		}
		if strings.HasPrefix(c.Request.URL.Path, "/v1/images/generations") {
			if modelRequest.Model == "" {
				modelRequest.Model = "dall-e-2"
			}
		}
		if strings.HasPrefix(c.Request.URL.Path, "/v1/audio/speech") {
			if modelRequest.Model == "" {
				modelRequest.Model = "tts-1"
			}
		}
		if strings.HasPrefix(c.Request.URL.Path, "/v1/audio/transcriptions") || strings.HasPrefix(c.Request.URL.Path, "/v1/audio/translations") {
			if modelRequest.Model == "" {
				modelRequest.Model = "whisper-1"
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
		c.Set("model", modelRequest.Model)
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
