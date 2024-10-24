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
	"one-api/relay/helper"
	"one-api/relay/model"
	"one-api/relay/util"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func RelayTextHelper(c *gin.Context) *model.ErrorWithStatusCode {
	modelMap := map[string]string{
		"claude-3-haiku": "claude-3-haiku-20240307",
		"claude-3-opus":  "claude-3-opus-20240229",
		"gpt-4-vision":   "gpt-4-turbo",
		"glm-v4":         "glm-4v",
	}
	ctx := c.Request.Context()
	meta := util.GetRelayMeta(c)
	// get & validate textRequest
	textRequest, err := getAndValidateTextRequest(c, meta.Mode)
	if err != nil {
		logger.Errorf(ctx, "getAndValidateTextRequest failed: %s", err.Error())
		return openai.ErrorWrapper(err, "invalid_text_request", http.StatusBadRequest)
	}
	meta.IsClaude = false
	meta.IsStream = textRequest.Stream
	meta.OriginModelName = textRequest.Model
	textRequest.Model, _ = util.GetMappedModelName(textRequest.Model, meta.ModelMapping)
	meta.ActualModelName = textRequest.Model
	// get model ratio & group ratio
	modelRatio := common.GetModelRatio(textRequest.Model)
	groupRatio := common.GetGroupRatio(meta.Group)
	promptTokens := getPromptTokens(textRequest, meta.Mode)
	meta.PromptTokens = promptTokens
	ratio := modelRatio * groupRatio
	preConsumedTokens := promptTokens
	if config.PreConsumedQuota <= 0 {
		config.PreConsumedQuota = 500
	}
	if preConsumedTokens <= 0 {
		preConsumedTokens = config.PreConsumedQuota
	}
	BillingByRequestEnabled, _ := strconv.ParseBool(config.OptionMap["BillingByRequestEnabled"])
	ModelRatioEnabled, _ := strconv.ParseBool(config.OptionMap["ModelRatioEnabled"])
	preConsumedQuota := int(float64(preConsumedTokens) * ratio)
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
		return bizErr
	}

	adaptor := helper.GetAdaptor(meta.APIType)
	if adaptor == nil {
		return openai.ErrorWrapper(fmt.Errorf("invalid api type: %d", meta.APIType), "invalid_api_type", http.StatusBadRequest)
	}
	adaptor.Init(meta)
	// get request body
	var requestBody io.Reader
	if meta.ActualModelName == "gpt-4-vision" || meta.ActualModelName == "claude-3-haiku" ||
		meta.ActualModelName == "claude-3-opus" ||
		meta.ActualModelName == "glm-v4" {
		var buf bytes.Buffer
		_, err := buf.ReadFrom(c.Request.Body)
		if err != nil {
			return openai.ErrorWrapper(err, "failed_to_read_request_body", http.StatusInternalServerError)
		}
		originalRequestBody := buf.Bytes()

		// 反序列化到TextRequest结构体
		var textRequest model.GeneralOpenAIRequest
		if err := json.Unmarshal(originalRequestBody, &textRequest); err != nil {
			return openai.ErrorWrapper(err, "failed to unmarshal request body", http.StatusInternalServerError)
		}
		if modelName, ok := modelMap[meta.ActualModelName]; ok {
			textRequest.Model = modelName
		}

		for i, msg := range textRequest.Messages {

			contentStr := msg.Content.(string)
			// 正则查找URL并构建新的消息内容
			newContent, err := createNewContentWithImages(contentStr)
			if err != nil {
				return openai.ErrorWrapper(err, "create_new_content_error", http.StatusInternalServerError)
			}
			newContentBytes, err := json.Marshal(newContent)
			if err != nil {
				logger.Errorf(ctx, "cannot marshal new content: %v", err)
			}
			textRequest.Messages[i].Content = json.RawMessage(newContentBytes)
		}
		convertedRequest, err := adaptor.ConvertRequest(c, meta, &textRequest)
		if err != nil {
			return openai.ErrorWrapper(err, "convert_request_failed", http.StatusInternalServerError)
		}
		jsonData, err := json.Marshal(convertedRequest)
		if err != nil {
			return openai.ErrorWrapper(err, "json_marshal_failed", http.StatusInternalServerError)
		}
		requestBody = bytes.NewBuffer(jsonData)
	} else {
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

	// do response
	startTime := time.Now()
	// do request
	resp, err := adaptor.DoRequest(c, meta, requestBody)

	if err != nil {
		logger.Errorf(ctx, "DoRequest failed: %s", err.Error())
		return openai.ErrorWrapper(err, "do_request_failed", http.StatusInternalServerError)
	}

	statusCodeMappingStr := c.GetString("status_code_mapping")
	if isErrorHappened(meta, resp) {
		util.ReturnPreConsumedQuota(ctx, preConsumedQuota, meta.TokenId)
		openaiErr := util.RelayErrorHandler(resp)
		// reset status code 重置状态码
		util.ResetStatusCode(openaiErr, statusCodeMappingStr)
		return openaiErr
	}

	// 执行 DoResponse 方法
	aitext, usage, respErr := adaptor.DoResponse(c, resp, meta)
	if respErr != nil {
		if meta.ChannelType == common.ChannelTypeAwsClaude {
			actualStatusCode := determineActualStatusCode(respErr.StatusCode, respErr.Message)
			// 更新 respErr 的状态码
			respErr.StatusCode = actualStatusCode
			// 使用实际的状态码
			c.Status(actualStatusCode)
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
func createNewContentWithImages(contentStr string) ([]interface{}, error) {
	re := regexp.MustCompile(`http[s]?:\/\/[^\s]+`)
	matches := re.FindAllString(contentStr, -1)
	description := re.ReplaceAllString(contentStr, "")

	newContent := []interface{}{
		openai.OpenAIMessageContent{Type: "text", Text: strings.TrimSpace(description)},
	}
	// 如果没有找到匹配的URL，直接返回已有结果和nil错误
	if len(matches) == 0 {
		return newContent, nil
	}

	for _, url := range matches {
		newContent = append(newContent, openai.MediaMessageImage{
			Type: "image_url",
			ImageUrl: openai.MessageImageUrl{
				Url:    url,
				Detail: "high",
			},
		})
	}
	return newContent, nil
}
