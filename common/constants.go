package common

import (
	"os"
	"strconv"
	"time"
)

var StartTime = time.Now().Unix() // unit: second
var Version = "v0.0.0"

var MemoryCacheEnabled = os.Getenv("MEMORY_CACHE_ENABLED") == "true"

var AdjustHour = GetOrDefault("ADJUSTHOUR", 0)

var GeminiSafetySetting = GetOrDefaultString("GEMINI_SAFETY_SETTING", "BLOCK_NONE")
var IsMasterNode = os.Getenv("NODE_TYPE") != "slave"

var requestInterval, _ = strconv.Atoi(os.Getenv("POLLING_INTERVAL"))
var RequestInterval = time.Duration(requestInterval) * time.Second

var SyncFrequency = GetOrDefault("SYNC_FREQUENCY", 60) // unit is second

var BatchUpdateInterval = GetOrDefault("BATCH_UPDATE_INTERVAL", 5)

var RelayTimeout = GetOrDefault("RELAY_TIMEOUT", 0) // unit is second

const (
	RequestIdKey = "X-Oneapi-Request-Id"
)

const (
	RoleGuestUser  = 0
	RoleCommonUser = 1
	RoleAdminUser  = 10
	RoleRootUser   = 100
)

var (
	FileUploadPermission    = RoleGuestUser
	FileDownloadPermission  = RoleGuestUser
	ImageUploadPermission   = RoleGuestUser
	ImageDownloadPermission = RoleGuestUser
)

// All duration's unit is seconds
// Shouldn't larger then RateLimitKeyExpirationDuration
var (
	GlobalApiRateLimitNum            = GetOrDefault("GLOBAL_API_RATE_LIMIT", 180)
	GlobalApiRateLimitDuration int64 = 3 * 60

	GlobalWebRateLimitNum            = GetOrDefault("GLOBAL_WEB_RATE_LIMIT", 400)
	GlobalWebRateLimitDuration int64 = 3 * 60

	UploadRateLimitNum            = 10
	UploadRateLimitDuration int64 = 60

	DownloadRateLimitNum            = 10
	DownloadRateLimitDuration int64 = 60

	CriticalRateLimitNum            = 20
	CriticalRateLimitDuration int64 = 20 * 60
)

var RateLimitKeyExpirationDuration = 20 * time.Minute

const (
	UserStatusEnabled  = 1 // don't use 0, 0 is the default value!
	UserStatusDisabled = 2 // also don't use 0
)

const (
	TokenStatusEnabled   = 1 // don't use 0, 0 is the default value!
	TokenStatusDisabled  = 2 // also don't use 0
	TokenStatusExpired   = 3
	TokenStatusExhausted = 4
)

const (
	RedemptionCodeStatusEnabled  = 1 // don't use 0, 0 is the default value!
	RedemptionCodeStatusDisabled = 2 // also don't use 0
	RedemptionCodeStatusUsed     = 3 // also don't use 0
)

const (
	ChannelStatusUnknown          = 0
	ChannelStatusEnabled          = 1 // don't use 0, 0 is the default value!
	ChannelStatusManuallyDisabled = 2 // also don't use 0
	ChannelStatusAutoDisabled     = 3
)

const (
	ChannelTypeUnknown        = 0
	ChannelTypeOpenAI         = 1
	ChannelTypeAPI2D          = 2
	ChannelTypeAzure          = 3
	ChannelTypeCloseAI        = 4
	ChannelTypeOpenAISB       = 5
	ChannelTypeOpenAIMax      = 6
	ChannelTypeOhMyGPT        = 7
	ChannelTypeCustom         = 8
	ChannelTypeAILS           = 9
	ChannelTypeAIProxy        = 10
	ChannelTypePaLM           = 11
	ChannelTypeAPI2GPT        = 12
	ChannelTypeAIGC2D         = 13
	ChannelTypeAnthropic      = 14
	ChannelTypeBaidu          = 15
	ChannelTypeZhipu          = 16
	ChannelTypeAli            = 17
	ChannelTypeXunfei         = 18
	ChannelType360            = 19
	ChannelTypeOpenRouter     = 20
	ChannelTypeAIProxyLibrary = 21
	ChannelTypeFastGPT        = 22
	ChannelTypeTencent        = 23
	ChannelTypeGemini         = 24
	ChannelTypeChatBot        = 25
	ChannelTypeLobeChat       = 26
	ChannelTypeMoonshot       = 27
	ChannelTypeStability      = 28
	ChannelTypeGroq           = 29
	ChannelTypeBaichuan       = 30
	ChannelTypeMinimax        = 31
	ChannelTypeMistral        = 32
	ChannelTypeOllama         = 33
	ChannelTypeLingYiWanWu    = 34
	ChannelTypeAwsClaude      = 35
	ChannelTypeCoze           = 36
	ChannelTypeCohere         = 37
	ChannelTypeDeepSeek       = 38
	ChannelTypeTogetherAI     = 39
	ChannelTypeDeepL          = 40
	ChannelTypeDouBao         = 41
	ChannelTypeGCP            = 42
)

var ChannelBaseURLs = []string{
	"",                                  // 0
	"https://api.openai.com",            // 1
	"https://oa.api2d.net",              // 2
	"",                                  // 3
	"https://api.closeai-proxy.xyz",     // 4
	"https://api.openai-sb.com",         // 5
	"https://api.openaimax.com",         // 6
	"https://api.ohmygpt.com",           // 7
	"",                                  // 8
	"https://api.caipacity.com",         // 9
	"https://api.aiproxy.io",            // 10
	"",                                  // 11
	"https://api.api2gpt.com",           // 12
	"https://api.aigc2d.com",            // 13
	"https://api.anthropic.com",         // 14
	"https://aip.baidubce.com",          // 15
	"https://open.bigmodel.cn",          // 16
	"https://dashscope.aliyuncs.com",    // 17
	"",                                  // 18
	"https://ai.360.cn",                 // 19
	"https://openrouter.ai/api",         // 20
	"https://api.aiproxy.io",            // 21
	"https://fastgpt.run/api/openapi",   // 22
	"https://hunyuan.cloud.tencent.com", //23
	"https://generativelanguage.googleapis.com", //24
	"",                                  //25
	"",                                  //26
	"https://api.moonshot.cn",           //27
	"https://api.stability.ai",          //28
	"https://api.groq.com/openai",       // 29
	"https://api.baichuan-ai.com",       // 30
	"https://api.minimax.chat",          // 31
	"https://api.mistral.ai",            // 32
	"http://localhost:11434",            // 33
	"https://api.lingyiwanwu.com",       // 34
	"",                                  // 35
	"https://api.coze.com",              // 36
	"https://api.cohere.ai",             //37
	"https://api.deepseek.com",          //38
	"https://api.together.xyz",          // 39
	"https://api-free.deepl.com",        // 40
	"https://ark.cn-beijing.volces.com", // 41
	"",                                  //42
}

const (
	ConfigKeyPrefix = "cfg_"

	ConfigKeyAPIVersion = ConfigKeyPrefix + "api_version"
	ConfigKeyLibraryID  = ConfigKeyPrefix + "library_id"
	ConfigKeyPlugin     = ConfigKeyPrefix + "plugin"
	ConfigSK            = ConfigKeyPrefix + "sk"
	ConfigAK            = ConfigKeyPrefix + "ak"
	ConfigRegion        = ConfigKeyPrefix + "region"
	ConfigUserID        = ConfigKeyPrefix + "user_id"
)
