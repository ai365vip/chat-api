package aws

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"one-api/common/ctxkey"

	"one-api/common"
	"one-api/common/helper"
	"one-api/common/logger"
	"one-api/relay/channel/anthropic"
	"one-api/relay/channel/openai"
	"one-api/relay/model"
	relaymodel "one-api/relay/model"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/bedrockruntime"
	"github.com/aws/aws-sdk-go-v2/service/bedrockruntime/types"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/copier"
	"github.com/pkg/errors"
)

func wrapErr(err error) *relaymodel.ErrorWithStatusCode {
	return &relaymodel.ErrorWithStatusCode{
		StatusCode: http.StatusInternalServerError,
		Error: relaymodel.Error{
			Message: fmt.Sprintf("%s", err.Error()),
		},
	}
}

// https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html
var awsModelIDMap = map[string]string{
	"claude-instant-1.2":         "anthropic.claude-instant-v1",
	"claude-2.0":                 "anthropic.claude-v2",
	"claude-2.1":                 "anthropic.claude-v2:1",
	"claude-3-sonnet-20240229":   "anthropic.claude-3-sonnet-20240229-v1:0",
	"claude-3-5-sonnet-20240620": "anthropic.claude-3-5-sonnet-20240620-v1:0",
	"claude-3-opus-20240229":     "anthropic.claude-3-opus-20240229-v1:0",
	"claude-3-haiku-20240307":    "anthropic.claude-3-haiku-20240307-v1:0",
	"claude-3-5-sonnet-20241022": "anthropic.claude-3-5-sonnet-20241022-v2:0",
	"claude-3-5-haiku-20241022":  "anthropic.claude-3-5-haiku-20241022-v1:0",
	"claude-3-7-sonnet-20250219": "anthropic.claude-3-7-sonnet-20250219-v1:0",
	"claude-sonnet-4-20250514":   "anthropic.claude-sonnet-4-20250514-v1:0",
	"claude-opus-4-20250514":     "anthropic.claude-opus-4-20250514-v1:0",
	"command-r":                  "cohere.command-r-v1:0",
	"command-r-plus":             "cohere.command-r-plus-v1:0",
}

func awsModelID(requestModel string) (string, error) {
	if awsModelID, ok := awsModelIDMap[requestModel]; ok {
		return awsModelID, nil
	}

	return "", errors.Errorf("model %s not found", requestModel)
}
func awsCrossModelID(requestModel string, cross string) (string, error) {
	prefix := cross
	if prefix != "" {
		prefix += "."
	}

	modelMap := map[string]string{
		"claude-instant-1.2":         prefix + "anthropic.claude-instant-v1",
		"claude-2.0":                 prefix + "anthropic.claude-v2",
		"claude-2.1":                 prefix + "anthropic.claude-v2:1",
		"claude-3-sonnet-20240229":   prefix + "anthropic.claude-3-sonnet-20240229-v1:0",
		"claude-3-5-sonnet-20240620": prefix + "anthropic.claude-3-5-sonnet-20240620-v1:0",
		"claude-3-opus-20240229":     prefix + "anthropic.claude-3-opus-20240229-v1:0",
		"claude-3-haiku-20240307":    prefix + "anthropic.claude-3-haiku-20240307-v1:0",
		"claude-3-5-sonnet-20241022": prefix + "anthropic.claude-3-5-sonnet-20241022-v2:0",
		"claude-3-5-haiku-20241022":  prefix + "anthropic.claude-3-5-haiku-20241022-v1:0",
		"claude-3-7-sonnet-20250219": prefix + "anthropic.claude-3-7-sonnet-20250219-v1:0",
		"claude-sonnet-4-20250514":   prefix + "anthropic.claude-sonnet-4-20250514-v1:0",
		"claude-opus-4-20250514":     prefix + "anthropic.claude-opus-4-20250514-v1:0",
	}

	if awsModelID, ok := modelMap[requestModel]; ok {
		return awsModelID, nil
	}

	return "", errors.Errorf("model %s not found", requestModel)
}
func Handler(c *gin.Context, awsCli *bedrockruntime.Client, modelName string) (*relaymodel.ErrorWithStatusCode, *relaymodel.Usage, string) {
	var awsModelId string
	var err error
	if cross := c.GetString(ctxkey.Cross); cross != "" {
		awsModelId, err = awsCrossModelID(c.GetString(ctxkey.RequestModel), cross)
	} else {
		awsModelId, err = awsModelID(c.GetString(ctxkey.RequestModel))
	}
	responseText := ""
	if err != nil {
		return wrapErr(errors.Wrap(err, "awsModelID")), nil, ""
	}
	awsReq := &bedrockruntime.InvokeModelInput{
		ModelId:     aws.String(awsModelId),
		Accept:      aws.String("application/json"),
		ContentType: aws.String("application/json"),
	}
	claudeReq_, ok := c.Get(ctxkey.ConvertedRequest)
	if !ok {
		return wrapErr(errors.New("request not found")), nil, ""
	}
	claudeReq := claudeReq_.(*anthropic.Request)
	if claudeReq == nil {
		return wrapErr(errors.New("claude request is nil")), nil, ""
	}
	awsClaudeReq := &Request{
		AnthropicVersion: "bedrock-2023-05-31",
	}
	if err = copier.Copy(awsClaudeReq, claudeReq); err != nil {
		return wrapErr(errors.Wrap(err, "copy request")), nil, ""
	}

	awsReq.Body, err = json.Marshal(awsClaudeReq)
	if err != nil {
		return wrapErr(errors.Wrap(err, "marshal request")), nil, ""
	}

	awsResp, err := awsCli.InvokeModel(c.Request.Context(), awsReq)
	if err != nil {
		return wrapErr(errors.Wrap(err, "InvokeModel")), nil, ""
	}

	claudeResponse := new(anthropic.Response)
	err = json.Unmarshal(awsResp.Body, claudeResponse)
	if err != nil {
		return wrapErr(errors.Wrap(err, "unmarshal response")), nil, ""
	}

	openaiResp := anthropic.ResponseClaude2OpenAI(claudeResponse)
	openaiResp.Model = modelName
	if len(claudeResponse.Content[0].Text) > 0 {
		responseText = claudeResponse.Content[0].Text
	}

	usage := relaymodel.Usage{
		PromptTokens:     claudeResponse.Usage.InputTokens,
		CompletionTokens: claudeResponse.Usage.OutputTokens,
		TotalTokens:      claudeResponse.Usage.InputTokens + claudeResponse.Usage.OutputTokens,
	}
	openaiResp.Usage = usage

	c.JSON(http.StatusOK, openaiResp)
	return nil, &usage, responseText
}

func StreamHandler(c *gin.Context, awsCli *bedrockruntime.Client) (*relaymodel.ErrorWithStatusCode, *relaymodel.Usage, string) {
	createdTime := helper.GetTimestamp()
	responseText := ""
	var awsModelId string
	var err error
	if cross := c.GetString(ctxkey.Cross); cross != "" {
		awsModelId, err = awsCrossModelID(c.GetString(ctxkey.RequestModel), cross)
	} else {
		awsModelId, err = awsModelID(c.GetString(ctxkey.RequestModel))
	}

	if err != nil {
		return wrapErr(errors.Wrap(err, "awsModelID")), nil, ""
	}

	awsReq := &bedrockruntime.InvokeModelWithResponseStreamInput{
		ModelId:     aws.String(awsModelId),
		Accept:      aws.String("application/json"),
		ContentType: aws.String("application/json"),
	}

	claudeReq_, ok := c.Get(ctxkey.ConvertedRequest)
	if !ok {
		return wrapErr(errors.New("request not found")), nil, ""
	}
	claudeReq := claudeReq_.(*anthropic.Request)
	if claudeReq == nil {
		return wrapErr(errors.New("claude request is nil")), nil, ""
	}

	awsClaudeReq := &Request{
		AnthropicVersion: "bedrock-2023-05-31",
	}
	if err = copier.Copy(awsClaudeReq, claudeReq); err != nil {
		return wrapErr(errors.Wrap(err, "copy request")), nil, ""
	}
	awsReq.Body, err = json.Marshal(awsClaudeReq)
	if err != nil {
		return wrapErr(errors.Wrap(err, "marshal request")), nil, ""
	}

	awsResp, err := awsCli.InvokeModelWithResponseStream(c.Request.Context(), awsReq)
	if err != nil {
		return wrapErr(errors.Wrap(err, "InvokeModelWithResponseStream")), nil, ""
	}
	stream := awsResp.GetStream()
	defer stream.Close()

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	var usage relaymodel.Usage
	var id string
	var lastToolCallChoice openai.ChatCompletionsStreamResponseChoice

	c.Stream(func(w io.Writer) bool {
		event, ok := <-stream.Events()
		if !ok {
			if responseText != "" {
				// 直接只发送一条带有usage信息的消息，不产生额外的空消息
				usageResponse := openai.ChatCompletionsStreamResponse{
					Id:      id,
					Object:  "chat.completion.chunk",
					Created: createdTime,
					Model:   c.GetString(ctxkey.OriginalModel),
					Choices: []openai.ChatCompletionsStreamResponseChoice{},
					Usage: &relaymodel.Usage{
						PromptTokens:     usage.PromptTokens,
						CompletionTokens: usage.CompletionTokens,
						TotalTokens:      usage.PromptTokens + usage.CompletionTokens,
					},
				}

				usageJsonStr, err := json.Marshal(usageResponse)
				if err == nil {
					c.Render(-1, common.CustomEvent{Data: "data: " + string(usageJsonStr)})
				}

				c.Render(-1, common.CustomEvent{Data: "data: [DONE]"})
			}
			return false
		}

		switch v := event.(type) {
		case *types.ResponseStreamMemberChunk:
			claudeResp := new(anthropic.StreamResponse)
			err := json.NewDecoder(bytes.NewReader(v.Value.Bytes)).Decode(claudeResp)
			if err != nil {
				logger.SysError("error unmarshalling stream response: " + err.Error())
				return false
			}

			response, meta := anthropic.StreamResponseClaude2OpenAI(claudeResp)
			if meta != nil {
				usage.PromptTokens += meta.Usage.InputTokens
				usage.CompletionTokens += meta.Usage.OutputTokens
				if len(meta.Id) > 0 { // only message_start has an id, otherwise it's a finish_reason event.
					id = meta.Id
					return true
				} else { // finish_reason case
					anthropic.ProcessToolCalls(&lastToolCallChoice, response)
				}
			}
			if response == nil {
				return true
			}
			if response.Choices != nil && len(response.Choices) > 0 {
				choice := response.Choices[0]
				if choice.Delta.Content != nil {
					if content, ok := choice.Delta.Content.(string); ok {
						responseText += content
					}
				}
			}
			response.Id = id
			response.Model = c.GetString(ctxkey.OriginalModel)
			response.Created = createdTime

			for _, choice := range response.Choices {
				if len(choice.Delta.ToolCalls) > 0 {
					lastToolCallChoice = choice
				}
			}
			jsonStr, err := json.Marshal(response)
			if err != nil {
				logger.SysError("error marshalling stream response: " + err.Error())
				return true
			}
			c.Render(-1, common.CustomEvent{Data: "data: " + string(jsonStr)})
			return true
		case *types.UnknownUnionMember:
			fmt.Println("unknown tag:", v.Tag)
			return false
		default:
			fmt.Println("union is nil or unknown type")
			return false
		}
	})
	return nil, &usage, responseText
}

func ClaudeHandler(c *gin.Context, awsCli *bedrockruntime.Client, modelName string) (*relaymodel.ErrorWithStatusCode, *relaymodel.Usage, string) {
	var awsModelId string
	var err error
	if cross := c.GetString(ctxkey.Cross); cross != "" {
		awsModelId, err = awsCrossModelID(c.GetString(ctxkey.RequestModel), cross)
	} else {
		awsModelId, err = awsModelID(c.GetString(ctxkey.RequestModel))
	}
	responseText := ""
	if err != nil {
		return wrapErr(errors.Wrap(err, "awsModelID")), nil, ""
	}
	awsReq := &bedrockruntime.InvokeModelInput{
		ModelId:     aws.String(awsModelId),
		Accept:      aws.String("application/json"),
		ContentType: aws.String("application/json"),
	}

	claudeReq_, ok := c.Get(ctxkey.ConvertedRequest)
	if !ok {
		return wrapErr(errors.New("request not found")), nil, ""
	}
	claudeReq := claudeReq_.(*anthropic.Request)
	if claudeReq == nil {
		return wrapErr(errors.New("claude request is nil")), nil, ""
	}
	awsClaudeReq := &Request{
		AnthropicVersion: "bedrock-2023-05-31",
	}
	if err = copier.Copy(awsClaudeReq, claudeReq); err != nil {
		return wrapErr(errors.Wrap(err, "copy request")), nil, ""
	}

	awsReq.Body, err = json.Marshal(awsClaudeReq)
	if err != nil {
		return wrapErr(errors.Wrap(err, "marshal request")), nil, ""
	}
	awsResp, err := awsCli.InvokeModel(c.Request.Context(), awsReq)
	if err != nil {
		return wrapErr(errors.Wrap(err, "InvokeModel")), nil, ""
	}
	claudeResponse := new(anthropic.Response)
	err = json.Unmarshal(awsResp.Body, claudeResponse)
	if err != nil {
		return wrapErr(errors.Wrap(err, "unmarshal response")), nil, ""
	}

	if len(claudeResponse.Content) > 0 {
		var thinkingText string
		var responseText string

		for _, content := range claudeResponse.Content {
			if content.Type == "thinking" {
				thinkingText = content.Thinking
			} else if content.Type == "text" {
				responseText = content.Text
			}
		}

		if thinkingText != "" {
			responseText = "<think>" + thinkingText + "</think>\n\n" + responseText
		}
	}
	usage := relaymodel.Usage{
		PromptTokens:     claudeResponse.Usage.InputTokens,
		CompletionTokens: claudeResponse.Usage.OutputTokens,
		TotalTokens:      claudeResponse.Usage.InputTokens + claudeResponse.Usage.OutputTokens,
	}

	c.JSON(http.StatusOK, claudeResponse)
	return nil, &usage, responseText
}

func StreamClaudeHandler(c *gin.Context, awsCli *bedrockruntime.Client) (*relaymodel.ErrorWithStatusCode, *relaymodel.Usage, string) {

	var awsModelId string
	var err error
	if cross := c.GetString(ctxkey.Cross); cross != "" {
		awsModelId, err = awsCrossModelID(c.GetString(ctxkey.RequestModel), cross)
	} else {
		awsModelId, err = awsModelID(c.GetString(ctxkey.RequestModel))
	}
	if err != nil {
		return wrapErr(errors.Wrap(err, "awsModelID")), nil, ""
	}

	awsReq := &bedrockruntime.InvokeModelWithResponseStreamInput{
		ModelId:     aws.String(awsModelId),
		Accept:      aws.String("application/json"),
		ContentType: aws.String("application/json"),
	}

	claudeReq_, ok := c.Get(ctxkey.ConvertedRequest)
	if !ok {
		return wrapErr(errors.New("request not found")), nil, ""
	}
	claudeReq := claudeReq_.(*anthropic.Request)
	if claudeReq == nil {
		return wrapErr(errors.New("claude request is nil")), nil, ""
	}

	awsClaudeReq := &Request{
		AnthropicVersion: "bedrock-2023-05-31",
	}
	if err = copier.Copy(awsClaudeReq, claudeReq); err != nil {
		return wrapErr(errors.Wrap(err, "copy request")), nil, ""
	}
	awsReq.Body, err = json.Marshal(awsClaudeReq)
	if err != nil {
		return wrapErr(errors.Wrap(err, "marshal request")), nil, ""
	}

	awsResp, err := awsCli.InvokeModelWithResponseStream(c.Request.Context(), awsReq)
	if err != nil {
		return wrapErr(errors.Wrap(err, "InvokeModelWithResponseStream")), nil, ""
	}
	stream := awsResp.GetStream()
	defer stream.Close()

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	var usage relaymodel.Usage
	var responseTextBuilder strings.Builder

	c.Stream(func(w io.Writer) bool {
		event, ok := <-stream.Events()
		if !ok {
			return false
		}

		switch v := event.(type) {
		case *types.ResponseStreamMemberChunk:
			// 首先解析响应
			var claudeResponse anthropic.StreamResponse
			if err := json.Unmarshal(v.Value.Bytes, &claudeResponse); err != nil {
				logger.SysError("Error unmarshalling stream response: " + err.Error())
				return true
			}

			// 构建事件流
			line := fmt.Sprintf("event: %s\ndata: %s\n\n", claudeResponse.Type, string(v.Value.Bytes))
			if _, err := w.Write([]byte(line)); err != nil {
				logger.SysError("Error writing stream: " + err.Error())
				return false
			}
			// 如果是消息结束，发送一个 ping 事件
			if claudeResponse.Type == "message_stop" {
				pingEvent := "event: ping\ndata: {\"type\": \"ping\"}\n\n"
				if _, err := w.Write([]byte(pingEvent)); err != nil {
					logger.SysError("Error writing ping event: " + err.Error())
					return false
				}
			}

			// 使用相同的转换逻辑
			response, meta := anthropic.StreamResponseClaude2OpenAI(&claudeResponse)
			if meta != nil {
				usage.PromptTokens += meta.Usage.InputTokens
				usage.CompletionTokens += meta.Usage.OutputTokens
			}
			if response != nil {
				responsePart := response.Choices[0].Delta.Content.(string)
				responseTextBuilder.WriteString(responsePart)
			}

			return true
		default:
			return false
		}
	})

	usage.TotalTokens = usage.PromptTokens + usage.CompletionTokens
	return nil, &usage, responseTextBuilder.String()
}

// 添加 Cohere 请求结构体
type CohereRequest struct {
	Message     string  `json:"message"`
	MaxTokens   int     `json:"max_tokens"`
	Temperature float64 `json:"temperature"`
}

// 添加 Cohere 响应结构体
type CohereResponse struct {
	Text string `json:"text"`
}

// 添加 Cohere 处理函数
func CohereHandler(c *gin.Context, awsCli *bedrockruntime.Client, modelName string) (*relaymodel.ErrorWithStatusCode, *relaymodel.Usage, string) {
	var awsModelId string
	var err error
	if cross := c.GetString(ctxkey.Cross); cross != "" {
		awsModelId, err = awsCrossModelID(c.GetString(ctxkey.RequestModel), cross)
	} else {
		awsModelId, err = awsModelID(c.GetString(ctxkey.RequestModel))
	}
	responseText := ""
	if err != nil {
		return wrapErr(errors.Wrap(err, "awsModelID")), nil, ""
	}

	awsReq := &bedrockruntime.InvokeModelInput{
		ModelId:     aws.String(awsModelId),
		Accept:      aws.String("application/json"),
		ContentType: aws.String("application/json"),
	}

	// 获取转换后的请求
	cohereReq_, ok := c.Get(ctxkey.ConvertedRequest)
	if !ok {
		return wrapErr(errors.New("request not found")), nil, ""
	}
	cohereReq := cohereReq_.(*CohereRequest)
	if cohereReq == nil {
		return wrapErr(errors.New("cohere request is nil")), nil, ""
	}

	awsReq.Body, err = json.Marshal(cohereReq)
	if err != nil {
		return wrapErr(errors.Wrap(err, "marshal request")), nil, ""
	}

	awsResp, err := awsCli.InvokeModel(c.Request.Context(), awsReq)
	if err != nil {
		return wrapErr(errors.Wrap(err, "InvokeModel")), nil, ""
	}

	cohereResponse := new(CohereResponse)
	err = json.Unmarshal(awsResp.Body, cohereResponse)
	if err != nil {
		return wrapErr(errors.Wrap(err, "unmarshal response")), nil, ""
	}

	// 构造 Claude 格式的响应以便复用转换函数
	claudeResponse := &anthropic.Response{
		Content: []anthropic.Content{
			{
				Type: "text",
				Text: cohereResponse.Text,
			},
		},
		Usage: anthropic.Usage{
			InputTokens:  len(cohereReq.Message) / 4,
			OutputTokens: len(cohereResponse.Text) / 4,
		},
	}

	responseText = cohereResponse.Text

	openaiResp := anthropic.ResponseClaude2OpenAI(claudeResponse)
	openaiResp.Model = modelName

	usage := relaymodel.Usage{
		PromptTokens:     claudeResponse.Usage.InputTokens,
		CompletionTokens: claudeResponse.Usage.OutputTokens,
		TotalTokens:      claudeResponse.Usage.InputTokens + claudeResponse.Usage.OutputTokens,
	}
	openaiResp.Usage = usage

	c.JSON(http.StatusOK, openaiResp)
	return nil, &usage, responseText
}

func StreamCohereHandler(c *gin.Context, awsCli *bedrockruntime.Client) (*relaymodel.ErrorWithStatusCode, *relaymodel.Usage, string) {
	var awsModelId string
	var err error
	if cross := c.GetString(ctxkey.Cross); cross != "" {
		awsModelId, err = awsCrossModelID(c.GetString(ctxkey.RequestModel), cross)
	} else {
		awsModelId, err = awsModelID(c.GetString(ctxkey.RequestModel))
	}
	if err != nil {
		return wrapErr(errors.Wrap(err, "awsModelID")), nil, ""
	}

	awsReq := &bedrockruntime.InvokeModelWithResponseStreamInput{
		ModelId:     aws.String(awsModelId),
		Accept:      aws.String("application/json"),
		ContentType: aws.String("application/json"),
	}

	cohereReq_, ok := c.Get(ctxkey.ConvertedRequest)
	if !ok {
		return wrapErr(errors.New("request not found")), nil, ""
	}
	cohereReq := cohereReq_.(*CohereRequest)
	if cohereReq == nil {
		return wrapErr(errors.New("cohere request is nil")), nil, ""
	}

	awsReq.Body, err = json.Marshal(cohereReq)
	if err != nil {
		return wrapErr(errors.Wrap(err, "marshal request")), nil, ""
	}

	awsResp, err := awsCli.InvokeModelWithResponseStream(c.Request.Context(), awsReq)
	if err != nil {
		return wrapErr(errors.Wrap(err, "InvokeModelWithResponseStream")), nil, ""
	}
	stream := awsResp.GetStream()
	defer stream.Close()

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	var usage relaymodel.Usage
	var responseTextBuilder strings.Builder
	createdTime := helper.GetTimestamp()
	sessionId := fmt.Sprintf("chatcmpl-%s", helper.GetUUID()) // 为整个会话生成一个统一的 ID

	c.Stream(func(w io.Writer) bool {
		event, ok := <-stream.Events()
		if !ok {
			if responseTextBuilder.Len() > 0 {
				// 计算最终使用量
				promptTokens := len(cohereReq.Message) / 4
				completionTokens := responseTextBuilder.Len() / 4
				usage = relaymodel.Usage{
					PromptTokens:     promptTokens,
					CompletionTokens: completionTokens,
					TotalTokens:      promptTokens + completionTokens,
				}

				// 发送带有 finish_reason 的消息
				finalResp := openai.ChatCompletionsStreamResponse{
					Id:      sessionId, // 使用统一的会话 ID
					Object:  "chat.completion.chunk",
					Created: createdTime,
					Model:   c.GetString(ctxkey.OriginalModel),
					Choices: []openai.ChatCompletionsStreamResponseChoice{
						{
							Delta: model.Message{
								Role:    "assistant",
								Content: "",
							},
							Index:        0,
							FinishReason: aws.String("stop"),
						},
					},
				}
				if jsonStr, err := json.Marshal(finalResp); err == nil {
					c.Render(-1, common.CustomEvent{Data: "data: " + string(jsonStr)})
				}

				// 发送使用量信息
				usageResp := openai.ChatCompletionsStreamResponse{
					Id:      sessionId, // 使用统一的会话 ID
					Object:  "chat.completion.chunk",
					Created: createdTime,
					Model:   c.GetString(ctxkey.OriginalModel),
					Choices: []openai.ChatCompletionsStreamResponseChoice{
						{
							Delta: model.Message{
								Role:    "assistant",
								Content: "",
							},
							Index: 0,
						},
					},
					Usage: &usage,
				}
				if jsonStr, err := json.Marshal(usageResp); err == nil {
					c.Render(-1, common.CustomEvent{Data: "data: " + string(jsonStr)})
				}

				c.Render(-1, common.CustomEvent{Data: "data: [DONE]"})
			}
			return false
		}

		switch v := event.(type) {
		case *types.ResponseStreamMemberChunk:
			var cohereResponse CohereResponse
			if err := json.Unmarshal(v.Value.Bytes, &cohereResponse); err != nil {
				logger.SysError("Error unmarshalling stream response: " + err.Error())
				return true
			}

			// 构造 OpenAI 格式的流式响应
			streamResp := openai.ChatCompletionsStreamResponse{
				Id:      sessionId, // 使用统一的会话 ID
				Object:  "chat.completion.chunk",
				Created: createdTime,
				Model:   c.GetString(ctxkey.OriginalModel),
				Choices: []openai.ChatCompletionsStreamResponseChoice{
					{
						Delta: model.Message{
							Role:    "assistant",
							Content: cohereResponse.Text,
						},
						Index: 0,
					},
				},
			}

			responseTextBuilder.WriteString(cohereResponse.Text)

			jsonStr, err := json.Marshal(streamResp)
			if err != nil {
				logger.SysError("Error marshalling stream response: " + err.Error())
				return true
			}
			c.Render(-1, common.CustomEvent{Data: "data: " + string(jsonStr)})
			return true
		default:
			return false
		}
	})

	return nil, &usage, responseTextBuilder.String()
}
