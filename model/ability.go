package model

import (
	"encoding/json"
	"errors"
	"fmt"
	"one-api/common"
	"strings"

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

func GetRandomSatisfiedChannel(group string, model string) (*Channel, error) {
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
	channel := Channel{}
	if len(abilities) > 0 {
		// Randomly choose one
		weightSum := uint(0)
		for _, ability_ := range abilities {
			weightSum += ability_.Weight
		}
		if weightSum == 0 {
			// All weight is 0, randomly choose one
			channel.Id = abilities[common.GetRandomInt(len(abilities))].ChannelId
		} else {
			// Randomly choose one
			weight := common.GetRandomInt(int(weightSum))
			for _, ability_ := range abilities {
				weight -= int(ability_.Weight)
				//log.Printf("weight: %d, ability weight: %d", weight, *ability_.Weight)
				if weight <= 0 {
					channel.Id = ability_.ChannelId
					break
				}
			}
		}
	} else {
		return nil, nil
	}
	err = DB.First(&channel, "id = ?", channel.Id).Error
	return &channel, err
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
