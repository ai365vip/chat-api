package controller

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"net/http"
	"one-api/common"
	"one-api/common/config"
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
	}
	if relayMode == constant.RelayRealtime && textRequest.Model == "" {
		textRequest.Model = c.Query("model")
	}
	err = util.ValidateTextRequest(textRequest, relayMode)
	if err != nil {
		return nil, err
	}
	return textRequest, nil
}

func getImageRequest(c *gin.Context, relayMode int) (*relaymodel.ImageRequest, error) {
	imageRequest := &relaymodel.ImageRequest{}
	err := common.UnmarshalBodyReusable(c, imageRequest)
	if err != nil {
		return nil, err
	}
	if imageRequest.N == 0 {
		imageRequest.N = 1
	}
	if imageRequest.Size == "" {
		imageRequest.Size = "1024x1024"
	}
	if imageRequest.Model == "" {
		imageRequest.Model = "dall-e-2"
	}
	return imageRequest, nil
}

func validateImageRequest(imageRequest *relaymodel.ImageRequest, meta *util.RelayMeta) *relaymodel.ErrorWithStatusCode {
	// model validation
	_, hasValidSize := constant.DalleSizeRatios[imageRequest.Model][imageRequest.Size]
	if !hasValidSize {
		return openai.ErrorWrapper(errors.New("size not supported for this image model"), "size_not_supported", http.StatusBadRequest)
	}
	// check prompt length
	if imageRequest.Prompt == "" {
		return openai.ErrorWrapper(errors.New("prompt is required"), "prompt_missing", http.StatusBadRequest)
	}
	if len(imageRequest.Prompt) > constant.DalleImagePromptLengthLimitations[imageRequest.Model] {
		return openai.ErrorWrapper(errors.New("prompt is too long"), "prompt_too_long", http.StatusBadRequest)
	}
	// Number of generated images validation
	if !isWithinRange(imageRequest.Model, imageRequest.N) {
		// channel not azure
		if meta.ChannelType != common.ChannelTypeAzure {
			return openai.ErrorWrapper(errors.New("invalid value of n"), "n_not_within_range", http.StatusBadRequest)
		}
	}
	return nil
}

func getImageCostRatio(imageRequest *relaymodel.ImageRequest) (float64, error) {
	if imageRequest == nil {
		return 0, errors.New("imageRequest is nil")
	}
	imageCostRatio, hasValidSize := constant.DalleSizeRatios[imageRequest.Model][imageRequest.Size]
	if !hasValidSize {
		return 0, fmt.Errorf("size not supported for this image model: %s", imageRequest.Size)
	}
	if imageRequest.Quality == "hd" && imageRequest.Model == "dall-e-3" {
		if imageRequest.Size == "1024x1024" {
			imageCostRatio *= 2
		} else {
			imageCostRatio *= 1.5
		}
	}
	return imageCostRatio, nil
}

type Message struct {
	Role    string          `json:"role"`
	Content json.RawMessage `json:"content"`
	Name    *string         `json:"name,omitempty"`
}

func getPromptTokens(textRequest *relaymodel.GeneralOpenAIRequest, relayMode int) int {
	switch relayMode {
	case constant.RelayModeChatCompletions:
		if textRequest.Model == "gpt-4-vision" || textRequest.Model == "claude-3-haiku" || textRequest.Model == "claude-3-opus" || textRequest.Model == "glm-v4" {
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
		return openai.CountTokenChatRequest(textRequest, textRequest.Model)
	case constant.RelayModeMessages:
		return openai.CountTokenChatRequest(textRequest, textRequest.Model)
	case constant.RelayModeCompletions:
		return openai.CountTokenInput(textRequest.Prompt, textRequest.Model)
	case constant.RelayModeModerations:
		return openai.CountTokenInput(textRequest.Input, textRequest.Model)
	}
	return 0
}

func preConsumeQuota(ctx context.Context, preConsumedQuota int, meta *util.RelayMeta) (int, *relaymodel.ErrorWithStatusCode) {
	userQuota, err := model.CacheGetUserQuota(ctx, meta.UserId)
	if err != nil {
		return preConsumedQuota, openai.ErrorWrapper(err, "get_user_quota_failed", http.StatusInternalServerError)
	}
	if userQuota-preConsumedQuota < 0 {
		logger.Errorf(ctx, "userID #%d user quota is not enough", meta.UserId)
		return preConsumedQuota, openai.ErrorWrapper(errors.New("user quota is not enough"), "insufficient_user_quota", http.StatusForbidden)
	}
	err = model.CacheDecreaseUserQuota(ctx, meta.UserId, preConsumedQuota)
	if err != nil {
		return preConsumedQuota, openai.ErrorWrapper(err, "decrease_user_quota_failed", http.StatusInternalServerError)
	}
	if userQuota > 100*preConsumedQuota {
		// in this case, we do not pre-consume quota
		// because the user has enough quota
		preConsumedQuota = 0
		logger.Info(ctx, fmt.Sprintf("用户%d 配额%d，额度充足，无需预先扣费。", meta.UserId, userQuota))
	}
	if preConsumedQuota > 0 {
		logger.Info(ctx, fmt.Sprintf("用户%d 额度 %d，预扣费 %d", meta.UserId, userQuota, preConsumedQuota))
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
	if textRequest.Messages != nil && len(textRequest.Messages) > 0 {
		for _, message := range textRequest.Messages {
			jsonBytes, err := json.Marshal(message.Content)
			if err != nil {
				logger.Warn(ctx, "Failed to marshal message content: "+err.Error())
				continue
			}
			usertext += string(jsonBytes)
		}
	} else if textRequest.Input != "" {
		// 处理 Input 字段
		if inputStr, ok := textRequest.Input.(string); ok {
			usertext = inputStr
		} else {
			jsonBytes, err := json.Marshal(textRequest.Input)
			if err != nil {
				logger.Warn(ctx, "Failed to marshal input content: "+err.Error())
			} else {
				usertext = string(jsonBytes)
			}
		}
	} else if textRequest.Prompt != "" {
		// 处理 Prompt 字段
		if promptStr, ok := textRequest.Prompt.(string); ok {
			usertext = promptStr
		} else {
			jsonBytes, err := json.Marshal(textRequest.Prompt)
			if err != nil {
				logger.Warn(ctx, "Failed to marshal prompt content: "+err.Error())
			} else {
				usertext = string(jsonBytes)
			}
		}
	}
	userQuota, err := model.CacheGetUserQuota(ctx, meta.UserId)
	if err != nil {
		openai.ErrorWrapper(err, "get_user_quota_failed", http.StatusInternalServerError)
	}
	BillingByRequestEnabled, _ := strconv.ParseBool(config.OptionMap["BillingByRequestEnabled"])
	ModelRatioEnabled, _ := strconv.ParseBool(config.OptionMap["ModelRatioEnabled"])
	modelRatioString := ""
	quota := 0
	completionRatio := common.GetCompletionRatio(textRequest.Model)
	promptTokens := usage.PromptTokens
	completionTokens := usage.CompletionTokens
	quota = promptTokens + int(float64(completionTokens)*completionRatio)

	modelRatioString = fmt.Sprintf("模型倍率 %.2f，补全倍率%.2f", modelRatio, completionRatio)
	quota = int(float64(quota) * ratio)
	if BillingByRequestEnabled {
		shouldUseModelRatio2 := !ModelRatioEnabled || (ModelRatioEnabled && meta.BillingEnabled)
		if shouldUseModelRatio2 {
			modelRatio2, ok := common.GetModelRatio2(meta.OriginModelName)
			if ok {
				ratio = modelRatio2 * groupRatio
				quota = int(ratio * config.QuotaPerUnit)
				modelRatioString = "按次计费"
			}
		}
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
	logger.Info(ctx, fmt.Sprintf("用户%d 扣费%d，预扣费 %d 实际扣费 %d。", meta.UserId, quotaDelta, preConsumedQuota, quota))

	multiplier := fmt.Sprintf("%s，分组倍率 %.2f", modelRatioString, groupRatio)
	LogContentEnabled, _ := strconv.ParseBool(config.OptionMap["LogContentEnabled"])
	logContent := ""
	if LogContentEnabled {
		logContent = fmt.Sprintf("用户: %s \nAI: %s", usertext, aitext)
	}
	err = model.PostConsumeTokenQuota(meta.TokenId, quotaDelta)
	if err != nil {
		logger.Error(ctx, "error consuming token remain quota: "+err.Error())
	}
	err = model.CacheDecreaseUserQuota(ctx, meta.UserId, quotaDelta)
	if err != nil {
		logger.Error(ctx, "decrease_user_quota_failed"+err.Error())
	}
	//err = model.CacheUpdateUserQuota(ctx, meta.UserId)
	//if err != nil {
	//	logger.Error(ctx, "error update user quota cache: "+err.Error())
	//}
	logModel := textRequest.Model
	if strings.HasPrefix(logModel, "gpt-4-gizmo") {
		logModel = "gpt-4-gizmo-*"
		logContent += fmt.Sprintf("，模型 %s", textRequest.Model)
	}
	if quota != 0 {
		model.RecordConsumeLog(ctx, meta.UserId, meta.ChannelId, meta.ChannelName, promptTokens, completionTokens, textRequest.Model, meta.TokenName, quota, logContent, meta.TokenId, multiplier, userQuota, int(duration), meta.IsStream, meta.AttemptsLog, meta.RelayIp)
		model.UpdateUserUsedQuotaAndRequestCount(meta.UserId, quota)
		model.UpdateChannelUsedQuota(meta.ChannelId, quota)
	}

}
func isErrorHappened(meta *util.RelayMeta, resp *http.Response) bool {
	if resp == nil {
		if meta.ChannelType == common.ChannelTypeAwsClaude {
			return false
		}
		return true
	}
	if resp.StatusCode != http.StatusOK {
		return true
	}
	if meta.ChannelType == common.ChannelTypeDeepL {
		// skip stream check for deepl
		return false
	}
	if meta.IsStream && strings.HasPrefix(resp.Header.Get("Content-Type"), "application/json") {
		return true
	}
	return false
}

func determineActualStatusCode(statusCode int, errorMessage string) int {
	// 使用正则表达式匹配 "StatusCode: XXX" 模式
	re := regexp.MustCompile(`StatusCode:\s*(\d+)`)
	matches := re.FindStringSubmatch(errorMessage)

	if len(matches) > 1 {
		// 提取状态码
		if actualStatusCode, err := strconv.Atoi(matches[1]); err == nil {
			return actualStatusCode
		}
	}

	// 如果没有匹配到或解析失败，返回原始状态码
	return statusCode
}

func PostWssConsumeQuota(ctx *gin.Context, usage *relaymodel.RealtimeUsage, meta *util.RelayMeta, textRequest *relaymodel.GeneralOpenAIRequest, ratio float64, preConsumedQuota int64, modelRatio float64, groupRatio float64, duration int, ip string) {
	userQuota, err := model.CacheGetUserQuota(ctx, meta.UserId)
	if err != nil {
		logger.Warn(ctx, "Failed to get user quota: "+err.Error())
	}

	textInputTokens := usage.InputTokenDetails.TextTokens
	textOutTokens := usage.OutputTokenDetails.TextTokens

	audioInputTokens := usage.InputTokenDetails.AudioTokens
	audioOutTokens := usage.OutputTokenDetails.AudioTokens

	completionRatio := common.GetCompletionRatio(meta.OriginModelName)
	audioRatio := common.GetAudioRatio(meta.OriginModelName)
	audioCompletionRatio := common.GetAudioCompletionRatio(meta.OriginModelName)
	// 获取计费相关配置
	BillingByRequestEnabled, _ := strconv.ParseBool(config.OptionMap["BillingByRequestEnabled"])
	ModelRatioEnabled, _ := strconv.ParseBool(config.OptionMap["ModelRatioEnabled"])
	quota := int64(0)

	modelQuota := fmt.Sprintf("模型倍率 %.2f，补全倍率 %.2f，音频倍率 %.2f，音频补全倍率 %.2f，分组倍率 %.2f", modelRatio, completionRatio, audioRatio, audioCompletionRatio, groupRatio)

	// 按请求计费的处理逻辑
	if BillingByRequestEnabled {
		shouldUseModelRatio2 := !ModelRatioEnabled || (ModelRatioEnabled && meta.BillingEnabled)
		if shouldUseModelRatio2 {
			modelRatio2, ok := common.GetModelRatio2(meta.OriginModelName)
			quota = int64(math.Round(float64(textInputTokens) + float64(textOutTokens)*completionRatio))
			quota += int64(math.Round(float64(audioInputTokens)*audioRatio + float64(audioOutTokens)*audioRatio*audioCompletionRatio))
			quota = int64(math.Round(float64(quota) * ratio))
			if ok {
				ratio = modelRatio2 * groupRatio
				quota = int64(ratio * config.QuotaPerUnit)
				modelQuota = fmt.Sprintf("按次计费 %0.2f", modelRatio2)
			}
		}
	}
	totalTokens := usage.TotalTokens
	// record all the consume log even if quota is 0
	if totalTokens == 0 {
		// in this case, must be some error happened
		// we cannot just return, because we may have to return the pre-consumed quota
		quota = 0
		modelQuota += fmt.Sprintf("（可能是上游超时）")
		common.LogError(ctx, fmt.Sprintf("total tokens is 0, cannot consume quota, userId %d, channelId %d, "+
			"tokenId %d, model %s， pre-consumed quota %d", meta.UserId, meta.ChannelId, meta.TokenId, meta.OriginModelName, preConsumedQuota))
	} else {

		// 更新用户使用的配额和请求计数
		model.UpdateUserUsedQuotaAndRequestCount(meta.UserId, int(quota))

		// 更新渠道使用的配额
		model.UpdateChannelUsedQuota(meta.ChannelId, int(quota))
	}
	other := GenerateWssOtherInfo(ctx, meta, usage, modelRatio, groupRatio, completionRatio, audioRatio, audioCompletionRatio)
	otherJson, _ := json.Marshal(other)
	model.RecordConsumeLog(ctx, meta.UserId, meta.ChannelId, meta.ChannelName, int(usage.InputTokens), int(usage.OutputTokens), textRequest.Model, meta.TokenName, int(quota), "", meta.TokenId, string(otherJson), userQuota, int(duration), meta.IsStream, meta.AttemptsLog, meta.RelayIp)

}

// GenerateWssOtherInfo 生成WebSocket相关的统计信息
// 包含音频和文本的输入输出token数量，以及各种比率
func GenerateWssOtherInfo(ctx *gin.Context, meta *util.RelayMeta, usage *relaymodel.RealtimeUsage, modelRatio, groupRatio, completionRatio, audioRatio, audioCompletionRatio float64) map[string]interface{} {
	// 获取基础文本信息
	info := GenerateTextOtherInfo(ctx, meta, modelRatio, groupRatio, completionRatio)

	// 添加WebSocket特定信息
	info["ws"] = true

	// 添加音频相关统计
	info["audio_input"] = usage.InputTokenDetails.AudioTokens   // 音频输入token数
	info["audio_output"] = usage.OutputTokenDetails.AudioTokens // 音频输出token数

	// 添加文本相关统计
	info["text_input"] = usage.InputTokenDetails.TextTokens   // 文本输入token数
	info["text_output"] = usage.OutputTokenDetails.TextTokens // 文本输出token数

	// 添加音频计费比率
	info["audio_ratio"] = audioRatio                      // 音频基础比率
	info["audio_completion_ratio"] = audioCompletionRatio // 音频补全比率

	return info
}

// GenerateTextOtherInfo 生成基础文本统计信息
// 包含模型比率、分组比率、补全比率和首次响应时间
func GenerateTextOtherInfo(ctx *gin.Context, meta *util.RelayMeta, modelRatio, groupRatio, completionRatio float64) map[string]interface{} {
	other := make(map[string]interface{})

	// 添加各种比率信息
	other["model_ratio"] = modelRatio           // 模型比率
	other["group_ratio"] = groupRatio           // 分组比率
	other["completion_ratio"] = completionRatio // 补全比率

	// 计算首次响应时间（毫秒）
	other["frt"] = float64(meta.FirstResponseTime.UnixMilli() - meta.StartTime.UnixMilli())

	return other
}
