package model

import (
	"time"
)

const (
	StatusPending   = 1 // 待处理
	StatusApproved  = 2 // 已批准
	StatusRejected  = 3 // 已拒绝
	StatusProcessed = 4 // 已处理
)

type WithdrawalOrder struct {
	ID                    uint    `gorm:"primaryKey;autoIncrement" json:"id"`                // 自增的ID作为主键
	UserID                uint    `gorm:"index;bigint" json:"user_id"`                       // 用户ID
	UserName              string  `gorm:"index" json:"user_name"`                            // 用户名
	OrderNumber           string  `gorm:"uniqueIndex;size:20" json:"order_number"`           // 工单号，确保唯一性
	WithdrawalAmount      float64 `gorm:"bigint" json:"withdrawal_amount"`                   // 提现金额
	AlipayAccount         string  `json:"alipay_account"`                                    // 支付宝账号
	Status                int     `gorm:"index;type:int" json:"status"`                      // 使用自定义状态类型	Suggestions           string  `gorm:"size:1024" json:"suggestions"`                      // 客户的建议反馈
	ProcessedAt           *int64  `gorm:"bigint" json:"processed_at,omitempty"`              // 工单处理完成的时间戳
	ProcessorID           uint    `gorm:"index;bigint" json:"processor_id,omitempty"`        // 处理工单的管理员ID
	Comment               string  `gorm:"size:1024" json:"comment,omitempty"`                // 处理人员的备注或评论
	Priority              int     `gorm:"index" json:"priority"`                             // 工单的优先级
	Resolved              bool    `gorm:"index" json:"resolved"`                             // 工单是否已经解决
	ResolutionDescription string  `gorm:"size:1024" json:"resolution_description,omitempty"` // 解决方案描述
	CreatedAt             int64   `gorm:"index;bigint" json:"created"`                       // 记录创建的时间戳
	UpdatedAt             int64   `gorm:"index;bigint" json:"updated"`                       // 最后更新的时间戳

}

type WithdrawalOrderView struct {
	// 包含 WithdrawalOrder 的所有字段
	WithdrawalOrder
	AffQuota   int `json:"aff_quota"`
	AffHistory int `json:"aff_history"`
}

// GetAllWithdrawalOrders 获取所有提现订单
func GetAllWithdrawalOrders(searchParams map[string]interface{}) ([]WithdrawalOrderView, error) {
	var ordersView []WithdrawalOrderView
	dbQuery := DB.Model(&WithdrawalOrder{}).
		Select(
			"withdrawal_orders.*, users.aff_quota, users.aff_history",
		).Joins("left join users on users.id = withdrawal_orders.user_id")

	if searchParams != nil {
		if userName, ok := searchParams["userName"]; ok {
			dbQuery = dbQuery.Where("withdrawal_orders.user_name = ?", userName)
		}
		if orderNumber, ok := searchParams["orderNumber"]; ok {
			dbQuery = dbQuery.Where("withdrawal_orders.order_number LIKE ?", "%"+orderNumber.(string)+"%")
		}
		if startDate, ok := searchParams["startDate"]; ok {
			dbQuery = dbQuery.Where("withdrawal_orders.created_at >= ?", startDate)
		}
		if endDate, ok := searchParams["endDate"]; ok {
			dbQuery = dbQuery.Where("withdrawal_orders.created_at <= ?", endDate)
		}
	}

	result := dbQuery.Order("withdrawal_orders.created_at desc").Scan(&ordersView)
	return ordersView, result.Error
}

// GetUserWithdrawalOrders 获取指定用户的所有提现订单
func GetUserWithdrawalOrders(userID uint) ([]WithdrawalOrder, error) {
	var orders []WithdrawalOrder
	result := DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&orders)
	return orders, result.Error
}

// UpdateWithdrawalOrderStatus 更新提现订单的状态
func UpdateWithdrawalOrderStatus(orderID uint, status int, processorID uint, comment string) error {
	updateInfo := map[string]interface{}{
		"status":       status,
		"processor_id": processorID,
		"comment":      comment,
		"processed_at": time.Now().Unix(),
	}

	// 根据订单ID更新状态和处理时间
	result := DB.Model(&WithdrawalOrder{}).Where("id = ?", orderID).Updates(updateInfo)

	return result.Error
}

// revertQuotaForRejectedOrder 处理拒绝订单并退回用户AffQuota额度
func RevertQuotaForRejectedOrder(orderID uint) error {
	// 开始数据库事务
	tx := DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer func() {
		if r := recover(); r != nil || tx.Error != nil {
			tx.Rollback()
		}
	}()

	// 获取订单信息
	var order WithdrawalOrder
	if err := tx.First(&order, orderID).Error; err != nil {
		return err
	}

	// 获取用户信息，并加锁以确保数据一致性
	var user User
	if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&user, order.UserID).Error; err != nil {
		return err
	}

	// 计算并退回用户额度
	refundAmount := int(order.WithdrawalAmount)
	user.AffQuota += refundAmount

	// 更新用户信息
	if err := tx.Save(&user).Error; err != nil {
		return err
	}

	// 设置订单为已处理状态和处理时间
	now := time.Now().Unix()
	order.ProcessedAt = &now

	// 更新订单信息
	if err := tx.Save(&order).Error; err != nil {
		return err
	}

	// 提交事务
	return tx.Commit().Error
}
