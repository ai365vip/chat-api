package controller

import (
	"bufio"
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
	"one-api/relay/util"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func RelayAudioHelper(c *gin.Context, relayMode int) *openai.ErrorWithStatusCode {
	audioModel := "whisper-1"

	tokenId := c.GetInt("token_id")
	channelType := c.GetInt("channel")
	channelId := c.GetInt("channel_id")
	userId := c.GetInt("id")
	group := c.GetString("group")
	tokenName := c.GetString("token_name")
	startTime := time.Now()

	var ttsRequest openai.TextToSpeechRequest
	if relayMode == constant.RelayModeAudioSpeech {
		// Read JSON
		err := common.UnmarshalBodyReusable(c, &ttsRequest)
		// Check if JSON is valid
		if err != nil {
			return openai.ErrorWrapper(err, "invalid_json", http.StatusBadRequest)
		}
		audioModel = ttsRequest.Model
		// Check if text is too long 4096
		if len(ttsRequest.Input) > 4096 {
			return openai.ErrorWrapper(errors.New("input is too long (over 4096 characters)"), "text_too_long", http.StatusBadRequest)
		}
	}

	preConsumedTokens := common.PreConsumedQuota
	modelRatio := common.GetModelRatio(ttsRequest.Model)
	groupRatio := common.GetGroupRatio(group)
	ratio := modelRatio * groupRatio
	modelRatioString := ""
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
				modelRatio2, ok := common.GetModelRatio2(ttsRequest.Model)
				if !ok {
					preConsumedQuota = int(float64(preConsumedTokens) * ratio)
					modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
				} else {
					ratio = modelRatio2 * groupRatio
					preConsumedQuota = int(ratio * common.QuotaPerUnit)
					modelRatioString = fmt.Sprintf("按次计费")
				}
			} else {
				preConsumedQuota = int(float64(preConsumedTokens) * ratio)
				modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
			}
		} else {
			preConsumedQuota = int(float64(preConsumedTokens) * ratio)
			modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
		}
	} else if BillingByRequestEnabled {
		modelRatio2, ok := common.GetModelRatio2(ttsRequest.Model)
		if !ok {
			preConsumedQuota = int(float64(preConsumedTokens) * ratio)
			modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
		} else {
			ratio = modelRatio2 * groupRatio
			preConsumedQuota = int(ratio * common.QuotaPerUnit)
			modelRatioString = fmt.Sprintf("按次计费")
		}
	} else {
		preConsumedQuota = int(float64(preConsumedTokens) * ratio)
		modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
	}
	userQuota, err := model.CacheGetUserQuota(userId)
	if err != nil {
		return openai.ErrorWrapper(err, "get_user_quota_failed", http.StatusInternalServerError)
	}

	// Check if user quota is enough
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
		userQuota, err = model.PreConsumeTokenQuota(tokenId, preConsumedQuota)
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
		if modelMap[audioModel] != "" {
			audioModel = modelMap[audioModel]
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
		fullRequestURL = fmt.Sprintf("%s/openai/deployments/%s/audio/transcriptions?api-version=%s", baseURL, audioModel, apiVersion)
	}

	requestBody := &bytes.Buffer{}
	_, err = io.Copy(requestBody, c.Request.Body)
	if err != nil {
		return openai.ErrorWrapper(err, "new_request_body_failed", http.StatusInternalServerError)
	}
	c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody.Bytes()))
	responseFormat := c.DefaultPostForm("response_format", "json")

	req, err := http.NewRequest(c.Request.Method, fullRequestURL, requestBody)
	if err != nil {
		return openai.ErrorWrapper(err, "new_request_failed", http.StatusInternalServerError)
	}

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
	var quota int
	if relayMode != constant.RelayModeAudioSpeech {
		responseBody, err := io.ReadAll(resp.Body)
		if err != nil {
			return openai.ErrorWrapper(err, "read_response_body_failed", http.StatusInternalServerError)
		}
		err = resp.Body.Close()
		if err != nil {
			return openai.ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError)
		}

		var openAIErr openai.SlimTextResponse
		if err = json.Unmarshal(responseBody, &openAIErr); err == nil {
			if openAIErr.Error.Message != "" {
				return openai.ErrorWrapper(fmt.Errorf("type %s, code %v, message %s", openAIErr.Error.Type, openAIErr.Error.Code, openAIErr.Error.Message), "request_error", http.StatusInternalServerError)
			}
		}

		var text string
		switch responseFormat {
		case "json":
			text, err = getTextFromJSON(responseBody)
		case "text":
			text, err = getTextFromText(responseBody)
		case "srt":
			text, err = getTextFromSRT(responseBody)
		case "verbose_json":
			text, err = getTextFromVerboseJSON(responseBody)
		case "vtt":
			text, err = getTextFromVTT(responseBody)
		default:
			return openai.ErrorWrapper(errors.New("unexpected_response_format"), "unexpected_response_format", http.StatusInternalServerError)
		}
		if err != nil {
			return openai.ErrorWrapper(err, "get_text_from_body_err", http.StatusInternalServerError)
		}
		quota = openai.CountTokenText(text, audioModel)
		resp.Body = io.NopCloser(bytes.NewBuffer(responseBody))
	}
	quotaDelta := quota - preConsumedQuota
	if resp.StatusCode != http.StatusOK {
		if preConsumedQuota > 0 {
			// we need to roll back the pre-consumed quota
			defer func(ctx context.Context) {
				go func() {
					// negative means add quota back for token & user
					err := model.PostConsumeTokenQuota(tokenId, userQuota, quotaDelta, preConsumedQuota, true)
					if err != nil {
						common.LogError(ctx, fmt.Sprintf("error rollback pre-consumed quota: %s", err.Error()))
					}
				}()
			}(c.Request.Context())
		}
		return util.RelayErrorHandler(resp)
	}
	defer func(ctx context.Context) {
		go func() {
			useTimeSeconds := time.Now().Unix() - startTime.Unix()
			quotaDelta := quota - preConsumedQuota
			err = model.PostConsumeTokenQuota(tokenId, userQuota, quotaDelta, preConsumedQuota, true)
			if err != nil {
				common.SysError("error consuming token remain quota: " + err.Error())
			}
			err = model.CacheUpdateUserQuota(userId)
			if err != nil {
				common.SysError("error update user quota cache: " + err.Error())
			}
			if quota != 0 {
				multiplier := fmt.Sprintf("%s，分组倍率 %.2f", modelRatioString, groupRatio)
				logContent := fmt.Sprintf(" ")
				model.RecordConsumeLog(ctx, userId, channelId, quota, 0, ttsRequest.Model, tokenName, quota, logContent, tokenId, multiplier, userQuota, int(useTimeSeconds), false)
				model.UpdateUserUsedQuotaAndRequestCount(userId, quota)
				channelId := c.GetInt("channel_id")
				model.UpdateChannelUsedQuota(channelId, quota)
			}
		}()
	}(c.Request.Context())

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

func getTextFromVTT(body []byte) (string, error) {
	return getTextFromSRT(body)
}

func getTextFromVerboseJSON(body []byte) (string, error) {
	var whisperResponse openai.WhisperVerboseJSONResponse
	if err := json.Unmarshal(body, &whisperResponse); err != nil {
		return "", fmt.Errorf("unmarshal_response_body_failed err :%w", err)
	}
	return whisperResponse.Text, nil
}

func getTextFromSRT(body []byte) (string, error) {
	scanner := bufio.NewScanner(strings.NewReader(string(body)))
	var builder strings.Builder
	var textLine bool
	for scanner.Scan() {
		line := scanner.Text()
		if textLine {
			builder.WriteString(line)
			textLine = false
			continue
		} else if strings.Contains(line, "-->") {
			textLine = true
			continue
		}
	}
	if err := scanner.Err(); err != nil {
		return "", err
	}
	return builder.String(), nil
}

func getTextFromText(body []byte) (string, error) {
	return strings.TrimSuffix(string(body), "\n"), nil
}

func getTextFromJSON(body []byte) (string, error) {
	var whisperResponse openai.WhisperJSONResponse
	if err := json.Unmarshal(body, &whisperResponse); err != nil {
		return "", fmt.Errorf("unmarshal_response_body_failed err :%w", err)
	}
	return whisperResponse.Text, nil
}
