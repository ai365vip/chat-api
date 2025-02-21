package controller

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/logger"
	"one-api/relay/channel/openai"
	"one-api/relay/constant"
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
	// 处理 system 消息格式
	println(meta.SupportsCacheControl)
	if textRequest.System != "" {
		systemContent, ok := textRequest.System.([]interface{})
		if ok {
			if !meta.SupportsCacheControl {

				// 不支持 cache_control，提取纯文本
				for _, item := range systemContent {
					if contentMap, ok := item.(map[string]interface{}); ok {
						if text, exists := contentMap["text"]; exists {
							textRequest.System = text.(string)
							break
						}
					}
				}
			}
		}
	}
	meta.IsStream = textRequest.Stream
	meta.AttemptsLog = c.GetString("attemptsLog")
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
	preConsumedTokens := promptTokens
	if config.PreConsumedQuota <= 0 {
		config.PreConsumedQuota = 500
	}
	if preConsumedTokens <= 0 {
		preConsumedTokens = config.PreConsumedQuota
	}
	BillingByRequestEnabled, _ := strconv.ParseBool(config.OptionMap["BillingByRequestEnabled"])
	ModelRatioEnabled, _ := strconv.ParseBool(config.OptionMap["ModelRatioEnabled"])
	preConsumedQuota = int(float64(preConsumedTokens) * ratio)
	if BillingByRequestEnabled {
		shouldUseModelRatio2 := !ModelRatioEnabled || (ModelRatioEnabled && meta.BillingEnabled)
		if shouldUseModelRatio2 {
			modelRatio2, ok := common.GetModelRatio2(meta.OriginModelName)
			if ok {
				ratio = modelRatio2 * groupRatio
				preConsumedQuota = int(ratio * config.QuotaPerUnit)
			}
		}
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
	adaptor.Init(meta)
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
	if meta.APIType == constant.APITypeGCP || meta.APIType == constant.APITypeAwsClaude || meta.APIType == constant.APITypeAnthropic {
		convertedRequest, err := adaptor.ConvertRequest(c, meta, textRequest)
		if err != nil {
			return openai.ErrorWrapper(err, "convert_request_failed", http.StatusInternalServerError)
		}
		jsonData, err := json.Marshal(convertedRequest)
		if err != nil {
			return openai.ErrorWrapper(err, "json_marshal_failed", http.StatusInternalServerError)
		}
		logger.Debugf(ctx, "converted request: \n%s", string(jsonData))
		requestBody = bytes.NewBuffer(jsonData)
	}

	// do responses
	startTime := time.Now()
	// do request
	resp, err := adaptor.DoRequest(c, meta, requestBody)
	if err != nil {
		logger.Errorf(ctx, "DoRequest failed: %s", err.Error())
		return openai.ErrorWrapper(err, "do_request_failed", http.StatusInternalServerError)
	}
	statusCodeMappingStr := c.GetString("status_code_mapping")
	if resp != nil {
		errorHappened := (resp.StatusCode != http.StatusOK) || (meta.IsStream && strings.HasPrefix(resp.Header.Get("Content-Type"), "application/json"))
		if errorHappened {
			logger.Errorf(ctx, "errorHappened is not nil: %+v", errorHappened)
			util.ReturnPreConsumedQuota(ctx, preConsumedQuota, meta.TokenId)
			openaiErr := util.RelayErrorHandler(resp)
			// reset status code 重置状态码
			util.ResetStatusCode(openaiErr, statusCodeMappingStr)
			return openaiErr
		}
	}

	// 执行 DoResponse 方法
	aitext, usage, respErr := adaptor.DoResponse(c, resp, meta)
	if respErr != nil {
		if meta.ChannelType == common.ChannelTypeAwsClaude {
			actualStatusCode := determineActualStatusCode(respErr.StatusCode, respErr.Message)
			// 更新 respErr 的状态码
			respErr.StatusCode = actualStatusCode
		}
		util.ReturnPreConsumedQuota(ctx, preConsumedQuota, meta.TokenId)
		util.ResetStatusCode(respErr, statusCodeMappingStr)
		return respErr
	}
	// 记录结束时间
	endTime := time.Now()

	// 计算执行时间（单位：秒）
	duration := int(endTime.Sub(startTime).Seconds())

	// post-consume quota
	go postConsumeQuota(ctx, usage, meta, textRequest, ratio, preConsumedQuota, modelRatio, groupRatio, aitext, duration)
	return nil
}
