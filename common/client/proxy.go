package client

import (
	"context"
	"errors"
	"net"
	"net/http"
	"net/url"
	"strings"

	"golang.org/x/net/proxy"
)

func GetProxiedHttpClient(proxyUrl string) (*http.Client, error) {
	if proxyUrl == "" {
		return &http.Client{}, nil
	}

	u, err := url.Parse(proxyUrl)
	if err != nil {
		return nil, err
	}

	switch {
	case strings.HasPrefix(proxyUrl, "http"):
		return &http.Client{
			Transport: &http.Transport{
				Proxy: http.ProxyURL(u),
			},
		}, nil
	case strings.HasPrefix(proxyUrl, "socks"):
		dialer, err := proxy.FromURL(u, proxy.Direct)
		if err != nil {
			return nil, err
		}
		return &http.Client{
			Transport: &http.Transport{
				DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
					return dialer.(proxy.ContextDialer).DialContext(ctx, network, addr)
				},
			},
		}, nil
	default:
		return nil, errors.New("unsupported proxy type: " + proxyUrl)
	}
}

func ProxiedHttpRequest(method, url, proxyUrl string) (*http.Response, error) {
	client, err := GetProxiedHttpClient(proxyUrl)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return nil, err
	}

	return client.Do(req)
}

func ProxiedHttpGet(url, proxyUrl string) (*http.Response, error) {
	return ProxiedHttpRequest(http.MethodGet, url, proxyUrl)
}

func ProxiedHttpHead(url, proxyUrl string) (*http.Response, error) {
	return ProxiedHttpRequest(http.MethodHead, url, proxyUrl)
}
