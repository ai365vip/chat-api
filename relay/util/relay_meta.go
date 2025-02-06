package util

import (
	"one-api/common"
	"one-api/common/ctxkey"
	"one-api/model"
	"one-api/relay/constant"
	dbmodel "one-api/relay/model"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type RelayMeta struct {
	Mode                 int
	ChannelType          int
	ChannelId            int
	ChannelName          string
	TokenId              int
	TokenName            string
	UserId               int
	Group                string
	ModelMapping         map[string]string
	Headers              map[string]string
	BaseURL              string
	APIKey               string
	APIType              int
	Config               model.ChannelConfig
	IsStream             bool
	AttemptsLog          string
	OriginModelName      string
	ActualModelName      string
	RequestURLPath       string
	PromptTokens         int // only for DoResponse
	FixedContent         string
	IsClaude             bool
	BillingEnabled       bool
	UnlimitedQuota       bool
	ProxyURL             string
	RelayIp              string
	ClientWs             *websocket.Conn
	TargetWs             *websocket.Conn
	RealtimeTools        []dbmodel.RealTimeTool
	InputAudioFormat     string
	OutputAudioFormat    string
	IsFirstRequest       bool
	setFirstResponse     bool
	FirstResponseTime    time.Time
	StartTime            time.Time
	SupportsCacheControl bool
}

func GetRelayMeta(c *gin.Context) *RelayMeta {
	meta := RelayMeta{
		Mode:                 constant.Path2RelayMode(c.Request.URL.Path),
		ChannelType:          c.GetInt("channel"),
		ChannelId:            c.GetInt("channel_id"),
		ChannelName:          c.GetString("channel_name"),
		TokenId:              c.GetInt("token_id"),
		TokenName:            c.GetString("token_name"),
		UserId:               c.GetInt("id"),
		Group:                c.GetString("group"),
		ModelMapping:         c.GetStringMapString("model_mapping"),
		Headers:              c.GetStringMapString("headers"),
		BaseURL:              c.GetString("base_url"),
		APIKey:               strings.TrimPrefix(c.Request.Header.Get("Authorization"), "Bearer "),
		RequestURLPath:       c.Request.URL.String(),
		FixedContent:         c.GetString("fixed_content"),
		AttemptsLog:          c.GetString("attemptsLog"),
		BillingEnabled:       c.GetBool("billing_enabled"),
		UnlimitedQuota:       c.GetBool("token_unlimited_quota"),
		ProxyURL:             c.GetString("proxy_url"),
		RelayIp:              c.GetString("relayIp"),
		SupportsCacheControl: c.GetBool("supports_cache_control"),
	}

	if meta.BaseURL == "" {
		meta.BaseURL = common.ChannelBaseURLs[meta.ChannelType]
	}
	cfg, ok := c.Get(ctxkey.Config)
	if ok {
		meta.Config = cfg.(model.ChannelConfig)
	}
	meta.APIType = constant.ChannelType2APIType(meta.ChannelType)
	return &meta
}
func GenRelayInfoWs(c *gin.Context, ws *websocket.Conn) *RelayMeta {
	info := GetRelayMeta(c)
	info.ClientWs = ws
	info.InputAudioFormat = "pcm16"
	info.OutputAudioFormat = "pcm16"
	info.IsFirstRequest = true
	return info
}
func (info *RelayMeta) SetFirstResponseTime() {
	if !info.setFirstResponse {
		info.FirstResponseTime = time.Now()
		info.setFirstResponse = true
	}
}
