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

// GetAllWithdrawalOrders 获取所有提现订单
func GetAllWithdrawalOrders() ([]WithdrawalOrder, error) {
	var orders []WithdrawalOrder
	result := DB.Find(&orders)
	return orders, result.Error
}

// GetUserWithdrawalOrders 获取指定用户的所有提现订单
func GetUserWithdrawalOrders(userID uint) ([]WithdrawalOrder, error) {
	var orders []WithdrawalOrder
	result := DB.Where("user_id = ?", userID).Find(&orders)
	return orders, result.Error
}

// UpdateWithdrawalOrderStatus 更新提现订单的状态
func UpdateWithdrawalOrderStatus(orderID uint, status int, processorID uint) error {
	updateInfo := map[string]interface{}{
		"status":       status,
		"processor_id": processorID,
		"processed_at": time.Now().Unix(),
	}

	// 根据订单ID更新状态和处理时间
	result := DB.Model(&WithdrawalOrder{}).Where("id = ?", orderID).Updates(updateInfo)

	return result.Error
}
