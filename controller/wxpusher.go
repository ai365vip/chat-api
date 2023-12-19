package controller

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"one-api/model"
	"strings"
)

const WxPusherAPIURL = "http://wxpusher.zjiecode.com/api/send/message"

type WxPusherRequest struct {
	AppToken    string   `json:"appToken"`
	Content     string   `json:"content"`
	Summary     string   `json:"summary"`
	ContentType int      `json:"contentType"`
	Uids        []string `json:"uids"`
}

// SendWxPusherNotification 使用WxPusher发送消息通知
func SendWxPusherNotification(title, content string) error {
	// 从OptionMap获取appToken
	appToken, exists := model.GetOptionFromMap("AppToken")
	if !exists || appToken == "" {
		return errors.New("appToken for WxPusher is not set or not found in OptionMap")
	}

	// 从OptionMap获取uids
	uidsStr, exists := model.GetOptionFromMap("Uids")
	if !exists || uidsStr == "" {
		return errors.New("UIDs for WxPusher are not set or not found in OptionMap")
	}
	uids := strings.Split(uidsStr, ",") // 假设UIDs在OptionMap中以逗号分隔

	requestData := WxPusherRequest{
		AppToken:    appToken,
		Content:     content,
		Summary:     title,
		ContentType: 1, // Content Type 1 表示文本
		Uids:        uids,
	}

	jsonData, err := json.Marshal(requestData)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", WxPusherAPIURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to send WxPusher notification, status code: %d", resp.StatusCode)
	}

	// 可以在这里进一步处理响应结果，如记录日志、重试机制等。

	return nil
}
