package model

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"one-api/common"
	"one-api/common/config"
	"sort"
	"strings"
	"sync"
	"time"

	"gorm.io/gorm"
)

type Ability struct {
	Group                 string `json:"group" gorm:"type:varchar(64);primaryKey;autoIncrement:false"`
	Model                 string `json:"model" gorm:"type:varchar(64);primaryKey;autoIncrement:false"`
	ChannelId             int    `json:"channel_id" gorm:"primaryKey;autoIncrement:false;index"`
	Enabled               bool   `json:"enabled"`
	Priority              *int64 `json:"priority" gorm:"bigint;default:0;index"`
	Weight                uint   `json:"weight" gorm:"default:0;index"`
	IsTools               *bool  `json:"is_tools" gorm:"default:true"`
	ClaudeOriginalRequest *bool  `json:"claude_original_request" gorm:"default:false"`
}

type ModelBillingInfo struct {
	Model                string  `json:"model"`
	ModelType            string  `json:"model_type"`
	ModelRatio           float64 `json:"model_ratio"` // ModelRatio中的值
	ModeCompletionlRatio float64 `json:"model_completion_ratio"`
	ModelPrice           float64 `json:"model_ratio_2"` // ModelPrice中的值（如果有的话）
}

type ModelRatios map[string]float64

func GetGroupModels(group string) ([]string, error) {
	groupCol := "`group`"
	trueVal := "1"
	if common.UsingPostgreSQL {
		groupCol = `"group"`
		trueVal = "true"
	}
	var models []string
	err := DB.Model(&Ability{}).Distinct("model").Where(groupCol+" = ? and enabled = "+trueVal, group).Pluck("model", &models).Error
	if err != nil {
		return nil, err
	}
	sort.Strings(models)
	return models, err
}

func GetGroupModelsBilling(group string, search string) ([]ModelBillingInfo, error) {
	var models []string
	groupCol := "`group`"
	if common.UsingPostgreSQL {
		groupCol = `"group"`
	}

	query := DB.Table("abilities").Where(groupCol+" = ? and enabled = ?", group, true)
	if search != "" {
		query = query.Where("model LIKE ?", "%"+search+"%")
	}
	err := query.Distinct("model").Pluck("model", &models).Error
	if err != nil {
		return nil, err
	}

	var options []struct {
		Key   string
		Value string
	}

	err = DB.Table("options").Where("`key` IN (?)", []string{"ModelRatio", "CompletionRatio", "ModelPrice"}).Find(&options).Error
	if err != nil {
		return nil, err
	}

	modelRatio := make(ModelRatios)
	if len(modelRatio) == 0 {
		jsonStr := config.OptionMap["ModelRatio"]
		if jsonStr == "" {
			jsonStr = common.ModelRatioJSONString()
		}
		err := json.Unmarshal([]byte(jsonStr), &modelRatio)
		if err != nil {
			return nil, fmt.Errorf("error unmarshalling ModelRatio: %v", err)
		}
	}

	ModelPrice := make(ModelRatios)
	var defaultModelPrice float64
	var hasDefault bool

	for _, option := range options {
		var ratios ModelRatios
		err = json.Unmarshal([]byte(option.Value), &ratios)
		if err != nil {
			return nil, err
		}
		if option.Key == "ModelRatio" {
			modelRatio = ratios
		} else if option.Key == "ModelPrice" {
			ModelPrice = ratios
			if defaultRatio, ok := ratios["default"]; ok {
				defaultModelPrice = defaultRatio
				hasDefault = true
			}
		}
	}

	var groupOption struct {
		Key   string
		Value string
	}
	groupRatioValue := 1.0
	err = DB.Table("options").Where("`key` = ?", "GroupRatio").First(&groupOption).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		groupRatioValue = 1.0
	} else if err != nil {
		return nil, err
	}

	if groupOption.Value != "" {
		var groupRatio ModelRatios
		err = json.Unmarshal([]byte(groupOption.Value), &groupRatio)
		if err != nil {
			return nil, err
		}
		if val, ok := groupRatio[group]; ok {
			groupRatioValue = val
		}
	}

	var modelsBillingInfos []ModelBillingInfo

	for _, model := range models {
		// 计算模型完成率
		modelCompletionRatio := common.GetCompletionRatio(model)

		var modelInfo ModelBillingInfo

		if model != "midjourney" {
			if ratio, exists := modelRatio[model]; exists {
				modelInfo.ModelRatio = ratio * groupRatioValue
				modelInfo.ModeCompletionlRatio = modelInfo.ModelRatio * modelCompletionRatio
			} else {
				modelInfo.ModelRatio = 15 * groupRatioValue
				modelInfo.ModeCompletionlRatio = modelInfo.ModelRatio * modelCompletionRatio
			}
		}

		if ratio, exists := ModelPrice[model]; exists {
			modelInfo.ModelPrice = ratio * groupRatioValue
		} else if hasDefault {
			modelInfo.ModelPrice = defaultModelPrice * groupRatioValue
		} else {
			modelInfo.ModelPrice = 0
		}

		modelInfo.Model = model
		// 不在这里设置 ModelType
		modelsBillingInfos = append(modelsBillingInfos, modelInfo)
	}

	return modelsBillingInfos, nil
}

var channelRateLimitStatus sync.Map // 存储每个 Channel 的频率限制状态
var rateLimitMutex sync.Mutex

type ChannelRateLimit struct {
	Count     int64     // 使用次数
	ResetTime time.Time // 上次重置时间
}

type ChannelModelKey struct {
	ChannelID int
	Model     string
}

func isRateLimited(channel Channel, channelId int, model string) bool {
	if (channel.RateLimited != nil && *channel.RateLimited) && (channel.RateLimitCount != nil && *channel.RateLimitCount > 0) {
		if _, ok := checkRateLimit(&channel, channelId, model); !ok {
			return true
		}
		updateRateLimitStatus(channelId, model)
	}
	return false
}

func checkRateLimit(channel *Channel, channelId int, model string) (*ChannelRateLimit, bool) {
	now := time.Now()
	key := ChannelModelKey{ChannelID: channelId, Model: model}

	rateLimitMutex.Lock()
	defer rateLimitMutex.Unlock()

	val, exists := channelRateLimitStatus.Load(key)
	if !exists { // 如果没有找到记录，则创建一个新的
		val = &ChannelRateLimit{
			Count:     1,                    // 初始化为1，表示这次请求被计数
			ResetTime: now.Add(time.Minute), // 设置下一个重置时间
		}
		channelRateLimitStatus.Store(key, val)
		return val.(*ChannelRateLimit), true
	}
	rl := val.(*ChannelRateLimit)
	if now.After(rl.ResetTime) {
		rl.Count = 1
		rl.ResetTime = now.Add(time.Minute)
		return rl, true
	} else if rl.Count <= (int64(*channel.RateLimitCount) + 1) {
		rl.Count++
		return rl, true
	}

	return rl, false
}

func updateRateLimitStatus(channelId int, model string) {
	now := time.Now()
	key := ChannelModelKey{ChannelID: channelId, Model: model}

	rateLimitMutex.Lock()
	defer rateLimitMutex.Unlock()

	val, _ := channelRateLimitStatus.Load(key)
	if val == nil {
		// 如果没有记录，则不执行任何操作
		return
	}

	rl := val.(*ChannelRateLimit)
	if now.After(rl.ResetTime) {
		// 重置频率限制状态
		rl.Count = 1
		rl.ResetTime = now.Add(time.Minute) // 设置ResetTime为下一分钟，而非当前时间
	} else {
		rl.Count++
	}

	channelRateLimitStatus.Store(key, rl)
}

func GetRandomSatisfiedChannel(group string, model string, excluded map[int]struct{}, ignoreFirstPriority bool, isTools bool, claudeoriginalrequest bool, i int) (*Channel, error) {
	// 当i等于1时，强制使用下一个优先级
	if i == 1 {
		return getChannelFromNextPriority(group, model)
	}

	abilities, err := getAbilitiesByPriority(group, model, ignoreFirstPriority, isTools, claudeoriginalrequest, excluded)
	if err != nil {
		return nil, err
	}

	channel := Channel{}
	for len(abilities) > 0 {
		selectedIdx, err := getRandomWeightedIndex(abilities)
		if err != nil {
			return nil, err
		}

		selectedAbility := abilities[selectedIdx]
		channelPtr, err := GetChannelById(selectedAbility.ChannelId, true)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				log.Printf("Channel with ID %d not found\n", selectedAbility.ChannelId)
			} else {
				return nil, err
			}
			abilities = removeAbility(abilities, selectedIdx)
			continue
		}

		channel = *channelPtr
		if isRateLimited(channel, selectedAbility.ChannelId, model) {
			abilities = removeAbility(abilities, selectedIdx)
			continue
		}

		return &channel, nil
	}

	return getChannelFromNextPriority(group, model)
}

func getAbilitiesByPriority(group string, model string, ignoreFirstPriority bool, isTools bool, claudeoriginalrequest bool, excluded map[int]struct{}) ([]Ability, error) {
	var abilities []Ability
	groupCol := "`group`"
	trueVal := "1"
	if common.UsingPostgreSQL {
		groupCol = `"group"`
		trueVal = "true"
	}

	channelQuery := DB.Where(groupCol+" = ? and model = ? and enabled = "+trueVal, group, model)
	if !ignoreFirstPriority {
		maxPrioritySubQuery := DB.Model(&Ability{}).Select("MAX(priority)").Where(groupCol+" = ? and model = ? and enabled = "+trueVal, group, model)
		channelQuery = channelQuery.Where("priority = (?)", maxPrioritySubQuery)
	}
	conditions := []string{}
	if isTools {
		conditions = append(conditions, "is_tools = true")
	}
	if claudeoriginalrequest {
		conditions = append(conditions, "claude_original_request = true")
	}
	if len(conditions) > 0 {
		combinedCondition := "(" + strings.Join(conditions, " OR ") + ")"
		channelQuery = channelQuery.Where(combinedCondition)
	}
	// 将 excluded 映射到一个切片
	excludedIds := make([]int, 0, len(excluded))
	for id := range excluded {
		excludedIds = append(excludedIds, id)
	}

	if len(excludedIds) > 0 {
		channelQuery = channelQuery.Where("channel_id NOT IN (?)", excludedIds)
	}
	err := channelQuery.Order("weight DESC").Find(&abilities).Error
	if err != nil {
		return nil, err
	}
	return abilities, nil
}

func getRandomWeightedIndex(abilities []Ability) (int, error) {
	weightSum := uint(0)
	for _, ability := range abilities {
		weightSum += ability.Weight
	}

	if weightSum == 0 {
		return common.GetRandomInt(len(abilities)), nil
	}

	randomWeight := common.GetRandomInt(int(weightSum))
	for i, ability := range abilities {
		randomWeight -= int(ability.Weight)
		if randomWeight <= 0 {
			return i, nil
		}
	}

	return -1, errors.New("unable to select a random weighted index")
}

func removeAbility(abilities []Ability, index int) []Ability {
	return append(abilities[:index], abilities[index+1:]...)
}

func getChannelFromNextPriority(group string, model string) (*Channel, error) {
	nextPriorityAbilities, err := getNextPriorityAbilities(group, model)
	if err != nil {
		return nil, err
	}

	if len(nextPriorityAbilities) > 0 {
		randomIdx := common.GetRandomInt(len(nextPriorityAbilities))
		selectedAbility := nextPriorityAbilities[randomIdx]
		channelPtr, err := GetChannelById(selectedAbility.ChannelId, true)
		if err != nil {
			return nil, err
		}
		return channelPtr, nil
	}

	return nil, errors.New("no channels available within rate limits")
}

func getNextPriorityAbilities(group string, model string) ([]Ability, error) {
	var abilities []Ability
	groupCol := "`group`"
	trueVal := "1"
	if common.UsingPostgreSQL {
		groupCol = `"group"`
		trueVal = "true"
	}

	// 首先获取当前最高优先级
	var maxPriority int
	err := DB.Table("abilities").
		Select("COALESCE(MAX(priority), 0) as max_priority"). // 假定最低优先级为 0
		Where(groupCol+" = ? AND model = ? AND enabled = "+trueVal, group, model).
		Pluck("max_priority", &maxPriority).Error

	if err != nil {
		return nil, err
	}

	// 使用得到的最高优先级来查询次高优先级的渠道列表
	// 我们从那些其 priority 小于当前最高优先级的记录中选择最大值
	nextMaxPrioritySubQuery := DB.Model(&Ability{}).Select("MAX(priority)").
		Where(groupCol+" = ? AND model = ? AND enabled = "+trueVal+" AND priority < ?", group, model, maxPriority)

	// 根据次高优先级查询能力列表
	err = DB.Where(groupCol+" = ? AND model = ? AND enabled = "+trueVal+" AND priority = (?)", group, model, nextMaxPrioritySubQuery).
		Order("weight DESC").
		Find(&abilities).Error

	if err != nil {
		return nil, err
	}
	return abilities, nil
}

func (channel *Channel) AddAbilities() error {
	models_ := strings.Split(channel.Models, ",")
	groups_ := strings.Split(channel.Group, ",")
	abilities := make([]Ability, 0, len(models_))
	for _, model := range models_ {
		for _, group := range groups_ {
			ability := Ability{
				Group:                 group,
				Model:                 model,
				ChannelId:             channel.Id,
				Enabled:               channel.Status == common.ChannelStatusEnabled,
				Priority:              channel.Priority,
				Weight:                uint(channel.GetWeight()),
				IsTools:               channel.IsTools,
				ClaudeOriginalRequest: channel.ClaudeOriginalRequest,
			}
			abilities = append(abilities, ability)
		}
	}
	return DB.Create(&abilities).Error
}

func (channel *Channel) DeleteAbilities() error {
	return DB.Where("channel_id = ?", channel.Id).Delete(&Ability{}).Error
}

// UpdateAbilities updates abilities of this channel.
// Make sure the channel is completed before calling this function.
func (channel *Channel) UpdateAbilities() error {
	// A quick and dirty way to update abilities
	// First delete all abilities of this channel
	err := channel.DeleteAbilities()
	if err != nil {
		return err
	}
	// Then add new abilities
	err = channel.AddAbilities()
	if err != nil {
		return err
	}
	return nil
}

func UpdateAbilityStatus(channelId int, status bool) error {
	return DB.Model(&Ability{}).Where("channel_id = ?", channelId).Select("enabled").Update("enabled", status).Error
}
