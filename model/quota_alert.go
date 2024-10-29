package model

import (
	"errors"
	"fmt"
	"one-api/common/config"
	"time"

	"gorm.io/gorm"
)

type QuotaAlertSettings struct {
	Id            int64  `json:"id"`
	UserId        int    `json:"user_id"`
	MinQuota      int    `json:"min_quota"`       // 最低额度阈值
	AlertInterval int    `json:"alert_interval"`  // 提醒间隔（小时）
	Email         string `json:"email"`           // 提醒邮箱
	LastAlertTime int64  `json:"last_alert_time"` // 上次提醒时间（Unix时间戳）
	Enabled       bool   `json:"enabled"`         // 是否启用提醒
	CreatedAt     int64  `json:"created_at"`      // 创建时间（Unix时间戳）
	UpdatedAt     int64  `json:"updated_at"`      // 更新时间（Unix时间戳）
}

func (QuotaAlertSettings) TableName() string {
	return "quota_alert_settings"
}

// SaveQuotaAlertSettings 保存用户的额度提醒设置
func SaveQuotaAlertSettings(settings *QuotaAlertSettings) error {
	// 首先获取用户当前的额度
	user, err := GetUserById(settings.UserId, false)
	if err != nil {
		return fmt.Errorf("获取用户信息失败: %w", err)
	}

	// 只有在启用提醒时才检查额度
	if settings.Enabled {
		// 计算用户实际额度
		userQuota := float64(user.Quota) / config.QuotaPerUnit

		// 检查设置的最低提醒额度是否高于用户当前额度
		if float64(settings.MinQuota) > userQuota {
			return fmt.Errorf("设置的最低提醒额度（%d）不能高于当前额度（%.2f）", settings.MinQuota, userQuota)
		}
	}

	var existingSettings QuotaAlertSettings
	err = DB.Where("user_id = ?", settings.UserId).First(&existingSettings).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// 如果没有找到记录，创建新记录
			now := time.Now().Unix()
			settings.CreatedAt = now
			settings.UpdatedAt = now
			return DB.Create(settings).Error
		}
		return err
	}
	// 如果找到了记录，更新现有记录
	existingSettings.MinQuota = settings.MinQuota
	existingSettings.AlertInterval = settings.AlertInterval
	existingSettings.Email = settings.Email
	existingSettings.Enabled = settings.Enabled
	existingSettings.UpdatedAt = time.Now().Unix()
	return DB.Save(&existingSettings).Error
}

// GetQuotaAlertSettingsByUserId 获取用户的额度提醒设置
func GetQuotaAlertSettingsByUserId(userId int) (*QuotaAlertSettings, error) {
	var settings QuotaAlertSettings
	err := DB.Where("user_id = ?", userId).First(&settings).Error
	return &settings, err
}

// GetEnabledQuotaAlertSettings 获取所有启用了提醒的设置
func GetEnabledQuotaAlertSettings() ([]QuotaAlertSettings, error) {
	var settings []QuotaAlertSettings
	err := DB.Where("enabled = ?", true).Find(&settings).Error
	return settings, err
}

// UpdateQuotaAlertSettings 更新额度提醒设置
func UpdateQuotaAlertSettings(settings *QuotaAlertSettings) error {
	return DB.Save(settings).Error
}
