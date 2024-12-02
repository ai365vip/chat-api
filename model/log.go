package model

import (
	"context"
	"fmt"
	"one-api/common"
	"one-api/common/config"
	"strings"
	"time"

	"gorm.io/gorm"
)

type Log struct {
	Id               int    `json:"id" gorm:"index:idx_created_at_id,priority:1"`
	UserId           int    `json:"user_id" gorm:"index"`
	CreatedAt        int64  `json:"created_at" gorm:"bigint;index:idx_created_at_id,priority:2;index:idx_created_at_type"`
	Type             int    `json:"type" gorm:"index:idx_created_at_type"`
	Content          string `json:"content"`
	Username         string `json:"username" gorm:"index:index_username_model_name,priority:2;default:''"`
	TokenName        string `json:"token_name" gorm:"index;default:''"`
	ModelName        string `json:"model_name" gorm:"index;index:index_username_model_name,priority:1;default:''"`
	Quota            int    `json:"quota" gorm:"default:0"`
	PromptTokens     int    `json:"prompt_tokens" gorm:"default:0"`
	CompletionTokens int    `json:"completion_tokens" gorm:"default:0"`
	ChannelId        int    `json:"channel" gorm:"index"`
	ChannelName      string `json:"channel_name"`
	TokenId          int    `json:"token_id" gorm:"default:0;index"`
	UseTime          int    `json:"use_time" gorm:"bigint;default:0"`
	IsStream         bool   `json:"is_stream" gorm:"default:false"`
	Multiplier       string `json:"multiplier"`
	UserQuota        int    `json:"userQuota"`
	AttemptsLog      string `json:"attempts_log"`
	Ip               string `json:"ip"`
}

type LogStatistic struct {
	Day              string `gorm:"column:day"`
	ModelName        string `gorm:"column:model_name"`
	RequestCount     int    `gorm:"column:request_count"`
	Quota            int    `gorm:"column:quota"`
	PromptTokens     int    `gorm:"column:prompt_tokens"`
	CompletionTokens int    `gorm:"column:completion_tokens"`
}

type UserLogResponse struct {
	Id               int    `json:"id" gorm:"index:idx_created_at_id,priority:1"`
	UserId           int    `json:"user_id" gorm:"index"`
	CreatedAt        int64  `json:"created_at" gorm:"bigint;index:idx_created_at_id,priority:2;index:idx_created_at_type"`
	Type             int    `json:"type" gorm:"index:idx_created_at_type"`
	Username         string `json:"username" gorm:"index:index_username_model_name,priority:2;default:''"`
	TokenName        string `json:"token_name" gorm:"index;default:''"`
	ModelName        string `json:"model_name" gorm:"index;index:index_username_model_name,priority:1;default:''"`
	Quota            int    `json:"quota" gorm:"default:0"`
	PromptTokens     int    `json:"prompt_tokens" gorm:"default:0"`
	CompletionTokens int    `json:"completion_tokens" gorm:"default:0"`
	TokenId          int    `json:"token_id" gorm:"default:0;index"`
	UseTime          int    `json:"use_time" gorm:"bigint;default:0"`
	IsStream         bool   `json:"is_stream" gorm:"default:false"`
	Multiplier       string `json:"multiplier"`
	UserQuota        int    `json:"userQuota"`
	Ip               string `json:"ip"`
}

const (
	LogTypeUnknown = iota
	LogTypeTopup
	LogTypeConsume
	LogTypeManage
	LogTypeSystem
	LogTypeAPIError
)

type HourlyStats struct {
	Hour   string  `json:"hour"`
	Count  int     `json:"count"`
	Amount float64 `json:"amount"`
}

type ModelStats struct {
	ModelName string  `json:"model_name"`
	Count     int     `json:"count"`
	Amount    float64 `json:"amount"`
}

func GetLogByKey(key string) (logs []*Log, err error) {
	err = DB.Joins("left join tokens on tokens.id = logs.token_id").
		Where("tokens.key = ? AND type != 5", strings.Split(key, "-")[1]).
		Order("created_at DESC").
		Find(&logs).Error
	return logs, err
}

func GetLogMjByKey(DB *gorm.DB, key string) (midjourneys []*Midjourney, err error) {
	// 分割 key 获取所需的参数
	parts := strings.Split(key, "-")
	if len(parts) < 2 {
		return nil, fmt.Errorf("无效的 key 格式: %s", key)
	}
	tokenKey := parts[1]

	dialect := DB.Dialector.Name()
	var sql string
	switch dialect {
	case "postgres":
		// PostgreSQL 方言的查询
		sql = `
			SELECT mj.* FROM midjourneys mj
			JOIN logs l ON mj.channel_id = l.channel_id AND mj.mj_id = l.content
			JOIN tokens t ON t.name = l.token_name
			WHERE t.key = ? AND l.model_name = 'midjourney'
			ORDER BY mj.start_time DESC
		`
	case "sqlite":
		// SQLite 方言的查询
		sql = `
			SELECT mj.* FROM midjourneys mj
			JOIN logs l ON mj.channel_id = l.channel_id AND mj.mj_id = l.content
			JOIN tokens t ON t.name = l.token_name
			WHERE t.key = ? AND l.model_name = 'midjourney'
			ORDER BY mj.start_time DESC
		`
	case "mysql":
		// MySQL 方言的查询
		sql = `
			SELECT mj.* FROM midjourneys mj
			JOIN logs l ON mj.channel_id = l.channel_id AND  mj.mj_id = l.content COLLATE utf8mb4_general_ci
			JOIN tokens t ON t.name = l.token_name
			WHERE t.key = ? AND l.model_name = 'midjourney'
			ORDER BY mj.start_time DESC
		`
	default:
		return nil, fmt.Errorf("不支持的数据库方言: %s", dialect)
	}

	err = DB.Raw(sql, tokenKey).Scan(&midjourneys).Error
	if err != nil {
		// 处理查询执行时遇到的任何错误
		return nil, fmt.Errorf("query execution failed: %v", err)
	}

	// 如果 midjourneys 为空，这意味着未找到与 key 匹配的记录
	if len(midjourneys) == 0 {
		return midjourneys, nil
	}

	return midjourneys, nil
}

func RecordLog(userId int, logType int, quota int, multiplier string) {
	if logType == LogTypeConsume && !config.LogConsumeEnabled {
		return
	}
	log := &Log{
		UserId:     userId,
		Username:   GetUsernameById(userId),
		CreatedAt:  common.GetTimestamp(),
		Quota:      quota,
		Type:       logType,
		Multiplier: multiplier,
	}
	err := DB.Create(log).Error
	if err != nil {
		common.SysError("failed to record log: " + err.Error())
	}

	LogQuotaData(userId, GetUsernameById(userId), LogTypeTopup, 0, "", 0, 0, quota, common.GetTimestamp())

}

func RecordConsumeLog(ctx context.Context, userId int, channelId int, channelName string, promptTokens int, completionTokens int, modelName string, tokenName string, quota int, content string, tokenId int, multiplier string, userQuota int, useTimeSeconds int, isStream bool, AttemptsLog string, Ip string) {
	common.LogInfo(ctx, fmt.Sprintf("record consume log: userId=%d, 用户调用前余额=%d, channelId=%d, promptTokens=%d, completionTokens=%d, modelName=%s, tokenName=%s, quota=%d,multiplier=%s", userId, userQuota, channelId, promptTokens, completionTokens, modelName, tokenName, quota, multiplier))
	if !config.LogConsumeEnabled {
		return
	}
	username := GetUsernameById(userId)
	log := &Log{
		UserId:           userId,
		Username:         username,
		CreatedAt:        common.GetTimestamp(),
		Type:             LogTypeConsume,
		Content:          content,
		PromptTokens:     promptTokens,
		CompletionTokens: completionTokens,
		TokenName:        tokenName,
		ModelName:        modelName,
		Quota:            quota,
		ChannelId:        channelId,
		ChannelName:      channelName,
		TokenId:          tokenId,
		Multiplier:       multiplier,
		UserQuota:        userQuota,
		UseTime:          useTimeSeconds,
		IsStream:         isStream,
		AttemptsLog:      AttemptsLog,
		Ip:               Ip,
	}
	err := DB.Create(log).Error
	if err != nil {
		common.LogError(ctx, "failed to record log: "+err.Error())
	}

	LogQuotaData(userId, username, LogTypeConsume, channelId, modelName, promptTokens, completionTokens, quota, common.GetTimestamp())

}

func GetAllLogs(logType int, startTimestamp int64, endTimestamp int64, modelName string, username string, tokenName string, startIdx int, num int, channel int) ([]*Log, int64, error) {
	var logs []*Log
	var count int64

	tx := DB.Model(&Log{})
	if logType == 6 {
		tx = tx.Where("attempts_log !='' AND type != 5")
	} else if logType != LogTypeUnknown {
		tx = tx.Where("type = ?", logType)
	}
	if modelName != "" {
		tx = tx.Where("model_name = ?", modelName)
	}
	if username != "" {
		tx = tx.Where("username = ?", username)
	}
	if tokenName != "" {
		tx = tx.Where("token_name = ?", tokenName)
	}
	if startTimestamp != 0 {
		tx = tx.Where("created_at >= ?", startTimestamp)
	}
	if endTimestamp != 0 {
		tx = tx.Where("created_at <= ?", endTimestamp)
	}
	if channel != 0 {
		tx = tx.Where("channel_id = ?", channel)
	}

	// 先计算符合条件的总记录数
	err := tx.Count(&count).Error
	if err != nil {
		return nil, 0, err
	}

	// 获取具体的日志记录
	err = tx.Order("id desc").Limit(num).Offset(startIdx).Find(&logs).Error
	return logs, count, err
}

func SearchLogsByDayAndModel(user_id int, startTimestamp, endTimestamp int64) (LogStatistics []*LogStatistic, err error) {
	AdjustHour := common.AdjustHour
	groupSelect := fmt.Sprintf("DATE_FORMAT(DATE_ADD(FROM_UNIXTIME(created_at), INTERVAL %d HOUR), '%%Y-%%m-%%d') as day", AdjustHour)

	if common.UsingPostgreSQL {
		groupSelect = fmt.Sprintf("TO_CHAR(date_trunc('day', to_timestamp(created_at) + INTERVAL '%d hours'), 'YYYY-MM-DD') as day", AdjustHour)
	}

	if common.UsingSQLite {
		groupSelect = fmt.Sprintf("strftime('%%Y-%%m-%%d', datetime(created_at, 'unixepoch', '+%d hours')) as day", AdjustHour)
	}

	err = DB.Raw(`
        SELECT `+groupSelect+`,
        model_name, sum(count) as request_count,
        sum(quota) as quota,
        sum(prompt_tokens) as prompt_tokens,
        sum(completion_tokens) as completion_tokens
        FROM quota_data
        WHERE type=2
        AND user_id= ?
        AND created_at BETWEEN ? AND ?
        GROUP BY day, model_name
        ORDER BY day, model_name
    `, user_id, startTimestamp, endTimestamp).Scan(&LogStatistics).Error

	//fmt.Println(user_id, startTimestamp, endTimestamp)

	return LogStatistics, err
}

func GetUserLogs(userId int, logType int, startTimestamp int64, endTimestamp int64, modelName string, tokenName string, startIdx int, num int) ([]*Log, int64, error) {
	var logs []*Log
	var count int64

	// 假设 Log 是你的日志记录结构体
	tx := DB.Model(&Log{}).Where("user_id = ?", userId)

	if logType == -1 {
		// 特殊值-1表示排除type=5的所有日志
		tx = tx.Where("type != 5")
	} else if logType != LogTypeUnknown {
		tx = tx.Where("type = ?", logType)
	}
	if modelName != "" {
		tx = tx.Where("model_name = ?", modelName)
	}
	if tokenName != "" {
		tx = tx.Where("token_name = ?", tokenName)
	}
	if startTimestamp != 0 {
		tx = tx.Where("created_at >= ?", startTimestamp)
	}
	if endTimestamp != 0 {
		tx = tx.Where("created_at <= ?", endTimestamp)
	}

	// 计算总数
	err := tx.Count(&count).Error
	if err != nil {
		return nil, 0, err
	}

	// 获取具体的日志记录
	err = tx.Order("id desc").Limit(num).Offset(startIdx).Find(&logs).Error
	if err != nil {
		return nil, 0, err
	}

	return logs, count, nil
}

func SearchAllLogs(keyword string) (logs []*Log, err error) {
	err = DB.Where("type = ? or content LIKE ?", keyword, keyword+"%").Order("id desc").Limit(config.MaxRecentItems).Find(&logs).Error
	return logs, err
}

func SearchProLogs(keyword string) (logs []*Log, err error) {
	err = DB.Where("type = ? or content LIKE ?", keyword, keyword+"%").Order("id desc").Limit(config.MaxRecentItems).Find(&logs).Error
	return logs, err
}

func SearchUserLogs(userId int, keyword string) (logs []*Log, err error) {
	err = DB.Where("user_id = ? and type = ?", userId, keyword).Order("id desc").Limit(config.MaxRecentItems).Omit("id").Find(&logs).Error
	return logs, err
}

type Stat struct {
	Quota int `json:"quota"`
	Rpm   int `json:"rpm"`
	Tpm   int `json:"tpm"`
}

func SumUsedQuota(logType int, startTimestamp int64, endTimestamp int64, modelName string, username string, tokenName string, channel int) (stat Stat) {
	// 获取当前时间的UNIX时间戳
	currentTime := time.Now().Unix()

	// 计算一分钟前的时间戳
	oneMinuteAgo := currentTime - 60

	// 创建基本查询，用于计算总Quota
	baseQuery := DB.Table("quota_data") // 更新表名为quota_data
	if username != "" {
		baseQuery = baseQuery.Where("username = ?", username)
	}
	if startTimestamp != 0 {
		baseQuery = baseQuery.Where("created_at >= ?", startTimestamp)
	}
	if endTimestamp != 0 {
		baseQuery = baseQuery.Where("created_at <= ?", endTimestamp)
	}
	if modelName != "" {
		baseQuery = baseQuery.Where("model_name = ?", modelName)
	}
	if channel != 0 {
		baseQuery = baseQuery.Where("channel_id = ?", channel)
	}
	baseQuery = baseQuery.Where("type = 2")
	// 计算总Quota
	baseQuery.Select("COALESCE(sum(quota), 0) as quota").Scan(&stat.Quota)

	rpmTpmQuery := DB.Table("logs").
		Where("created_at >= ?", oneMinuteAgo).
		Where("created_at <= ?", currentTime)
	if username != "" {
		rpmTpmQuery = rpmTpmQuery.Where("username = ?", username)
	}
	if tokenName != "" {
		rpmTpmQuery = rpmTpmQuery.Where("token_name >= ?", tokenName)
	}
	if modelName != "" {
		rpmTpmQuery = rpmTpmQuery.Where("model_name = ?", modelName)
	}
	if channel != 0 {
		rpmTpmQuery = rpmTpmQuery.Where("channel_id = ?", channel)
	}
	rpmTpmQuery = rpmTpmQuery.Where("type = 2")
	rpmTpmQuery.Select("count(*) as rpm, sum(prompt_tokens) + sum(completion_tokens) as tpm").Scan(&stat)

	return stat
}
func SumUsedProQuota(logType int, startTimestamp int64, endTimestamp int64, modelName string, username string, tokenName string, channel int) (stat Stat) {
	tx := DB.Table("logs").Select("sum(quota) quota, count(*) rpm, sum(prompt_tokens) + sum(completion_tokens) tpm")
	if username != "" {
		tx = tx.Where("username = ?", username)
	}
	if tokenName != "" {
		tx = tx.Where("token_name = ?", tokenName)
	}
	if startTimestamp != 0 {
		tx = tx.Where("created_at >= ?", startTimestamp)
	}
	if endTimestamp != 0 {
		tx = tx.Where("created_at <= ?", endTimestamp)
	}
	if modelName != "" {
		tx = tx.Where("model_name = ?", modelName)
	}
	if channel != 0 {
		tx = tx.Where("channel_id = ?", channel)
	}
	tx.Where("type = ?", LogTypeConsume).Scan(&stat)
	return stat
}

func SumUsedToken(logType int, startTimestamp int64, endTimestamp int64, modelName string, username string, tokenName string) (token int) {
	tx := DB.Table("logs").Select("ifnull(sum(prompt_tokens),0) + ifnull(sum(completion_tokens),0)")
	if username != "" {
		tx = tx.Where("username = ?", username)
	}
	if tokenName != "" {
		tx = tx.Where("token_name = ?", tokenName)
	}
	if startTimestamp != 0 {
		tx = tx.Where("created_at >= ?", startTimestamp)
	}
	if endTimestamp != 0 {
		tx = tx.Where("created_at <= ?", endTimestamp)
	}
	if modelName != "" {
		tx = tx.Where("model_name = ?", modelName)
	}
	tx.Where("type = ?", LogTypeConsume).Scan(&token)
	return token
}

func DeleteOldLog(targetTimestamp int64) (int64, error) {
	result := DB.Where("created_at < ?", targetTimestamp).Delete(&Log{})
	return result.RowsAffected, result.Error
}
func SearchHourlyAndModelStats(userID int, tokenName, modelName, startTimestamp, endTimestamp string) (hourlyStats []HourlyStats, modelStats []ModelStats, err error) {
	var hourlySelect, groupSelect string
	AdjustHour := common.AdjustHour
	switch {
	case common.UsingPostgreSQL:
		hourlySelect = "TO_CHAR(to_timestamp(created_at) + INTERVAL '%d hours', 'HH24:00') as hour"
		groupSelect = "TO_CHAR(date_trunc('day', to_timestamp(created_at) + INTERVAL '%d hours'), 'YYYY-MM-DD') as day"
	case common.UsingSQLite:
		hourlySelect = "strftime('%H:00', datetime(created_at, 'unixepoch', '+%d hours')) as hour"
		groupSelect = "strftime('%%Y-%%m-%%d', datetime(created_at, 'unixepoch', '+%d hours')) as day"
	default: // MySQL/MariaDB
		hourlySelect = "DATE_FORMAT(DATE_ADD(FROM_UNIXTIME(created_at), INTERVAL %d HOUR), '%%H:00') as hour"
		groupSelect = "DATE_FORMAT(DATE_ADD(FROM_UNIXTIME(created_at), INTERVAL %d HOUR), '%%Y-%%m-%%d') as day"
	}

	hourlySelect = fmt.Sprintf(hourlySelect, AdjustHour)
	groupSelect = fmt.Sprintf(groupSelect, AdjustHour)

	hourlyQuery := DB.Table("quota_data").
		Select(hourlySelect + ", SUM(count) as count, SUM(quota)/500000 as amount")

	modelQuery := DB.Table("quota_data").
		Select("model_name, SUM(count) as count, SUM(quota)/500000 as amount")

	// 添加条件
	conditions := make([]string, 0)
	values := make([]interface{}, 0)

	conditions = append(conditions, "created_at BETWEEN ? AND ?")
	values = append(values, startTimestamp, endTimestamp)

	conditions = append(conditions, "user_id = ?")
	values = append(values, userID)

	if tokenName != "" {
		conditions = append(conditions, "token_name LIKE ?")
		values = append(values, tokenName+"%")
	}
	if modelName != "" {
		conditions = append(conditions, "model_name LIKE ?")
		values = append(values, modelName+"%")
	}

	whereClause := strings.Join(conditions, " AND ")

	hourlyQuery = hourlyQuery.Where(whereClause, values...).Group("hour").Order("hour")
	modelQuery = modelQuery.Where(whereClause, values...).Group("model_name").Order("count DESC")

	err = hourlyQuery.Find(&hourlyStats).Error
	if err != nil {
		return
	}

	err = modelQuery.Find(&modelStats).Error
	return
}

// 添加记录登录日志的函数
func RecordLoginLog(ctx context.Context, userId int, ip string) {
	username := GetUsernameById(userId)
	log := &Log{
		UserId:     userId,
		Username:   username,
		CreatedAt:  common.GetTimestamp(),
		Type:       LogTypeSystem,
		Multiplier: "用户登录",
		Ip:         ip,
	}

	err := DB.Create(log).Error
	if err != nil {
		common.LogError(ctx, "failed to record login log: "+err.Error())
	}
}

// 新增记录API错误日志的函数
func RecordAPIErrorLog(userId int, channelId int, channelName, modelName, tokenName string, tokenId int, content string, ip string) {
	log := &Log{
		UserId:      userId,
		Username:    GetUsernameById(userId),
		CreatedAt:   common.GetTimestamp(),
		Type:        LogTypeAPIError,
		AttemptsLog: content,
		ChannelId:   channelId,
		ChannelName: channelName,
		ModelName:   modelName,
		TokenName:   tokenName,
		TokenId:     tokenId,
		Ip:          ip,
	}

	err := DB.Create(log).Error
	if err != nil {
		common.SysError("failed to record API error log: " + err.Error())
	}
}
