package util

import (
	"one-api/common"
	"one-api/common/ctxkey"
	"one-api/model"
	"one-api/relay/constant"
	"strings"

	"github.com/gin-gonic/gin"
)

type RelayMeta struct {
	Mode            int
	ChannelType     int
	ChannelId       int
	ChannelName     string
	TokenId         int
	TokenName       string
	UserId          int
	Group           string
	ModelMapping    map[string]string
	Headers         map[string]string
	BaseURL         string
	APIKey          string
	APIType         int
	Config          model.ChannelConfig
	IsStream        bool
	AttemptsLog     string
	OriginModelName string
	ActualModelName string
	RequestURLPath  string
	PromptTokens    int // only for DoResponse
	FixedContent    string
	IsClaude        bool
	BillingEnabled  bool
	UnlimitedQuota  bool
	ProxyURL        string
	RelayIp         string
}

func GetRelayMeta(c *gin.Context) *RelayMeta {
	meta := RelayMeta{
		Mode:           constant.Path2RelayMode(c.Request.URL.Path),
		ChannelType:    c.GetInt("channel"),
		ChannelId:      c.GetInt("channel_id"),
		ChannelName:    c.GetString("channel_name"),
		TokenId:        c.GetInt("token_id"),
		TokenName:      c.GetString("token_name"),
		UserId:         c.GetInt("id"),
		Group:          c.GetString("group"),
		ModelMapping:   c.GetStringMapString("model_mapping"),
		Headers:        c.GetStringMapString("headers"),
		BaseURL:        c.GetString("base_url"),
		APIKey:         strings.TrimPrefix(c.Request.Header.Get("Authorization"), "Bearer "),
		RequestURLPath: c.Request.URL.String(),
		FixedContent:   c.GetString("fixed_content"),
		AttemptsLog:    c.GetString("attemptsLog"),
		BillingEnabled: c.GetBool("billing_enabled"),
		UnlimitedQuota: c.GetBool("token_unlimited_quota"),
		ProxyURL:       c.GetString("proxy_url"),
		RelayIp:        c.GetString("relayIp"),
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
