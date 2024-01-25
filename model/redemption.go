package model

import (
	"errors"
	"fmt"
	"one-api/common"
	"strconv"
	"time"

	"gorm.io/gorm"
)

type Redemption struct {
	Id           int    `json:"id"`
	UserId       int    `json:"user_id"`
	Key          string `json:"key" gorm:"type:char(32);uniqueIndex"`
	Status       int    `json:"status" gorm:"default:1"`
	Name         string `json:"name" gorm:"index"`
	Quota        int    `json:"quota" gorm:"default:100"`
	CreatedTime  int64  `json:"created_time" gorm:"bigint"`
	RedeemedTime int64  `json:"redeemed_time" gorm:"bigint"`
	Count        int    `json:"count" gorm:"-:all"` // only for api request
	UsedUserId   int    `json:"used_user_id"`
}

func GetAllRedemptions(startIdx int, num int) ([]*Redemption, error) {
	var redemptions []*Redemption
	var err error
	err = DB.Order("id desc").Limit(num).Offset(startIdx).Find(&redemptions).Error
	return redemptions, err
}

func SearchRedemptions(keyword string) (redemptions []*Redemption, err error) {
	err = DB.Where("id = ? or name LIKE ?", keyword, keyword+"%").Find(&redemptions).Error
	return redemptions, err
}

func GetRedemptionById(id int) (*Redemption, error) {
	if id == 0 {
		return nil, errors.New("id 为空！")
	}
	redemption := Redemption{Id: id}
	var err error = nil
	err = DB.First(&redemption, "id = ?", id).Error
	return &redemption, err
}

func Redeem(key string, userId int) (quota int, err error) {
	if key == "" {
		return 0, errors.New("未提供兑换码")
	}
	if userId == 0 {
		return 0, errors.New("无效的 user id")
	}
	redemption := &Redemption{}

	keyCol := "`key`"
	if common.UsingPostgreSQL {
		keyCol = `"key"`
	}
	RedempTionCount := strconv.Itoa(common.RedempTionCount)

	err = DB.Transaction(func(tx *gorm.DB) error {
		err := tx.Set("gorm:query_option", "FOR UPDATE").Where(keyCol+" = ?", key).First(redemption).Error
		if err != nil {
			return errors.New("无效的兑换码")
		}
		if redemption.Status != common.RedemptionCodeStatusEnabled {
			return errors.New("该兑换码已被使用")
		}

		// 更新用户的总配额
		err = tx.Model(&User{}).Where("id = ?", userId).Update("quota", gorm.Expr("quota + ?", redemption.Quota)).Error
		if err != nil {
			return err
		}

		err = redemptionIncreaseRechargeQuota(tx, userId, RedempTionCount, redemption.Quota)
		if err != nil {
			return err
		}
		// 标记兑换码为已用
		redemption.RedeemedTime = common.GetTimestamp()
		redemption.Status = common.RedemptionCodeStatusUsed
		redemption.UsedUserId = userId
		err = tx.Save(redemption).Error
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return 0, errors.New("兑换失败，" + err.Error())
	}

	// 这里可以记录日志和其他相关的操作
	RecordLog(userId, LogTypeTopup, redemption.Quota, fmt.Sprintf("通过兑换码充值 %s", common.LogQuota(redemption.Quota)))
	VipInsert(userId, redemption.Quota)

	return redemption.Quota, nil
}

func (redemption *Redemption) Insert() error {
	var err error
	err = DB.Create(redemption).Error
	return err
}

func (redemption *Redemption) SelectUpdate() error {
	// This can update zero values
	return DB.Model(redemption).Select("redeemed_time", "status").Updates(redemption).Error
}

// Update Make sure your token's fields is completed, because this will update non-zero values
func (redemption *Redemption) Update() error {
	var err error
	err = DB.Model(redemption).Select("name", "status", "quota", "redeemed_time").Updates(redemption).Error
	return err
}

func (redemption *Redemption) Delete() error {
	var err error
	err = DB.Delete(redemption).Error
	return err
}

func DeleteRedemptionById(id int) (err error) {
	if id == 0 {
		return errors.New("id 为空！")
	}
	redemption := Redemption{Id: id}
	err = DB.Where(redemption).First(&redemption).Error
	if err != nil {
		return err
	}
	return redemption.Delete()
}

func redemptionIncreaseRechargeQuota(tx *gorm.DB, id int, topupratio string, quota int) (err error) {
	var endQuotaAt int64

	// 如果topupratio不为空且不是"-1"，计算结束时间戳；如果是"-1"，则设置无限期。
	if topupratio != "" && topupratio != "-1" {
		days, convErr := strconv.Atoi(topupratio)
		if convErr != nil {
			return convErr
		}
		currentTime := time.Now().Unix()
		endQuotaAt = currentTime + int64(days*24*60*60)
	} else if topupratio == "-1" {
		endQuotaAt = -1 // 表示无限期
	}

	// 启动一个事务处理增加配额和插入充值记录
	if topupratio != "" {
		record := &RechargeRecord{
			UserID:    uint(id),
			Amount:    quota,
			StartDate: time.Now().Unix(), // 使用当前时间作为StartDate
			EndDate:   endQuotaAt,        // 根据topupratio设置EndDate
		}
		if err := tx.Create(&record).Error; err != nil {
			return err
		}
	}

	return err
}
