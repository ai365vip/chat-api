package model

import "errors"

type TopUp struct {
	Id         int     `json:"id"`
	UserId     int     `json:"user_id" gorm:"index"`
	Amount     int     `json:"amount"`
	Money      float64 `json:"money"`
	TopupRatio string  `json:"topup_ratio"`
	TradeNo    string  `json:"trade_no"`
	CreateTime int64   `json:"create_time"`
	Status     string  `json:"status"`
}

type TopUpQueryParams struct {
	UserId     string
	TradeNo    string
	CreateTime string
	Status     string
}

func (topUp *TopUp) Insert() error {
	var err error
	err = DB.Create(topUp).Error
	return err
}

func (topUp *TopUp) Update() error {
	var err error
	err = DB.Save(topUp).Error
	return err
}

func GetTopUpById(id int) *TopUp {
	var topUp *TopUp
	var err error
	err = DB.Where("id = ?", id).First(&topUp).Error
	if err != nil {
		return nil
	}
	return topUp
}

func GetTopUpByTradeNo(tradeNo string) *TopUp {
	var topUp *TopUp
	var err error
	err = DB.Where("trade_no = ?", tradeNo).First(&topUp).Error
	if err != nil {
		return nil
	}
	return topUp
}

func GetAllTopUps(startIdx int, num int, queryParams TopUpQueryParams) []*TopUp {
	var topups []*TopUp
	var err error

	// 初始化查询构建器
	query := DB

	// 添加过滤条件
	if queryParams.UserId != "" {
		query = query.Where("user_id = ?", queryParams.UserId)
	}
	if queryParams.TradeNo != "" {
		query = query.Where("trade_no = ?", queryParams.TradeNo)
	}
	if queryParams.CreateTime != "" {
		query = query.Where("create_time >= ?", queryParams.CreateTime)
	}
	if queryParams.Status != "" {
		query = query.Where("status = ?", queryParams.Status)
	}

	// 获取数据
	err = query.Order("id desc").Limit(num).Offset(startIdx).Find(&topups).Error
	if err != nil {
		return nil
	}

	return topups
}
func GetTopUpByUserId(id int) ([]*TopUp, error) {
	var topUp []*TopUp
	var err error
	err = DB.Where("user_id = ?", id).First(&topUp).Error
	if err != nil {
		return nil, err
	}
	return topUp, err
}
func SearchTopUps(keyword string) (topups []*TopUp, err error) {
	err = DB.Where("user_id = ? or trade_no = ?", keyword, keyword+"%").Find(&topups).Error
	return topups, err
}

func DeleteTopUpnById(id int) (err error) {
	if id == 0 {
		return errors.New("id 为空！")
	}
	topup := TopUp{UserId: id}
	err = DB.Where(topup).First(&topup).Error
	if err != nil {
		return err
	}
	return topup.Delete()
}
func (topup *TopUp) Delete() error {
	var err error
	err = DB.Delete(topup).Error
	return err
}

func DeleteTopUpsWithStatusPending() (err error) {

	err = DB.Where("status = ?", "pending").Delete(&TopUp{}).Error
	return err
}
