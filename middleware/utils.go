package middleware

import (
	"fmt"
	"one-api/common"
	"strings"

	"github.com/gin-gonic/gin"
)

func abortWithMessage(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, gin.H{
		"error": gin.H{
			"message": common.MessageWithRequestId(message, c.GetString(common.RequestIdKey)),
			"type":    "chat_api_error",
		},
	})
	c.Abort()
	message = fmt.Sprintf("用户ID「%d」, 请求失败：%s", c.GetInt("id"), message)
	common.LogError(c.Request.Context(), message)
}
func isModelInList(modelName string, models string) bool {
	modelList := strings.Split(models, ",")
	for _, model := range modelList {
		if modelName == model {
			return true
		}
	}
	return false
}
