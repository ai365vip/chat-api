package openai

import (
	"encoding/json"
	"errors"
	"fmt"
	"image"
	"log"
	"math"
	"one-api/common"
	"one-api/common/logger"
	"one-api/relay/model"
	"strings"
	"unicode/utf8"

	"github.com/pkoukk/tiktoken-go"
)

// tokenEncoderMap won't grow after initialization
var tokenEncoderMap = map[string]*tiktoken.Tiktoken{}
var defaultTokenEncoder *tiktoken.Tiktoken

func InitTokenEncoders() {
	logger.SysLog("initializing token encoders")
	gpt35TokenEncoder, err := tiktoken.EncodingForModel("gpt-3.5-turbo")
	if err != nil {
		logger.FatalLog(fmt.Sprintf("failed to get gpt-3.5-turbo token encoder: %s", err.Error()))
	}
	defaultTokenEncoder = gpt35TokenEncoder
	gpt4TokenEncoder, err := tiktoken.EncodingForModel("gpt-4")
	if err != nil {
		logger.FatalLog(fmt.Sprintf("failed to get gpt-4 token encoder: %s", err.Error()))
	}
	for model := range common.ModelRatio {
		if strings.HasPrefix(model, "gpt-3.5") {
			tokenEncoderMap[model] = gpt35TokenEncoder
		} else if strings.HasPrefix(model, "gpt-4") {
			tokenEncoderMap[model] = gpt4TokenEncoder
		} else {
			tokenEncoderMap[model] = nil
		}
	}
	logger.SysLog("token encoders initialized")
}

func getTokenEncoder(model string) *tiktoken.Tiktoken {
	tokenEncoder, ok := tokenEncoderMap[model]
	if ok && tokenEncoder != nil {
		return tokenEncoder
	}
	if ok {
		tokenEncoder, err := tiktoken.EncodingForModel(model)
		if err != nil {
			logger.SysError(fmt.Sprintf("failed to get token encoder for model %s: %s, using encoder for gpt-3.5-turbo", model, err.Error()))
			tokenEncoder = defaultTokenEncoder
		}
		tokenEncoderMap[model] = tokenEncoder
		return tokenEncoder
	}
	return defaultTokenEncoder
}

func getTokenNum(tokenEncoder *tiktoken.Tiktoken, text string) int {
	if common.ApproximateTokenEnabled {
		return int(float64(len(text)) * 0.38)
	}
	return len(tokenEncoder.Encode(text, nil, nil))
}

func CountAudioToken(text string, model string) int {
	if strings.HasPrefix(model, "tts") {
		return utf8.RuneCountInString(text)
	} else {
		return CountTokenText(text, model)
	}
}

func processImageToken(m MediaMessage) (int, error) {
	var imageUrl MessageImageUrl
	var err error

	// 尝试直接从 m.ImageUrl 中获取字符串URL
	if str, ok := m.ImageUrl.(string); ok {
		imageUrl = MessageImageUrl{Url: str, Detail: "auto"}
	} else if imageUrlMap, ok := m.ImageUrl.(map[string]interface{}); ok {
		// 尝试从 map 中解析 URL 和 Detail
		url, urlOk := imageUrlMap["url"].(string)
		detail, detailOk := imageUrlMap["detail"].(string)
		if !urlOk {
			return 0, fmt.Errorf("invalid image url structure")
		}
		if !detailOk {
			detail = "auto" // 默认值，如果未提供 detail
		}
		imageUrl = MessageImageUrl{
			Url:    url,
			Detail: detail,
		}
	} else {
		// 如果既不是字符串也不是预期的 map 结构，则返回错误
		return 0, fmt.Errorf("unknown image url format")
	}

	// 调用 getImageToken 计算图像所需的令牌数量
	tokenNum, err := getImageToken(&imageUrl)
	if err != nil {
		return 0, err
	}

	return tokenNum, nil
}

func CountTokenMessages(messages []model.Message, model string) int {
	tokenEncoder := getTokenEncoder(model)
	tokensPerMessage := 3
	tokensPerName := 1
	if model == "gpt-3.5-turbo-0301" {
		tokensPerMessage = 4
		tokensPerName = -1 // If there's a name, the role is omitted
	}
	tokenNum := 0
	for _, message := range messages {
		tokenNum += tokensPerMessage
		tokenNum += getTokenNum(tokenEncoder, message.Role)

		contentBytes, ok := message.Content.([]byte)
		if !ok {
			continue
		}

		// 尝试首先解码为string，如果失败，则尝试解码为[]MediaMessage
		var stringContent string
		if err := json.Unmarshal(contentBytes, &stringContent); err == nil {
			tokenNum += getTokenNum(tokenEncoder, stringContent)
		} else {
			var arrayContent []MediaMessage
			if err := json.Unmarshal(contentBytes, &arrayContent); err != nil {
				return 0 // 或者处理错误
			}

			for _, m := range arrayContent {
				if m.Type == "image_url" {
					imageTokenNum, err := processImageToken(m)
					if err != nil {
						return 0 // 或者处理错误
					}
					tokenNum += imageTokenNum
				} else {
					tokenNum += getTokenNum(tokenEncoder, m.Text)
				}
			}
		}

		if message.Name != nil && tokensPerName > 0 {
			tokenNum += tokensPerName
			tokenNum += getTokenNum(tokenEncoder, *message.Name)
		}
	}
	tokenNum += 3 // Every reply is primed with <|im_start|>assistant<|im_sep|>
	return tokenNum
}

func getImageToken(imageUrl *MessageImageUrl) (int, error) {
	if imageUrl.Detail == "low" {
		return 85, nil
	}
	var config image.Config
	var err error
	var format string
	if strings.HasPrefix(imageUrl.Url, "http") {
		common.SysLog(fmt.Sprintf("downloading image: %s", imageUrl.Url))
		config, format, err = common.DecodeUrlImageData(imageUrl.Url)
	} else {
		common.SysLog(fmt.Sprintf("decoding image"))
		config, format, err = common.DecodeBase64ImageData(imageUrl.Url)
	}
	if err != nil {
		return 0, err
	}

	if config.Width == 0 || config.Height == 0 {
		return 0, errors.New(fmt.Sprintf("fail to decode image config: %s", imageUrl.Url))
	}
	// TODO: 适配官方auto计费
	if config.Width < 512 && config.Height < 512 {
		if imageUrl.Detail == "auto" || imageUrl.Detail == "" {
			// 如果图片尺寸小于512，强制使用low
			imageUrl.Detail = "low"
			return 85, nil
		}
	}

	shortSide := config.Width
	otherSide := config.Height
	log.Printf("format: %s, width: %d, height: %d", format, config.Width, config.Height)
	// 缩放倍数
	scale := 1.0
	if config.Height < shortSide {
		shortSide = config.Height
		otherSide = config.Width
	}

	// 将最小变的尺寸缩小到768以下，如果大于768，则缩放到768
	if shortSide > 768 {
		scale = float64(shortSide) / 768
		shortSide = 768
	}
	// 将另一边按照相同的比例缩小，向上取整
	otherSide = int(math.Ceil(float64(otherSide) / scale))
	//log.Printf("shortSide: %d, otherSide: %d, scale: %f", shortSide, otherSide, scale)
	// 计算图片的token数量(边的长度除以512，向上取整)
	tiles := (shortSide + 511) / 512 * ((otherSide + 511) / 512)
	//log.Printf("tiles: %d", tiles)
	return tiles*170 + 85, nil
}
func countImageTokens(messages []Message, model string) int {
	//recover when panic
	tokenEncoder := getTokenEncoder(model)
	// Reference:
	// https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
	// https://github.com/pkoukk/tiktoken-go/issues/6
	//
	// Every message follows <|start|>{role/name}\n{content}<|end|>\n
	var tokensPerMessage int
	var tokensPerName int
	if model == "gpt-3.5-turbo-0301" {
		tokensPerMessage = 4
		tokensPerName = -1 // If there's a name, the role is omitted
	} else {
		tokensPerMessage = 3
		tokensPerName = 1
	}
	tokenNum := 0
	for _, message := range messages {
		tokenNum += tokensPerMessage
		tokenNum += getTokenNum(tokenEncoder, message.Role)
		var arrayContent []MediaMessage
		if err := json.Unmarshal(message.Content, &arrayContent); err != nil {

			var stringContent string
			if err := json.Unmarshal(message.Content, &stringContent); err != nil {
				return 0
			} else {
				tokenNum += getTokenNum(tokenEncoder, stringContent)
				if message.Name != nil {
					tokenNum += tokensPerName
					tokenNum += getTokenNum(tokenEncoder, *message.Name)
				}
			}
		} else {
			for _, m := range arrayContent {
				if m.Type == "image_url" {
					var imageTokenNum int
					if str, ok := m.ImageUrl.(string); ok {
						imageTokenNum, err = getImageToken(&MessageImageUrl{Url: str, Detail: "auto"})
					} else {
						imageUrlMap := m.ImageUrl.(map[string]interface{})
						detail, ok := imageUrlMap["detail"]
						if ok {
							imageUrlMap["detail"] = detail.(string)
						} else {
							imageUrlMap["detail"] = "auto"
						}
						imageUrl := MessageImageUrl{
							Url:    imageUrlMap["url"].(string),
							Detail: imageUrlMap["detail"].(string),
						}
						imageTokenNum, err = getImageToken(&imageUrl)
					}
					if err != nil {
						return 0
					}

					tokenNum += imageTokenNum
					//log.Printf("image token num: %d", imageTokenNum)
				} else {
					tokenNum += getTokenNum(tokenEncoder, m.Text)
				}
			}
		}
	}
	tokenNum += 3 // Every reply is primed with <|start|>assistant<|message|>
	return tokenNum
}

func CountTokenInput(input any, model string) int {
	switch v := input.(type) {
	case string:
		return CountTokenText(v, model)
	case []string:
		text := ""
		for _, s := range v {
			text += s
		}
		return CountTokenText(text, model)
	}
	return 0
}

func CountTokenText(text string, model string) int {
	tokenEncoder := getTokenEncoder(model)
	return getTokenNum(tokenEncoder, text)
}
