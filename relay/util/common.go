package util

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"one-api/common"
	"one-api/common/config"
	relaymodel "one-api/relay/model"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func ShouldDisableChannel(err *relaymodel.Error, statusCode int, channelAutoBan int) bool {
	if !config.AutomaticDisableChannelEnabled {
		return false
	}
	if channelAutoBan == 0 {
		return false
	}
	if err == nil {
		return false
	}
	if strings.Contains(err.Message, "This is not a chat model") {
		return false
	}
	if strings.Contains(err.Message, "Missing required parameter") {
		return false
	}
	if strings.Contains(err.Message, "An internal error has occurred. Our team has been alerted") {
		return false
	}
	if strings.Contains(err.Message, "This is a chat model") {
		return false
	}
	if strings.Contains(err.Message, "tools is not supported in this model") {
		return false
	}
	if statusCode == http.StatusUnauthorized {
		return true
	}
	if statusCode == http.StatusBadGateway {
		return true
	}
	if statusCode == http.StatusNotAcceptable {
		return true
	}
	if statusCode == http.StatusNotFound {
		return true
	}
	if statusCode == http.StatusPreconditionRequired {
		return true
	}
	switch err.Type {
	case "insufficient_quota":
		return true
	// https://docs.anthropic.com/claude/reference/errors
	case "authentication_error":
		return true
	case "permission_error":
		return true
	case "forbidden":
		return true
	}
	if err.Code == "invalid_api_key" || err.Code == "account_deactivated" {
		return true
	}
	if strings.HasPrefix(err.Message, "Your credit balance is too low") { // anthropic
		return true
	} else if strings.HasPrefix(err.Message, "This organization has been disabled.") {
		return true
	}
	if strings.Contains(err.Message, "ValidationException: Operation not allowed") {
		return true
	}
	//if strings.Contains(err.Message, "quota") {
	//	return true
	//}
	if strings.Contains(err.Message, "用户已被封禁") {
		return true
	}
	if strings.Contains(err.Message, "This is a Premium Model") {
		return true
	}
	if strings.Contains(err.Message, "Insufficient credits") {
		return true
	}
	if strings.Contains(err.Message, "credit") {
		return true
	}
	if strings.Contains(err.Message, "balance") {
		return true
	}
	return false
}
func ShouldEnableChannel(err error, openAIErr *relaymodel.Error) bool {
	if !config.AutomaticEnableChannelEnabled {
		return false
	}
	if err != nil {
		return false
	}
	if openAIErr != nil {
		return false
	}
	return true
}

func GetAPIVersion(c *gin.Context) string {
	query := c.Request.URL.Query()
	apiVersion := query.Get("api-version")
	if apiVersion == "" {
		apiVersion = c.GetString("api_version")
	}
	return apiVersion
}

type GeneralErrorResponse struct {
	Error    relaymodel.Error `json:"error"`
	Message  string           `json:"message"`
	Msg      string           `json:"msg"`
	Err      string           `json:"err"`
	ErrorMsg string           `json:"error_msg"`
	Header   struct {
		Message string `json:"message"`
	} `json:"header"`
	Response struct {
		Error struct {
			Message string `json:"message"`
		} `json:"error"`
	} `json:"response"`
}

func (e GeneralErrorResponse) ToMessage() string {
	if e.Error.Message != "" {
		return e.Error.Message
	}
	if e.Message != "" {
		return e.Message
	}
	if e.Msg != "" {
		return e.Msg
	}
	if e.Err != "" {
		return e.Err
	}
	if e.ErrorMsg != "" {
		return e.ErrorMsg
	}
	if e.Header.Message != "" {
		return e.Header.Message
	}
	if e.Response.Error.Message != "" {
		return e.Response.Error.Message
	}
	return ""
}

func RelayErrorHandler(resp *http.Response) (ErrorWithStatusCode *relaymodel.ErrorWithStatusCode) {
	if resp == nil {
		return &relaymodel.ErrorWithStatusCode{
			StatusCode: 500,
			Error: relaymodel.Error{
				Message: "resp is nil",
				Type:    "upstream_error",
				Code:    "bad_response",
			},
		}
	}
	ErrorWithStatusCode = &relaymodel.ErrorWithStatusCode{
		StatusCode: resp.StatusCode,
		Error: relaymodel.Error{
			Message: "",
			Type:    "upstream_error",
			Code:    "bad_response_status_code",
			Param:   strconv.Itoa(resp.StatusCode),
		},
	}
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return
	}

	err = resp.Body.Close()
	if err != nil {
		return
	}
	// 记录原始响应体，便于调试
	common.Errorf(context.Background(), "Error response body: %s", string(responseBody))
	var errResponse GeneralErrorResponse
	err = json.Unmarshal(responseBody, &errResponse)
	if err != nil {
		// 如果无法解析为标准格式，尝试解析为数组格式
		var errorArray []map[string]interface{}
		if json.Unmarshal(responseBody, &errorArray) == nil && len(errorArray) > 0 {
			// 提取第一个错误对象
			if errorObj, ok := errorArray[0]["error"].(map[string]interface{}); ok {
				if msg, ok := errorObj["message"].(string); ok {
					ErrorWithStatusCode.Error.Message = msg
					return
				}
			}
		}

		// 如果所有解析尝试都失败，直接使用原始响应体
		if len(responseBody) > 0 {
			ErrorWithStatusCode.Error.Message = string(responseBody)
		}
		return
	}
	if errResponse.Error.Message != "" {
		// OpenAI format error, so we override the default one
		ErrorWithStatusCode.Error = errResponse.Error
	} else {
		errorMessage := errResponse.ToMessage()
		if errorMessage != "" {
			ErrorWithStatusCode.Error.Message = errorMessage
		} else {
			// 如果所有已知字段都为空，直接使用原始响应体
			ErrorWithStatusCode.Error.Message = string(responseBody)
		}

	}
	if ErrorWithStatusCode.Error.Message == "" {
		ErrorWithStatusCode.Error.Message = fmt.Sprintf("bad response status code %d", resp.StatusCode)
	}
	return
}

func GetFullRequestURL(baseURL string, requestURL string, channelType int) string {
	fullRequestURL := fmt.Sprintf("%s%s", baseURL, requestURL)

	if strings.HasPrefix(baseURL, "https://gateway.ai.cloudflare.com") {
		switch channelType {
		case common.ChannelTypeOpenAI:
			fullRequestURL = fmt.Sprintf("%s%s", baseURL, strings.TrimPrefix(requestURL, "/v1"))
		case common.ChannelTypeAzure:
			fullRequestURL = fmt.Sprintf("%s%s", baseURL, strings.TrimPrefix(requestURL, "/openai/deployments"))
		}
	}
	return fullRequestURL
}

func GetAzureAPIVersion(c *gin.Context) string {
	query := c.Request.URL.Query()
	apiVersion := query.Get("api-version")
	if apiVersion == "" {
		apiVersion = c.GetString(common.ConfigKeyAPIVersion)
	}
	return apiVersion
}

func ResetStatusCode(openaiErr *relaymodel.ErrorWithStatusCode, statusCodeMappingStr string) {
	if statusCodeMappingStr == "" || statusCodeMappingStr == "{}" {
		return
	}
	statusCodeMapping := make(map[string]string)
	err := json.Unmarshal([]byte(statusCodeMappingStr), &statusCodeMapping)
	if err != nil {
		return
	}
	if openaiErr.StatusCode == http.StatusOK {
		return
	}

	codeStr := strconv.Itoa(openaiErr.StatusCode)
	if _, ok := statusCodeMapping[codeStr]; ok {
		intCode, _ := strconv.Atoi(statusCodeMapping[codeStr])
		openaiErr.StatusCode = intCode
	}
}
