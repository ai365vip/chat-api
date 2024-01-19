package util

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"one-api/common"
	"one-api/relay/channel/openai"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func ShouldDisableChannel(err *openai.Error, statusCode int) bool {
	if !common.AutomaticDisableChannelEnabled {
		return false
	}
	if err == nil {
		return false
	}
	if statusCode == http.StatusUnauthorized {
		return true
	}
	if err.Type == "insufficient_quota" ||
		err.Code == "invalid_api_key" ||
		err.Code == "account_deactivated" ||
		err.Code == "billing_not_active" ||
		(err.Type == "requests" && strings.Contains(err.Message, "You have exceeded your rate limit.")) {
		return true
	}
	return false
}

type GeneralErrorResponse struct {
	Error    openai.Error `json:"error"`
	Message  string       `json:"message"`
	Msg      string       `json:"msg"`
	Err      string       `json:"err"`
	ErrorMsg string       `json:"error_msg"`
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

func RelayErrorHandler(resp *http.Response) (ErrorWithStatusCode *openai.ErrorWithStatusCode) {
	ErrorWithStatusCode = &openai.ErrorWithStatusCode{
		StatusCode: resp.StatusCode,
		Error: openai.Error{
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
	var errResponse GeneralErrorResponse
	err = json.Unmarshal(responseBody, &errResponse)
	if err != nil {
		return
	}
	if errResponse.Error.Message != "" {
		// OpenAI format error, so we override the default one
		ErrorWithStatusCode.Error = errResponse.Error
	} else {
		ErrorWithStatusCode.Error.Message = errResponse.ToMessage()
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

func GetAPIVersion(c *gin.Context) string {
	query := c.Request.URL.Query()
	apiVersion := query.Get("api-version")
	if apiVersion == "" {
		apiVersion = c.GetString("api_version")
	}
	return apiVersion
}
