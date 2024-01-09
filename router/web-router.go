package router

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"one-api/common"
	"one-api/controller"
	"one-api/middleware"
	"strings"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
)

func serveUserIndexPage(c *gin.Context) {

	systemText, exists := common.OptionMap["SystemText"]

	if !exists || systemText == "" {
		userIndexPage := c.MustGet("defaultUserIndexPage").([]byte)
		common.SystemText = string(userIndexPage)
		common.OptionMap["SystemText"] = common.SystemText

		c.Data(http.StatusOK, "text/html; charset=utf-8", userIndexPage)
		return
	}

	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(systemText))
}

func SetWebRouter(router *gin.Engine, adminFS embed.FS, userFS embed.FS, adminIndexPage []byte, defaultUserIndexPage []byte) {
	router.Use(gzip.Gzip(gzip.DefaultCompression))
	router.Use(middleware.GlobalWebRateLimit())
	router.Use(middleware.Cache())
	// 配置管理员界面的静态文件服务
	adminStaticFiles, err := fs.Sub(adminFS, "web-admin/build")
	if err != nil {
		log.Fatalf("Failed to create sub FS for admin app: %v", err)
	}
	router.StaticFS("/admin", http.FS(adminStaticFiles))

	userStaticFiles, err := fs.Sub(userFS, "web-user/build")
	if err != nil {
		log.Fatalf("Failed to create sub FS for user app: %v", err)
	}
	router.StaticFS("/panel", http.FS(userStaticFiles))

	// 设置默认的 User Index Page
	router.Use(func(c *gin.Context) {
		c.Set("defaultUserIndexPage", defaultUserIndexPage)
	})

	router.NoRoute(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.RequestURI, "/v1") || strings.HasPrefix(c.Request.RequestURI, "/api") {
			controller.RelayNotFound(c)
			return
		}
		c.Header("Cache-Control", "no-cache")
		if strings.HasPrefix(c.Request.RequestURI, "/admin") {
			// 返回管理员界面的 index.html
			c.Data(http.StatusOK, "text/html; charset=utf-8", adminIndexPage)
		} else {
			// 否则返回普通用户界面的 index.html
			serveUserIndexPage(c)
		}
	})
}
