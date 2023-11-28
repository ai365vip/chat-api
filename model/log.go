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

func RecordLog(userId int, logType int, content string) {
	if logType == LogTypeConsume && !common.LogConsumeEnabled {
		return
	}
	log := &Log{
		UserId:    userId,
		Username:  GetUsernameById(userId),
		CreatedAt: common.GetTimestamp(),
		Type:      logType,
		Content:   content,
	}
	err := DB.Create(log).Error
	if err != nil {
		common.SysError("failed to record log: " + err.Error())
	}
}

func RecordConsumeLog(ctx context.Context, userId int, channelId int, promptTokens int, completionTokens int, modelName string, tokenName string, quota int, content string, tokenId int) {
	common.LogInfo(ctx, fmt.Sprintf("record consume log: userId=%d, channelId=%d, promptTokens=%d, completionTokens=%d, modelName=%s, tokenName=%s, quota=%d", userId, channelId, promptTokens, completionTokens, modelName, tokenName, quota))
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

func GetProLogs(logType int, startTimestamp int64, endTimestamp int64, modelName string, username string, tokenName string, channel int) (logs []*Logs, total int64, err error) {
	// 构建原始查询基础...
	var queryBase = `
        FROM
            logs
        WHERE
            1=1
    `

	var queryParams []interface{}
	var groupByFields []string // 使用一个切片来存储需要分组的字段列表

	if logType != LogTypeUnknown {
		queryBase += " AND type = ?"
		queryParams = append(queryParams, logType)
	}
	if modelName != "" {
		queryBase += " AND model_name = ?"
		queryParams = append(queryParams, modelName)
		groupByFields = append(groupByFields, "model_name") // 分组字段
	}
	if username != "" {
		queryBase += " AND username = ?"
		queryParams = append(queryParams, username)
		groupByFields = append(groupByFields, "username") // 分组字段
	}
	if tokenName != "" {
		queryBase += " AND token_name = ?"
		queryParams = append(queryParams, tokenName)
		groupByFields = append(groupByFields, "token_name") // 分组字段
	}
	if startTimestamp != 0 {
		queryBase += " AND created_at >= ?"
		queryParams = append(queryParams, startTimestamp)
	}
	if endTimestamp != 0 {
		queryBase += " AND created_at <= ?"
		queryParams = append(queryParams, endTimestamp)
	}
	if channel != 0 {
		queryBase += " AND channel_id = ?"
		queryParams = append(queryParams, channel)
		groupByFields = append(groupByFields, "channel_id") // 分组字段
	}

	// 构建 SELECT 和 GROUP BY 子句
	selectClause := "SELECT DATE_FORMAT(DATE_ADD(FROM_UNIXTIME(created_at), INTERVAL 12 HOUR), '%Y-%m-%d') AS created_data,"
	groupByClause := "GROUP BY created_data"
	for _, field := range groupByFields {
		selectClause += fmt.Sprintf(" %s,", field)
		groupByClause += fmt.Sprintf(", %s", field)
	}

	// 查询日志数据...
	dataQuery := selectClause + `
        COUNT(id) AS cishu,
        SUM(prompt_tokens) AS prompt_tokens,
        SUM(completion_tokens) AS completion_tokens,
        SUM(quota) AS quota
    ` + queryBase + `
    ` + groupByClause + `
    ORDER BY created_data DESC, quota DESC
    `

	tx := DB.Raw(dataQuery, queryParams...).Scan(&logs)
	err = tx.Error
	if err != nil {
		fmt.Printf("查询日志出错: %+v\n", err)
		return nil, 0, err
	}

	// 查询 dataQuery 结果的总条数
	totalQuery := `SELECT COUNT(*) AS count FROM (` + dataQuery + `) AS a`

	var totalResult struct {
		Count int64
	}
	err = DB.Raw(totalQuery, queryParams...).Scan(&totalResult).Error
	if err != nil {
		fmt.Printf("查询 dataQuery 结果的总条数出错: %+v\n", err)
		return nil, 0, err
	}
	total = totalResult.Count

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
