package model

import (
	"encoding/json"
	"fmt"
	"one-api/common"
	"one-api/common/client"
	"one-api/common/config"
	"strings"
	"sync"
	"time"

	"gorm.io/gorm"
)

type Channel struct {
	Id                    int     `json:"id"`
	Type                  int     `json:"type" gorm:"default:0"`
	Key                   string  `json:"key" gorm:"type:text"`
	OpenAIOrganization    *string `json:"openai_organization"`
	Status                int     `json:"status" gorm:"default:1"`
	Name                  string  `json:"name" gorm:"index"`
	Weight                *uint   `json:"weight" gorm:"default:0"`
	CreatedTime           int64   `json:"created_time" gorm:"bigint"`
	TestTime              int64   `json:"test_time" gorm:"bigint"`
	ResponseTime          int     `json:"response_time"` // in milliseconds
	BaseURL               *string `json:"base_url" gorm:"column:base_url;default:''"`
	Other                 string  `json:"other"`
	Balance               float64 `json:"balance"` // in USD
	BalanceUpdatedTime    int64   `json:"balance_updated_time" gorm:"bigint"`
	Models                string  `json:"models"`
	Tags                  string  `json:"tags" gorm:"type:varchar(255)"`
	Group                 string  `json:"group" gorm:"type:varchar(255);default:'default'"`
	UsedQuota             int64   `json:"used_quota" gorm:"bigint;default:0"`
	UsedCount             int     `json:"used_count" gorm:"default:0"`
	ModelMapping          *string `json:"model_mapping" gorm:"type:varchar(1024);default:''"`
	Headers               *string `json:"headers" gorm:"type:varchar(1024);default:''"`
	Priority              *int64  `json:"priority" gorm:"bigint;default:0"`
	AutoBan               *int    `json:"auto_ban" gorm:"default:1"`
	IsTools               *bool   `json:"is_tools" gorm:"default:true"`
	ClaudeOriginalRequest *bool   `json:"claude_original_request" gorm:"default:false"`
	TestedTime            *int    `json:"tested_time" gorm:"bigint"`
	ModelTest             string  `json:"model_test"`
	RateLimited           *bool   `json:"rate_limited" gorm:"default:false"`
	RateLimitCount        *int    `json:"rate_limit_count" gorm:"default:0"`
	IsImageURLEnabled     *int    `json:"is_image_url_enabled" gorm:"default:0"`
	StatusCodeMapping     *string `json:"status_code_mapping" gorm:"type:varchar(1024);default:''"`
	Config                string  `json:"config"`
	ProxyURL              *string `json:"proxy_url"`
	GcpAccount            *string `json:"gcp_account" gorm:"type:varchar(4096);default:''"`
	SupportsCacheControl  *bool   `json:"supports_cache_control"  gorm:"default:false"`
}
type ChannelConfig struct {
	Region       string `json:"region,omitempty"`
	SK           string `json:"sk,omitempty"`
	AK           string `json:"ak,omitempty"`
	Cross        string `json:"cross,omitempty"`
	UserID       string `json:"user_id,omitempty"`
	APIVersion   string `json:"api_version,omitempty"`
	LibraryID    string `json:"library_id,omitempty"`
	Plugin       string `json:"plugin,omitempty"`
	ProjectId    string `json:"project_id,omitempty"`
	ClientId     string `json:"client_id,omitempty"`
	ClientSecret string `json:"client_secret,omitempty"`
	RefreshToken string `json:"refresh_token,omitempty"`
	GeminiModel  string `json:"gemini_model,omitempty"`
}

func GetAllChannels(startIdx int, num int, selectAll bool, idSort bool) ([]*Channel, error) {
	var channels []*Channel
	var err error
	if selectAll {
		err = DB.Order("id desc").Find(&channels).Error
	} else {
		err = DB.Order("id desc").Limit(num).Offset(startIdx).Omit("key").Find(&channels).Error
	}
	return channels, err
}

func SearchChannels(keyword string, group string, typeKey string, models string) (channels []*Channel, err error) {
	keyCol := "`key`"
	if common.UsingPostgreSQL {
		keyCol = `"key"`
	}

	query := DB.Omit("key")

	if keyword != "" {
		query = query.Where("id = ? OR name LIKE ? OR "+keyCol+" = ?", common.String2Int(keyword), "%"+keyword+"%", keyword)
	}

	if group != "" {
		groupCol := "`group`"
		if common.UsingPostgreSQL {
			groupCol = `"group"`
		}
		query = query.Where(groupCol+" LIKE ?", "%"+group+"%")
	}

	if typeKey != "" {
		typeCol := "`type`"
		if common.UsingPostgreSQL {
			typeCol = `"type"`
		}
		query = query.Where(typeCol+" = ?", typeKey)
	}

	if models != "" {
		modelsCol := "`models`"
		if common.UsingPostgreSQL {
			modelsCol = `"models"`
		}
		modelsSlice := strings.Split(models, ",")
		for _, model := range modelsSlice {
			model = strings.TrimSpace(model) // 去除可能的前后空格
			query = query.Where(modelsCol+" LIKE ?", "%"+model+"%")
		}
	}

	err = query.Order("id desc").Find(&channels).Error
	return channels, err
}

func GetChannelById(id int, selectAll bool) (*Channel, error) {
	var channel Channel
	db := DB.Session(&gorm.Session{NewDB: true})

	var err error
	if selectAll {
		err = db.First(&channel, "id = ?", id).Error
	} else {
		err = db.Omit("key").First(&channel, "id = ?", id).Error
	}

	return &channel, err
}

func GetChannelByIdIsImageURLEnabled(id int) (*int, error) {
	var channel Channel
	db := DB.Session(&gorm.Session{NewDB: true})

	// 只选择 is_image_url_enabled 字段进行查询
	err := db.Select("is_image_url_enabled").First(&channel, "id = ?", id).Error
	if err != nil {
		return nil, err
	}

	return channel.IsImageURLEnabled, nil
}

func GetRandomChannel() (*Channel, error) {
	channel := Channel{}
	var err error = nil
	if common.UsingSQLite {
		err = DB.Where("status = ? and `group` = ?", common.ChannelStatusEnabled, "default").Order("RANDOM()").Limit(1).First(&channel).Error
	} else {
		err = DB.Where("status = ? and `group` = ?", common.ChannelStatusEnabled, "default").Order("RAND()").Limit(1).First(&channel).Error
	}
	return &channel, err
}

func BatchInsertChannels(channels []Channel) error {
	// 批量插入所有通道
	err := DB.Create(&channels).Error
	if err != nil {
		return fmt.Errorf("failed to batch insert channels: %v", err)
	}

	// 为 Type 40 的通道调用 checkAndGetAccessToken
	for i := range channels {
		if channels[i].Type == 42 {
			err = channels[i].checkAndGetAccessToken()
			if err != nil {
				return fmt.Errorf("failed to check and get access token for channel (Type 40, ID: %d): %v", channels[i].Id, err)
			}
		}
	}

	// 为所有通道添加能力（保持不变）
	for _, channel_ := range channels {
		err = channel_.AddAbilities()
		if err != nil {
			return err
		}
	}

	return nil
}

func BatchDeleteChannels(ids []int) error {
	//使用事务 删除channel表和channel_ability表
	tx := DB.Begin()
	err := tx.Where("id in (?)", ids).Delete(&Channel{}).Error
	if err != nil {
		// 回滚事务
		tx.Rollback()
		return err
	}
	err = tx.Where("channel_id in (?)", ids).Delete(&Ability{}).Error
	if err != nil {
		// 回滚事务
		tx.Rollback()
		return err
	}
	// 提交事务
	tx.Commit()
	return err
}

func (channel *Channel) GetPriority() int64 {
	if channel.Priority == nil {
		return 0
	}
	return *channel.Priority
}

func (channel *Channel) GetWeight() int {
	if channel.Weight == nil {
		return 0
	}
	return int(*channel.Weight)
}

func (channel *Channel) GetBaseURL() string {
	if channel.BaseURL == nil {
		return ""
	}
	return *channel.BaseURL
}

func (channel *Channel) GetModelMapping() map[string]string {
	if channel.ModelMapping == nil || *channel.ModelMapping == "" || *channel.ModelMapping == "{}" {
		return nil
	}
	modelMapping := make(map[string]string)
	err := json.Unmarshal([]byte(*channel.ModelMapping), &modelMapping)
	if err != nil {
		common.SysError(fmt.Sprintf("failed to unmarshal model mapping for channel %d, error: %s", channel.Id, err.Error()))
		return nil
	}
	return modelMapping
}

func (channel *Channel) GetModelHeaders() map[string]string {
	if channel.Headers == nil || *channel.Headers == "" || *channel.Headers == "{}" {
		return nil
	}
	headers := make(map[string]string)
	err := json.Unmarshal([]byte(*channel.Headers), &headers)
	if err != nil {
		common.SysError(fmt.Sprintf("failed to unmarshal headers for channel %d, error: %s", channel.Id, err.Error()))
		return nil
	}
	return headers
}

func (channel *Channel) GetStatusCodeMapping() string {
	if channel.StatusCodeMapping == nil {
		return ""
	}
	return *channel.StatusCodeMapping
}

func (channel *Channel) Insert() error {
	var err error
	err = DB.Create(channel).Error
	if err != nil {
		return err
	}
	err = channel.AddAbilities()
	if err != nil {
		return err
	}
	return channel.checkAndGetAccessToken()
}

func (channel *Channel) Update() error {
	var err error
	err = DB.Model(channel).Updates(channel).Error
	if err != nil {
		return err
	}
	DB.Model(channel).First(channel, "id = ?", channel.Id)
	err = channel.UpdateAbilities()
	if err != nil {
		return err
	}
	return channel.checkAndGetAccessToken()
}

func (channel *Channel) checkAndGetAccessToken() error {
	if channel.Type == 42 {
		var config ChannelConfig
		err := json.Unmarshal([]byte(channel.Config), &config)
		if err != nil {
			return fmt.Errorf("failed to unmarshal config: %v", err)
		}

		var accessToken string
		if channel.GcpAccount != nil && *channel.GcpAccount != "" {
			accessToken, err = client.GetGCPAccessToken(channel.GcpAccount, channel.ProxyURL)
			if err != nil {
				return fmt.Errorf("failed to get GCP access token for channel %d: %w", channel.Id, err)
			}
		} else {
			if config.ClientId == "" || config.ClientSecret == "" || config.RefreshToken == "" {
				return fmt.Errorf("missing required OAuth2 config fields for channel %d", channel.Id)
			}
			accessToken, err = client.GetAccessToken(config.ClientId, config.ClientSecret, config.RefreshToken, channel.ProxyURL)
			if err != nil {
				return fmt.Errorf("failed to get OAuth2 access token for channel %d: %w", channel.Id, err)
			}
		}

		if accessToken == "" {
			return fmt.Errorf("received empty access token for channel %d", channel.Id)
		}

		// 使用 accessToken 进行后续操作
		channel.Key = accessToken

		// 更新数据库中的 key 字段
		err = DB.Model(channel).Update("key", accessToken).Error
		if err != nil {
			return fmt.Errorf("failed to update channel key with new access token: %v", err)
		}
	}
	return nil
}

func (channel *Channel) UpdateResponseTime(responseTime int64) {
	err := DB.Model(channel).Select("response_time", "test_time").Updates(Channel{
		TestTime:     common.GetTimestamp(),
		ResponseTime: int(responseTime),
	}).Error
	if err != nil {
		common.SysError("failed to update response time: " + err.Error())
	}
}

func (channel *Channel) UpdateBalance(balance float64) {
	err := DB.Model(channel).Select("balance_updated_time", "balance").Updates(Channel{
		BalanceUpdatedTime: common.GetTimestamp(),
		Balance:            balance,
	}).Error
	if err != nil {
		common.SysError("failed to update balance: " + err.Error())
	}
}

func (channel *Channel) Delete() error {
	var err error
	err = DB.Delete(channel).Error
	if err != nil {
		return err
	}
	err = channel.DeleteAbilities()
	return err
}

func UpdateChannelStatusById(id int, status int) {
	err := UpdateAbilityStatus(id, status == common.ChannelStatusEnabled)
	if err != nil {
		common.SysError("failed to update ability status: " + err.Error())
	}
	err = DB.Model(&Channel{}).Where("id = ?", id).Update("status", status).Error
	if err != nil {
		common.SysError("failed to update channel status: " + err.Error())
	}
}

func UpdateChannelUsedQuota(id int, quota int) {
	if config.BatchUpdateEnabled {
		addNewRecord(BatchUpdateTypeChannelUsedQuota, id, quota)
		return
	}
	updateChannelUsedQuota(id, quota)
}

func updateChannelUsedQuota(id int, quota int) {
	err := DB.Model(&Channel{}).Where("id = ?", id).
		Updates(map[string]interface{}{
			"used_quota": gorm.Expr("used_quota + ?", quota),
			"used_count": gorm.Expr("used_count + 1"),
		}).Error
	if err != nil {
		common.SysError("failed to update channel used quota and count: " + err.Error())
	}
}

func DeleteChannelByStatus(status int64) (int64, error) {
	result := DB.Where("status = ?", status).Delete(&Channel{})
	return result.RowsAffected, result.Error
}

func DeleteDisabledChannel() (int64, error) {
	result := DB.Where("status = ? or status = ?", common.ChannelStatusAutoDisabled, common.ChannelStatusManuallyDisabled).Delete(&Channel{})
	return result.RowsAffected, result.Error
}

func (channel *Channel) LoadConfig() (ChannelConfig, error) {
	var cfg ChannelConfig
	if channel.Config == "" {
		return cfg, nil
	}
	err := json.Unmarshal([]byte(channel.Config), &cfg)
	if err != nil {
		return cfg, err
	}
	return cfg, nil
}

func StartScheduledRefreshAccessTokens() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			go func() {
				err := ScheduledRefreshAccessTokens()
				if err != nil {
					common.SysError(fmt.Sprintf("定时刷新访问令牌时发生错误：%v", err))
				}
			}()
		}
	}
}

func ScheduledRefreshAccessTokens() error {
	common.SysLog("开始定时刷新访问令牌")

	var channels []Channel

	// 查询所有 type = 40 的通道
	err := DB.Where("type = ?", 42).Find(&channels).Error
	if err != nil {
		return fmt.Errorf("没有GCP通道：%v", err)
	}

	var wg sync.WaitGroup
	semaphore := make(chan struct{}, 10) // 限制并发数为10

	for _, channel := range channels {
		wg.Add(1)
		semaphore <- struct{}{} // 获取信号量
		go func(ch Channel) {
			defer wg.Done()
			defer func() { <-semaphore }() // 释放信号量

			var config ChannelConfig
			err := json.Unmarshal([]byte(ch.Config), &config)
			if err != nil {
				common.SysError(fmt.Sprintf("解析通道 %d 的配置失败：%v", ch.Id, err.Error()))
				return
			}
			var accessToken string
			if ch.GcpAccount != nil && *ch.GcpAccount != "" {
				accessToken, err = client.GetGCPAccessToken(ch.GcpAccount, ch.ProxyURL)
			} else {
				accessToken, err = client.GetAccessToken(config.ClientId, config.ClientSecret, config.RefreshToken, ch.ProxyURL)
			}

			if err != nil {
				handleTokenError(ch, err)
				return
			}

			// 更新数据库中的 key 字段，如果状态为3则更新为1
			updates := map[string]interface{}{
				"key": accessToken,
			}
			if ch.Status == 3 {
				updates["status"] = 1
			}

			err = DB.Model(&ch).Updates(updates).Error
			if err != nil {
				common.SysError(fmt.Sprintf("更新通道 %d 失败：%v", ch.Id, err.Error()))
				return
			}

			if ch.Status == 3 {
				common.SysLog(fmt.Sprintf("成功更新通道 %d 的访问令牌并将状态更新为1", ch.Id))
			} else {
				common.SysLog(fmt.Sprintf("成功更新通道 %d 的访问令牌", ch.Id))
			}
		}(channel)
	}

	wg.Wait() // 等待所有goroutine完成

	return nil
}
func handleTokenError(ch Channel, err error) {
	if ch.Status == 1 {
		updateErr := DB.Model(&ch).Updates(map[string]interface{}{
			"status": 3,
		}).Error
		if updateErr != nil {
			common.SysError(fmt.Sprintf("更新通道 %d 状态为3失败：%v", ch.Id, updateErr))
		} else {
			common.SysError(fmt.Sprintf("由于获取令牌失败，通道 %d 的状态已更新为3", ch.Id))
		}
	}
	common.SysError(fmt.Sprintf("获取通道 %d 的访问令牌失败：%v", ch.Id, err))
}

func GetTaggedChannels() ([]*Channel, error) {
	var channels []*Channel
	// 查询所有有标签的渠道
	err := DB.Select("id, type, status, name, weight, created_time, test_time, response_time, balance, balance_updated_time, models, `group`, tags, used_quota, used_count, priority, auto_ban, tested_time, model_test, rate_limited").
		Where("tags IS NOT NULL AND tags != ''").
		Order("id desc").
		Find(&channels).Error
	return channels, err
}

func GetUntaggedChannels(startIdx int, num int) ([]*Channel, error) {
	var channels []*Channel
	// 查询所有没有标签的渠道，并进行分页
	err := DB.Select("id, type, status, name, weight, created_time, test_time, response_time, balance, balance_updated_time, models, `group`, tags, used_quota, used_count, priority, auto_ban, tested_time, model_test, rate_limited").
		Where("tags IS NULL OR tags = ''").
		Order("id desc").
		Limit(num).
		Offset(startIdx).
		Find(&channels).Error
	return channels, err
}

func GetUntaggedChannelsCount() (int64, error) {
	var count int64
	err := DB.Model(&Channel{}).
		Where("tags IS NULL OR tags = ''").
		Count(&count).Error
	return count, err
}

func CopyChannel(id int) (*Channel, error) {
	// 1. 查找原始渠道
	var originalChannel Channel
	if err := DB.First(&originalChannel, id).Error; err != nil {
		return nil, fmt.Errorf("未找到源渠道: %v", err)
	}

	// 2. 创建新的渠道对象
	newChannel := Channel{
		// 基本信息
		Type:   originalChannel.Type,
		Name:   originalChannel.Name + " (copy)",
		Status: originalChannel.Status,
		Weight: originalChannel.Weight,
		Other:  originalChannel.Other,
		Models: originalChannel.Models,
		Group:  originalChannel.Group,
		Tags:   originalChannel.Tags,

		// 配置信息
		OpenAIOrganization:    originalChannel.OpenAIOrganization,
		ModelMapping:          originalChannel.ModelMapping,
		Headers:               originalChannel.Headers,
		Priority:              originalChannel.Priority,
		AutoBan:               originalChannel.AutoBan,
		IsTools:               originalChannel.IsTools,
		ClaudeOriginalRequest: originalChannel.ClaudeOriginalRequest,
		TestedTime:            originalChannel.TestedTime,
		ModelTest:             originalChannel.ModelTest,
		RateLimitCount:        originalChannel.RateLimitCount,
		IsImageURLEnabled:     originalChannel.IsImageURLEnabled,
		StatusCodeMapping:     originalChannel.StatusCodeMapping,
		Config:                originalChannel.Config,
		ProxyURL:              originalChannel.ProxyURL,
		GcpAccount:            originalChannel.GcpAccount,
		SupportsCacheControl:  originalChannel.SupportsCacheControl,

		// 设置新的时间戳
		CreatedTime: time.Now().Unix(),

		// 重置的字段
		Key:                "", // 需要重新设置
		Balance:            0,
		BalanceUpdatedTime: 0,
		UsedQuota:          0,
		UsedCount:          0,
		TestTime:           0,
		ResponseTime:       0,
		RateLimited:        originalChannel.RateLimited, // 默认 false
	}

	// 3. 保存新渠道到数据库
	if err := DB.Create(&newChannel).Error; err != nil {
		return nil, fmt.Errorf("创建新渠道失败: %v", err)
	}

	return &newChannel, nil
}

// 重置通道的计数
func ResetChannelStats(id int) {
	DB.Model(&Channel{}).Where("id = ?", id).Updates(map[string]interface{}{
		"used_quota": 0,
		"balance":    0,
		"used_count": 0,
	})
}
