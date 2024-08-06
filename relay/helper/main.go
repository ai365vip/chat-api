package helper

import (
	"one-api/relay/channel"
	"one-api/relay/channel/aiproxy"
	"one-api/relay/channel/ali"
	"one-api/relay/channel/anthropic"
	"one-api/relay/channel/aws"
	"one-api/relay/channel/baidu"
	"one-api/relay/channel/cohere"
	"one-api/relay/channel/coze"
	"one-api/relay/channel/deepl"
	"one-api/relay/channel/gcpclaude"
	"one-api/relay/channel/gemini"
	"one-api/relay/channel/ollama"
	"one-api/relay/channel/openai"
	"one-api/relay/channel/palm"
	"one-api/relay/channel/stability"
	"one-api/relay/channel/tencent"
	"one-api/relay/channel/xunfei"
	"one-api/relay/channel/zhipu"
	"one-api/relay/constant"
)

func GetAdaptor(apiType int) channel.Adaptor {
	switch apiType {
	case constant.APITypeAIProxyLibrary:
		return &aiproxy.Adaptor{}
	case constant.APITypeAli:
		return &ali.Adaptor{}
	case constant.APITypeAnthropic:
		return &anthropic.Adaptor{}
	case constant.APITypeBaidu:
		return &baidu.Adaptor{}
	case constant.APITypeGemini:
		return &gemini.Adaptor{}
	case constant.APITypeOpenAI:
		return &openai.Adaptor{}
	case constant.APITypePaLM:
		return &palm.Adaptor{}
	case constant.APITypeTencent:
		return &tencent.Adaptor{}
	case constant.APITypeXunfei:
		return &xunfei.Adaptor{}
	case constant.APITypeZhipu:
		return &zhipu.Adaptor{}
	case constant.APITypeStability:
		return &stability.Adaptor{}
	case constant.APITypeOllama:
		return &ollama.Adaptor{}
	case constant.APITypeAwsClaude:
		return &aws.Adaptor{}
	case constant.APITypeCoze:
		return &coze.Adaptor{}
	case constant.APITypeDeepL:
		return &deepl.Adaptor{}
	case constant.APITypeCohere:
		return &cohere.Adaptor{}
	case constant.APITypeGCP:
		return &gcpclaude.Adaptor{}
	}
	return nil
}
