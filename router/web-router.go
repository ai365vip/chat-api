package router

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"one-api/common/config"
	"one-api/controller"
	"one-api/middleware"
	"regexp"
	"strings"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
)

func serveUserIndexPage(c *gin.Context) {
	// 从Gin上下文中获取默认的用户索引页面
	userIndexPage := c.MustGet("defaultUserIndexPage").([]byte)
	userIndexPageStr := string(userIndexPage)
	// 尝试从公共选项映射中获取系统文本
	systemText, exists := config.OptionMap["SystemText"]

	// 正则表达式用于查找和替换script标签中的src属性
	re := regexp.MustCompile(`static/js/main\.[a-z0-9]+\.js"`)

	// 从userIndexPage中提取当前JS文件名
	matches := re.FindStringSubmatch(userIndexPageStr)
	if len(matches) == 0 {
		c.String(http.StatusInternalServerError, "No script tag found in the default user index page")
		return
	}
	currentScriptTag := matches[0]

	if !exists || systemText == "" {
		// 如果系统文本不存在或为空，直接使用默认页面
		config.SystemText = userIndexPageStr
		config.OptionMap["SystemText"] = config.SystemText
		c.Data(http.StatusOK, "text/html; charset=utf-8", userIndexPage)
		return
	}

	// 如果系统文本存在，更新其script标签
	updatedSystemText := re.ReplaceAllString(systemText, currentScriptTag)
	config.OptionMap["SystemText"] = updatedSystemText

	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(updatedSystemText))
}

func SetWebRouter(router *gin.Engine, adminFS embed.FS, userFS embed.FS, adminIndexPage []byte, defaultUserIndexPage []byte) {
	// 设置默认的 User Index Page
	router.Use(func(c *gin.Context) {
		c.Set("defaultUserIndexPage", defaultUserIndexPage)
	})
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
