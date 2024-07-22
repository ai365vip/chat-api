package config

import (
	"os"
	"sync"

	"github.com/google/uuid"
)

// this hard coding will be replaced automatically when building, no need to manually change
var SystemName = "Chat API"
var SystemText = ""
var ServerAddress = "http://localhost:3000"
var OutProxyUrl = ""
var PayAddress = ""
var EpayId = ""
var EpayKey = ""
var Price = 7.3
var RedempTionCount = 30
var Footer = ""
var Logo = ""
var TopUpLink = ""
var ChatLink = ""
var QuotaPerUnit = 500 * 1000.0 // $0.002 / 1K tokens
var DisplayInCurrencyEnabled = true
var DisplayTokenStatEnabled = true
var EmailNotificationsEnabled = true
var WxPusherNotificationsEnabled = true
var ModelRatioEnabled = true
var BillingByRequestEnabled = true
var GroupModelEnabled = false       //模型限制
var GroupModelLimitsEnabled = false //速率限制
var GroupEnable = true
var LogContentEnabled = true
var Wx = true
var Zfb = true
var DrawingEnabled = true
var DataExportEnabled = true
var DataExportInterval = 5 // unit: minute
var MiniQuota = 1.0
var ProporTions = 10
var UserGroup = "default"
var VipUserGroup = "default"
var DebugEnabled = os.Getenv("DEBUG") == "true"
var SessionSecret = uuid.New().String()

var OptionMap map[string]string
var OptionMapRWMutex sync.RWMutex
var ItemsPerPage = 10
var MaxRecentItems = 100

var PasswordLoginEnabled = true
var PasswordRegisterEnabled = true
var EmailVerificationEnabled = false
var GitHubOAuthEnabled = false
var WeChatAuthEnabled = false
var TurnstileCheckEnabled = false
var RegisterEnabled = true
var ApproximateTokenEnabled = false
var UserGroupEnabled = false
var EmailDomainRestrictionEnabled = false
var EmailDomainWhitelist = []string{
	"gmail.com",
	"163.com",
	"126.com",
	"qq.com",
	"outlook.com",
	"hotmail.com",
	"icloud.com",
	"yahoo.com",
	"foxmail.com",
}
var LogConsumeEnabled = true

var SMTPServer = ""
var SMTPPort = 587
var SMTPAccount = ""
var SMTPFrom = ""
var SMTPToken = ""

var AppToken = ""
var Uids = ""

var GitHubClientId = ""
var GitHubClientSecret = ""

var WeChatServerAddress = ""
var WeChatServerToken = ""
var WeChatAccountQRCodeImageURL = ""

var TurnstileSiteKey = ""
var TurnstileSecretKey = ""
var QuotaForNewUser = 0
var QuotaForInviter = 0
var QuotaForInvitee = 0
var ChannelDisableThreshold = 5.0
var AutomaticDisableChannelEnabled = false
var AutomaticEnableChannelEnabled = false
var TopupRatioEnabled = true
var TopupAmountEnabled = false
var QuotaRemindThreshold = 1000
var PreConsumedQuota = 500

var RetryTimes = 0

var RootUserEmail = ""
var BatchUpdateEnabled = false

var BlankReplyRetryEnabled = true
