package minimax

import (
	"fmt"
	"one-api/relay/constant"
	"one-api/relay/util"
)

func GetRequestURL(meta *util.RelayMeta) (string, error) {
	if meta.Mode == constant.RelayModeChatCompletions {
		return fmt.Sprintf("%s/v1/text/chatcompletion_v2", meta.BaseURL), nil
	}
	return "", fmt.Errorf("unsupported relay mode %d for minimax", meta.Mode)
}
