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
	minTokens                       = 1    // 最小 token 数，改为 1
	maxAudioDuration                = 240  // 最大音频时长（分钟）
	// 文件大小相关常量
	smallFileSize  = 1 * 1024 * 1024  // 1MB
	mediumFileSize = 10 * 1024 * 1024 // 10MB
	maxFileSize    = 50 * 1024 * 1024 // 50MB

	// 缓冲区大小
	smallBuffer  = 32 * 1024  // 32KB
	mediumBuffer = 64 * 1024  // 64KB
	largeBuffer  = 128 * 1024 // 128KB

	// 并发控制
	maxConcurrentLarge  = 20  // 大文件最大并发
	maxConcurrentMedium = 50  // 中等文件最大并发
	maxConcurrentSmall  = 100 // 小文件最大并发

	tmpFilePattern = "whisper-audio-*.tmp"
)

// 针对不同大小文件的并发控制
var (
	largeSemaphore  = make(chan struct{}, maxConcurrentLarge)
	mediumSemaphore = make(chan struct{}, maxConcurrentMedium)
	smallSemaphore  = make(chan struct{}, maxConcurrentSmall)
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
	var estimatedTokens int
	preConsumedTokens := config.PreConsumedQuota
	if strings.HasPrefix(audioRequest.Model, "whisper-1") {
		// 恢复请求体用于预估 token
		c.Request.Body = io.NopCloser(bytes.NewReader(bodyBytes))
		tokens, err := countAudioTokens(c)
		if err != nil {
			logger.Warn(c.Request.Context(), fmt.Sprintf("音频token预估失败：%s", err.Error()))
			preConsumedTokens = defaultWhisperPreConsumedTokens
		} else {
			preConsumedTokens = tokens
			estimatedTokens = tokens
		}
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
	defer func(ctx context.Context, estimatedTokens int) {
		go func() {
			useTimeSeconds := time.Now().Unix() - startTime.Unix()
			var quota int
			var promptTokens int

			if strings.HasPrefix(audioRequest.Model, "tts-1") {
				quota = openai.CountAudioToken(audioRequest.Input, audioRequest.Model)
				promptTokens = quota
			} else if strings.HasPrefix(audioRequest.Model, "whisper-1") {
				// 直接使用之前计算的结果
				quota = estimatedTokens
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
	}(c.Request.Context(), estimatedTokens)

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
	// 使用更长的基础超时时间
	baseCtx, baseCancel := context.WithTimeout(c.Request.Context(), 300*time.Second)
	defer baseCancel()

	body, err := common.GetRequestBody(c)
	if err != nil {
		return defaultWhisperPreConsumedTokens, fmt.Errorf("get request body failed: %w", err)
	}

	var reqBody struct {
		File *multipart.FileHeader `form:"file" binding:"required"`
	}

	c.Request.Body = io.NopCloser(bytes.NewReader(body))
	if err = c.ShouldBind(&reqBody); err != nil {
		return defaultWhisperPreConsumedTokens, fmt.Errorf("bind request body failed: %w", err)
	}

	fileSize := reqBody.File.Size
	if fileSize > maxFileSize {
		return defaultWhisperPreConsumedTokens, fmt.Errorf("file too large: %d bytes", fileSize)
	}

	// 根据文件大小选择合适的信号量和处理策略
	var sem chan struct{}
	var bufferSize int
	var processTimeout time.Duration

	switch {
	case fileSize > mediumFileSize:
		sem = largeSemaphore
		bufferSize = largeBuffer
		processTimeout = 180 * time.Second
	case fileSize > smallFileSize:
		sem = mediumSemaphore
		bufferSize = mediumBuffer
		processTimeout = 120 * time.Second
	default:
		sem = smallSemaphore
		bufferSize = smallBuffer
		processTimeout = 60 * time.Second
	}

	// 获取处理令牌
	select {
	case sem <- struct{}{}:
		defer func() { <-sem }()
	case <-baseCtx.Done():
		return defaultWhisperPreConsumedTokens, fmt.Errorf("request timeout while waiting for processing slot")
	}

	// 创建一个独立的上下文用于文件处理
	processCtx, processCancel := context.WithTimeout(context.Background(), processTimeout)
	defer processCancel()

	reqFp, err := reqBody.File.Open()
	if err != nil {
		return defaultWhisperPreConsumedTokens, fmt.Errorf("open request file failed: %w", err)
	}
	defer reqFp.Close()

	// 创建临时文件
	tmpDir := os.TempDir()
	tmpFp, err := os.CreateTemp(tmpDir, tmpFilePattern)
	if err != nil {
		return defaultWhisperPreConsumedTokens, fmt.Errorf("create temp file failed: %w", err)
	}

	tmpPath := tmpFp.Name()
	defer func() {
		tmpFp.Close()
		// 异步删除临时文件
		go func(path string) {
			// 为大文件提供更长的清理延迟
			cleanupDelay := time.Second
			if fileSize > mediumFileSize {
				cleanupDelay = 3 * time.Second
			}
			time.Sleep(cleanupDelay)

			if err := os.Remove(path); err != nil {
				logger.Warn(context.Background(), fmt.Sprintf("Failed to remove temp file %s: %v", path, err))
			}
		}(tmpPath)
	}()

	// 使用适当大小的buffer复制文件
	buf := make([]byte, bufferSize)
	if _, err = io.CopyBuffer(tmpFp, reqFp, buf); err != nil {
		return defaultWhisperPreConsumedTokens, fmt.Errorf("copy file failed: %w", err)
	}

	if err = tmpFp.Sync(); err != nil {
		return defaultWhisperPreConsumedTokens, fmt.Errorf("sync temp file failed: %w", err)
	}

	// 确保文件指针重置到开始位置
	if _, err = tmpFp.Seek(0, 0); err != nil {
		return defaultWhisperPreConsumedTokens, fmt.Errorf("seek temp file failed: %w", err)
	}

	// 使用独立的上下文获取音频时长
	duration, err := common.GetAudioDuration(processCtx, tmpPath)
	if err != nil {
		if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
			return defaultWhisperPreConsumedTokens, nil
		}
		logger.Warn(processCtx, fmt.Sprintf("Failed to get audio duration for %s (size: %d bytes): %v, using default tokens",
			tmpPath, fileSize, err))
		return defaultWhisperPreConsumedTokens, nil
	}

	// 计算token数量
	durationMinutes := duration / 60.0
	if durationMinutes > float64(maxAudioDuration) {
		durationMinutes = float64(maxAudioDuration)
	}

	// 简化 token 计算逻辑，按实际时长比例计算
	estimatedTokens := int(math.Ceil(durationMinutes * tokenPerMinute))
	if estimatedTokens < minTokens {
		estimatedTokens = minTokens
	}

	// 简化日志输出，只显示秒数
	logger.Info(processCtx, fmt.Sprintf("音频文件处理完成：文件大小=%d字节，时长=%.1f秒，预估tokens=%d",
		fileSize,
		duration,
		estimatedTokens))

	return estimatedTokens, nil
}
