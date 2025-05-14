package openai

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"one-api/relay/model"

	"github.com/gin-gonic/gin"
)

// 添加ImageResponseWithUsage结构体
type ImageResponseWithUsage struct {
	Created int64 `json:"created"`
	Data    []struct {
		URL string `json:"url"`
	} `json:"data"`
	Usage struct {
		InputTokens       int `json:"input_tokens"`
		InputTokenDetails struct {
			ImageTokens int `json:"image_tokens"`
			TextTokens  int `json:"text_tokens"`
		} `json:"input_tokens_details"`
		OutputTokens int `json:"output_tokens"`
		TotalTokens  int `json:"total_tokens"`
	} `json:"usage,omitempty"`
}

func ImageHandler(c *gin.Context, resp *http.Response) (*model.ErrorWithStatusCode, *model.Usage) {
	var imageResponse ImageResponseWithUsage
	responseBodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return ErrorWrapper(err, "read_response_body_failed", http.StatusInternalServerError), nil
	}
	err = resp.Body.Close()
	if err != nil {
		return ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError), nil
	}
	err = json.Unmarshal(responseBodyBytes, &imageResponse)
	if err != nil {
		return ErrorWrapper(err, "unmarshal_response_body_failed", http.StatusInternalServerError), nil
	}

	var usage *model.Usage = nil

	if imageResponse.Usage.TotalTokens > 0 { // Check if usage block exists
		usage = &model.Usage{
			PromptTokens:     int(imageResponse.Usage.InputTokens),
			CompletionTokens: int(imageResponse.Usage.OutputTokens),
			TotalTokens:      int(imageResponse.Usage.TotalTokens),
		}
		// Populate detailed prompt tokens if available (for gpt-image-1)
		if imageResponse.Usage.InputTokenDetails.TextTokens > 0 || imageResponse.Usage.InputTokenDetails.ImageTokens > 0 {
			usage.PromptTokensDetails = &model.PromptTokensDetails{
				TextTokens:  int(imageResponse.Usage.InputTokenDetails.TextTokens),
				ImageTokens: int(imageResponse.Usage.InputTokenDetails.ImageTokens),
			}
		}
	}

	// Restore response body for copying to client
	resp.Body = io.NopCloser(bytes.NewBuffer(responseBodyBytes))

	for k, v := range resp.Header {
		c.Writer.Header().Set(k, v[0])
	}
	c.Writer.WriteHeader(resp.StatusCode)

	_, err = io.Copy(c.Writer, resp.Body)
	if err != nil {
		return ErrorWrapper(err, "copy_response_body_failed", http.StatusInternalServerError), nil
	}
	err = resp.Body.Close()
	if err != nil {
		return ErrorWrapper(err, "close_response_body_failed", http.StatusInternalServerError), nil
	}

	return nil, usage
}

func ImagesEditsHandler(c *gin.Context, resp *http.Response) (*model.ErrorWithStatusCode, *model.Usage) {
	// 读取并解析响应体
	responseBodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return ErrorWrapper(err, "read_response_body_failed", http.StatusInternalServerError), nil
	}
	err = resp.Body.Close()
	if err != nil {
		// 只记录错误但不中断流程
		c.Error(err)
	}

	// 解析响应以提取使用量信息
	var imageResponse ImageResponseWithUsage
	var usage *model.Usage = nil

	unmarshalErr := json.Unmarshal(responseBodyBytes, &imageResponse)
	if unmarshalErr == nil {
		if imageResponse.Usage.TotalTokens > 0 {
			usage = &model.Usage{
				PromptTokens:     int(imageResponse.Usage.InputTokens),
				CompletionTokens: int(imageResponse.Usage.OutputTokens),
				TotalTokens:      int(imageResponse.Usage.TotalTokens),
			}
			// 填充详细的 token 信息（适用于 gpt-image-1）
			if imageResponse.Usage.InputTokenDetails.TextTokens > 0 || imageResponse.Usage.InputTokenDetails.ImageTokens > 0 {
				usage.PromptTokensDetails = &model.PromptTokensDetails{
					TextTokens:  int(imageResponse.Usage.InputTokenDetails.TextTokens),
					ImageTokens: int(imageResponse.Usage.InputTokenDetails.ImageTokens),
				}
			}
		}
	}

	// 恢复响应体以供客户端读取
	resp.Body = io.NopCloser(bytes.NewBuffer(responseBodyBytes))

	c.Writer.WriteHeader(resp.StatusCode)
	for k, v := range resp.Header {
		c.Writer.Header().Set(k, v[0])
	}

	if _, copyErr := io.Copy(c.Writer, resp.Body); copyErr != nil {
		return ErrorWrapper(copyErr, "copy_response_body_failed", http.StatusInternalServerError), usage
	}

	return nil, usage
}
