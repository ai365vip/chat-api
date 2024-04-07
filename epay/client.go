package epay

import "net/url"

type Config struct {
	PartnerID string
	Key       string
}

var _ Service = (*Client)(nil)

// Service 易支付API
type Service interface {
	// Purchase 生成支付链接和参数
	Purchase(args *PurchaseArgs) (string, map[string]string, error)
	// Verify 验证回调参数是否符合签名
	Verify(params map[string]string) (*VerifyRes, error)
}

type Client struct {
	Config  *Config
	BaseUrl *url.URL
}

const DefaultUrl = "https://payment.moe/"

// NewClient 创建一个新的易支付客户端
func NewClient(config *Config) *Client {
	u, _ := url.Parse(DefaultUrl)

	return &Client{
		Config:  config,
		BaseUrl: u,
	}
}

// NewClientWithUrl 创建一个新的易支付客户端
func NewClientWithUrl(config *Config, baseUrl string) (*Client, error) {
	u, err := url.Parse(baseUrl)
	if err != nil {
		return nil, err
	}

	return &Client{
		Config:  config,
		BaseUrl: u,
	}, nil
}
