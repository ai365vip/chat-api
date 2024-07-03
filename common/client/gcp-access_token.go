package client

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type TokenManager struct {
	credentialsJSON []byte
	proxyURL        string
	tokenSource     oauth2.TokenSource
}

func GetGCPAccessToken(gcpAccount *string, proxyURL *string) (string, error) {
	if gcpAccount == nil || *gcpAccount == "" {
		return "", fmt.Errorf("GCP account is empty")
	}

	tokenManager, err := NewTokenManager(gcpAccount, proxyURL)
	if err != nil {
		return "", fmt.Errorf("failed to create token manager: %w", err)
	}

	return tokenManager.GetAccessToken()
}

func NewTokenManager(gcpAccount *string, proxyURL *string) (*TokenManager, error) {
	if gcpAccount == nil || *gcpAccount == "" {
		return nil, fmt.Errorf("GCP account is empty")
	}

	var proxyURLStr string
	if proxyURL != nil {
		proxyURLStr = *proxyURL
	}

	// Validate JSON format
	var jsonMap map[string]interface{}
	if err := json.Unmarshal([]byte(*gcpAccount), &jsonMap); err != nil {
		return nil, fmt.Errorf("invalid GCP account JSON: %w", err)
	}

	return &TokenManager{
		credentialsJSON: []byte(*gcpAccount),
		proxyURL:        proxyURLStr,
	}, nil
}

func (tm *TokenManager) GetAccessToken() (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if tm.tokenSource == nil {
		httpClient, err := GetProxiedHttpClient(tm.proxyURL)
		if err != nil {
			return "", fmt.Errorf("failed to create proxied http client: %w", err)
		}

		ctx = context.WithValue(ctx, oauth2.HTTPClient, httpClient)

		credentials, err := google.CredentialsFromJSON(ctx, tm.credentialsJSON, "https://www.googleapis.com/auth/cloud-platform")
		if err != nil {
			return "", fmt.Errorf("failed to create credentials: %w", err)
		}

		tm.tokenSource = credentials.TokenSource
	}

	token, err := tm.tokenSource.Token()
	if err != nil {
		return "", fmt.Errorf("failed to get token: %w", err)
	}

	if token.AccessToken == "" {
		return "", fmt.Errorf("received empty access token")
	}

	return token.AccessToken, nil
}
