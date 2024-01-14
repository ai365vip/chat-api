package model

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"one-api/common"
	"strings"
	"sync"
	"time"

	"gorm.io/gorm"
)

type Ability struct {
	Group     string `json:"group" gorm:"type:varchar(64);primaryKey;autoIncrement:false"`
	Model     string `json:"model" gorm:"type:varchar(64);primaryKey;autoIncrement:false"`
	ChannelId int    `json:"channel_id" gorm:"primaryKey;autoIncrement:false;index"`
	Enabled   bool   `json:"enabled"`
	Priority  *int64 `json:"priority" gorm:"bigint;default:0;index"`
	Weight    uint   `json:"weight" gorm:"default:0;index"`
}

type ModelBillingInfo struct {
	Model           string  `json:"model"`
	ModelRatio      float64 `json:"model_ratio"`      // ModelRatio中的值
	ModelPrice      float64 `json:"model_ratio_2"`    // ModelPrice中的值（如果有的话）
	CalculatedRatio float64 `json:"calculated_ratio"` // 计算后的比率
}

type ModelRatios map[string]float64

func GetGroupModels(group string) []string {
	var models []string
	// Find distinct models
	groupCol := "`group`"
	if common.UsingPostgreSQL {
		groupCol = `"group"`
	}
	DB.Table("abilities").Where(groupCol+" = ? and enabled = ?", group, true).Distinct("model").Pluck("model", &models)
	return models
}

func GetGroupModelsBilling(group string) ([]ModelBillingInfo, error) {
	var models []string
	// 获取所有模型名称
	groupCol := "`group`"
	if common.UsingPostgreSQL {
		groupCol = `"group"`
	}

	err := DB.Table("abilities").Where(groupCol+" = ? and enabled = ?", group, true).Distinct("model").Pluck("model", &models).Error
	if err != nil {
		return nil, err
	}

	// 查询options表获取ModelRatio和ModelPrice的值
	var options []struct {
		Key   string
		Value string
	}

	err = DB.Table("options").Where("`key` IN (?)", []string{"ModelRatio", "ModelPrice"}).Find(&options).Error
	if err != nil {
		return nil, err
	}

	// 解析ModelRatio 和 ModelPrice 的值
	modelRatio := make(ModelRatios)
	if len(modelRatio) == 0 {
		jsonStr := common.OptionMap["ModelRatio"]
		if jsonStr == "" {
			jsonStr = common.ModelRatioJSONString()
		}
		err := json.Unmarshal([]byte(jsonStr), &modelRatio)
		if err != nil {
			return nil, fmt.Errorf("error unmarshalling ModelRatio from common: %v", err)
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
			// 尝试获取ModelPrice的默认值
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
	var groupRatioValue float64 = 1
	err = DB.Table("options").Where("`key` = ?", "GroupRatio").First(&groupOption).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// 如果记录未找到，则将相关变量设置为默认值 1
		groupRatioValue = 1
	} else if err != nil {
		// 如果有其他错误，则返回错误
		return nil, err
	}

	if groupOption.Value != "" {
		var groupRatio ModelRatios
		err = json.Unmarshal([]byte(groupOption.Value), &groupRatio)
		if err != nil {
			return nil, err
		}
		// 获取 group 对应的 ratio，如果没有特定于组的比率则使用默认值
		if val, ok := groupRatio[group]; ok {
			groupRatioValue = val
		}
	}

	var modelsBillingInfos []ModelBillingInfo

	for _, model := range models {
		var modelInfo ModelBillingInfo

		// 查找ModelRatio和ModelPrice的值
		if model != "midjourney" {
			if ratio, exists := modelRatio[model]; exists {
				modelInfo.ModelRatio = ratio * groupRatioValue
			} else {
				// 如果ModelRatio不存在，使用默认值15
				modelInfo.ModelRatio = 15 * groupRatioValue
			}
		}

		if ratio, exists := ModelPrice[model]; exists {
			modelInfo.ModelPrice = ratio * groupRatioValue
		} else if hasDefault {
			// 如果ModelPrice不存在但有默认值，则使用此默认值
			modelInfo.ModelPrice = defaultModelPrice * groupRatioValue
		} else {
			// 如果ModelPrice不存在并且没有默认值，则设置为0
			modelInfo.ModelPrice = 0
		}

		modelInfo.Model = model
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

func checkRateLimit(channelId int) (*ChannelRateLimit, bool) {
	now := time.Now()

	rateLimitMutex.Lock()
	val, _ := channelRateLimitStatus.Load(channelId)
	rateLimitMutex.Unlock()

	if val == nil { // 如果没有找到记录，则创建一个新的
		val = &ChannelRateLimit{
			Count:     0,
			ResetTime: now,
		}
		channelRateLimitStatus.Store(channelId, val)
	}

	rl := val.(*ChannelRateLimit)

	if now.Sub(rl.ResetTime) >= time.Minute {
		// 如果已经过了重置时间，则重置频率限制状态
		return &ChannelRateLimit{Count: 0, ResetTime: now}, true
	}

	if rl.Count < 3 {
		return rl, true
	}

	// 当 Count 到达3时，说明已经超出限制
	return rl, false
}

func updateRateLimitStatus(channelId int) {
	now := time.Now()

	rateLimitMutex.Lock()
	defer rateLimitMutex.Unlock()

	val, _ := channelRateLimitStatus.Load(channelId)
	if val == nil {
		return // 如果没有记录，则不执行任何操作
	}

	rl := val.(*ChannelRateLimit)
	if now.Sub(rl.ResetTime) >= time.Minute {
		// 重置频率限制状态
		rl.Count = 1
		rl.ResetTime = now
	} else {
		// 增加使用次数
		rl.Count++
	}

	channelRateLimitStatus.Store(channelId, rl)
}

func GetRandomSatisfiedChannel(group string, model string) (*Channel, error) {
	abilities, err := getAbilitiesByPriority(group, model)
	if err != nil {
		return nil, err
	}
	channel := Channel{}
	for len(abilities) > 0 {
		// Randomly choose one based on weight
		weightSum := uint(0)
		for _, ability := range abilities {
			weightSum += ability.Weight
		}

		// 这里通过随机选择模拟一个加权随机算法
		selectedIdx := -1
		if weightSum == 0 {
			selectedIdx = common.GetRandomInt(len(abilities))
		} else {
			randomWeight := common.GetRandomInt(int(weightSum))
			for i, ability := range abilities {
				randomWeight -= int(ability.Weight)
				if randomWeight <= 0 {
					selectedIdx = i
					break
				}
			}
		}
		var rateLimitedAbilities []int

		selectedAbility := abilities[selectedIdx]

		//log.Println("查询ID", selectedAbility.ChannelId)

		// 使用 GetChannelById 函数并对返回的指针进行解引用
		channelPtr, err := GetChannelById(selectedAbility.ChannelId, true)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				// 如果记录未找到，可能需要进行一些特定的处理
				log.Printf("Channel with ID %d not found\n", selectedAbility.ChannelId)
			} else {
				// 对于除记录未找到外的其他错误，直接返回错误
				return nil, err
			}

			// 移除当前渠道，继续选择下一个渠道
			log.Println("无法获取渠道", selectedAbility.ChannelId)
			abilities = append(abilities[:selectedIdx], abilities[selectedIdx+1:]...)
			if len(abilities) == 0 { // 检查是否还有其他可用渠道
				return nil, errors.New("no channels available within rate limits")
			}
			continue
		}
		channel = *channelPtr

		// 检查该渠道是否启用了频率限制以及是否达到了频率限制
		rateLimited := channel.RateLimited != nil && *channel.RateLimited
		if rateLimited {
			_, ok := checkRateLimit(selectedAbility.ChannelId)
			if !ok { // 如果达到频率限制
				rateLimitedAbilities = append(rateLimitedAbilities, selectedIdx)
				// 移除当前渠道，继续选择下一个渠道
				//log.Println("ID限制", selectedAbility.ChannelId)
				abilities = append(abilities[:selectedIdx], abilities[selectedIdx+1:]...)
				// 如果移除后没有剩余渠道，则尝试获取次优先级的渠道
				if len(abilities) == 0 {
					break // 跳出循环，后面处理获取次优先级渠道的逻辑
				}
				continue
			}

			// 更新频率限制状态
			updateRateLimitStatus(selectedAbility.ChannelId)
		}

		// 返回找到的 Channel，它既没有超过频率限制，也没有禁用频率限制
		return &channel, nil
	}

	// 如果所有渠道都超过了频率限制，我们尝试获取下一个优先级的渠道
	nextPriorityAbilities, err := getNextPriorityAbilities(group, model)
	if err != nil {
		return nil, err
	}

	// 从下一个优先级的渠道中随机选择一个返回
	if len(nextPriorityAbilities) > 0 {
		randomIdx := common.GetRandomInt(len(nextPriorityAbilities))
		selectedAbility := nextPriorityAbilities[randomIdx]
		channelPtr, err := GetChannelById(selectedAbility.ChannelId, true)
		if err != nil {
			return nil, err
		}
		return channelPtr, nil
	}

	// 所有渠道都超过频率限制，返回错误
	return nil, errors.New("no channels available within rate limits")
}

func getAbilitiesByPriority(group string, model string) ([]Ability, error) {
	var abilities []Ability
	groupCol := "`group`"
	trueVal := "1"
	if common.UsingPostgreSQL {
		groupCol = `"group"`
		trueVal = "true"
	}

	var err error = nil
	maxPrioritySubQuery := DB.Model(&Ability{}).Select("MAX(priority)").Where(groupCol+" = ? and model = ? and enabled = "+trueVal, group, model)
	channelQuery := DB.Where(groupCol+" = ? and model = ? and enabled = "+trueVal+" and priority = (?)", group, model, maxPrioritySubQuery)
	if common.UsingSQLite || common.UsingPostgreSQL {
		err = channelQuery.Order("weight DESC").Find(&abilities).Error
	} else {
		err = channelQuery.Order("weight DESC").Find(&abilities).Error
	}

	if err != nil {
		return nil, err
	}
	return abilities, nil
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
	DB.Table("abilities").Select("MAX(priority) as max_priority").
		Where(groupCol+" = ? AND model = ? AND enabled = "+trueVal, group, model).
		Pluck("max_priority", &maxPriority)

	// 使用得到的最高优先级来查询次高优先级的渠道列表
	// 我们从那些其 priority 小于当前最高优先级的记录中选择最大值
	nextMaxPrioritySubQuery := DB.Model(&Ability{}).Select("MAX(priority)").
		Where(groupCol+" = ? AND model = ? AND enabled = "+trueVal+" AND priority < ?", group, model, maxPriority)

	// 根据次高优先级查询能力列表
	err := DB.Where(groupCol+" = ? AND model = ? AND enabled = "+trueVal+" AND priority = (?)", group, model, nextMaxPrioritySubQuery).
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
				Group:     group,
				Model:     model,
				ChannelId: channel.Id,
				Enabled:   channel.Status == common.ChannelStatusEnabled,
				Priority:  channel.Priority,
				Weight:    uint(channel.GetWeight()),
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
