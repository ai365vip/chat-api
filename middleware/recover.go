package middleware

import (
	"fmt"
	"net/http"
	"one-api/common"
	"runtime/debug"

	"github.com/gin-gonic/gin"
)

func RelayPanicRecover() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				ctx := c.Request.Context()
				common.Errorf(ctx, fmt.Sprintf("panic detected: %v", err))
				common.Errorf(ctx, fmt.Sprintf("stacktrace from panic: %s", string(debug.Stack())))
				common.Errorf(ctx, fmt.Sprintf("request: %s %s", c.Request.Method, c.Request.URL.Path))
				body, _ := common.GetRequestBody(c)
				common.Errorf(ctx, fmt.Sprintf("request body: %s", string(body)))
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": gin.H{
						"message": fmt.Sprintf("Panic detected, error: %v. Please submit an issue with the related log here: https://github.com/ai365vip/chat-api", err),
						"type":    "chat_api_panic",
					},
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}
