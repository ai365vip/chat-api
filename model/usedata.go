package model

import (
	"fmt"
	"one-api/common"
	"one-api/common/config"
	"sync"
	"time"
)

// QuotaData 柱状图数据
type QuotaData struct {
	Id               int    `json:"id"`
	UserID           int    `json:"user_id" gorm:"index"`
	Username         string `json:"username" gorm:"index:idx_qdt_model_user_name,priority:2;size:64;default:''"`
	Type             int    `json:"type" gorm:"default:0"`
	ChannelId        int    `json:"channel" gorm:"index"`
	ModelName        string `json:"model_name" gorm:"index:idx_qdt_model_user_name,priority:1;size:64;default:''"`
	CreatedAt        int64  `json:"created_at" gorm:"bigint;index:idx_qdt_created_at,priority:2"`
	Count            int    `json:"count" gorm:"default:0"`
	PromptTokens     int    `json:"prompt_tokens" gorm:"default:0"`
	CompletionTokens int    `json:"completion_tokens" gorm:"default:0"`
	Quota            int    `json:"quota" gorm:"default:0"`
}

func UpdateQuotaData() {
	defer func() {
		if r := recover(); r != nil {
			common.SysLog(fmt.Sprintf("UpdateQuotaData panic: %s", r))
		}
	}()

	var currentInterval = config.DataExportInterval
	ticker := time.NewTicker(time.Duration(currentInterval) * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			common.SysLog("正在更新数据看板数据...")
			SaveQuotaDataCache()
			// 检查间隔是否已更改
			if currentInterval != config.DataExportInterval {
				ticker.Stop()
				currentInterval = config.DataExportInterval
				ticker = time.NewTicker(time.Duration(currentInterval) * time.Minute)
			}
		}
	}
}

var CacheQuotaData = make(map[string]*QuotaData)
var CacheQuotaDataLock = sync.Mutex{}

func LogQuotaDataCache(userId int, username string, LogType int, channelId int, modelName string, promptTokens int, completionTokens int, quota int, createdAt int64) {
	// 只精确到小时
	createdAt = createdAt - (createdAt % 3600)
	key := fmt.Sprintf("%d-%s-%d-%d-%s-%d", userId, username, LogType, channelId, modelName, createdAt)
	quotaData, ok := CacheQuotaData[key]
	if ok {
		quotaData.Count += 1
		quotaData.Quota += quota
		quotaData.PromptTokens += promptTokens
		quotaData.CompletionTokens += completionTokens
	} else {
		quotaData = &QuotaData{
			UserID:           userId,
			Username:         username,
			Type:             LogType,
			ChannelId:        channelId,
			ModelName:        modelName,
			CreatedAt:        createdAt,
			Count:            1,
			PromptTokens:     promptTokens,
			CompletionTokens: completionTokens,
			Quota:            quota,
		}
	}
	CacheQuotaData[key] = quotaData
}

func LogQuotaData(userId int, username string, LogType int, channelId int, modelName string, promptTokens int, completionTokens int, quota int, createdAt int64) {
	CacheQuotaDataLock.Lock()
	defer CacheQuotaDataLock.Unlock()
	LogQuotaDataCache(userId, username, LogType, channelId, modelName, promptTokens, completionTokens, quota, createdAt)
}

func SaveQuotaDataCache() {
	CacheQuotaDataLock.Lock()
	defer CacheQuotaDataLock.Unlock()
	size := len(CacheQuotaData)
	// 如果缓存中有数据，就保存到数据库中
	// 1. 先查询数据库中是否有数据
	// 2. 如果有数据，就更新数据
	// 3. 如果没有数据，就插入数据
	for _, quotaData := range CacheQuotaData {
		quotaDataDB := &QuotaData{}
		DB.Table("quota_data").Where("user_id = ? and type = ? and channel_id = ? and model_name = ? and created_at = ?",
			quotaData.UserID, quotaData.Type, quotaData.ChannelId, quotaData.ModelName, quotaData.CreatedAt).First(quotaDataDB)
		if quotaDataDB.Id > 0 {
			quotaDataDB.Count += quotaData.Count
			quotaDataDB.Quota += quotaData.Quota
			quotaDataDB.PromptTokens += quotaData.PromptTokens
			quotaDataDB.CompletionTokens += quotaData.CompletionTokens
			DB.Table("quota_data").Save(quotaDataDB)
		} else {
			DB.Table("quota_data").Create(quotaData)
		}
	}
	CacheQuotaData = make(map[string]*QuotaData)
	common.SysLog(fmt.Sprintf("保存数据看板数据成功，共保存%d条数据", size))
}

func GetQuotaDataByUsername(username string, startTime int64, endTime int64) (quotaData []*QuotaData, err error) {
	var quotaDatas []*QuotaData
	// 从quota_data表中查询数据
	err = DB.Table("quota_data").Where("username = ?", username).Find(&quotaDatas).Error
	return quotaDatas, err
}

func GetQuotaDataByUserId(userId int, startTime int64, endTime int64) (quotaData []*QuotaData, err error) {
	var quotaDatas []*QuotaData
	// 从quota_data表中查询数据
	err = DB.Table("quota_data").Where("user_id = ? and created_at >= ? and created_at <= ?", userId, startTime, endTime).Find(&quotaDatas).Error
	return quotaDatas, err
}

func GetAllQuotaDates(startTime int64, endTime int64) (quotaData []*QuotaData, err error) {
	var quotaDatas []*QuotaData
	// 从quota_data表中查询数据
	err = DB.Table("quota_data").Where("created_at >= ? and created_at <= ?", startTime, endTime).Find(&quotaDatas).Error
	return quotaDatas, err
}
