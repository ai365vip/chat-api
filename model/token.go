package model

import (
	"errors"
	"fmt"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/logger"
	"strings"
	"time"

	"gorm.io/gorm"
)

type Token struct {
	Id             int     `json:"id"`
	UserId         int     `json:"user_id"`
	Key            string  `json:"key" gorm:"type:char(255);uniqueIndex"`
	Status         int     `json:"status" gorm:"default:1"`
	Name           string  `json:"name" gorm:"index" `
	CreatedTime    int64   `json:"created_time" gorm:"bigint"`
	AccessedTime   int64   `json:"accessed_time" gorm:"bigint"`
	ExpiredTime    int64   `json:"expired_time" gorm:"bigint;default:-1"` // -1 means never expired
	RemainQuota    int     `json:"remain_quota" gorm:"default:0"`
	UnlimitedQuota bool    `json:"unlimited_quota" gorm:"default:false"`
	UsedQuota      int     `json:"used_quota" gorm:"default:0"`
	Group          string  `json:"group" gorm:"type:varchar(255);"` // 添加 group 字段
	BillingEnabled bool    `json:"billing_enabled" gorm:"default:false"`
	Models         string  `json:"models"`
	FixedContent   string  `json:"fixed_content" gorm:"type:varchar(1000);"`
	Subnet         *string `json:"subnet" gorm:"default:''"` // allowed subnet
	Version        int64   `json:"version" gorm:"default:0"`
}

func GetAllUserTokens(userId int, startIdx int, num int) ([]*Token, error) {
	var tokens []*Token
	var err error
	err = DB.Where("user_id = ?", userId).Order("id desc").Limit(num).Offset(startIdx).Find(&tokens).Error
	return tokens, err
}

func SearchUserTokens(userId int, keyword string, token string) (tokens []*Token, err error) {
	if token != "" {
		token = strings.Trim(token, "sk-")
	}
	err = DB.Where("user_id = ?", userId).Where("name LIKE ?", "%"+keyword+"%").Where("`key` LIKE ?", "%"+token+"%").Find(&tokens).Error
	return tokens, err
}

func ValidateUserToken(key string, model string) (token *Token, err error) {
	if key == "" {
		return nil, errors.New("未提供令牌")
	}
	token, err = CacheGetTokenByKey(key)
	if err == nil {
		if token.Status == common.TokenStatusExhausted {
			return token, errors.New("该令牌额度已用尽")
		} else if token.Status == common.TokenStatusExpired {
			return token, errors.New("该令牌已过期")
		}
		if token.Status != common.TokenStatusEnabled {
			return token, errors.New("该令牌状态不可用")
		}
		if token.ExpiredTime != -1 && token.ExpiredTime < common.GetTimestamp() {
			if !common.RedisEnabled {
				token.Status = common.TokenStatusExpired
				err := token.SelectUpdate()
				if err != nil {
					common.SysError("failed to update token status" + err.Error())
				}
			}
			return token, errors.New("该令牌已过期")
		}
		if !token.UnlimitedQuota && token.RemainQuota <= 0 {
			if !common.RedisEnabled {
				// in this case, we can make sure the token is exhausted
				token.Status = common.TokenStatusExhausted
				err := token.SelectUpdate()
				if err != nil {
					common.SysError("failed to update token status" + err.Error())
				}
			}
			return token, errors.New("该令牌额度已用尽")
		}
		if token.Models != "" {
			models := strings.Split(token.Models, ",")
			if strings.HasPrefix(model, "gpt-4-gizmo") {
				model = "gpt-4-gizmo-*"
			}
			modelFound := false
			for _, m := range models {
				if m == model {
					modelFound = true
					break
				}
			}
			if !modelFound && model != "" {
				return token, errors.New("该令牌不支持指定的模型")
			}
		}
		return token, nil
	}
	return nil, errors.New("无效的令牌")
}

func GetTokenByIds(id int, userId int) (*Token, error) {
	if id == 0 || userId == 0 {
		return nil, errors.New("id 或 userId 为空！")
	}
	token := Token{Id: id, UserId: userId}
	var err error = nil
	err = DB.First(&token, "id = ? and user_id = ?", id, userId).Error
	return &token, err
}

func GetTokenById(id int) (*Token, error) {
	if id == 0 {
		return nil, errors.New("id 为空！")
	}
	token := Token{Id: id}
	var err error = nil
	err = DB.First(&token, "id = ?", id).Error
	return &token, err
}

func (token *Token) Insert() error {
	var err error
	err = DB.Create(token).Error
	return err
}

// Update Make sure your token's fields is completed, because this will update non-zero values
func (token *Token) Update() error {
	var err error
	err = DB.Model(token).Select("name", "status", "expired_time", "remain_quota", "unlimited_quota", "group", "billing_enabled", "models", "fixed_content", "subnet").Updates(token).Error
	return err
}

func (token *Token) UpdateTokenBilling() error {
	return DB.Model(token).Select("BillingEnabled").Updates(map[string]interface{}{
		"BillingEnabled": token.BillingEnabled,
	}).Error
}

func (token *Token) SelectUpdate() error {
	// This can update zero values
	return DB.Model(token).Select("accessed_time", "status").Updates(token).Error
}

func (token *Token) Delete() error {
	var err error
	err = DB.Delete(token).Error
	return err
}

func DeleteTokenById(id int, userId int) (err error) {
	// Why we need userId here? In case user want to delete other's token.
	if id == 0 || userId == 0 {
		return errors.New("id 或 userId 为空！")
	}
	token := Token{Id: id, UserId: userId}
	err = DB.Where(token).First(&token).Error
	if err != nil {
		return err
	}
	return token.Delete()
}

func IncreaseTokenQuota(id int, quota int) (err error) {

	if quota < 0 {
		return errors.New("quota 不能为负数！")
	}
	if config.BatchUpdateEnabled {
		addNewRecord(BatchUpdateTypeTokenQuota, id, quota)
		return nil
	}
	return increaseTokenQuota(id, quota)
}

func increaseTokenQuota(id int, quota int) (err error) {
	err = DB.Model(&Token{}).Where("id = ?", id).Updates(
		map[string]interface{}{
			"remain_quota":  gorm.Expr("remain_quota + ?", quota),
			"used_quota":    gorm.Expr("used_quota - ?", quota),
			"accessed_time": common.GetTimestamp(),
		},
	).Error
	return err
}

func DecreaseTokenQuota(id int, quota int) (err error) {
	if quota < 0 {
		return errors.New("quota 不能为负数！")
	}
	if config.BatchUpdateEnabled {
		addNewRecord(BatchUpdateTypeTokenQuota, id, -quota)
		return nil
	}
	return decreaseTokenQuota(id, quota)
}

func decreaseTokenQuota(id int, quota int) error {
	maxRetries := 2
	for retries := 0; retries < maxRetries; retries++ {
		var token Token

		// 获取当前的 Token 信息
		if err := DB.Select("id, remain_quota, used_quota, version").Where("id = ?", id).First(&token).Error; err != nil {
			return err
		}

		newVersion := time.Now().UnixNano() / int64(time.Millisecond)

		// 使用乐观锁更新 Token
		result := DB.Model(&Token{}).
			Where("id = ? AND version = ?", id, token.Version).
			Updates(map[string]interface{}{
				"remain_quota":  gorm.Expr("remain_quota - ?", quota),
				"used_quota":    gorm.Expr("used_quota + ?", quota),
				"accessed_time": newVersion, // 使用新版本号作为访问时间
				"version":       newVersion, // 更新版本号
			})

		if result.Error != nil {
			return result.Error
		}

		if result.RowsAffected == 1 {
			// 更新成功，退出循环
			return nil
		}

		// 如果没有更新任何行，说明发生了并发更新，需要重试
		time.Sleep(time.Millisecond * time.Duration(10*(retries+1)))
	}

	return errors.New("failed to update token quota after max retries")
}

func PostConsumeTokenQuota(tokenId int, quota int) (err error) {
	token, err := GetTokenById(tokenId)
	if quota > 0 {
		err = DecreaseUserQuota(token.UserId, quota)
	} else {
		err = IncreaseUserQuota(token.UserId, -quota)
	}
	if err != nil {
		return err
	}
	if !token.UnlimitedQuota {
		if quota > 0 {
			err = DecreaseTokenQuota(tokenId, quota)
		} else {
			err = IncreaseTokenQuota(tokenId, -quota)
		}
		if err != nil {
			return err
		}
	}
	return nil
}

func PreConsumeTokenQuota(tokenId int, quota int) (err error) {
	if quota < 0 {
		return errors.New("quota 不能为负数！")
	}
	token, err := GetTokenById(tokenId)
	if err != nil {
		return err
	}
	if !token.UnlimitedQuota && token.RemainQuota < quota {
		return errors.New("令牌额度不足")
	}
	userQuota, err := GetUserQuota(token.UserId)
	if err != nil {
		return err
	}
	if userQuota < quota {
		return errors.New("用户额度不足")
	}
	quotaTooLow := userQuota >= config.QuotaRemindThreshold && userQuota-quota < config.QuotaRemindThreshold
	noMoreQuota := userQuota-quota <= 0
	if quotaTooLow || noMoreQuota {
		go func() {
			email, err := GetUserEmail(token.UserId)
			if err != nil {
				logger.SysError("failed to fetch user email: " + err.Error())
			}
			prompt := "您的额度即将用尽"
			if noMoreQuota {
				prompt = "您的额度已用尽"
			}
			if email != "" {
				topUpLink := fmt.Sprintf("%s/topup", config.ServerAddress)
				err = common.SendEmail(prompt, email,
					fmt.Sprintf("%s，当前剩余额度为 %d，为了不影响您的使用，请及时充值。<br/>充值链接：<a href='%s'>%s</a>", prompt, userQuota, topUpLink, topUpLink))
				if err != nil {
					logger.SysError("failed to send email" + err.Error())
				}
			}
		}()
	}
	if !token.UnlimitedQuota {
		err = DecreaseTokenQuota(tokenId, quota)
		if err != nil {
			return err
		}
	}
	err = DecreaseUserQuota(token.UserId, quota)
	return err
}
