package controller

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"one-api/common"
	"one-api/common/logger"
	dbmodel "one-api/model"
	"one-api/relay/channel/openai"
	"one-api/relay/helper"
	"one-api/relay/model"
	"one-api/relay/util"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func RelayClaude(c *gin.Context) *model.ErrorWithStatusCode {

	ctx := c.Request.Context()
	meta := util.GetRelayMeta(c)
	// get & validate textRequest
	meta.IsClaude = true
	textRequest, err := getAndValidateTextRequest(c, meta.Mode)
	if err != nil {
		logger.Errorf(ctx, "getAndValidateTextRequest failed: %s", err.Error())
		return openai.ErrorWrapper(err, "invalid_text_request", http.StatusBadRequest)
	}

	meta.IsStream = textRequest.Stream

	// map model name
	var isModelMapped bool
	meta.OriginModelName = textRequest.Model
	textRequest.Model, isModelMapped = util.GetMappedModelName(textRequest.Model, meta.ModelMapping)
	meta.ActualModelName = textRequest.Model
	// get model ratio & group ratio
	modelRatio := common.GetModelRatio(textRequest.Model)
	groupRatio := common.GetGroupRatio(meta.Group)
	promptTokens := getPromptTokens(textRequest, meta.Mode)
	meta.PromptTokens = promptTokens
	ratio := modelRatio * groupRatio
	preConsumedQuota := 0
	preConsumedTokens := common.PreConsumedQuota
	if textRequest.MaxTokens != 0 {
		preConsumedTokens = promptTokens + textRequest.MaxTokens
	}
	token, err := dbmodel.GetTokenById(meta.TokenId)
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

	preConsumedQuota, bizErr := preConsumeQuota(ctx, preConsumedQuota, meta)
	if bizErr != nil {
		logger.Warnf(ctx, "preConsumeQuota failed: %+v", *bizErr)
		return bizErr
	}

	adaptor := helper.GetAdaptor(meta.APIType)
	if adaptor == nil {
		return openai.ErrorWrapper(fmt.Errorf("invalid api type: %d", meta.APIType), "invalid_api_type", http.StatusBadRequest)
	}

	// get request body
	var requestBody io.Reader
	if isModelMapped {
		jsonStr, err := json.Marshal(textRequest)
		if err != nil {
			return openai.ErrorWrapper(err, "json_marshal_failed", http.StatusInternalServerError)
		}
		requestBody = bytes.NewBuffer(jsonStr)
	} else {
		requestBody = c.Request.Body
	}
	// do responses
	startTime := time.Now()
	// do request
	resp, err := adaptor.DoRequest(c, meta, requestBody)
	if err != nil {
		logger.Errorf(ctx, "DoRequest failed: %s", err.Error())
		return openai.ErrorWrapper(err, "do_request_failed", http.StatusInternalServerError)
	}
	meta.IsStream = meta.IsStream || strings.HasPrefix(resp.Header.Get("Content-Type"), "text/event-stream")
	if resp != nil && resp.StatusCode != http.StatusOK {
		util.ReturnPreConsumedQuota(ctx, preConsumedQuota, meta.TokenId)
		return util.RelayErrorHandler(resp)
	}

	// 执行 DoResponse 方法
	aitext, usage, respErr := adaptor.DoResponse(c, resp, meta)

	// 记录结束时间
	endTime := time.Now()

	// 计算执行时间（单位：秒）
	duration := int(endTime.Sub(startTime).Seconds())
	if respErr != nil {
		logger.Errorf(ctx, "respErr is not nil: %+v", respErr)
		util.ReturnPreConsumedQuota(ctx, preConsumedQuota, meta.TokenId)
		return respErr
	}
	// post-consume quota
	go postConsumeQuota(ctx, usage, meta, textRequest, ratio, preConsumedQuota, modelRatio, groupRatio, aitext, duration)
	return nil
}
