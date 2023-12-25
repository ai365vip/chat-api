package model

import (
	"context"
	"fmt"
	"one-api/common"
	"strings"

	"gorm.io/gorm"
)

type Log struct {
	Id               int    `json:"id;index:idx_created_at_id,priority:1"`
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
	TokenId          int    `json:"token_id" gorm:"default:0;index"`
	Multiplier       string `json:"multiplier"`
	UserQuota        int    `json:"userQuota"`
}

type Logs struct {
	Id               int    `json:"id;index:idx_created_at_id,priority:1"`
	UserId           int    `json:"user_id" gorm:"index"`
	CreatedAt        int64  `json:"created_at" gorm:"bigint;index:idx_created_at_id,priority:2;index:idx_created_at_type"`
	Type             int    `json:"type" gorm:"index:idx_created_at_type"`
	Username         string `json:"username" gorm:"index:index_username_model_name,priority:2;default:''"`
	TokenName        string `json:"token_name" gorm:"index;default:''"`
	ModelName        string `json:"model_name" gorm:"index;index:index_username_model_name,priority:1;default:''"`
	ChannelId        int    `json:"channel" gorm:"index"`
	TokenId          int    `json:"token_id" gorm:"default:0;index"`
	CreatedData      string `json:"created_data"`      // 匹配 DATE(datetime(created_at, 'unixepoch')) AS created_data
	Cishu            int    `json:"cishu"`             // 匹配 COUNT(id) AS cishu
	PromptTokens     int    `json:"prompt_tokens"`     // 匹配 SUM(prompt_tokens) AS prompt_tokens
	CompletionTokens int    `json:"completion_tokens"` // 匹配 SUM(completion_tokens) AS completion_tokens
	Quota            int    `json:"quota"`             // 匹配 SUM(quota/500000) AS quota
	Multiplier       string `json:"multiplier"`
	UserQuota        int    `json:"userQuota"`
}
type LogStatistic struct {
	Day              string `gorm:"column:day"`
	ModelName        string `gorm:"column:model_name"`
	RequestCount     int    `gorm:"column:request_count"`
	Quota            int    `gorm:"column:quota"`
	PromptTokens     int    `gorm:"column:prompt_tokens"`
	CompletionTokens int    `gorm:"column:completion_tokens"`
}

const (
	LogTypeUnknown = iota
	LogTypeTopup
	LogTypeConsume
	LogTypeManage
	LogTypeSystem
)

func GetLogByKey(key string) (logs []*Log, err error) {
	err = DB.Joins("left join tokens on tokens.id = logs.token_id").Where("tokens.key = ?", strings.Split(key, "-")[1]).Find(&logs).Error
	return logs, err
}

func RecordLog(userId int, logType int, multiplier string) {
	if logType == LogTypeConsume && !common.LogConsumeEnabled {
		return
	}
	log := &Log{
		UserId:     userId,
		Username:   GetUsernameById(userId),
		CreatedAt:  common.GetTimestamp(),
		Type:       logType,
		Multiplier: multiplier,
	}
	err := DB.Create(log).Error
	if err != nil {
		common.SysError("failed to record log: " + err.Error())
	}
}

func RecordConsumeLog(ctx context.Context, userId int, channelId int, promptTokens int, completionTokens int, modelName string, tokenName string, quota int, content string, tokenId int, multiplier string, userQuota int) {
	common.LogInfo(ctx, fmt.Sprintf("record consume log: userId=%d, 用户调用前余额=%d, channelId=%d, promptTokens=%d, completionTokens=%d, modelName=%s, tokenName=%s, quota=%d,multiplier=%s", userId, userQuota, channelId, promptTokens, completionTokens, modelName, tokenName, quota, multiplier))
	if !common.LogConsumeEnabled {
		return
	}
	log := &Log{
		UserId:           userId,
		Username:         GetUsernameById(userId),
		CreatedAt:        common.GetTimestamp(),
		Type:             LogTypeConsume,
		Content:          content,
		PromptTokens:     promptTokens,
		CompletionTokens: completionTokens,
		TokenName:        tokenName,
		ModelName:        modelName,
		Quota:            quota,
		ChannelId:        channelId,
		TokenId:          tokenId,
		Multiplier:       multiplier,
		UserQuota:        userQuota,
	}
	err := DB.Create(log).Error
	if err != nil {
		common.LogError(ctx, "failed to record log: "+err.Error())
	}
}

func GetAllLogs(logType int, startTimestamp int64, endTimestamp int64, modelName string, username string, tokenName string, startIdx int, num int, channel int) (logs []*Log, err error) {
	var tx *gorm.DB
	if logType == LogTypeUnknown {
		tx = DB
	} else {
		tx = DB.Where("type = ?", logType)
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
	err = tx.Order("id desc").Limit(num).Offset(startIdx).Find(&logs).Error
	return logs, err
}

func SearchLogsByDayAndModel(user_id, start, end int) (LogStatistics []*LogStatistic, err error) {
	groupSelect := "DATE_FORMAT(FROM_UNIXTIME(created_at), '%Y-%m-%d') as day"

	if common.UsingPostgreSQL {
		groupSelect = "TO_CHAR(date_trunc('day', to_timestamp(created_at)), 'YYYY-MM-DD') as day"
	}

	if common.UsingSQLite {
		groupSelect = "strftime('%Y-%m-%d', datetime(created_at, 'unixepoch')) as day"
	}

	err = DB.Raw(`
		SELECT `+groupSelect+`,
		model_name, count(1) as request_count,
		sum(quota) as quota,
		sum(prompt_tokens) as prompt_tokens,
		sum(completion_tokens) as completion_tokens
		FROM logs
		WHERE type=2
		AND user_id= ?
		AND created_at BETWEEN ? AND ?
		GROUP BY day, model_name
		ORDER BY day, model_name
	`, user_id, start, end).Scan(&LogStatistics).Error

	fmt.Println(user_id, start, end)

	return LogStatistics, err
}

func GetProLogs(db *gorm.DB, logType int, startTimestamp int64, endTimestamp int64, modelName string, username string, tokenName string, channel int) (logs []*Logs, total int64, err error) {
	// 确定当前使用的数据库方言
	dialect := db.Dialector.Name()

	// 构建 SELECT 子句和 GROUP BY 子句，这里要区分不同的数据库
	var selectClause, groupByClause string
	switch dialect {
	case "postgres":
		// PostgreSQL 方言的日期格式化
		selectClause = "TO_CHAR(TO_TIMESTAMP(created_at), 'YYYY-MM-DD') AS created_data, COUNT(id) AS cishu, SUM(prompt_tokens) AS prompt_tokens, SUM(completion_tokens) AS completion_tokens, SUM(quota) AS quota"
		groupByClause = "TO_CHAR(TO_TIMESTAMP(created_at), 'YYYY-MM-DD')"
	case "sqlite":
		// SQLite 方言的日期格式化
		selectClause = "DATE(datetime(created_at, 'unixepoch')) AS created_data, COUNT(id) AS cishu, SUM(prompt_tokens) AS prompt_tokens, SUM(completion_tokens) AS completion_tokens, SUM(quota) AS quota"
		groupByClause = "DATE(datetime(created_at, 'unixepoch'))"
	case "mysql":
		// MySQL 方言的日期格式化
		selectClause = "DATE_FORMAT(FROM_UNIXTIME(created_at), '%Y-%m-%d') AS created_data, COUNT(id) AS cishu, SUM(prompt_tokens) AS prompt_tokens, SUM(completion_tokens) AS completion_tokens, SUM(quota) AS quota"
		groupByClause = "DATE_FORMAT(FROM_UNIXTIME(created_at), '%Y-%m-%d')"
	default:
		return nil, 0, fmt.Errorf("不支持的数据库方言: %s", dialect)
	}

	query := db.Model(&Log{})

	if logType != LogTypeUnknown {
		query = query.Where("type = ?", logType)
	}
	if modelName != "" {
		query = query.Where("model_name = ?", modelName)
	}
	if username != "" {
		query = query.Where("username = ?", username)
	}
	if tokenName != "" {
		query = query.Where("token_name = ?", tokenName)
	}
	if startTimestamp != 0 {
		query = query.Where("created_at >= ?", startTimestamp)
	}
	if endTimestamp != 0 {
		query = query.Where("created_at <= ?", endTimestamp)
	}
	if channel != 0 {
		query = query.Where("channel_id = ?", channel)
	}

	// 定义结果结构体，包含了 GROUP BY 和 SELECT 语句中所需字段
	type groupResult struct {
		CreatedData      string
		Cishu            int
		PromptTokens     int
		CompletionTokens int
		Quota            int
	}

	var results []groupResult

	// 执行 GROUP BY 查询
	err = query.Select(selectClause).Group(groupByClause).Order("created_data DESC, quota DESC").Scan(&results).Error
	if err != nil {
		return nil, 0, fmt.Errorf("查询日志出错: %+v", err)
	}

	// 转换 results 到 Logs 结构体切片
	for _, result := range results {
		log := &Logs{
			CreatedData:      result.CreatedData,
			Cishu:            result.Cishu,
			PromptTokens:     result.PromptTokens,
			CompletionTokens: result.CompletionTokens,
			Quota:            result.Quota,
			// 其他字段根据需要填充
		}
		logs = append(logs, log)
	}

	const secondsInDay = 24 * 60 * 60
	totalDays := (endTimestamp - startTimestamp) / secondsInDay
	if (endTimestamp-startTimestamp)%secondsInDay != 0 {
		totalDays++ // 对于不满一天的部分也计为一天
	}

	// 将计算出的总天数赋值给 total
	total = totalDays

	return logs, total, nil
}

func GetUserLogs(userId int, logType int, startTimestamp int64, endTimestamp int64, modelName string, tokenName string, startIdx int, num int) (logs []*Log, err error) {
	var tx *gorm.DB
	if logType == LogTypeUnknown {
		tx = DB.Where("user_id = ?", userId)
	} else {
		tx = DB.Where("user_id = ? and type = ?", userId, logType)
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
	err = tx.Order("id desc").Limit(num).Offset(startIdx).Omit("id").Find(&logs).Error
	return logs, err
}

func SearchAllLogs(keyword string) (logs []*Log, err error) {
	err = DB.Where("type = ? or content LIKE ?", keyword, keyword+"%").Order("id desc").Limit(common.MaxRecentItems).Find(&logs).Error
	return logs, err
}

func SearchProLogs(keyword string) (logs []*Log, err error) {
	err = DB.Where("type = ? or content LIKE ?", keyword, keyword+"%").Order("id desc").Limit(common.MaxRecentItems).Find(&logs).Error
	return logs, err
}

func SearchUserLogs(userId int, keyword string) (logs []*Log, err error) {
	err = DB.Where("user_id = ? and type = ?", userId, keyword).Order("id desc").Limit(common.MaxRecentItems).Omit("id").Find(&logs).Error
	return logs, err
}

type Stat struct {
	Quota int `json:"quota"`
	Rpm   int `json:"rpm"`
	Tpm   int `json:"tpm"`
}

func SumUsedQuota(logType int, startTimestamp int64, endTimestamp int64, modelName string, username string, tokenName string, channel int) (stat Stat) {
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
