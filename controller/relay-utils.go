package controller

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"log"
	"net/http"
	"one-api/common"
	"strconv"
	"strings"
	"unicode/utf8"

	"github.com/chai2010/webp"
	"github.com/gin-gonic/gin"
	"github.com/pkoukk/tiktoken-go"
)

var stopFinishReason = "stop"

// tokenEncoderMap won't grow after initialization
var tokenEncoderMap = map[string]*tiktoken.Tiktoken{}
var defaultTokenEncoder *tiktoken.Tiktoken

func InitTokenEncoders() {
	common.SysLog("initializing token encoders")
	gpt35TokenEncoder, err := tiktoken.EncodingForModel("gpt-3.5-turbo")
	if err != nil {
		common.FatalLog(fmt.Sprintf("failed to get gpt-3.5-turbo token encoder: %s", err.Error()))
	}
	defaultTokenEncoder = gpt35TokenEncoder
	gpt4TokenEncoder, err := tiktoken.EncodingForModel("gpt-4")
	if err != nil {
		common.FatalLog(fmt.Sprintf("failed to get gpt-4 token encoder: %s", err.Error()))
	}
	for model, _ := range common.ModelRatio {
		if strings.HasPrefix(model, "gpt-3.5") {
			tokenEncoderMap[model] = gpt35TokenEncoder
		} else if strings.HasPrefix(model, "gpt-4") {
			tokenEncoderMap[model] = gpt4TokenEncoder
		} else {
			tokenEncoderMap[model] = nil
		}
	}
	common.SysLog("token encoders initialized")
}

func getTokenEncoder(model string) *tiktoken.Tiktoken {
	tokenEncoder, ok := tokenEncoderMap[model]
	if ok && tokenEncoder != nil {
		return tokenEncoder
	}
	if ok {
		tokenEncoder, err := tiktoken.EncodingForModel(model)
		if err != nil {
			common.SysError(fmt.Sprintf("failed to get token encoder for model %s: %s, using encoder for gpt-3.5-turbo", model, err.Error()))
			tokenEncoder = defaultTokenEncoder
		}
		tokenEncoderMap[model] = tokenEncoder
		return tokenEncoder
	}
	return defaultTokenEncoder
}

func getTokenNum(tokenEncoder *tiktoken.Tiktoken, text string) int {
	return len(tokenEncoder.Encode(text, nil, nil))
}

func getImageToken(imageUrl string, detail string) (int, error) {
	var config image.Config
	var err error
	// 如果detail为空，则默认为"low"
	if detail == "" {
		detail = "high"
	}
	if detail == "high" {
		// 检查图片URL是否为Base64编码数据
		if strings.HasPrefix(imageUrl, "data:image/") {
			log.Println("正在解码Base64图像数据")
			config, err = common.DecodeBase64ImageData(imageUrl)
			if err != nil {
				return 0, fmt.Errorf("解码Base64图像数据失败: %w", err)
			}
		} else if strings.HasPrefix(imageUrl, "http") {
			// 对于HTTP/HTTPS URLs下载图片
			log.Printf("正在下载图片: %s", imageUrl)
			response, err := http.Get(imageUrl)
			if err != nil {
				return 0, fmt.Errorf("获取图片URL失败: %w", err)
			}
			defer response.Body.Close()

			// 如果状态码不是200 OK，则返回错误
			if response.StatusCode != http.StatusOK {
				return 0, fmt.Errorf("服务器返回非200状态码: %d", response.StatusCode)
			}

			// 获取完整的图片数据
			data, err := io.ReadAll(response.Body)
			if err != nil {
				return 0, fmt.Errorf("读取图片数据失败: %w", err)
			}

			// 尝试使用标准库解码图像配置信息
			config, _, err = image.DecodeConfig(bytes.NewReader(data))
			if err != nil {
				// 标准库解码失败，尝试WebP格式
				config, err = webp.DecodeConfig(bytes.NewReader(data))
				if err != nil {
					return 0, fmt.Errorf("解码WebP图像配置失败: %w", err)
				}
			}
		} else {
			return 0, errors.New("不支持的图片URL格式")
		}
	} else if detail == "low" {
		return 85, nil
	}

	// 确保config中的Width和Height是有效的
	if config.Width <= 0 || config.Height <= 0 {
		return 0, fmt.Errorf("无效的图片尺寸")
	}

	// 记录图片尺寸
	log.Printf("图片尺寸 - 宽度: %d, 高度: %d", config.Width, config.Height)

	// 根据逻辑计算token数量
	shortSide := config.Width
	if config.Height < shortSide {
		shortSide = config.Height
	}

	scale := 1.0
	if shortSide > 768 {
		scale = float64(shortSide) / 768
		shortSide = 768
	}

	otherSide := int(float64(config.Height) / scale)
	if config.Width < config.Height {
		otherSide = int(float64(config.Width) / scale)
	}

	// 计算token数
	tiles := (shortSide + 511) / 512 * ((otherSide + 511) / 512)
	tokenCount := tiles*170 + 85

	// 记录计算出的tokens
	log.Printf("计算得到的图片token数: %d", tokenCount)

	return tokenCount, nil

}

func countTokenMessages(messages []Message, model string) (int, error) {
	tokenEncoder := getTokenEncoder(model)
	var tokensPerMessage int
	var tokensPerName int

	// 根据不同的模型设置token计算方式
	if model == "gpt-3.5-turbo-0301" {
		tokensPerMessage = 4
		tokensPerName = -1 // 如果有name，则忽略role的token计数
	} else {
		tokensPerMessage = 3
		tokensPerName = 1
	}

	var totalTokens int

	for _, message := range messages {
		totalTokens += tokensPerMessage
		totalTokens += getTokenNum(tokenEncoder, "<|im_start|>"+message.Role+"\n")

		if message.Name != nil && tokensPerName > 0 {
			totalTokens += tokensPerName
			totalTokens += getTokenNum(tokenEncoder, *message.Name+"\n")
		}

		if len(message.Content) > 0 && message.Content[0] == '[' {
			var contentItems []json.RawMessage
			err := json.Unmarshal(message.Content, &contentItems)
			if err != nil {
				return 0, fmt.Errorf("解析到[]json.RawMessage失败: %w", err)
			}

			for _, item := range contentItems {
				var baseItem MediaMessageBase
				err := json.Unmarshal(item, &baseItem)
				if err != nil {
					return 0, fmt.Errorf("解析媒体消息类型失败: %w", err)
				}

				switch baseItem.Type {
				case "text":
					var textItem MediaMessageText
					err := json.Unmarshal(item, &textItem)
					if err != nil {
						return 0, fmt.Errorf("解析文本消息失败: %w", err)
					}
					totalTokens += getTokenNum(tokenEncoder, textItem.Text)
				case "image_url":
					var imageItem MediaMessageImage
					err := json.Unmarshal(item, &imageItem)
					if err != nil {
						return 0, fmt.Errorf("解析图像消息失败: %w", err)
					}

					imageTokens, err := getImageToken(imageItem.ImageUrl.Url, imageItem.ImageUrl.Detail)
					if err != nil {
						return 0, fmt.Errorf("获取图像token失败: %w", err)
					}
					totalTokens += imageTokens
				default:
					return 0, fmt.Errorf("不支持的媒体消息类型: %s", baseItem.Type)
				}
			}
		} else {
			var textContent string
			err := json.Unmarshal(message.Content, &textContent)
			if err != nil {
				return 0, fmt.Errorf("解析为字符串失败: %w", err)
			}
			totalTokens += getTokenNum(tokenEncoder, textContent)
		}

		totalTokens += getTokenNum(tokenEncoder, "<|end|>\n")
	}

	// 将每个回复与assistant角色的标记进行累加
	totalTokens += getTokenNum(tokenEncoder, "<|im_start|>assistant<|im_sep|>")

	return totalTokens, nil
}

func countTokenInput(input any, model string) int {
	switch input.(type) {
	case string:
		return countTokenText(input.(string), model)
	case []string:
		text := ""
		for _, s := range input.([]string) {
			text += s
		}
		return countTokenText(text, model)
	}
	return 0
}

func countAudioToken(text string, model string) int {
	if strings.HasPrefix(model, "tts") {
		return utf8.RuneCountInString(text)
	} else {
		return countTokenText(text, model)
	}
}

func countTokenText(text string, model string) int {
	tokenEncoder := getTokenEncoder(model)
	return getTokenNum(tokenEncoder, text)
}

func errorWrapper(err error, code string, statusCode int) *OpenAIErrorWithStatusCode {
	text := err.Error()
	// 定义一个正则表达式匹配URL
	if strings.Contains(text, "Post") {
		common.SysLog(fmt.Sprintf("error: %s", text))
		text = "请求上游地址失败"
	}
	//避免暴露内部错误

	openAIError := OpenAIError{
		Message: text,
		Type:    "new_api_error",
		Code:    code,
	}
	return &OpenAIErrorWithStatusCode{
		OpenAIError: openAIError,
		StatusCode:  statusCode,
	}
}

func shouldDisableChannel(err *OpenAIError, statusCode int) bool {
	if !common.AutomaticDisableChannelEnabled {
		return false
	}
	if err == nil {
		return false
	}
	if statusCode == http.StatusUnauthorized {
		return true
	}
	if err.Type == "insufficient_quota" || err.Code == "invalid_api_key" || err.Code == "account_deactivated" {
		return true
	}
	return false
}

func setEventStreamHeaders(c *gin.Context) {
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Transfer-Encoding", "chunked")
	c.Writer.Header().Set("X-Accel-Buffering", "no")
}

func relayErrorHandler(resp *http.Response) (openAIErrorWithStatusCode *OpenAIErrorWithStatusCode) {
	openAIErrorWithStatusCode = &OpenAIErrorWithStatusCode{
		StatusCode: resp.StatusCode,
		OpenAIError: OpenAIError{
			Message: fmt.Sprintf("bad response status code %d", resp.StatusCode),
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
	var textResponse TextResponse
	err = json.Unmarshal(responseBody, &textResponse)
	if err != nil {
		return
	}
	openAIErrorWithStatusCode.OpenAIError = textResponse.Error
	return
}

func getFullRequestURL(baseURL string, requestURL string, channelType int) string {
	fullRequestURL := fmt.Sprintf("%s%s", baseURL, requestURL)
	if channelType == common.ChannelTypeOpenAI {
		if strings.HasPrefix(baseURL, "https://gateway.ai.cloudflare.com") {
			fullRequestURL = fmt.Sprintf("%s%s", baseURL, strings.TrimPrefix(requestURL, "/v1"))
		}
	}
	return fullRequestURL
}
