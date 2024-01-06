package router

import (
	"embed"
	"io/fs"
	"io/ioutil"
	"log"
	"net/http"
	"one-api/controller"
	"one-api/middleware"
	"os"
	"strings"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
)

func serveUserIndexPage(c *gin.Context) {
	userIndexPath := os.Getenv("DYNAMIC_USER_INDEX_PATH")
	var userIndexPage []byte
	var err error

	// 尝试加载动态路径指定的 index.html 文件
	if userIndexPath != "" {
		userIndexPage, err = ioutil.ReadFile(userIndexPath)
		if err != nil {
			log.Printf("Failed to read dynamic user index page at path %s: %v", userIndexPath, err)
			// 如果动态文件读取失败，则回退到默认的嵌入式页面
			userIndexPage = c.MustGet("defaultUserIndexPage").([]byte)
		}
	} else {
		userIndexPage = c.MustGet("defaultUserIndexPage").([]byte)
	}

	c.Data(http.StatusOK, "text/html; charset=utf-8", userIndexPage)
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
