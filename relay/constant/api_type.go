package constant

import (
	"one-api/common"
)

const (
	APITypeOpenAI = iota
	APITypeAnthropic
	APITypePaLM
	APITypeBaidu
	APITypeZhipu
	APITypeAli
	APITypeXunfei
	APITypeAIProxyLibrary
	APITypeTencent
	APITypeGemini
	APITypeChatBot
	APITypeLobeChat
	APITypeZhipu_v4
	APITypeDummy // this one is only for count, do not add any channel after this
	APITypeStability
	APITypeOllama
)

func ChannelType2APIType(channelType int) int {
	apiType := APITypeOpenAI
	switch channelType {
	case common.ChannelTypeAnthropic:
		apiType = APITypeAnthropic
	case common.ChannelTypeBaidu:
		apiType = APITypeBaidu
	case common.ChannelTypePaLM:
		apiType = APITypePaLM
	case common.ChannelTypeZhipu:
		apiType = APITypeZhipu
	case common.ChannelTypeAli:
		apiType = APITypeAli
	case common.ChannelTypeXunfei:
		apiType = APITypeXunfei
	case common.ChannelTypeAIProxyLibrary:
		apiType = APITypeAIProxyLibrary
	case common.ChannelTypeTencent:
		apiType = APITypeTencent
	case common.ChannelTypeGemini:
		apiType = APITypeGemini
	case common.ChannelTypeChatBot:
		apiType = APITypeChatBot
	case common.ChannelTypeLobeChat:
		apiType = APITypeLobeChat
	case common.ChannelTypeStability:
		apiType = APITypeStability
	case common.ChannelTypeOllama:
		apiType = APITypeOllama
	}
	return apiType
}
