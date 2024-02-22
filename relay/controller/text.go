package controller

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"one-api/common"
	"one-api/model"
	"one-api/relay/channel/openai"
	"one-api/relay/constant"
	"one-api/relay/util"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func RelayTextHelper(c *gin.Context, relayMode int) *openai.ErrorWithStatusCode {
	ctx := c.Request.Context()

	meta := util.GetRelayMeta(c)
	startTime := time.Now()
	var textRequest openai.GeneralOpenAIRequest
	err := common.UnmarshalBodyReusable(c, &textRequest)
	if err != nil {
		return openai.ErrorWrapper(err, "bind_request_body_failed", http.StatusBadRequest)
	}
	if relayMode == constant.RelayModeModerations && textRequest.Model == "" {
		textRequest.Model = "text-moderation-latest"
	}
	if relayMode == constant.RelayModeEmbeddings && textRequest.Model == "" {
		textRequest.Model = c.Param("model")
	}
	err = util.ValidateTextRequest(&textRequest, relayMode)
	if err != nil {
		return openai.ErrorWrapper(err, "invalid_text_request", http.StatusBadRequest)
	}
	var isModelMapped bool
	textRequest.Model, isModelMapped = util.GetMappedModelName(textRequest.Model, meta.ModelMapping)
	apiType := constant.ChannelType2APIType(meta.ChannelType)

	fullRequestURL, err := GetRequestURL(c.Request.URL.String(), apiType, relayMode, meta, &textRequest)
	if err != nil {
		common.LogError(ctx, fmt.Sprintf("util.GetRequestURL failed: %s", err.Error()))
		return openai.ErrorWrapper(fmt.Errorf("util.GetRequestURL failed"), "get_request_url_failed", http.StatusInternalServerError)
	}
	var promptTokens int
	var completionTokens int
	switch relayMode {
	case constant.RelayModeChatCompletions:
		// 在发送请求之前，检查模型并对 gpt-4-vision-completions 模型特殊处理
		if textRequest.Model == "gpt-4-vision" {
			for i, msg := range textRequest.Messages {
				contentStr := string(msg.Content)

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
		promptTokens = openai.CountTokenMessages(textRequest.Messages, textRequest.Model)
	case constant.RelayModeCompletions:
		promptTokens = openai.CountTokenInput(textRequest.Prompt, textRequest.Model)
	case constant.RelayModeModerations:
		promptTokens = openai.CountTokenInput(textRequest.Input, textRequest.Model)
	}
	preConsumedTokens := common.PreConsumedQuota
	if textRequest.MaxTokens != 0 {
		preConsumedTokens = promptTokens + textRequest.MaxTokens
	}
	usertext := ""
	for _, message := range textRequest.Messages {
		jsonBytes, err := json.Marshal(message.Content)
		if err != nil {
			continue
		}
		usertext = string(jsonBytes)

	}
	modelRatio := common.GetModelRatio(textRequest.Model)
	groupRatio := common.GetGroupRatio(meta.Group)
	ratio := modelRatio * groupRatio
	preConsumedQuota := 0

	token, err := model.GetTokenById(meta.TokenId)
	if err != nil {
		log.Println("获取token出错:", err)
	}
	BillingByRequestEnabled, _ := strconv.ParseBool(common.OptionMap["BillingByRequestEnabled"])
	ModelRatioEnabled, _ := strconv.ParseBool(common.OptionMap["ModelRatioEnabled"])
	if BillingByRequestEnabled && ModelRatioEnabled {
		if token.BillingEnabled {
			modelRatio2, ok := common.GetModelRatio2(textRequest.Model)
			if !ok {
				preConsumedQuota = int(float64(preConsumedTokens) * ratio)
			} else {
				ratio = modelRatio2 * groupRatio
				preConsumedQuota = int(ratio * common.QuotaPerUnit)
			}
		} else {
			preConsumedQuota = int(float64(preConsumedTokens) * ratio)
		}
	} else if BillingByRequestEnabled {
		modelRatio2, ok := common.GetModelRatio2(textRequest.Model)
		if !ok {
			preConsumedQuota = int(float64(preConsumedTokens) * ratio)
		} else {
			ratio = modelRatio2 * groupRatio
			preConsumedQuota = int(ratio * common.QuotaPerUnit)
		}
	} else {
		preConsumedQuota = int(float64(preConsumedTokens) * ratio)
	}
	userQuota, err := model.CacheGetUserQuota(meta.UserId)
	if err != nil {
		return openai.ErrorWrapper(err, "get_user_quota_failed", http.StatusInternalServerError)
	}
	if userQuota-preConsumedQuota < 0 {
		return openai.ErrorWrapper(errors.New("user quota is not enough"), "insufficient_user_quota", http.StatusForbidden)
	}
	err = model.CacheDecreaseUserQuota(meta.UserId, preConsumedQuota)
	if err != nil {
		return openai.ErrorWrapper(err, "decrease_user_quota_failed", http.StatusInternalServerError)
	}
	if userQuota > 100*preConsumedQuota {
		preConsumedQuota = 0
		common.LogInfo(c.Request.Context(), fmt.Sprintf("user %d has enough quota %d, trusted and no need to pre-consume", meta.UserId, userQuota))
		if !meta.TokenUnlimited {
			tokenQuota := meta.TokenQuota
			if tokenQuota > 100*preConsumedQuota {
				preConsumedQuota = 0
				common.LogInfo(c.Request.Context(), fmt.Sprintf("user %d quota %d and token %d quota %d are enough, trusted and no need to pre-consume", meta.UserId, userQuota, meta.TokenId, tokenQuota))
			}
		} else {
			preConsumedQuota = 0
			common.LogInfo(c.Request.Context(), fmt.Sprintf("user %d with unlimited token has enough quota %d, trusted and no need to pre-consume", meta.UserId, userQuota))
		}
	}
	if preConsumedQuota > 0 {
		userQuota, err = model.PreConsumeTokenQuota(meta.TokenId, preConsumedQuota)
		if err != nil {
			return openai.ErrorWrapper(err, "pre_consume_token_quota_failed", http.StatusForbidden)
		}
	}
	requestBody, err := GetRequestBody(c, textRequest, isModelMapped, apiType, relayMode)
	if err != nil {
		return openai.ErrorWrapper(err, "get_request_body_failed", http.StatusInternalServerError)
	}
	var req *http.Request
	var resp *http.Response
	isStream := textRequest.Stream

	if apiType != constant.APITypeXunfei { // cause xunfei use websocket
		req, err = http.NewRequest(c.Request.Method, fullRequestURL, requestBody)
		if err != nil {
			return openai.ErrorWrapper(err, "new_request_failed", http.StatusInternalServerError)
		}
		SetupRequestHeaders(c, req, apiType, meta, isStream)
		resp, err = util.HTTPClient.Do(req)
		if err != nil {
			return openai.ErrorWrapper(err, "do_request_failed", http.StatusInternalServerError)
		}
		err = req.Body.Close()
		if err != nil {
			return openai.ErrorWrapper(err, "close_request_body_failed", http.StatusInternalServerError)
		}
		err = c.Request.Body.Close()
		if err != nil {
			return openai.ErrorWrapper(err, "close_request_body_failed", http.StatusInternalServerError)
		}
		isStream = isStream || strings.HasPrefix(resp.Header.Get("Content-Type"), "text/event-stream")

		if resp.StatusCode != http.StatusOK {
			util.ReturnPreConsumedQuota(ctx, preConsumedQuota, meta.TokenId)
			return util.RelayErrorHandler(resp)
		}
	}

	var respErr *openai.ErrorWithStatusCode
	var usage *openai.Usage
	var aitext string

	defer func(ctx context.Context) {
		// Why we use defer here? Because if error happened, we will have to return the pre-consumed quota.
		if respErr != nil {
			common.LogError(ctx, "respErr is not nil: %+v")
			util.ReturnPreConsumedQuota(ctx, preConsumedQuota, meta.TokenId)
			return
		}
		if usage == nil {
			common.LogError(ctx, "usage is nil, which is unexpected")
			return
		}

		go func() {
			modelRatioString := ""
			useTimeSeconds := time.Now().Unix() - startTime.Unix()
			quota := 0
			token, err := model.GetTokenById(meta.TokenId)
			if err != nil {
				log.Println("获取token出错:", err)
			}
			completionRatio := common.GetCompletionRatio(textRequest.Model)
			promptTokens = usage.PromptTokens
			completionTokens = usage.CompletionTokens
			quota = promptTokens + int(float64(completionTokens)*completionRatio)
			//log.Println("BillingByRequestEnabled:", BillingByRequestEnabled)
			//log.Println("ModelRatioEnabled:", ModelRatioEnabled)
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
			multiplier := fmt.Sprintf("%s，分组倍率 %.2f", modelRatioString, groupRatio)
			LogContentEnabled, _ := strconv.ParseBool(common.OptionMap["LogContentEnabled"])
			logContent := ""
			if LogContentEnabled {
				logContent = fmt.Sprintf("用户: %s \nAI: %s", usertext, aitext)
			}

			if totalTokens == 0 {
				quota = 0
				logContent += fmt.Sprintf("（有疑问请联系管理员）")
				common.LogError(ctx, fmt.Sprintf("total tokens is 0, cannot consume quota, userId %d, channelId %d, tokenId %d, model %s， pre-consumed quota %d", meta.UserId, meta.ChannelId, meta.TokenId, textRequest.Model, preConsumedQuota))
			} else {
				quotaDelta := quota - preConsumedQuota
				err = model.PostConsumeTokenQuota(meta.TokenId, userQuota, quotaDelta, preConsumedQuota, true)
				if err != nil {
					common.LogError(ctx, "error consuming token remain quota: "+err.Error())
				}
				err = model.CacheUpdateUserQuota(meta.UserId)
				if err != nil {
					common.LogError(ctx, "error update user quota cache: "+err.Error())
				}
			}

			logModel := textRequest.Model
			if strings.HasPrefix(logModel, "gpt-4-gizmo") {
				logModel = "gpt-4-gizmo-*"
				logContent += fmt.Sprintf("，模型 %s", textRequest.Model)
			}
			if quota != 0 {
				model.RecordConsumeLog(ctx, meta.UserId, meta.ChannelId, meta.ChannelName, promptTokens, completionTokens, textRequest.Model, meta.TokenName, quota, logContent, meta.TokenId, multiplier, userQuota, int(useTimeSeconds), isStream)
				model.UpdateUserUsedQuotaAndRequestCount(meta.UserId, quota)
				model.UpdateChannelUsedQuota(meta.ChannelId, quota)
			}
		}()
	}(ctx)
	aitext, usage, respErr = DoResponse(c, &textRequest, resp, relayMode, apiType, isStream, promptTokens)
	if respErr != nil {
		return respErr
	}
	return nil
}
