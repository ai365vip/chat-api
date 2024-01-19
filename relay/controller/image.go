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
	"one-api/relay/util"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func isWithinRange(element string, value int) bool {
	if _, ok := common.DalleGenerationImageAmounts[element]; !ok {
		return false
	}
	min := common.DalleGenerationImageAmounts[element][0]
	max := common.DalleGenerationImageAmounts[element][1]

	return value >= min && value <= max
}

func RelayImageHelper(c *gin.Context, relayMode int) *openai.ErrorWithStatusCode {
	imageModel := "dall-e-2"
	imageSize := "1024x1024"

	tokenId := c.GetInt("token_id")
	channelType := c.GetInt("channel")
	channelId := c.GetInt("channel_id")
	userId := c.GetInt("id")
	group := c.GetString("group")
	consumeQuota := c.GetBool("consume_quota")

	var imageRequest openai.ImageRequest
	if consumeQuota {
		err := common.UnmarshalBodyReusable(c, &imageRequest)
		if err != nil {
			return openai.ErrorWrapper(err, "bind_request_body_failed", http.StatusBadRequest)
		}
	}

	if imageRequest.N == 0 {
		imageRequest.N = 1
	}

	// Size validation
	if imageRequest.Size != "" {
		imageSize = imageRequest.Size
	}

	// Model validation
	if imageRequest.Model != "" {
		imageModel = imageRequest.Model
	}

	imageCostRatio, hasValidSize := common.DalleSizeRatios[imageModel][imageSize]

	// Check if model is supported
	if hasValidSize {
		if imageRequest.Quality == "hd" && imageModel == "dall-e-3" {
			if imageSize == "1024x1024" {
				imageCostRatio *= 2
			} else {
				imageCostRatio *= 1.5
			}
		}
	} else {
		return openai.ErrorWrapper(errors.New("size not supported for this image model"), "size_not_supported", http.StatusBadRequest)
	}

	// Prompt validation
	if imageRequest.Prompt == "" {
		return openai.ErrorWrapper(errors.New("prompt is required"), "prompt_missing", http.StatusBadRequest)
	}

	// Check prompt length
	if len(imageRequest.Prompt) > common.DalleImagePromptLengthLimitations[imageModel] {
		return openai.ErrorWrapper(errors.New("prompt is too long"), "prompt_too_long", http.StatusBadRequest)
	}

	// Number of generated images validation
	if isWithinRange(imageModel, imageRequest.N) == false {
		// channel not azure
		if channelType != common.ChannelTypeAzure {
			return openai.ErrorWrapper(errors.New("invalid value of n"), "n_not_within_range", http.StatusBadRequest)
		}
	}

	// map model name
	modelMapping := c.GetString("model_mapping")
	isModelMapped := false
	if modelMapping != "" {
		modelMap := make(map[string]string)
		err := json.Unmarshal([]byte(modelMapping), &modelMap)
		if err != nil {
			return openai.ErrorWrapper(err, "unmarshal_model_mapping_failed", http.StatusInternalServerError)
		}
		if modelMap[imageModel] != "" {
			imageModel = modelMap[imageModel]
			isModelMapped = true
		}
	}
	baseURL := common.ChannelBaseURLs[channelType]
	requestURL := c.Request.URL.String()
	if c.GetString("base_url") != "" {
		baseURL = c.GetString("base_url")
	}
	fullRequestURL := util.GetFullRequestURL(baseURL, requestURL, channelType)
	if channelType == common.ChannelTypeAzure {
		// https://learn.microsoft.com/en-us/azure/ai-services/openai/dall-e-quickstart?tabs=dalle3%2Ccommand-line&pivots=rest-api
		apiVersion := util.GetAPIVersion(c)
		// https://{resource_name}.openai.azure.com/openai/deployments/dall-e-3/images/generations?api-version=2023-06-01-preview
		fullRequestURL = fmt.Sprintf("%s/openai/deployments/%s/images/generations?api-version=%s", baseURL, imageModel, apiVersion)
	}

	var requestBody io.Reader
	if isModelMapped || channelType == common.ChannelTypeAzure { // make Azure channel request body
		jsonStr, err := json.Marshal(imageRequest)
		if err != nil {
			return openai.ErrorWrapper(err, "marshal_text_request_failed", http.StatusInternalServerError)
		}
		requestBody = bytes.NewBuffer(jsonStr)
	} else {
		requestBody = c.Request.Body
	}
	sizeRatio := 1.0
	if imageRequest.Size == "256x256" {
		sizeRatio = 1
	} else if imageRequest.Size == "512x512" {
		sizeRatio = 1.125
	} else if imageRequest.Size == "1024x1024" {
		sizeRatio = 1.25
	} else if imageRequest.Size == "1024x1792" || imageRequest.Size == "1792x1024" {
		sizeRatio = 2.5
	}
	modelRatio := common.GetModelRatio(imageRequest.Model)
	groupRatio := common.GetGroupRatio(group)
	ratio := modelRatio * groupRatio
	userQuota, err := model.CacheGetUserQuota(userId)

	modelRatioString := ""
	quota := 0
	token, err := model.GetTokenById(tokenId)
	if err != nil {
		log.Println("获取token出错:", err)
	}
	BillingByRequestEnabled, _ := strconv.ParseBool(common.OptionMap["BillingByRequestEnabled"])
	ModelRatioEnabled, _ := strconv.ParseBool(common.OptionMap["ModelRatioEnabled"])

	if BillingByRequestEnabled && ModelRatioEnabled {
		if token.BillingEnabled {
			modelRatio2, ok := common.GetModelRatio2(imageRequest.Model)
			if !ok { // 如果 ModelRatio2 中没有对应的 name，则继续使用之前的 quota 值
				quota = int(ratio*sizeRatio*imageCostRatio*1000) * imageRequest.N
				modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
			} else {
				ratio = modelRatio2 * groupRatio
				quota = int(ratio * common.QuotaPerUnit)
				modelRatioString = fmt.Sprintf("按次计费")
			}
		} else {
			quota = int(ratio*sizeRatio*imageCostRatio*1000) * imageRequest.N
			modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
		}
	} else if BillingByRequestEnabled {
		modelRatio2, ok := common.GetModelRatio2(imageRequest.Model)
		if !ok { // 如果 ModelRatio2 中没有对应的 name，则继续使用之前的 quota 值
			quota = int(ratio*sizeRatio*imageCostRatio*1000) * imageRequest.N
			modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
		} else {
			ratio = modelRatio2 * groupRatio
			quota = int(ratio * 1 * 500000)
			modelRatioString = fmt.Sprintf("按次计费")
		}
	} else {
		quota = int(ratio*sizeRatio*imageCostRatio*1000) * imageRequest.N
		modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)
	}

	if consumeQuota && userQuota-quota < 0 {
		return openai.ErrorWrapper(errors.New("user quota is not enough"), "insufficient_user_quota", http.StatusForbidden)
	}

	req, err := http.NewRequest(c.Request.Method, fullRequestURL, requestBody)
	if err != nil {
		return openai.ErrorWrapper(err, "new_request_failed", http.StatusInternalServerError)
	}
	tok := c.Request.Header.Get("Authorization")
	if channelType == common.ChannelTypeAzure { // Azure authentication
		tok = strings.TrimPrefix(tok, "Bearer ")
		req.Header.Set("api-key", tok)
	} else {
		req.Header.Set("Authorization", tok)
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
	var textResponse openai.ImageResponse

	defer func(ctx context.Context) {
		if resp.StatusCode != http.StatusOK {
			return
		}
		err := model.PostConsumeTokenQuota(tokenId, userQuota, quota, 0, true)
		if err != nil {
			common.SysError("error consuming token remain quota: " + err.Error())
		}
		err = model.CacheUpdateUserQuota(userId)
		if err != nil {
			common.SysError("error update user quota cache: " + err.Error())
		}
		if quota != 0 {
			tokenName := c.GetString("token_name")
			multiplier := fmt.Sprintf(" %s，分组倍率 %.2f", modelRatioString, groupRatio)
			logContent := fmt.Sprintf(" ")
			model.RecordConsumeLog(ctx, userId, channelId, 0, 0, imageRequest.Model, tokenName, quota, logContent, tokenId, multiplier, userQuota)
			model.UpdateUserUsedQuotaAndRequestCount(userId, quota)
			channelId := c.GetInt("channel_id")
			model.UpdateChannelUsedQuota(channelId, quota)
		}
	}(c.Request.Context())

	responseBody, err := io.ReadAll(resp.Body)

	if err != nil {
		return openai.ErrorWrapper(err, "read_response_body_failed", http.StatusInternalServerError)
	}
	err = resp.Body.Close()
	if err != nil {
		return openai.ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError)
	}
	err = json.Unmarshal(responseBody, &textResponse)
	if err != nil {
		return openai.ErrorWrapper(err, "unmarshal_response_body_failed", http.StatusInternalServerError)
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
