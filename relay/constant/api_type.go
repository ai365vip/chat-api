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
	APITypeDummy // this one is only for count, do not add any channel after this
	APITypeStability
	APITypeOllama
	APITypeAwsClaude
	APITypeCoze
	APITypeCohere
	APITypeDeepL
	APITypeGCP
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
	case common.ChannelTypeStability:
		apiType = APITypeStability
	case common.ChannelTypeOllama:
		apiType = APITypeOllama
	case common.ChannelTypeAwsClaude:
		apiType = APITypeAwsClaude
	case common.ChannelTypeCoze:
		apiType = APITypeCoze
	case common.ChannelTypeCohere:
		apiType = APITypeCohere
	case common.ChannelTypeDeepL:
		apiType = APITypeDeepL
	case common.ChannelTypeGCP:
		apiType = APITypeGCP
	}
	return apiType
}
