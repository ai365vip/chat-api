package util

import (
	"one-api/common"
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
	APIVersion      string
	APIKey          string
	APIType         int
	Config          map[string]string
	IsStream        bool
	OriginModelName string
	ActualModelName string
	RequestURLPath  string
	PromptTokens    int // only for DoResponse
	FixedContent    string
	IsClaude        bool
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
		APIVersion:     c.GetString(common.ConfigKeyAPIVersion),
		APIKey:         strings.TrimPrefix(c.Request.Header.Get("Authorization"), "Bearer "),
		Config:         nil,
		RequestURLPath: c.Request.URL.String(),
		FixedContent:   c.GetString("fixed_content"),
	}
	if meta.ChannelType == common.ChannelTypeAzure {
		meta.APIVersion = GetAzureAPIVersion(c)
	}
	if meta.BaseURL == "" {
		meta.BaseURL = common.ChannelBaseURLs[meta.ChannelType]
	}
	meta.APIType = constant.ChannelType2APIType(meta.ChannelType)
	return &meta
}
