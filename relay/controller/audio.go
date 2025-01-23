package controller

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"mime/multipart"
	"net/http"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/logger"
	"one-api/model"
	"one-api/relay/channel/openai"
	"one-api/relay/constant"
	dbmodel "one-api/relay/model"
	"one-api/relay/util"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/pkg/errors"

	"github.com/gin-gonic/gin"
)

var availableVoices = []string{
	"alloy",
	"echo",
	"fable",
	"onyx",
	"nova",
	"shimmer",
}

// 添加音频预估配置常量
const (
	defaultWhisperPreConsumedTokens = 500  // 默认预扣 token 数
	tokenPerMinute                  = 1000 // 每分钟音频消耗的 token 数
)

func RelayAudioHelper(c *gin.Context, relayMode int) *dbmodel.ErrorWithStatusCode {
	meta := util.GetRelayMeta(c)
	startTime := time.Now()

	// 保存原始请求体
	bodyBytes, err := common.GetRequestBody(c)
	if err != nil {
		return openai.ErrorWrapper(err, "read_request_body_failed", http.StatusBadRequest)
	}

	var audioRequest openai.TextToSpeechRequest
	if !strings.HasPrefix(c.Request.URL.Path, "/v1/audio/transcriptions") {
		err := json.Unmarshal(bodyBytes, &audioRequest)
		if err != nil {
			return openai.ErrorWrapper(err, "bind_request_body_failed", http.StatusBadRequest)
		}
	} else {
		audioRequest = openai.TextToSpeechRequest{
			Model: "whisper-1",
		}
	}

	// request validation
	if audioRequest.Model == "" {
		return openai.ErrorWrapper(errors.New("model is required"), "required_field_missing", http.StatusBadRequest)
	}

	if strings.HasPrefix(audioRequest.Model, "tts-1") {
		if audioRequest.Voice == "" {
			return openai.ErrorWrapper(errors.New("voice is required"), "required_field_missing", http.StatusBadRequest)
		}
		if !common.StringsContains(availableVoices, audioRequest.Voice) {
			return openai.ErrorWrapper(errors.New("voice must be one of "+strings.Join(availableVoices, ", ")), "invalid_field_value", http.StatusBadRequest)
		}
	}

	// 优化预扣费计算逻辑
	preConsumedTokens := config.PreConsumedQuota
	if strings.HasPrefix(audioRequest.Model, "whisper-1") {
		// 恢复请求体用于预估 token
		c.Request.Body = io.NopCloser(bytes.NewReader(bodyBytes))
		estimatedTokens, err := countAudioTokens(c)
		if err != nil {
			logger.Warn(c.Request.Context(), "estimate_audio_tokens_failed: "+err.Error())
			preConsumedTokens = defaultWhisperPreConsumedTokens
		} else {
			preConsumedTokens = int(estimatedTokens)
		}
		// 再次恢复请求体供后续使用
		c.Request.Body = io.NopCloser(bytes.NewReader(bodyBytes))
	}

	modelRatio := common.GetModelRatio(audioRequest.Model)
	groupRatio := common.GetGroupRatio(meta.Group)
	ratio := modelRatio * groupRatio
	var preConsumedQuota int

	// 计算预扣费额度
	BillingByRequestEnabled, _ := strconv.ParseBool(config.OptionMap["BillingByRequestEnabled"])
	ModelRatioEnabled, _ := strconv.ParseBool(config.OptionMap["ModelRatioEnabled"])
	preConsumedQuota = int(float64(preConsumedTokens) * ratio)

	if BillingByRequestEnabled {
		shouldUseModelRatio2 := !ModelRatioEnabled || (ModelRatioEnabled && meta.BillingEnabled)
		if shouldUseModelRatio2 {
			modelRatio2, ok := common.GetModelRatio2(audioRequest.Model)
			if ok {
				ratio = modelRatio2 * groupRatio
				preConsumedQuota = int(ratio * config.QuotaPerUnit)
			}
		}
	}

	userQuota, err := model.CacheGetUserQuota(c, meta.UserId)
	if err != nil {
		return openai.ErrorWrapper(err, "get_user_quota_failed", http.StatusInternalServerError)
	}

	if userQuota-preConsumedQuota < 0 {
		return openai.ErrorWrapper(errors.New("user quota is not enough"), "insufficient_user_quota", http.StatusForbidden)
	}
	err = model.CacheDecreaseUserQuota(c, meta.UserId, preConsumedQuota)
	if err != nil {
		return openai.ErrorWrapper(err, "decrease_user_quota_failed", http.StatusInternalServerError)
	}
	if userQuota > 100*preConsumedQuota {
		// in this case, we do not pre-consume quota
		// because the user has enough quota
		preConsumedQuota = 0
	}

	if preConsumedQuota > 0 {
		err = model.PreConsumeTokenQuota(meta.TokenId, preConsumedQuota)
		if err != nil {
			return openai.ErrorWrapper(err, "pre_consume_token_quota_failed", http.StatusForbidden)
		}
	}

	// map model name
	modelMapping := c.GetString("model_mapping")
	if modelMapping != "" {
		modelMap := make(map[string]string)
		err := json.Unmarshal([]byte(modelMapping), &modelMap)
		if err != nil {
			return openai.ErrorWrapper(err, "unmarshal_model_mapping_failed", http.StatusInternalServerError)
		}
		if modelMap[audioRequest.Model] != "" {
			audioRequest.Model = modelMap[audioRequest.Model]
		}
	}

	baseURL := common.ChannelBaseURLs[meta.ChannelType]
	requestURL := c.Request.URL.String()
	if c.GetString("base_url") != "" {
		baseURL = c.GetString("base_url")
	}
	fullRequestURL := util.GetFullRequestURL(baseURL, requestURL, meta.ChannelType)
	if meta.ChannelType == common.ChannelTypeAzure {
		apiVersion := meta.Config.APIVersion
		if relayMode == constant.RelayModeAudioTranscription {
			// https://learn.microsoft.com/en-us/azure/ai-services/openai/whisper-quickstart?tabs=command-line#rest-api
			fullRequestURL = fmt.Sprintf("%s/openai/deployments/%s/audio/transcriptions?api-version=%s", baseURL, audioRequest.Model, apiVersion)

		} else if relayMode == constant.RelayModeAudioSpeech {
			// https://learn.microsoft.com/en-us/azure/ai-services/openai/text-to-speech-quickstart?tabs=command-line#rest-api
			fullRequestURL = fmt.Sprintf("%s/openai/deployments/%s/audio/speech?api-version=%s", baseURL, audioRequest.Model, apiVersion)
		}
	}
	var buf bytes.Buffer
	_, err = io.Copy(&buf, c.Request.Body)
	if err != nil {
		// 处理可能的错误
		return openai.ErrorWrapper(err, "failed_to_read_request_body", http.StatusInternalServerError)
	}

	// 创建 HTTP 请求，使用 buf 作为请求体
	req, err := http.NewRequest(c.Request.Method, fullRequestURL, &buf)
	if err != nil {
		return openai.ErrorWrapper(err, "new_request_failed", http.StatusInternalServerError)
	}
	if (relayMode == constant.RelayModeAudioTranscription || relayMode == constant.RelayModeAudioSpeech) && meta.ChannelType == common.ChannelTypeAzure {
		// https://learn.microsoft.com/en-us/azure/ai-services/openai/whisper-quickstart?tabs=command-line#rest-api
		apiKey := c.Request.Header.Get("Authorization")
		apiKey = strings.TrimPrefix(apiKey, "Bearer ")
		req.Header.Set("api-key", apiKey)
		req.ContentLength = c.Request.ContentLength
	} else {
		req.Header.Set("Authorization", c.Request.Header.Get("Authorization"))
	}
	req.Header.Set("Content-Type", c.Request.Header.Get("Content-Type"))
	req.Header.Set("Accept", c.Request.Header.Get("Accept"))

	resp, err := util.HTTPClient.Do(req)

	if err != nil {
		return openai.ErrorWrapper(err, "do_request_failed", http.StatusInternalServerError)
	}
	defer resp.Body.Close()
	if resp != nil && resp.StatusCode != http.StatusOK {
		util.RelayErrorHandler(resp)
	}

	var audioResponse openai.AudioResponse

	// 优化实际用量计算逻辑
	defer func(ctx context.Context) {
		go func() {
			useTimeSeconds := time.Now().Unix() - startTime.Unix()
			var quota int
			var promptTokens int

			if strings.HasPrefix(audioRequest.Model, "tts-1") {
				quota = openai.CountAudioToken(audioRequest.Input, audioRequest.Model)
				promptTokens = quota
			} else if strings.HasPrefix(audioRequest.Model, "whisper-1") {
				// 恢复请求体用于计算实际 token
				c.Request.Body = io.NopCloser(bytes.NewReader(bodyBytes))
				tokens, err := countAudioTokens(c)
				if err != nil {
					logger.Error(ctx, "count_audio_tokens_failed: "+err.Error())
					quota = preConsumedTokens
				} else {
					quota = int(tokens)
				}
				promptTokens = quota
			}

			modelRatioString := ""
			modelpromptQuota := modelRatio * 0.002 * 1000
			modelQuota := fmt.Sprintf("Usage $%.2f/ 1M characters", modelpromptQuota)
			modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
			if BillingByRequestEnabled {
				shouldUseModelRatio2 := !ModelRatioEnabled || (ModelRatioEnabled && meta.BillingEnabled)
				if shouldUseModelRatio2 {
					modelRatio2, ok := common.GetModelRatio2(meta.OriginModelName)
					if ok {
						ratio = modelRatio2 * groupRatio
						quota = int(ratio * config.QuotaPerUnit)
						modelRatioString = "按次计费"
						modelQuota = fmt.Sprintf("按次计费 %0.2f", modelRatio2)
					}
				}
			}

			if groupRatio != 1 {
				modelQuota += fmt.Sprintf("。分组倍率%f", groupRatio)
			}
			if ratio != 0 && quota <= 0 {
				quota = 1
			}
			quotaDelta := quota - preConsumedQuota
			err = model.PostConsumeTokenQuota(meta.TokenId, quotaDelta)
			if err != nil {
				common.SysError("error consuming token remain quota: " + err.Error())
			}
			err = model.CacheDecreaseUserQuota(ctx, meta.UserId, quotaDelta)
			if err != nil {
				logger.Error(ctx, "decrease_user_quota_failed"+err.Error())
			}
			//err = model.CacheUpdateUserQuota(c, userId)
			//if err != nil {
			//	common.SysError("error update user quota cache: " + err.Error())
			//}

			if quota != 0 {
				tokenName := c.GetString("token_name")
				multiplier := fmt.Sprintf("%s，分组倍率 %.2f", modelRatioString, groupRatio)
				logContent := " "
				model.RecordConsumeLog(ctx, meta.UserId, meta.ChannelId, meta.ChannelName, promptTokens, 0, audioRequest.Model, tokenName, quota, logContent, meta.TokenId, multiplier, userQuota, int(useTimeSeconds), false, meta.AttemptsLog, meta.RelayIp)
				model.UpdateUserUsedQuotaAndRequestCount(meta.UserId, quota)
				channelId := c.GetInt("channel_id")
				model.UpdateChannelUsedQuota(channelId, quota)
			}

		}()
	}(c.Request.Context())

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return openai.ErrorWrapper(err, "read_response_body_failed", http.StatusInternalServerError)
	}
	if strings.HasPrefix(audioRequest.Model, "tts-1") {

	} else {
		err = json.Unmarshal(responseBody, &audioResponse)
		if err != nil {
			return openai.ErrorWrapper(err, "unmarshal_response_body_failed", http.StatusInternalServerError)
		}
	}

	resp.Body = io.NopCloser(bytes.NewBuffer(responseBody))

	for k, v := range resp.Header {
		c.Writer.Header().Set(k, v[0])
	}
	c.Writer.WriteHeader(resp.StatusCode)

	_, err = io.Copy(c.Writer, resp.Body)
	if err != nil {
		return openai.ErrorWrapper(err, "copy_response_body_failed", http.StatusInternalServerError)
	}
	err = resp.Body.Close()
	if err != nil {
		return openai.ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError)
	}
	return nil
}

// 优化 countAudioTokens 函数
func countAudioTokens(c *gin.Context) (int, error) {
	body, err := common.GetRequestBody(c)
	if err != nil {
		return 0, fmt.Errorf("get request body failed: %w", err)
	}

	var reqBody struct {
		File *multipart.FileHeader `form:"file" binding:"required"`
	}

	c.Request.Body = io.NopCloser(bytes.NewReader(body))
	if err = c.ShouldBind(&reqBody); err != nil {
		return 0, fmt.Errorf("bind request body failed: %w", err)
	}

	reqFp, err := reqBody.File.Open()
	if err != nil {
		return 0, fmt.Errorf("open request file failed: %w", err)
	}
	defer reqFp.Close()

	tmpFp, err := os.CreateTemp("", "audio-*")
	if err != nil {
		return 0, fmt.Errorf("create temp file failed: %w", err)
	}
	defer os.Remove(tmpFp.Name())
	defer tmpFp.Close()

	if _, err = io.Copy(tmpFp, reqFp); err != nil {
		return 0, fmt.Errorf("copy file failed: %w", err)
	}

	if err = tmpFp.Sync(); err != nil {
		return 0, fmt.Errorf("sync temp file failed: %w", err)
	}

	duration, err := common.GetAudioDuration(c.Request.Context(), tmpFp.Name())
	if err != nil {
		return 0, fmt.Errorf("get audio duration failed: %w", err)
	}

	return int(math.Round(math.Ceil(duration) / 60.0 * tokenPerMinute)), nil
}
