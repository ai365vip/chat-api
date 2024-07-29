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
	"one-api/common/config"
	"one-api/common/ctxkey"
	"one-api/common/logger"
	"one-api/model"
	"one-api/relay/channel/openai"
	"one-api/relay/constant"
	"one-api/relay/helper"
	relaymodel "one-api/relay/model"
	"one-api/relay/util"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func isWithinRange(element string, value int) bool {
	if _, ok := constant.DalleGenerationImageAmounts[element]; !ok {
		return false
	}
	min := constant.DalleGenerationImageAmounts[element][0]
	max := constant.DalleGenerationImageAmounts[element][1]

	return value >= min && value <= max
}

func RelayImageHelper(c *gin.Context, relayMode int) *relaymodel.ErrorWithStatusCode {
	ctx := c.Request.Context()
	meta := util.GetRelayMeta(c)
	startTime := time.Now()
	imageRequest, err := getImageRequest(c, meta.Mode)
	if err != nil {
		logger.Errorf(ctx, "getImageRequest failed: %s", err.Error())
		return openai.ErrorWrapper(err, "invalid_image_request", http.StatusBadRequest)
	}

	// map model name
	var isModelMapped bool
	meta.OriginModelName = imageRequest.Model
	imageRequest.Model, isModelMapped = util.GetMappedModelName(imageRequest.Model, meta.ModelMapping)
	meta.ActualModelName = imageRequest.Model

	// model validation
	bizErr := validateImageRequest(imageRequest, meta)
	if bizErr != nil {
		return bizErr
	}
	imageCostRatio, err := getImageCostRatio(imageRequest)
	if err != nil {
		return openai.ErrorWrapper(err, "get_image_cost_ratio_failed", http.StatusInternalServerError)
	}

	var requestBody io.Reader
	if strings.ToLower(c.GetString(ctxkey.ContentType)) == "application/json" &&
		isModelMapped || meta.ChannelType == common.ChannelTypeAzure { // make Azure channel request body // make Azure channel request body
		jsonStr, err := json.Marshal(imageRequest)
		if err != nil {
			return openai.ErrorWrapper(err, "marshal_image_request_failed", http.StatusInternalServerError)
		}
		requestBody = bytes.NewBuffer(jsonStr)
	} else {
		requestBody = c.Request.Body
	}

	adaptor := helper.GetAdaptor(meta.APIType)
	if adaptor == nil {
		return openai.ErrorWrapper(fmt.Errorf("invalid api type: %d", meta.APIType), "invalid_api_type", http.StatusBadRequest)
	}

	switch meta.ChannelType {
	case common.ChannelTypeAli:
		fallthrough
	case common.ChannelTypeBaidu:
		fallthrough
	case common.ChannelTypeZhipu:
		finalRequest, err := adaptor.ConvertImageRequest(imageRequest)
		if err != nil {
			return openai.ErrorWrapper(err, "convert_image_request_failed", http.StatusInternalServerError)
		}

		jsonStr, err := json.Marshal(finalRequest)
		if err != nil {
			return openai.ErrorWrapper(err, "marshal_image_request_failed", http.StatusInternalServerError)
		}
		requestBody = bytes.NewBuffer(jsonStr)
	}

	modelRatio := common.GetModelRatio(imageRequest.Model)
	groupRatio := common.GetGroupRatio(meta.Group)
	ratio := modelRatio * groupRatio
	userQuota, err := model.CacheGetUserQuota(c, meta.UserId)
	if err != nil {
		return openai.ErrorWrapper(err, "get_user_quota_failed", http.StatusInternalServerError)
	}
	sizeRatio := 1.0
	modelRatioString := ""
	quota := 0
	token, err := model.GetTokenById(meta.TokenId)
	if err != nil {
		log.Println("获取token出错:", err)
	}
	BillingByRequestEnabled, _ := strconv.ParseBool(config.OptionMap["BillingByRequestEnabled"])
	ModelRatioEnabled, _ := strconv.ParseBool(config.OptionMap["ModelRatioEnabled"])
	quota = int(ratio*sizeRatio*imageCostRatio*1000) * imageRequest.N
	modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)

	if BillingByRequestEnabled {
		shouldUseModelRatio2 := !ModelRatioEnabled || (ModelRatioEnabled && token.BillingEnabled)
		if shouldUseModelRatio2 {
			modelRatio2, ok := common.GetModelRatio2(imageRequest.Model)
			if ok {
				ratio = modelRatio2 * groupRatio
				quota = int(ratio * config.QuotaPerUnit)
				modelRatioString = "按次计费"
			}
		}
	}

	if userQuota-quota < 0 {
		return openai.ErrorWrapper(errors.New("user quota is not enough"), "insufficient_user_quota", http.StatusForbidden)
	}

	// do request
	resp, err := adaptor.DoRequest(c, meta, requestBody)
	if err != nil {
		logger.Errorf(ctx, "DoRequest failed: %s", err.Error())
		return openai.ErrorWrapper(err, "do_request_failed", http.StatusInternalServerError)
	}

	defer func(ctx context.Context) {
		useTimeSeconds := time.Now().Unix() - startTime.Unix()
		if resp != nil && resp.StatusCode != http.StatusOK {
			return
		}
		err := model.PostConsumeTokenQuota(meta.TokenId, quota)
		if err != nil {
			common.SysError("error consuming token remain quota: " + err.Error())
		}
		err = model.CacheDecreaseUserQuota(ctx, meta.UserId, quota)
		if err != nil {
			logger.Error(ctx, "decrease_user_quota_failed"+err.Error())
		}
		//err = model.CacheUpdateUserQuota(c, meta.UserId)
		//if err != nil {
		//	common.SysError("error update user quota cache: " + err.Error())
		//}
		if quota != 0 {
			tokenName := c.GetString("token_name")
			multiplier := fmt.Sprintf(" %s，分组倍率 %.2f", modelRatioString, groupRatio)
			logContent := " "
			model.RecordConsumeLog(ctx, meta.UserId, meta.ChannelId, meta.ChannelName, 0, 0, imageRequest.Model, tokenName, quota, logContent, meta.TokenId, multiplier, userQuota, int(useTimeSeconds), false, meta.AttemptsLog, meta.RelayIp)
			model.UpdateUserUsedQuotaAndRequestCount(meta.UserId, quota)
			model.UpdateChannelUsedQuota(meta.ChannelId, quota)
		}
	}(c.Request.Context())

	// do response
	_, _, respErr := adaptor.DoResponse(c, resp, meta)
	if respErr != nil {
		logger.Errorf(ctx, "respErr is not nil: %+v", respErr)
		return respErr
	}

	return nil
}

func ImagesEditsHandler(c *gin.Context, resp *http.Response) (*relaymodel.ErrorWithStatusCode, *relaymodel.Usage) {
	c.Writer.WriteHeader(resp.StatusCode)
	for k, v := range resp.Header {
		c.Writer.Header().Set(k, v[0])
	}

	if _, err := io.Copy(c.Writer, resp.Body); err != nil {
		return openai.ErrorWrapper(err, "copy_response_body_failed", http.StatusInternalServerError), nil
	}
	defer resp.Body.Close()

	return nil, nil
}
