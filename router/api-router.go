package router

import (
	"one-api/controller"
	"one-api/middleware"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
)

func SetApiRouter(router *gin.Engine) {
	apiRouter := router.Group("/api")
	apiRouter.Use(gzip.Gzip(gzip.DefaultCompression))
	apiRouter.Use(middleware.GlobalAPIRateLimit())
	{
		apiRouter.GET("/status", controller.GetStatus)
		apiRouter.GET("/notice", controller.GetNotice)
		apiRouter.GET("/about", controller.GetAbout)
		apiRouter.GET("/midjourney", controller.GetMidjourney)
		apiRouter.GET("/home_page_content", controller.GetHomePageContent)
		apiRouter.GET("/verification", middleware.CriticalRateLimit(), middleware.TurnstileCheck(), controller.SendEmailVerification)
		apiRouter.GET("/reset_password", middleware.CriticalRateLimit(), middleware.TurnstileCheck(), controller.SendPasswordResetEmail)
		apiRouter.POST("/user/reset", middleware.CriticalRateLimit(), controller.ResetPassword)
		apiRouter.GET("/oauth/github", middleware.CriticalRateLimit(), controller.GitHubOAuth)
		apiRouter.GET("/oauth/state", middleware.CriticalRateLimit(), controller.GenerateOAuthCode)
		apiRouter.GET("/oauth/wechat", middleware.CriticalRateLimit(), controller.WeChatAuth)
		apiRouter.GET("/oauth/wechat/bind", middleware.CriticalRateLimit(), middleware.UserAuth(), controller.WeChatBind)
		apiRouter.GET("/oauth/email/bind", middleware.CriticalRateLimit(), middleware.UserAuth(), controller.EmailBind)

		userRoute := apiRouter.Group("/user")
		{
			userRoute.POST("/register", middleware.CriticalRateLimit(), middleware.TurnstileCheck(), controller.Register)
			userRoute.POST("/login", middleware.CriticalRateLimit(), middleware.TurnstileCheck(), controller.Login)
			//userRoute.POST("/tokenlog", middleware.CriticalRateLimit(), controller.TokenLog)
			userRoute.GET("/logout", controller.Logout)
			userRoute.GET("/epay/notify", controller.EpayNotify)

			selfRoute := userRoute.Group("/")
			selfRoute.Use(middleware.UserAuth())
			{
				selfRoute.GET("/dashboard", controller.GetUserDashboard)
				selfRoute.GET("/self", controller.GetSelf)
				selfRoute.GET("/models", controller.GetUserModels)
				selfRoute.GET("/modelbilling", controller.GetUserModelsBilling)
				selfRoute.PUT("/self", controller.UpdateSelf)
				selfRoute.DELETE("/self", controller.DeleteSelf)
				selfRoute.GET("/token", controller.GenerateAccessToken)
				selfRoute.GET("/aff", controller.GetAffCode)
				selfRoute.POST("/topup", controller.TopUp)
				selfRoute.POST("/pay", controller.RequestEpay)
				selfRoute.POST("/amount", controller.RequestAmount)
				selfRoute.POST("/aff_transfer", controller.TransferAffQuota)
				selfRoute.POST("/aff_withdrawal", controller.AffQuota)
				selfRoute.GET("/option", controller.GetUserOptions)
				selfRoute.GET("/userwithdrawals", controller.GetWithdrawalOrdersEndpoint) // 获取用户自己的提现订单列表
				selfRoute.GET("/group", controller.GetUserGroups)
				selfRoute.POST("/quota_alert", controller.SetUserQuotaAlert)
				selfRoute.GET("/quota_alert", controller.GetUserQuotaAlertSettings)
			}

			adminRoute := userRoute.Group("/")
			adminRoute.Use(middleware.AdminAuth())
			{
				adminRoute.GET("/", controller.GetAllUsers)
				adminRoute.GET("/search", controller.SearchUsers)
				adminRoute.GET("/:id", controller.GetUser)
				adminRoute.POST("/", controller.CreateUser)
				adminRoute.POST("/manage", controller.ManageUser)
				adminRoute.PUT("/", controller.UpdateUser)
				adminRoute.DELETE("/:id", controller.DeleteUser)
				adminRoute.GET("/withdrawals", controller.GetAllWithdrawalOrdersEndpoint)                  // 获取所有用户的提现订单列表
				adminRoute.POST("/withdrawals/:id/status", controller.UpdateWithdrawalOrderStatusEndpoint) // 更新提现订单状态

			}
		}
		// 创建 /option 路由分组
		optionRoute := apiRouter.Group("/option")
		optionRoute.Use(middleware.RootAuth())
		{
			optionRoute.GET("/", controller.GetOptions)   // 根用户可访问
			optionRoute.PUT("/", controller.UpdateOption) // 根用户可访问
		}

		channelRoute := apiRouter.Group("/channel")
		channelRoute.Use(middleware.AdminAuth())
		{
			channelRoute.GET("/", controller.GetAllChannels)
			channelRoute.GET("/search", controller.SearchChannels)
			channelRoute.GET("/models", controller.ListChannelModels)
			channelRoute.GET("/:id", controller.GetChannel)
			channelRoute.GET("/test", controller.TestAllChannels)
			channelRoute.GET("/test/:id", controller.TestChannel)
			channelRoute.GET("/update_balance", controller.UpdateAllChannelsBalance)
			channelRoute.GET("/update_balance/:id", controller.UpdateChannelBalance)
			channelRoute.POST("/", controller.AddChannel)
			channelRoute.PUT("/", controller.UpdateChannel)
			channelRoute.DELETE("/disabled", controller.DeleteDisabledChannel)
			channelRoute.DELETE("/:id", controller.DeleteChannel)
			channelRoute.POST("/batch", controller.DeleteChannelBatch)
			channelRoute.GET("/fetch_models/:id", controller.FetchUpstreamModels)
			channelRoute.POST("/copy", controller.CopyChannel)
			channelRoute.POST("/reset_stats/:id", controller.ResetChannelStats)

		}
		tokenRoute := apiRouter.Group("/token")
		tokenRoute.Use(middleware.UserAuth())
		{
			tokenRoute.GET("/", controller.GetAllTokens)
			tokenRoute.GET("/search", controller.SearchTokens)
			tokenRoute.GET("/:id", controller.GetToken)
			tokenRoute.PUT("/", controller.UpdateToken)
			tokenRoute.POST("/", controller.AddToken)
			tokenRoute.PUT("/:id/billing_strategy", controller.UpdateTokenBillingStrategy)
			tokenRoute.DELETE("/:id", controller.DeleteToken)
		}
		redemptionRoute := apiRouter.Group("/redemption")
		redemptionRoute.Use(middleware.AdminAuth())
		{
			redemptionRoute.GET("/", controller.GetAllRedemptions)
			redemptionRoute.GET("/search", controller.SearchRedemptions)
			redemptionRoute.GET("/:id", controller.GetRedemption)
			redemptionRoute.POST("/", controller.AddRedemption)
			redemptionRoute.PUT("/", controller.UpdateRedemption)
			redemptionRoute.DELETE("/:id", controller.DeleteRedemption)
		}
		topupsRoute := apiRouter.Group("/topups")
		topupsRoute.Use(middleware.AdminAuth())
		{
			topupsRoute.GET("/", controller.GetAllTopUps)
			topupsRoute.GET("/search", controller.SearchTopUps)
			topupsRoute.GET("/:id", controller.GetTopUp)
			topupsRoute.DELETE("/delete", controller.DeleteTopUp)
		}

		logRoute := apiRouter.Group("/log")
		logRoute.GET("/", middleware.AdminAuth(), controller.GetAllLogs)
		logRoute.DELETE("/", middleware.AdminAuth(), controller.DeleteHistoryLogs)
		logRoute.GET("/stat", middleware.AdminAuth(), controller.GetLogsStat)
		logRoute.GET("/self/stat", middleware.UserAuth(), controller.GetLogsSelfStat)
		logRoute.GET("/search", middleware.AdminAuth(), controller.SearchAllLogs)
		logRoute.GET("/self", middleware.UserAuth(), controller.GetUserLogs)
		logRoute.GET("/hourly-stats", middleware.UserAuth(), controller.SearchHourlylogs)
		logproRoute := apiRouter.Group("/logall")
		logproRoute.GET("/stat", middleware.AdminAuth(), controller.GetLogsProStat)
		logproRoute.GET("/search", middleware.AdminAuth(), controller.SearchProLogs)

		dataRoute := apiRouter.Group("/data")
		dataRoute.GET("/", middleware.AdminAuth(), controller.GetAllQuotaDates)

		logRoute.Use(middleware.CORS())
		{
			logRoute.GET("/token", controller.GetLogByKey)
			logRoute.GET("/tokenmj", controller.GetLogMjByKey)
			logRoute.GET("/withdrawalscount", controller.GetWithdrawalOrdersCount)

		}

		logproRoute.Use(middleware.CORS())
		{
			logproRoute.GET("/token", controller.GetLogByKey)

		}
		groupRoute := apiRouter.Group("/group")
		groupRoute.Use(middleware.AdminAuth())
		{
			groupRoute.GET("/", controller.GetGroups)
		}
		mjRoute := apiRouter.Group("/mj")
		mjRoute.GET("/self", middleware.UserAuth(), controller.GetUserMidjourney)
		mjRoute.GET("/", middleware.AdminAuth(), controller.GetAllMidjourney)
	}
}
