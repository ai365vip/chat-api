package openai

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"one-api/common"
	omodel "one-api/model"
	"one-api/relay/model"
	"one-api/relay/util"
	"strings"

	"net"
	"one-api/common/client"

	"github.com/gorilla/websocket"

	"github.com/bytedance/gopkg/util/gopool"
	"github.com/gin-gonic/gin"
	"golang.org/x/net/context"
)

func DoWssRequest(c *gin.Context, meta *util.RelayMeta, requestBody io.Reader) (*websocket.Conn, error) {
	baseUrl := strings.TrimPrefix(meta.BaseURL, "https://")
	baseUrl = strings.TrimPrefix(baseUrl, "http://")
	baseUrl = "wss://" + baseUrl + "/v1/realtime?model=" + meta.OriginModelName
	meta.BaseURL = baseUrl

	targetHeader := http.Header{}
	targetHeader.Set("openai-beta", "realtime=v1")
	targetHeader.Set("Authorization", "Bearer "+meta.APIKey)
	targetHeader.Set("Content-Type", c.Request.Header.Get("Content-Type"))

	// 创建支持代理的 websocket dialer
	dialer := websocket.Dialer{}
	if meta.ProxyURL != "" {
		proxyClient, err := client.GetProxiedHttpClient(meta.ProxyURL)
		if err != nil {
			return nil, fmt.Errorf("create proxy client failed: %w", err)
		}
		// 转换 DialContext 为 NetDial 函数
		dialer.NetDial = func(network, addr string) (net.Conn, error) {
			return proxyClient.Transport.(*http.Transport).DialContext(context.Background(), network, addr)
		}
	}

	targetConn, _, err := dialer.Dial(meta.BaseURL, targetHeader)
	if err != nil {
		return nil, fmt.Errorf("dial failed to %s: %w", meta.BaseURL, err)
	}

	return targetConn, nil
}

func OpenaiRealtimeHandler(c *gin.Context, meta *util.RelayMeta) (*model.ErrorWithStatusCode, *model.RealtimeUsage) {
	meta.IsStream = true
	clientConn := meta.ClientWs
	targetConn := meta.TargetWs

	// 使用 context 来管理所有 goroutine
	ctx, cancel := context.WithCancel(c.Request.Context())
	defer cancel()

	const channelSize = 32
	errChan := make(chan error, 2)

	usage := &model.RealtimeUsage{}
	localUsage := &model.RealtimeUsage{}
	sumUsage := &model.RealtimeUsage{}

	// 处理来自客户端的消息
	gopool.Go(func() {
		for {
			select {
			case <-ctx.Done():
				return
			default:
				if err := handleClientMessages(c, ctx, meta, clientConn, targetConn, localUsage); err != nil {
					if !isNormalClose(err) {
						errChan <- fmt.Errorf("client message error: %w", err)
					}
					return
				}
			}
		}
	})

	// 处理来自目标服务器的消息
	gopool.Go(func() {
		for {
			select {
			case <-ctx.Done():
				return
			default:
				if err := handleTargetMessages(c, ctx, meta, clientConn, targetConn, usage, localUsage, sumUsage); err != nil {
					if !isNormalClose(err) {
						errChan <- fmt.Errorf("target message error: %w", err)
					}
					return
				}
			}
		}
	})

	// 等待结束信号
	select {
	case err := <-errChan:
		common.LogError(c, "realtime error: "+err.Error())
	case <-ctx.Done():
	}

	// 最终处理未结算的使用量
	if err := finalizeUsage(c, meta, usage, localUsage, sumUsage); err != nil {
		common.LogError(c, "finalize usage error: "+err.Error())
	}

	return nil, sumUsage
}

func handleClientMessages(c *gin.Context, ctx context.Context, meta *util.RelayMeta,
	clientConn, targetConn *websocket.Conn, localUsage *model.RealtimeUsage) error {
	_, message, err := clientConn.ReadMessage()
	if err != nil {
		return err
	}

	realtimeEvent := &model.RealtimeEvent{}
	if err := json.Unmarshal(message, realtimeEvent); err != nil {
		return fmt.Errorf("error unmarshalling client message: %w", err)
	}

	// 处理会话更新
	if realtimeEvent.Type == RealtimeEventTypeSessionUpdate && realtimeEvent.Session != nil {
		if realtimeEvent.Session.Tools != nil {
			meta.RealtimeTools = realtimeEvent.Session.Tools
		}
	}

	// 计算token
	textToken, audioToken, err := CountTokenRealtime(meta, *realtimeEvent, meta.OriginModelName)
	if err != nil {
		return fmt.Errorf("error counting tokens: %w", err)
	}

	updateUsageInputTokens(localUsage, textToken, audioToken)

	// 转发消息到目标服务器
	if err := util.WssString(c, targetConn, string(message)); err != nil {
		return fmt.Errorf("error forwarding to target: %w", err)
	}

	return nil
}

func handleTargetMessages(c *gin.Context, ctx context.Context, meta *util.RelayMeta,
	clientConn, targetConn *websocket.Conn, usage, localUsage, sumUsage *model.RealtimeUsage) error {
	_, message, err := targetConn.ReadMessage()
	if err != nil {
		return err
	}

	meta.SetFirstResponseTime()
	realtimeEvent := &model.RealtimeEvent{}
	if err := json.Unmarshal(message, realtimeEvent); err != nil {
		return fmt.Errorf("error unmarshalling target message: %w", err)
	}

	switch realtimeEvent.Type {
	case RealtimeEventTypeResponseDone:
		if err := handleResponseDone(c, meta, realtimeEvent, usage, localUsage, sumUsage); err != nil {
			return fmt.Errorf("error handling response done: %w", err)
		}
	case RealtimeEventTypeSessionUpdated, RealtimeEventTypeSessionCreated:
		handleSessionUpdate(meta, realtimeEvent)
	default:
		if err := handleOtherEvents(meta, realtimeEvent, localUsage); err != nil {
			return fmt.Errorf("error handling other events: %w", err)
		}
	}

	// 转发消息到客户端
	if err := util.WssString(c, clientConn, string(message)); err != nil {
		return fmt.Errorf("error forwarding to client: %w", err)
	}

	return nil
}

func handleResponseDone(c *gin.Context, meta *util.RelayMeta, event *model.RealtimeEvent,
	usage, localUsage, sumUsage *model.RealtimeUsage) error {
	if event.Response != nil && event.Response.Usage != nil {
		updateUsageFromResponse(usage, event.Response.Usage)
		if err := preConsumeUsage(c, meta, usage, sumUsage); err != nil {
			return err
		}
		// 重置使用量
		usage = &model.RealtimeUsage{}
		localUsage = &model.RealtimeUsage{}
		return nil
	}

	// 如果没有使用量信息，使用本地计算的使用量
	textToken, audioToken, err := CountTokenRealtime(meta, *event, meta.OriginModelName)
	if err != nil {
		return err
	}

	meta.IsFirstRequest = false
	updateUsageInputTokens(localUsage, textToken, audioToken)
	if err := preConsumeUsage(c, meta, localUsage, sumUsage); err != nil {
		return err
	}
	localUsage = &model.RealtimeUsage{}
	return nil
}

func handleSessionUpdate(meta *util.RelayMeta, event *model.RealtimeEvent) {
	if event.Session != nil {
		meta.InputAudioFormat = GetStringIfEmpty(event.Session.InputAudioFormat, meta.InputAudioFormat)
		meta.OutputAudioFormat = GetStringIfEmpty(event.Session.OutputAudioFormat, meta.OutputAudioFormat)
	}
}

func handleOtherEvents(meta *util.RelayMeta, event *model.RealtimeEvent, localUsage *model.RealtimeUsage) error {
	textToken, audioToken, err := CountTokenRealtime(meta, *event, meta.OriginModelName)
	if err != nil {
		return err
	}

	updateUsageOutputTokens(localUsage, textToken, audioToken)
	return nil
}

func finalizeUsage(c *gin.Context, meta *util.RelayMeta, usage, localUsage, sumUsage *model.RealtimeUsage) error {
	if usage.TotalTokens != 0 && usage.OutputTokens != 0 {
		if err := preConsumeUsage(c, meta, usage, sumUsage); err != nil {
			return err
		}
	}

	if localUsage.TotalTokens != 0 && localUsage.OutputTokens != 0 {
		if err := preConsumeUsage(c, meta, localUsage, sumUsage); err != nil {
			return err
		}
	}

	return nil
}

func updateUsageInputTokens(usage *model.RealtimeUsage, textToken, audioToken int) {
	usage.TotalTokens += textToken + audioToken
	usage.InputTokens += textToken + audioToken
	usage.InputTokenDetails.TextTokens += textToken
	usage.InputTokenDetails.AudioTokens += audioToken
}

func updateUsageOutputTokens(usage *model.RealtimeUsage, textToken, audioToken int) {
	usage.TotalTokens += textToken + audioToken
	usage.OutputTokens += textToken + audioToken
	usage.OutputTokenDetails.TextTokens += textToken
	usage.OutputTokenDetails.AudioTokens += audioToken
}

func updateUsageFromResponse(usage *model.RealtimeUsage, responseUsage *model.RealtimeUsage) {
	usage.TotalTokens += responseUsage.TotalTokens
	usage.InputTokens += responseUsage.InputTokens
	usage.OutputTokens += responseUsage.OutputTokens
	usage.InputTokenDetails.AudioTokens += responseUsage.InputTokenDetails.AudioTokens
	usage.InputTokenDetails.CachedTokens += responseUsage.InputTokenDetails.CachedTokens
	usage.InputTokenDetails.TextTokens += responseUsage.InputTokenDetails.TextTokens
	usage.OutputTokenDetails.AudioTokens += responseUsage.OutputTokenDetails.AudioTokens
	usage.OutputTokenDetails.TextTokens += responseUsage.OutputTokenDetails.TextTokens
}

func isNormalClose(err error) bool {
	return websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway)
}

func preConsumeUsage(ctx *gin.Context, meta *util.RelayMeta, usage *model.RealtimeUsage, totalUsage *model.RealtimeUsage) error {
	totalUsage.TotalTokens += usage.TotalTokens
	totalUsage.InputTokens += usage.InputTokens
	totalUsage.OutputTokens += usage.OutputTokens
	totalUsage.InputTokenDetails.CachedTokens += usage.InputTokenDetails.CachedTokens
	totalUsage.InputTokenDetails.TextTokens += usage.InputTokenDetails.TextTokens
	totalUsage.InputTokenDetails.AudioTokens += usage.InputTokenDetails.AudioTokens
	totalUsage.OutputTokenDetails.TextTokens += usage.OutputTokenDetails.TextTokens
	totalUsage.OutputTokenDetails.AudioTokens += usage.OutputTokenDetails.AudioTokens
	// clear usage
	err := PreWssConsumeQuota(ctx, meta, usage)
	return err
}

func GetStringIfEmpty(str string, defaultValue string) string {
	if str == "" {
		return defaultValue
	}
	return str
}

func PreWssConsumeQuota(ctx *gin.Context, meta *util.RelayMeta, usage *model.RealtimeUsage) error {
	userQuota, err := omodel.GetUserQuota(meta.UserId)
	if err != nil {
		return err
	}

	token, err := omodel.GetTokenById(meta.TokenId)
	if err != nil {
		log.Println("获取token出错:", err)
	}

	modelName := meta.OriginModelName
	textInputTokens := usage.InputTokenDetails.TextTokens
	textOutTokens := usage.OutputTokenDetails.TextTokens
	audioInputTokens := usage.InputTokenDetails.AudioTokens
	audioOutTokens := usage.OutputTokenDetails.AudioTokens

	completionRatio := common.GetCompletionRatio(modelName)
	audioRatio := common.GetAudioRatio(meta.OriginModelName)
	audioCompletionRatio := common.GetAudioCompletionRatio(modelName)
	groupRatio := common.GetGroupRatio(meta.Group)
	modelRatio := common.GetModelRatio(modelName)

	ratio := groupRatio * modelRatio

	quota := textInputTokens + int(math.Round(float64(textOutTokens)*completionRatio))
	quota += int(math.Round(float64(audioInputTokens)*audioRatio)) + int(math.Round(float64(audioOutTokens)*audioRatio*audioCompletionRatio))

	quota = int(math.Round(float64(quota) * ratio))
	if ratio != 0 && quota <= 0 {
		quota = 1
	}

	if userQuota < int(quota) {
		return errors.New(fmt.Sprintf("用户额度不足，剩余额度为 %d", userQuota))
	}

	if token.RemainQuota < int(quota) {
		return errors.New(fmt.Sprintf("令牌额度不足，剩余额度为 %d", token.RemainQuota))
	}

	// 更新token用户配额
	err = omodel.PostConsumeTokenQuota(meta.TokenId, int(quota))
	if err != nil {
		return fmt.Errorf("user_quota_failed: %w", err)
	}
	// 更新redis配额
	if err := omodel.CacheDecreaseUserQuota(ctx, meta.UserId, int(quota)); err != nil {
		return fmt.Errorf("decrease_user_quota_failed: %w", err)
	}
	//common.LogInfo(ctx, "realtime streaming consume quota success, quota: "+fmt.Sprintf("%d", quota))

	return nil
}
