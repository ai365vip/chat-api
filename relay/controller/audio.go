package controller

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"one-api/common"
	"one-api/model"
	"one-api/relay/channel/openai"
	"one-api/relay/constant"
	dbmodel "one-api/relay/model"
	"one-api/relay/util"
	"strconv"
	"strings"
	"time"

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

func RelayAudioHelper(c *gin.Context, relayMode int) *dbmodel.ErrorWithStatusCode {

	tokenId := c.GetInt("token_id")
	channelType := c.GetInt("channel")
	channelId := c.GetInt("channel_id")
	channelName := c.GetString("channel_name")
	userId := c.GetInt("id")
	group := c.GetString("group")
	startTime := time.Now()
	var audioRequest openai.TextToSpeechRequest
	if !strings.HasPrefix(c.Request.URL.Path, "/v1/audio/transcriptions") {
		err := common.UnmarshalBodyReusable(c, &audioRequest)
		if err != nil {
			return openai.ErrorWrapper(err, "bind_request_body_failed", http.StatusBadRequest)
		}
	} else {
		audioRequest = openai.TextToSpeechRequest{
			Model: "whisper-1",
		}
	}
	//err := common.UnmarshalBodyReusable(c, &audioRequest)

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

	preConsumedTokens := common.PreConsumedQuota
	modelRatio := common.GetModelRatio(audioRequest.Model)
	groupRatio := common.GetGroupRatio(group)
	ratio := modelRatio * groupRatio
	preConsumedQuota := 0
	token, err := model.GetTokenById(tokenId)
	if err != nil {
		log.Println("获取token出错:", err)
	}

	BillingByRequestEnabled, _ := strconv.ParseBool(common.OptionMap["BillingByRequestEnabled"])
	ModelRatioEnabled, _ := strconv.ParseBool(common.OptionMap["ModelRatioEnabled"])

	if BillingByRequestEnabled && ModelRatioEnabled {
		if token.BillingEnabled {
			if token.BillingEnabled {
				modelRatio2, ok := common.GetModelRatio2(audioRequest.Model)
				if !ok {
					preConsumedQuota = int(float64(preConsumedTokens) * ratio)
				} else {
					ratio = modelRatio2 * groupRatio
					preConsumedQuota = int(ratio * common.QuotaPerUnit)
				}
			} else {
				preConsumedQuota = int(float64(preConsumedTokens) * ratio)
			}
		} else {
			preConsumedQuota = int(float64(preConsumedTokens) * ratio)
		}
	} else if BillingByRequestEnabled {
		modelRatio2, ok := common.GetModelRatio2(audioRequest.Model)
		if !ok {
			preConsumedQuota = int(float64(preConsumedTokens) * ratio)
		} else {
			ratio = modelRatio2 * groupRatio
			preConsumedQuota = int(ratio * common.QuotaPerUnit)
		}
	} else {
		preConsumedQuota = int(float64(preConsumedTokens) * ratio)
	}

	userQuota, err := model.CacheGetUserQuota(c, userId)
	if err != nil {
		return openai.ErrorWrapper(err, "get_user_quota_failed", http.StatusInternalServerError)
	}
	if userQuota-preConsumedQuota < 0 {
		return openai.ErrorWrapper(errors.New("user quota is not enough"), "insufficient_user_quota", http.StatusForbidden)
	}
	err = model.CacheDecreaseUserQuota(userId, preConsumedQuota)
	if err != nil {
		return openai.ErrorWrapper(err, "decrease_user_quota_failed", http.StatusInternalServerError)
	}
	if userQuota > 100*preConsumedQuota {
		// in this case, we do not pre-consume quota
		// because the user has enough quota
		preConsumedQuota = 0
	}

	if preConsumedQuota > 0 {
		err = model.PreConsumeTokenQuota(tokenId, preConsumedQuota)
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

	baseURL := common.ChannelBaseURLs[channelType]
	requestURL := c.Request.URL.String()
	if c.GetString("base_url") != "" {
		baseURL = c.GetString("base_url")
	}

	fullRequestURL := util.GetFullRequestURL(baseURL, requestURL, channelType)
	if relayMode == constant.RelayModeAudioTranscription && channelType == common.ChannelTypeAzure {
		// https://learn.microsoft.com/en-us/azure/ai-services/openai/whisper-quickstart?tabs=command-line#rest-api
		apiVersion := util.GetAPIVersion(c)
		fullRequestURL = fmt.Sprintf("%s/openai/deployments/%s/audio/transcriptions?api-version=%s", baseURL, audioRequest.Model, apiVersion)
	}
	requestBody := c.Request.Body

	req, err := http.NewRequest(c.Request.Method, fullRequestURL, requestBody)
	if err != nil {
		return openai.ErrorWrapper(err, "new_request_failed", http.StatusInternalServerError)
	}
	req.Header.Set("Authorization", c.Request.Header.Get("Authorization"))
	if relayMode == constant.RelayModeAudioTranscription && channelType == common.ChannelTypeAzure {
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

	err = req.Body.Close()
	if err != nil {
		return openai.ErrorWrapper(err, "close_request_body_failed", http.StatusInternalServerError)
	}
	err = c.Request.Body.Close()
	if err != nil {
		return openai.ErrorWrapper(err, "close_request_body_failed", http.StatusInternalServerError)
	}

	if resp.StatusCode != http.StatusOK {
		util.RelayErrorHandler(resp)
	}

	var audioResponse openai.AudioResponse

	defer func(ctx context.Context) {
		go func() {
			useTimeSeconds := time.Now().Unix() - startTime.Unix()
			quota := 0
			var promptTokens = 0
			if strings.HasPrefix(audioRequest.Model, "tts-1") {
				quota = openai.CountAudioToken(audioRequest.Input, audioRequest.Model)
				promptTokens = quota
			} else {
				quota = openai.CountAudioToken(audioResponse.Text, audioRequest.Model)
				promptTokens = quota
			}
			modelRatioString := ""

			if BillingByRequestEnabled && ModelRatioEnabled {
				if token.BillingEnabled {
					modelRatio2, ok := common.GetModelRatio2(audioRequest.Model)
					if !ok {
						quota = int(float64(quota) * ratio)
						modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
					} else {
						ratio = modelRatio2 * groupRatio
						quota = int(ratio * common.QuotaPerUnit)
						modelRatioString = fmt.Sprintf("按次计费")
					}
				} else {
					quota = int(float64(quota) * ratio)
					modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
				}
			} else if BillingByRequestEnabled {
				modelRatio2, ok := common.GetModelRatio2(audioRequest.Model)
				if !ok {
					quota = int(float64(quota) * ratio)
					modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
				} else {
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
			quotaDelta := quota - preConsumedQuota
			err = model.PostConsumeTokenQuota(tokenId, quotaDelta)
			if err != nil {
				common.SysError("error consuming token remain quota: " + err.Error())
			}
			err = model.CacheUpdateUserQuota(c, userId)
			if err != nil {
				common.SysError("error update user quota cache: " + err.Error())
			}
			if quota != 0 {
				tokenName := c.GetString("token_name")
				multiplier := fmt.Sprintf("%s，分组倍率 %.2f", modelRatioString, groupRatio)
				logContent := fmt.Sprintf(" ")
				model.RecordConsumeLog(ctx, userId, channelId, channelName, promptTokens, 0, audioRequest.Model, tokenName, quota, logContent, tokenId, multiplier, userQuota, int(useTimeSeconds), false)
				model.UpdateUserUsedQuotaAndRequestCount(userId, quota)
				channelId := c.GetInt("channel_id")
				model.UpdateChannelUsedQuota(channelId, quota)
			}
		}()
	}(c.Request.Context())

	responseBody, err := io.ReadAll(resp.Body)

	if err != nil {
		return openai.ErrorWrapper(err, "read_response_body_failed", http.StatusInternalServerError)
	}
	err = resp.Body.Close()
	if err != nil {
		return openai.ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError)
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
