package router

import (
	"one-api/controller"
	"one-api/middleware"
	"one-api/relay/channel/midjourney"

	"github.com/gin-gonic/gin"
)

func configureMidjourneyRoutes(group *gin.RouterGroup) {
	group.GET("/image/:id", midjourney.RelayMidjourneyImage)
	group.Use(middleware.TokenAuth(), middleware.Distribute())
	{
		group.POST("/submit/imagine", controller.RelayMidjourney)
		group.POST("/submit/change", controller.RelayMidjourney)
		group.POST("/submit/simple-change", controller.RelayMidjourney)
		group.POST("/submit/describe", controller.RelayMidjourney)
		group.POST("/submit/blend", controller.RelayMidjourney)
		group.POST("/submit/action", controller.RelayMidjourney)
		group.POST("/submit/modal", controller.RelayMidjourney)
		group.POST("/submit/shorten", controller.RelayMidjourney)
		group.POST("/insight-face/swap", controller.RelayMidjourney)
		group.POST("/submit/upload-discord-images", controller.RelayMidjourney)
		group.POST("/notify", controller.RelayMidjourney)
		group.GET("/task/:id/fetch", controller.RelayMidjourney)
		group.GET("/task/:id/image-seed", controller.RelayMidjourney)
		group.POST("/task/list-by-condition", controller.RelayMidjourney)
	}
}

func SetRelayRouter(router *gin.Engine) {
	router.Use(middleware.CORS())
	// https://platform.openai.com/docs/api-reference/introduction
	modelsRouter := router.Group("/v1/models")
	modelsRouter.Use(middleware.TokenAuth())
	{
		modelsRouter.GET("", controller.ListModels)
		modelsRouter.GET("/:model", controller.RetrieveModel)
	}
	relayV1Router := router.Group("/v1")
	relayV1Router.Use(middleware.RelayPanicRecover(), middleware.TokenAuth())
	{
		// WebSocket 路由
		wsRouter := relayV1Router.Group("")
		wsRouter.Use(middleware.Distribute())
		wsRouter.GET("/realtime", controller.WssRelay)
	}
	{
		httpRouter := relayV1Router.Group("")
		httpRouter.Use(middleware.Distribute())
		httpRouter.POST("/completions", controller.Relay)
		httpRouter.POST("/chat/completions", controller.Relay)
		httpRouter.POST("/edits", controller.Relay)
		httpRouter.POST("/images/generations", controller.Relay)
		httpRouter.POST("/images/edits", controller.Relay)
		httpRouter.POST("/images/variations", controller.RelayNotImplemented)
		httpRouter.POST("/embeddings", controller.Relay)
		httpRouter.POST("/engines/:model/embeddings", controller.Relay)
		httpRouter.POST("/audio/transcriptions", controller.Relay)
		httpRouter.POST("/audio/translations", controller.Relay)
		httpRouter.POST("/audio/speech", controller.Relay)
		httpRouter.GET("/files", controller.RelayNotImplemented)
		httpRouter.POST("/files", controller.RelayNotImplemented)
		httpRouter.DELETE("/files/:id", controller.RelayNotImplemented)
		httpRouter.GET("/files/:id", controller.RelayNotImplemented)
		httpRouter.GET("/files/:id/content", controller.RelayNotImplemented)
		httpRouter.POST("/fine_tuning/jobs", controller.RelayNotImplemented)
		httpRouter.GET("/fine_tuning/jobs", controller.RelayNotImplemented)
		httpRouter.GET("/fine_tuning/jobs/:id", controller.RelayNotImplemented)
		httpRouter.POST("/fine_tuning/jobs/:id/cancel", controller.RelayNotImplemented)
		httpRouter.GET("/fine_tuning/jobs/:id/events", controller.RelayNotImplemented)
		httpRouter.DELETE("/models/:model", controller.RelayNotImplemented)
		httpRouter.POST("/moderations", controller.Relay)
		httpRouter.POST("/assistants", controller.RelayNotImplemented)
		httpRouter.GET("/assistants/:id", controller.RelayNotImplemented)
		httpRouter.POST("/assistants/:id", controller.RelayNotImplemented)
		httpRouter.DELETE("/assistants/:id", controller.RelayNotImplemented)
		httpRouter.GET("/assistants", controller.RelayNotImplemented)
		httpRouter.POST("/assistants/:id/files", controller.RelayNotImplemented)
		httpRouter.GET("/assistants/:id/files/:fileId", controller.RelayNotImplemented)
		httpRouter.DELETE("/assistants/:id/files/:fileId", controller.RelayNotImplemented)
		httpRouter.GET("/assistants/:id/files", controller.RelayNotImplemented)
		httpRouter.POST("/threads", controller.RelayNotImplemented)
		httpRouter.GET("/threads/:id", controller.RelayNotImplemented)
		httpRouter.POST("/threads/:id", controller.RelayNotImplemented)
		httpRouter.DELETE("/threads/:id", controller.RelayNotImplemented)
		httpRouter.POST("/threads/:id/messages", controller.RelayNotImplemented)
		httpRouter.GET("/threads/:id/messages/:messageId", controller.RelayNotImplemented)
		httpRouter.POST("/threads/:id/messages/:messageId", controller.RelayNotImplemented)
		httpRouter.GET("/threads/:id/messages/:messageId/files/:filesId", controller.RelayNotImplemented)
		httpRouter.GET("/threads/:id/messages/:messageId/files", controller.RelayNotImplemented)
		httpRouter.POST("/threads/:id/runs", controller.RelayNotImplemented)
		httpRouter.GET("/threads/:id/runs/:runsId", controller.RelayNotImplemented)
		httpRouter.POST("/threads/:id/runs/:runsId", controller.RelayNotImplemented)
		httpRouter.GET("/threads/:id/runs", controller.RelayNotImplemented)
		httpRouter.POST("/threads/:id/runs/:runsId/submit_tool_outputs", controller.RelayNotImplemented)
		httpRouter.POST("/threads/:id/runs/:runsId/cancel", controller.RelayNotImplemented)
		httpRouter.GET("/threads/:id/runs/:runsId/steps/:stepId", controller.RelayNotImplemented)
		httpRouter.GET("/threads/:id/runs/:runsId/steps", controller.RelayNotImplemented)
		httpRouter.POST("/messages", controller.Relay)
		httpRouter.POST("/responses", controller.Relay)
	}
	relayMjTurboRouter := router.Group("/mj-turbo/mj")
	configureMidjourneyRoutes(relayMjTurboRouter)

	relayMjFastRouter := router.Group("/mj-fast/mj")
	configureMidjourneyRoutes(relayMjFastRouter)

	relayMjRelaxtRouter := router.Group("/mj-relax/mj")
	configureMidjourneyRoutes(relayMjRelaxtRouter)

	relayMjRouter := router.Group("/mj")
	configureMidjourneyRoutes(relayMjRouter)
}
