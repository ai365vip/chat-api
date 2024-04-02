package controller

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"one-api/common"
	"one-api/common/logger"
	"one-api/model"
	"one-api/relay/channel/openai"
	"one-api/relay/constant"
	relaymodel "one-api/relay/model"
	"one-api/relay/util"
	"regexp"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func getAndValidateTextRequest(c *gin.Context, relayMode int) (*relaymodel.GeneralOpenAIRequest, error) {
	textRequest := &relaymodel.GeneralOpenAIRequest{}
	err := common.UnmarshalBodyReusable(c, textRequest)
	if err != nil {
		return nil, err
	}
	if relayMode == constant.RelayModeModerations && textRequest.Model == "" {
		textRequest.Model = "text-moderation-latest"
	}
	if relayMode == constant.RelayModeEmbeddings && textRequest.Model == "" {
		textRequest.Model = c.Param("model")
		textRequest.Stream = false
	}
	if relayMode == constant.RelayModeEmbeddings {
		textRequest.Stream = false
	}
	err = util.ValidateTextRequest(textRequest, relayMode)
	if err != nil {
		return nil, err
	}
	return textRequest, nil
}

type Message struct {
	Role    string          `json:"role"`
	Content json.RawMessage `json:"content"`
	Name    *string         `json:"name,omitempty"`
}

func getPromptTokens(textRequest *relaymodel.GeneralOpenAIRequest, relayMode int) int {
	switch relayMode {
	case constant.RelayModeChatCompletions:
		if textRequest.Model == "gpt-4-vision" {
			for i, msg := range textRequest.Messages {
				contentStr := msg.Content.(string)

				// 使用正则表达式查找所有URL
				re := regexp.MustCompile(`http[s]?:\/\/[^\s]+`)
				matches := re.FindAllString(contentStr, -1)

				description := re.ReplaceAllString(contentStr, "") // 删除所有URL后的描述文本
				// 构建新的消息内容
				newContent := []interface{}{
					openai.OpenAIMessageContent{Type: "text", Text: strings.TrimSpace(description)},
				}
				// 如果找到了URL
				for _, url := range matches {
					newContent = append(newContent, openai.MediaMessageImage{
						Type:     "image_url",
						ImageUrl: openai.MessageImageUrl{Url: url}, // 使用MessageImageUrl结构体
					})
				}
				// 序列化新的消息内容
				newContentBytes, err := json.Marshal(newContent)
				if err != nil {
					log.Printf("无法序列化新的消息内容: %v\n", err)
					continue
				}
				// 更新 textRequest 中的消息内容
				textRequest.Messages[i].Content = json.RawMessage(newContentBytes)

			}

		}
		return openai.CountTokenMessages(textRequest.Messages, textRequest.Model)
	case constant.RelayModeCompletions:
		return openai.CountTokenInput(textRequest.Prompt, textRequest.Model)
	case constant.RelayModeModerations:
		return openai.CountTokenInput(textRequest.Input, textRequest.Model)
	}
	return 0
}

func getPreConsumedQuota(textRequest *relaymodel.GeneralOpenAIRequest, promptTokens int, ratio float64) int {
	preConsumedTokens := common.PreConsumedQuota
	if textRequest.MaxTokens != 0 {
		preConsumedTokens = promptTokens + textRequest.MaxTokens
	}
	return int(float64(preConsumedTokens) * ratio)
}

func preConsumeQuota(ctx context.Context, textRequest *relaymodel.GeneralOpenAIRequest, promptTokens int, ratio float64, meta *util.RelayMeta) (int, *relaymodel.ErrorWithStatusCode) {
	preConsumedQuota := getPreConsumedQuota(textRequest, promptTokens, ratio)

	userQuota, err := model.CacheGetUserQuota(ctx, meta.UserId)
	if err != nil {
		return preConsumedQuota, openai.ErrorWrapper(err, "get_user_quota_failed", http.StatusInternalServerError)
	}
	if userQuota-preConsumedQuota < 0 {
		return preConsumedQuota, openai.ErrorWrapper(errors.New("user quota is not enough"), "insufficient_user_quota", http.StatusForbidden)
	}
	err = model.CacheDecreaseUserQuota(meta.UserId, preConsumedQuota)
	if err != nil {
		return preConsumedQuota, openai.ErrorWrapper(err, "decrease_user_quota_failed", http.StatusInternalServerError)
	}
	if userQuota > 100*preConsumedQuota {
		// in this case, we do not pre-consume quota
		// because the user has enough quota
		preConsumedQuota = 0
		//logger.Info(ctx, fmt.Sprintf("user %d has enough quota %d, trusted and no need to pre-consume", meta.UserId, userQuota))
	}
	if preConsumedQuota > 0 {
		err := model.PreConsumeTokenQuota(meta.TokenId, preConsumedQuota)
		if err != nil {
			return preConsumedQuota, openai.ErrorWrapper(err, "pre_consume_token_quota_failed", http.StatusForbidden)
		}
	}
	return preConsumedQuota, nil
}

func postConsumeQuota(ctx context.Context, usage *relaymodel.Usage, meta *util.RelayMeta, textRequest *relaymodel.GeneralOpenAIRequest, ratio float64, preConsumedQuota int, modelRatio float64, groupRatio float64, aitext string, duration int) {
	if usage == nil {
		logger.Error(ctx, "usage is nil, which is unexpected")
		return
	}
	usertext := ""
	for _, message := range textRequest.Messages {
		jsonBytes, err := json.Marshal(message.Content)
		if err != nil {
			continue
		}
		usertext = string(jsonBytes)

	}
	userQuota, err := model.CacheGetUserQuota(ctx, meta.UserId)
	token, err := model.GetTokenById(meta.TokenId)
	BillingByRequestEnabled, _ := strconv.ParseBool(common.OptionMap["BillingByRequestEnabled"])
	ModelRatioEnabled, _ := strconv.ParseBool(common.OptionMap["ModelRatioEnabled"])
	modelRatioString := ""
	quota := 0
	completionRatio := common.GetCompletionRatio(textRequest.Model)
	promptTokens := usage.PromptTokens
	completionTokens := usage.CompletionTokens
	quota = promptTokens + int(float64(completionTokens)*completionRatio)

	if BillingByRequestEnabled && ModelRatioEnabled {
		if token.BillingEnabled {
			modelRatio2, ok := common.GetModelRatio2(textRequest.Model)
			if !ok {
				quota = int(float64(quota) * ratio)
				modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
			} else {
				groupRatio := common.GetGroupRatio(meta.Group)
				ratio = modelRatio2 * groupRatio
				quota = int(ratio * common.QuotaPerUnit)
				modelRatioString = fmt.Sprintf("按次计费")
			}
		} else {
			quota = int(float64(quota) * ratio)
			modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
		}
	} else if BillingByRequestEnabled {
		modelRatio2, ok := common.GetModelRatio2(textRequest.Model)
		if !ok {
			quota = int(float64(quota) * ratio)
			modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
		} else {
			groupRatio := common.GetGroupRatio(meta.Group)
			ratio = modelRatio2 * groupRatio
			quota = int(ratio * common.QuotaPerUnit)
			modelRatioString = fmt.Sprintf("按次计费")
		}
	} else {
		quota = int(float64(quota) * ratio)
		modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
	}
	if ratio != 0 && quota <= 0 {
		quota = 1
	}
	totalTokens := promptTokens + completionTokens
	if totalTokens == 0 {
		// in this case, must be some error happened
		// we cannot just return, because we may have to return the pre-consumed quota
		quota = 0
	}
	if meta.ChannelType == common.ChannelTypeStability {

		aitextInt, err := strconv.ParseInt(aitext, 16, 64)
		if err != nil {
			// 处理转换错误
			fmt.Println("转换错误:", err)
		} else {
			quota = quota * int(aitextInt)
		}

	}
	quotaDelta := quota - preConsumedQuota
	multiplier := fmt.Sprintf("%s，分组倍率 %.2f", modelRatioString, groupRatio)
	LogContentEnabled, _ := strconv.ParseBool(common.OptionMap["LogContentEnabled"])
	logContent := ""
	if LogContentEnabled {
		logContent = fmt.Sprintf("用户: %s \nAI: %s", usertext, aitext)
	}
	err = model.PostConsumeTokenQuota(meta.TokenId, quotaDelta)
	if err != nil {
		logger.Error(ctx, "error consuming token remain quota: "+err.Error())
	}
	err = model.CacheUpdateUserQuota(ctx, meta.UserId)
	if err != nil {
		logger.Error(ctx, "error update user quota cache: "+err.Error())
	}
	logModel := textRequest.Model
	if strings.HasPrefix(logModel, "gpt-4-gizmo") {
		logModel = "gpt-4-gizmo-*"
		logContent += fmt.Sprintf("，模型 %s", textRequest.Model)
	}
	if quota != 0 {
		model.RecordConsumeLog(ctx, meta.UserId, meta.ChannelId, meta.ChannelName, promptTokens, completionTokens, textRequest.Model, meta.TokenName, quota, logContent, meta.TokenId, multiplier, userQuota, int(duration), meta.IsStream)
		model.UpdateUserUsedQuotaAndRequestCount(meta.UserId, quota)
		model.UpdateChannelUsedQuota(meta.ChannelId, quota)
	}

}
