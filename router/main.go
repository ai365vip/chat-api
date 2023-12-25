package router

import (
	"embed"
	"fmt"
	"net/http"
	"one-api/common"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func SetRouter(router *gin.Engine, adminFS embed.FS, userFS embed.FS, adminIndexPage []byte, userIndexPage []byte) {
	SetApiRouter(router)
	SetDashboardRouter(router)
	SetRelayRouter(router)
	frontendBaseUrl := os.Getenv("FRONTEND_BASE_URL")
	if common.IsMasterNode && frontendBaseUrl != "" {
		frontendBaseUrl = ""
		common.SysLog("FRONTEND_BASE_URL is ignored on master node")
	}
	if frontendBaseUrl == "" {
		SetWebRouter(router, adminFS, userFS, adminIndexPage, userIndexPage)
	} else {
		frontendBaseUrl = strings.TrimSuffix(frontendBaseUrl, "/")
		router.NoRoute(func(c *gin.Context) {
			c.Redirect(http.StatusMovedPermanently, fmt.Sprintf("%s%s", frontendBaseUrl, c.Request.RequestURI))
		})
	}
}
