package model

import (
	"encoding/json"
	"fmt"
	"one-api/common"

	"gorm.io/gorm"
)

type Channel struct {
	Id                 int     `json:"id"`
	Type               int     `json:"type" gorm:"default:0"`
	Key                string  `json:"key" gorm:"type:text"`
	OpenAIOrganization *string `json:"openai_organization"`
	Status             int     `json:"status" gorm:"default:1"`
	Name               string  `json:"name" gorm:"index"`
	Weight             *uint   `json:"weight" gorm:"default:0"`
	CreatedTime        int64   `json:"created_time" gorm:"bigint"`
	TestTime           int64   `json:"test_time" gorm:"bigint"`
	ResponseTime       int     `json:"response_time"` // in milliseconds
	BaseURL            *string `json:"base_url" gorm:"column:base_url;default:''"`
	Other              string  `json:"other"`
	Balance            float64 `json:"balance"` // in USD
	BalanceUpdatedTime int64   `json:"balance_updated_time" gorm:"bigint"`
	Models             string  `json:"models"`
	Group              string  `json:"group" gorm:"type:varchar(255);default:'default'"`
	UsedQuota          int64   `json:"used_quota" gorm:"bigint;default:0"`
	UsedCount          int     `json:"used_count" gorm:"default:0"`
	ModelMapping       *string `json:"model_mapping" gorm:"type:varchar(1024);default:''"`
	Headers            *string `json:"headers" gorm:"type:varchar(1024);default:''"`
	Priority           *int64  `json:"priority" gorm:"bigint;default:0"`
	AutoBan            *int    `json:"auto_ban" gorm:"default:1"`
	TestedTime         *int    `json:"tested_time" gorm:"bigint"`
	ModelTest          string  `json:"model_test"`
	RateLimited        *bool   `json:"rate_limited" gorm:"default:false"`
	IsImageURLEnabled  *int    `json:"is_image_url_enabled" gorm:"default:0"`
	Config             string  `json:"config"`
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

func SearchChannels(keyword string, group string) (channels []*Channel, err error) {
	keyCol := "`key`"
	if common.UsingPostgreSQL {
		keyCol = `"key"`
	}
	if group != "" {
		groupCol := "`group`"
		if common.UsingPostgreSQL {
			groupCol = `"group"`
		}
		err = DB.Omit("key").Where("(id = ? or name LIKE ? or "+keyCol+" = ?) and "+groupCol+" LIKE ?", common.String2Int(keyword), keyword+"%", keyword, "%"+group+"%").Order("id desc").Find(&channels).Error
	} else {
		err = DB.Omit("key").Where("id = ? or name LIKE ? or "+keyCol+" = ?", common.String2Int(keyword), keyword+"%", keyword).Order("id desc").Find(&channels).Error
	}
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
	var err error
	err = DB.Create(&channels).Error
	if err != nil {
		return err
	}
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

func (channel *Channel) LoadConfig() (map[string]string, error) {
	if channel.Config == "" {
		return nil, nil
	}
	cfg := make(map[string]string)
	err := json.Unmarshal([]byte(channel.Config), &cfg)
	if err != nil {
		return nil, err
	}
	return cfg, nil
}

func (channel *Channel) Insert() error {
	var err error
	err = DB.Create(channel).Error
	if err != nil {
		return err
	}
	err = channel.AddAbilities()
	return err
}

func (channel *Channel) Update() error {
	var err error
	err = DB.Model(channel).Updates(channel).Error
	if err != nil {
		return err
	}
	DB.Model(channel).First(channel, "id = ?", channel.Id)
	err = channel.UpdateAbilities()
	return err
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
	if common.BatchUpdateEnabled {
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
