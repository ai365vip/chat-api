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

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(requestBody)
	if err != nil {
		return openai.ErrorWrapper(err, "Failed to read request body", http.StatusInternalServerError)
	}
	requestBody = buf

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
	//sizeRatio := 1.0
	modelRatioString := ""
	var quota int = 0
	token, err := model.GetTokenById(meta.TokenId)
	if err != nil {
		log.Println("获取token出错:", err)
	}
	BillingByRequestEnabled, _ := strconv.ParseBool(config.OptionMap["BillingByRequestEnabled"])
	ModelRatioEnabled, _ := strconv.ParseBool(config.OptionMap["ModelRatioEnabled"])
	modelpromptQuota := float64(modelRatio * imageCostRatio * 1000 / config.QuotaPerUnit)

	// 针对 gpt-image-1 模型，在价格描述中显示质量信息
	qualityDesc := ""
	if imageRequest.Model == "gpt-image-1" && imageRequest.Quality != "" {
		qualityDesc = fmt.Sprintf(" (%s)", strings.ToUpper(imageRequest.Quality[:1])+imageRequest.Quality[1:])
	}

	modelQuota := fmt.Sprintf("%s%s $%0.4f/ image", imageRequest.Size, qualityDesc, modelpromptQuota)
	if imageRequest.Model == "gpt-image-1" {
		modelQuota = fmt.Sprintf("%s%s / image", imageRequest.Size, qualityDesc)

	}
	quota = int(ratio*imageCostRatio*1000) * imageRequest.N
	modelRatioString = fmt.Sprintf("模型倍率 %.2f", modelRatio)

	// 如果当前请求特别指定了按请求计费
	if BillingByRequestEnabled {
		shouldUseModelRatio2 := !ModelRatioEnabled || (ModelRatioEnabled && token.BillingEnabled)
		if shouldUseModelRatio2 {
			modelRatio2, ok := common.GetModelRatio2(imageRequest.Model)
			if ok {
				ratio = modelRatio2 * groupRatio
				quota = int(ratio * config.QuotaPerUnit)
				modelRatioString = "按次计费"
				modelQuota = fmt.Sprintf("按次计费 %.2f", modelRatio2)
			}
		}
	}

	if userQuota-quota < 0 {
		return openai.ErrorWrapper(errors.New("user quota is not enough"), "insufficient_user_quota", http.StatusForbidden)
	}
	if groupRatio != 1 {
		modelQuota += fmt.Sprintf("。分组倍率%f", groupRatio)
	}
	// do request
	resp, err := adaptor.DoRequest(c, meta, requestBody)
	if err != nil {
		logger.Errorf(ctx, "DoRequest failed: %s", err.Error())
		return openai.ErrorWrapper(err, "do_request_failed", http.StatusInternalServerError)
	}

	// 创建一个变量来存储可能的token使用信息
	var tokenUsage *relaymodel.ImageTokenUsage = nil
	var promptTokens int = 0
	var completionTokens int = 0
	var promptquota float64 = 0
	var completionquota float64 = 0
	defer func(ctx context.Context) {
		useTimeSeconds := time.Now().Unix() - startTime.Unix()
		if resp != nil && resp.StatusCode != http.StatusOK {
			return
		}

		var finalQuota int = quota
		var extraInfo string = ""

		// 处理GPT Image 1模型的token计费
		if tokenUsage != nil && imageRequest.Model == "gpt-image-1" {
			// 计算各类型token的费用（美元）
			textInputCost := float64(tokenUsage.InputTokenDetails.TextTokens) * constant.GPTImage1TokenPrices.TextInputPrice
			imageInputCost := float64(tokenUsage.InputTokenDetails.ImageTokens) * constant.GPTImage1TokenPrices.ImageInputPrice
			imageOutputCost := float64(tokenUsage.OutputTokens) * constant.GPTImage1TokenPrices.ImageOutputPrice

			// 计算token总费用（美元）
			tokenTotalCost := textInputCost + imageInputCost + imageOutputCost
			// 转换为系统内部的配额单位 (修改这里，确保至少有1个配额)
			tokenQuota := int(tokenTotalCost * float64(groupRatio))
			// 将token配额加到基础图像生成配额上
			finalQuota = tokenQuota
			promptTokens = tokenUsage.InputTokenDetails.TextTokens
			completionTokens = tokenUsage.OutputTokens
			promptquota = textInputCost
			completionquota = imageOutputCost
			extraInfo = fmt.Sprintf("Token计费: 文本输入: %d ($%.5f), 图像输入: %d ($%.5f), 图像输出: %d ($%.5f), Token总费用: $%.5f",
				promptTokens, promptquota/config.QuotaPerUnit,
				tokenUsage.InputTokenDetails.ImageTokens, imageInputCost/config.QuotaPerUnit,
				completionTokens, completionquota/config.QuotaPerUnit,
				tokenTotalCost/config.QuotaPerUnit)

			modelQuota += extraInfo
			logger.Info(ctx, fmt.Sprintf("用户 %d 使用 gpt-image-1 模型，基础图像费用：%d，token费用：%d，总费用：%d，token详情：%s",
				meta.UserId, quota, tokenQuota, finalQuota, extraInfo))
		}

		err := model.PostConsumeTokenQuota(meta.TokenId, finalQuota)
		if err != nil {
			logger.SysError("error consuming token remain quota: " + err.Error())
		}
		err = model.CacheDecreaseUserQuota(ctx, meta.UserId, finalQuota)
		if err != nil {
			logger.Error(ctx, "decrease_user_quota_failed"+err.Error())
		}
		log.Println(modelRatioString)
		if imageRequest.Model == "dall-e-3" || imageRequest.Model == "dall-e-2" {
			modelQuota = fmt.Sprintf("模型倍率 %.2f", modelRatio)
		}
		if finalQuota != 0 {
			tokenName := c.GetString("token_name")
			//multiplier := fmt.Sprintf(" %s，分组倍率 %.2f", modelRatioString, groupRatio)
			logContent := " "
			model.RecordConsumeLog(ctx, meta.UserId, meta.ChannelId, meta.ChannelName, promptTokens, completionTokens, imageRequest.Model, tokenName, finalQuota, logContent, meta.TokenId, modelQuota, userQuota, int(useTimeSeconds), false, meta.AttemptsLog, meta.RelayIp)
			model.UpdateUserUsedQuotaAndRequestCount(meta.UserId, finalQuota)
			model.UpdateChannelUsedQuota(meta.ChannelId, finalQuota)
		}
	}(c.Request.Context())

	// do response
	// 如果需要处理token使用信息，修改DoResponse以返回相关数据
	_, usageData, respErr := adaptor.DoResponse(c, resp, meta)
	if respErr != nil {
		logger.Errorf(ctx, "respErr is not nil: %+v", respErr)
		return respErr
	}
	// 将model.Usage转换为relaymodel.ImageTokenUsage
	if usageData != nil && imageRequest.Model == "gpt-image-1" {

		// 创建ImageTokenUsage结构体实例
		tokenUsage = &relaymodel.ImageTokenUsage{
			InputTokens:  int(usageData.PromptTokens),
			OutputTokens: int(usageData.CompletionTokens),
			TotalTokens:  int(usageData.TotalTokens),
		}

		// 如果存在详细的token信息，则填充
		if usageData.PromptTokensDetails != nil {
			tokenUsage.InputTokenDetails.TextTokens = int(usageData.PromptTokensDetails.TextTokens)
			tokenUsage.InputTokenDetails.ImageTokens = int(usageData.PromptTokensDetails.ImageTokens)
		} else {
			// 如果没有详细信息，假设所有提示tokens都是文本tokens
			tokenUsage.InputTokenDetails.TextTokens = int(usageData.PromptTokens)
			tokenUsage.InputTokenDetails.ImageTokens = 0
		}

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
