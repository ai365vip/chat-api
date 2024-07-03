package client

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
)

func GetAccessToken(clientId, clientSecret, refreshToken string, proxyURL *string) (string, error) {
	var TOKEN_URL = "https://www.googleapis.com/oauth2/v4/token"
	payload := strings.NewReader(fmt.Sprintf(`{
        "client_id": "%s",
        "client_secret": "%s",
        "refresh_token": "%s",
        "grant_type": "refresh_token"
    }`, clientId, clientSecret, refreshToken))

	req, err := http.NewRequest("POST", TOKEN_URL, payload)
	if err != nil {
		return "", err
	}

	req.Header.Add("Content-Type", "application/json")

	var client *http.Client
	if proxyURL != nil && *proxyURL != "" {
		client, err = GetProxiedHttpClient(*proxyURL)
		if err != nil {
			return "", fmt.Errorf("创建代理客户端失败: %v", err)
		}
	} else {
		client = &http.Client{}
	}

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode == 401 {
		return "", errors.New("获取AccessToken失败: 未授权（401）。请检查您的凭据")
	}

	var result map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return "", err
	}

	if errorMsg, ok := result["error"]; ok {
		errorDescription, _ := result["error_description"].(string)
		return "", fmt.Errorf("%v: %s", errorMsg, errorDescription)
	}

	accessToken, ok := result["access_token"].(string)
	if !ok {
		return "", errors.New("在响应中未找到访问令牌")
	}

	return accessToken, nil
}
