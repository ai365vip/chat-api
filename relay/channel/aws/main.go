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
					id = fmt.Sprintf("chatcmpl-%s", meta.Id)
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
