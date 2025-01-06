package openai

import (
	"encoding/base64"
	"errors"
	"fmt"
	"math"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/image"
	"one-api/common/logger"
	"one-api/relay/model"
	"one-api/relay/util"
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
	gpt4oTokenEncoder, err := tiktoken.EncodingForModel("gpt-4o")
	if err != nil {
		logger.FatalLog(fmt.Sprintf("failed to get gpt-4o token encoder: %s", err.Error()))
	}
	gpt4TokenEncoder, err := tiktoken.EncodingForModel("gpt-4")
	if err != nil {
		logger.FatalLog(fmt.Sprintf("failed to get gpt-4 token encoder: %s", err.Error()))
	}
	for model := range common.ModelRatio {
		if strings.HasPrefix(model, "gpt-3.5") {
			tokenEncoderMap[model] = gpt35TokenEncoder
		} else if strings.HasPrefix(model, "gpt-4o") {
			tokenEncoderMap[model] = gpt4oTokenEncoder
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
	if config.ApproximateTokenEnabled {
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

func CountTokenChatRequest(message *model.GeneralOpenAIRequest, model string) int {
	tkm := 0
	msgTokens := CountTokenMessages(message.Messages, model)
	tkm += msgTokens

	if message.Tools != nil {
		toolTokens := processToolCalls(message.Tools, model)
		if toolTokens == -1 {
			return 0
		}
		tkm += 8 + toolTokens
	}
	return tkm
}

func processToolCalls(toolCalls []model.Tool, model string) int {
	countStr := ""
	for _, tool := range toolCalls {
		countStr = tool.Function.Name
		if tool.Function.Description != "" {
			countStr += tool.Function.Description
		}
		if tool.Function.Parameters != nil {
			countStr += fmt.Sprintf("%v", tool.Function.Parameters)
		}
	}
	return CountTokenInput(countStr, model)
}

func CountTokenMessages(messages []model.Message, model string) int {
	tokenEncoder := getTokenEncoder(model)
	// Reference:
	// https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
	// https://github.com/pkoukk/tiktoken-go/issues/6
	//
	// Every message follows <|start|>{role/name}\n{content}<|end|>\n
	tokensPerMessage := 3
	tokensPerName := 1
	tokenNum := 0

	for _, message := range messages {
		tokenNum += tokensPerMessage

		if message.Content == nil {
			continue
		}

		switch content := message.Content.(type) {
		case string:
			tokenNum += getTokenNum(tokenEncoder, content)
		case []interface{}:
			for _, item := range content {
				m, ok := item.(map[string]interface{})
				if !ok {
					continue
				}

				switch m["type"] {
				case "text":
					if text, ok := m["text"].(string); ok {
						tokenNum += getTokenNum(tokenEncoder, text)
					}
				case "image_url":
					imageUrl, ok := m["image_url"].(map[string]interface{})
					if !ok {
						continue
					}
					url, ok := imageUrl["url"].(string)
					if !ok {
						continue
					}
					detail := ""
					if detailVal, ok := imageUrl["detail"]; ok {
						detail, _ = detailVal.(string)
					}
					imageTokens, err := countImageTokens(url, detail, model)
					if err != nil {
						logger.SysError("计算图像Token时出错: " + err.Error())
					} else {
						tokenNum += imageTokens
					}
				case "image":
					source, ok := m["source"].(map[string]interface{})
					if !ok {
						continue
					}
					data, ok := source["data"].(string)
					if !ok {
						continue
					}
					mediaType, ok := source["media_type"].(string)
					if !ok {
						mediaType = "image/jpeg" // 默认值
					}

					// 组合成完整的 Data URL
					dataURL := fmt.Sprintf("data:%s;base64,%s", mediaType, data)
					imageTokens, err := claudeImageTokens(dataURL)
					if err != nil {
						logger.SysError("计算图像Token时出错: " + err.Error())
					} else {
						tokenNum += imageTokens
					}
				}
			}
		default:
			logger.SysError("未知的消息内容类型")
		}

		tokenNum += getTokenNum(tokenEncoder, message.Role)
		if message.Name != nil {
			tokenNum += tokensPerName
			tokenNum += getTokenNum(tokenEncoder, *message.Name)
		}
	}

	tokenNum += 3 // Every reply is primed with <|start|>assistant<|message|>

	return tokenNum
}

func countImageTokens(url string, detail string, model string) (_ int, err error) {
	var fetchSize = true
	var width, height int

	if detail == "" || detail == "auto" {
		// assume by test, not sure if this is correct
		detail = "high"
	}
	switch detail {
	case "low":
		if strings.HasPrefix(model, "gpt-4o-mini") {
			return gpt4oMiniLowDetailCost, nil
		}
		return lowDetailCost, nil
	case "high":
		if fetchSize {
			width, height, err = image.GetImageSize(url)
			if err != nil {
				return 0, err
			}
		}
		if width > 2048 || height > 2048 { // max(width, height) > 2048
			ratio := float64(2048) / math.Max(float64(width), float64(height))
			width = int(float64(width) * ratio)
			height = int(float64(height) * ratio)
		}
		if width > 768 && height > 768 { // min(width, height) > 768
			ratio := float64(768) / math.Min(float64(width), float64(height))
			width = int(float64(width) * ratio)
			height = int(float64(height) * ratio)
		}
		numSquares := int(math.Ceil(float64(width)/512) * math.Ceil(float64(height)/512))
		if strings.HasPrefix(model, "gpt-4o-mini") {
			return numSquares*gpt4oMiniHighDetailCost + gpt4oMiniAdditionalCost, nil
		}
		result := numSquares*highDetailCostPerTile + additionalCost
		return result, nil
	default:
		return 0, errors.New("invalid detail option")
	}
}

func claudeImageTokens(url string) (int, error) {
	var width, height int

	width, height, err := image.GetImageSize(url)
	if err != nil {
		return 0, err
	}

	// 根据图像尺寸计算Token数
	if width <= 200 && height <= 200 {
		return 54, nil
	} else if width <= 1000 && height <= 1000 {
		return 1334, nil
	} else if width <= 1092 && height <= 1092 {
		return 1590, nil
	}

	// 对其他尺寸使用比例成本计算
	numSquares := int(math.Ceil(float64(width)/512) * math.Ceil(float64(height)/512))
	result := numSquares*highDetailCostPerTile + additionalCost
	return result, nil
}

const (
	lowDetailCost         = 85
	highDetailCostPerTile = 170
	additionalCost        = 85
	// gpt-4o-mini cost higher than other model
	gpt4oMiniLowDetailCost  = 2833
	gpt4oMiniHighDetailCost = 5667
	gpt4oMiniAdditionalCost = 2833
)

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
func CountTokenRealtime(meta *util.RelayMeta, request model.RealtimeEvent, model string) (int, int, error) {
	audioToken := 0
	textToken := 0
	switch request.Type {
	case RealtimeEventTypeSessionUpdated:
		if request.Session != nil {
			msgTokens, err := CountTextToken(request.Session.Instructions, model)
			if err != nil {
				return 0, 0, err
			}
			textToken += msgTokens
		}
	case RealtimeEventResponseAudioDelta:
		// count audio token
		atk, err := CountAudioTokenOutput(request.Delta, meta.OutputAudioFormat)
		if err != nil {
			return 0, 0, fmt.Errorf("error counting audio token: %v", err)
		}
		audioToken += atk
	case RealtimeEventResponseAudioTranscriptionDelta, RealtimeEventResponseFunctionCallArgumentsDelta:
		// count text token
		tkm, err := CountTextToken(request.Delta, model)
		if err != nil {
			return 0, 0, fmt.Errorf("error counting text token: %v", err)
		}
		textToken += tkm
	case RealtimeEventInputAudioBufferAppend:
		// count audio token
		atk, err := CountAudioTokenInput(request.Audio, meta.InputAudioFormat)
		if err != nil {
			return 0, 0, fmt.Errorf("error counting audio token: %v", err)
		}
		audioToken += atk
	case RealtimeEventConversationItemCreated:
		if request.Item != nil {
			switch request.Item.Type {
			case "message":
				for _, content := range request.Item.Content {
					if content.Type == "input_text" {
						tokens, err := CountTextToken(content.Text, model)
						if err != nil {
							return 0, 0, err
						}
						textToken += tokens
					}
				}
			}
		}
	case RealtimeEventTypeResponseDone:
		// count tools token
		if !meta.IsFirstRequest {
			if meta.RealtimeTools != nil && len(meta.RealtimeTools) > 0 {
				for _, tool := range meta.RealtimeTools {
					toolTokens := CountTokenInput(tool, model)
					textToken += 8
					textToken += int(toolTokens)
				}
			}
		}
	}
	return textToken, audioToken, nil
}

func CountAudioTokenOutput(audioBase64 string, audioFormat string) (int, error) {
	if audioBase64 == "" {
		return 0, nil
	}
	duration, err := parseAudio(audioBase64, audioFormat)
	if err != nil {
		return 0, err
	}
	return int(duration / 60 * 200 / 0.24), nil
}

func CountAudioTokenInput(audioBase64 string, audioFormat string) (int, error) {
	if audioBase64 == "" {
		return 0, nil
	}
	duration, err := parseAudio(audioBase64, audioFormat)
	if err != nil {
		return 0, err
	}
	return int(duration / 60 * 100 / 0.06), nil
}

func CountTextToken(text string, model string) (int, error) {
	tokenEncoder := getTokenEncoder(model)
	tokenNum := getTokenNum(tokenEncoder, text)
	return int(tokenNum), nil
}

func parseAudio(audioBase64 string, format string) (duration float64, err error) {
	audioData, err := base64.StdEncoding.DecodeString(audioBase64)
	if err != nil {
		return 0, fmt.Errorf("base64 decode error: %v", err)
	}

	var samplesCount int
	var sampleRate int

	switch format {
	case "pcm16":
		samplesCount = len(audioData) / 2 // 16位 = 2字节每样本
		sampleRate = 24000                // 24kHz
	case "g711_ulaw", "g711_alaw":
		samplesCount = len(audioData) // 8位 = 1字节每样本
		sampleRate = 8000             // 8kHz
	default:
		samplesCount = len(audioData) // 8位 = 1字节每样本
		sampleRate = 8000             // 8kHz
	}

	duration = float64(samplesCount) / float64(sampleRate)
	return duration, nil
}
