package aws

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

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
			c.Render(-1, common.CustomEvent{Data: "data: [DONE]"})
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
					if len(lastToolCallChoice.Delta.ToolCalls) > 0 {
						lastArgs := &lastToolCallChoice.Delta.ToolCalls[len(lastToolCallChoice.Delta.ToolCalls)-1].Function
						if len(lastArgs.Arguments.(string)) == 0 { // compatible with OpenAI sending an empty object `{}` when no arguments.
							lastArgs.Arguments = "{}"
							response.Choices[len(response.Choices)-1].Delta.Content = nil
							response.Choices[len(response.Choices)-1].Delta.ToolCalls = lastToolCallChoice.Delta.ToolCalls
						}
					}
				}
			}
			if response == nil {
				return true
			}
			responseText += response.Choices[0].Delta.Content.(string)
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

	responseText = claudeResponse.Content[0].Text
	usage := relaymodel.Usage{
		PromptTokens:     claudeResponse.Usage.InputTokens,
		CompletionTokens: claudeResponse.Usage.OutputTokens,
		TotalTokens:      claudeResponse.Usage.InputTokens + claudeResponse.Usage.OutputTokens,
	}

	c.JSON(http.StatusOK, claudeResponse)
	return nil, &usage, responseText
}

func StreamClaudeHandler(c *gin.Context, awsCli *bedrockruntime.Client) (*relaymodel.ErrorWithStatusCode, *relaymodel.Usage, string) {
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
	c.Stream(func(w io.Writer) bool {
		event, ok := <-stream.Events()
		if !ok {
			return false
		}

		switch v := event.(type) {
		case *types.ResponseStreamMemberChunk:
			var data map[string]interface{}
			if err := json.Unmarshal(v.Value.Bytes, &data); err != nil {
				logger.SysError("error unmarshalling stream response: " + err.Error())
				return false
			}
			eventType, ok := data["type"].(string)
			if !ok {
				logger.SysError("error getting event type")
				return false
			}

			// 处理不同类型的事件
			switch eventType {
			case "message_start":
				if message, ok := data["message"].(map[string]interface{}); ok {
					if usageData, ok := message["usage"].(map[string]interface{}); ok {
						usage.PromptTokens = int(usageData["input_tokens"].(float64))
					}
				}
			case "content_block_delta":
				if delta, ok := data["delta"].(map[string]interface{}); ok {
					if textDelta, ok := delta["text"].(string); ok {
						responseText += textDelta
					}
				}
			case "message_delta":
				if usageData, ok := data["usage"].(map[string]interface{}); ok {
					usage.CompletionTokens += int(usageData["output_tokens"].(float64))
				}
			case "message_stop":
				usage.TotalTokens = usage.PromptTokens + usage.CompletionTokens
			}

			// 构建新的响应格式
			response := fmt.Sprintf("event: %s\ndata: %s\n\n", eventType, string(v.Value.Bytes))

			_, err := w.Write([]byte(response))
			if err != nil {
				logger.SysError("error writing stream response: " + err.Error())
				return false
			}

			// 如果是 message_stop 事件，发送一个额外的 ping 事件
			if eventType == "message_stop" {
				pingEvent := "event: ping\ndata: {\"type\": \"ping\"}\n\n"
				_, err := w.Write([]byte(pingEvent))
				if err != nil {
					logger.SysError("error writing ping event: " + err.Error())
					return false
				}
			}

			return true
		case *types.UnknownUnionMember:
			logger.SysError("unknown tag: " + v.Tag)
			return false
		default:
			logger.SysError("union is nil or unknown type")
			return false
		}
	})
	return nil, &usage, responseText
}
