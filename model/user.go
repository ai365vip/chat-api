package model

import (
	"errors"
	"fmt"
	"log"
	"math/rand"
	"one-api/common"
	"one-api/common/config"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
)

// User if you add sensitive fields, don't forget to clean them in setupLogin function.
// Otherwise, the sensitive information will be saved on local storage in plain text!
type User struct {
	Id               int            `json:"id"`
	Username         string         `json:"username" gorm:"unique;index" validate:"max=12"`
	Password         string         `json:"password" gorm:"not null;" validate:"min=8,max=20"`
	DisplayName      string         `json:"display_name" gorm:"index" validate:"max=20"`
	Role             int            `json:"role" gorm:"type:int;default:1"`   // admin, common
	Status           int            `json:"status" gorm:"type:int;default:1"` // enabled, disabled
	Email            string         `json:"email" gorm:"index" validate:"max=50"`
	GitHubId         string         `json:"github_id" gorm:"column:github_id;index"`
	WeChatId         string         `json:"wechat_id" gorm:"column:wechat_id;index"`
	VerificationCode string         `json:"verification_code" gorm:"-:all"`                                    // this field is only for Email verification, don't save it to database!
	AccessToken      string         `json:"access_token" gorm:"type:char(32);column:access_token;uniqueIndex"` // this token is for system management
	Quota            int            `json:"quota" gorm:"type:int;default:0"`
	UsedQuota        int            `json:"used_quota" gorm:"type:int;default:0;column:used_quota"` // used quota
	RequestCount     int            `json:"request_count" gorm:"type:int;default:0;"`               // request number
	Group            string         `json:"group" gorm:"type:varchar(32);default:'default'"`
	AffCode          string         `json:"aff_code" gorm:"type:varchar(32);column:aff_code;uniqueIndex"`
	AffCount         int            `json:"aff_count" gorm:"type:int;default:0;column:aff_count"`
	AffQuota         int            `json:"aff_quota" gorm:"type:int;default:0;column:aff_quota"`           // 邀请剩余额度
	AffHistoryQuota  int            `json:"aff_history_quota" gorm:"type:int;default:0;column:aff_history"` // 邀请历史额度
	InviterId        int            `json:"inviter_id" gorm:"type:int;column:inviter_id;index"`
	CreatedAt        int64          `json:"created_at" gorm:"index"`
	DeletedAt        gorm.DeletedAt `gorm:"index"`
	LastLoginAt      int64          `json:"last_login_at"`
	Version          int64          `json:"version" gorm:"type:bigint;default:0"`
}

type RechargeRecord struct {
	ID        uint  `gorm:"primaryKey" json:"id"` // 充值记录ID
	UserID    uint  `gorm:"index" json:"user_id"` // 对应的用户ID
	Amount    int   `json:"amount"`               // 充值额度
	StartDate int64 `json:"start_date"`           // 充值的起始时间
	EndDate   int64 `json:"end_date"`             // 充值的结束时间
	CreatedAt int64 `json:"created_at"`           // 创建时间戳
	UpdatedAt int64 `json:"updated_at"`           // 更新时间戳
	Version   int64 `json:"version" gorm:"type:bigint;default:0"`
}

// CheckUserExistOrDeleted check if user exist or deleted, if not exist, return false, nil, if deleted or exist, return true, nil
func CheckUserExistOrDeleted(username string, email string) (bool, error) {
	var user User

	// err := DB.Unscoped().First(&user, "username = ? or email = ?", username, email).Error
	// check email if empty
	var err error
	if email == "" {
		err = DB.Unscoped().First(&user, "username = ?", username).Error
	} else {
		err = DB.Unscoped().First(&user, "username = ? or email = ?", username, email).Error
	}
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// not exist, return false, nil
			return false, nil
		}
		// other error, return false, err
		return false, err
	}
	// exist, return true, nil
	return true, nil
}

func GetMaxUserId() int {
	var user User
	DB.Last(&user)
	return user.Id
}

func GetAllUsers(startIdx int, num int) (users []*User, err error) {
	err = DB.Unscoped().Order("id desc").Limit(num).Offset(startIdx).Omit("password").Find(&users).Error
	return users, err
}

func SearchUsers(keyword string, group string) ([]*User, error) {
	var users []*User
	var err error

	// 尝试将关键字转换为整数ID
	keywordInt, err := strconv.Atoi(keyword)
	if err == nil {
		// 如果转换成功，按照ID和可选的组别搜索用户
		query := DB.Unscoped().Omit("password").Where("`id` = ?", keywordInt)
		if group != "" {
			query = query.Where("`group` = ?", group) // 使用反引号包围group
		}
		err = query.Find(&users).Error
		if err != nil || len(users) > 0 {
			return users, err
		}
	}

	err = nil

	query := DB.Unscoped().Omit("password")
	likeCondition := "`username` LIKE ? OR `email` LIKE ? OR `display_name` LIKE ?"
	if group != "" {
		query = query.Where("("+likeCondition+") AND `group` = ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", group)
	} else {
		query = query.Where(likeCondition, "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}
	err = query.Find(&users).Error

	return users, err
}

func GetUserById(id int, selectAll bool) (*User, error) {
	if id == 0 {
		return nil, errors.New("id 为空！")
	}
	user := User{Id: id}
	var err error = nil
	if selectAll {
		err = DB.First(&user, "id = ?", id).Error
	} else {
		err = DB.Omit("password").First(&user, "id = ?", id).Error
	}
	return &user, err
}

func GetUserIdByAffCode(affCode string) (int, error) {
	if affCode == "" {
		return 0, errors.New("affCode 为空！")
	}
	var user User
	err := DB.Select("id").First(&user, "aff_code = ?", affCode).Error
	return user.Id, err
}

func DeleteUserById(id int) (err error) {
	if id == 0 {
		return errors.New("id 为空！")
	}
	user := User{Id: id}
	return user.Delete()
}

func HardDeleteUserById(id int) error {
	if id == 0 {
		return errors.New("id 为空！")
	}
	err := DB.Unscoped().Delete(&User{}, "id = ?", id).Error
	return err
}

func inviteUser(inviterId int) (err error) {
	user, err := GetUserById(inviterId, true)
	if err != nil {
		return err
	}
	user.AffCount++
	user.AffQuota += config.QuotaForInviter
	user.AffHistoryQuota += config.QuotaForInviter
	return DB.Save(user).Error
}

func (user *User) TransferAffQuotaToQuota(quota int) error {
	transferAmount := int(float64(quota) * config.QuotaPerUnit)

	// 开始数据库事务
	tx := DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer tx.Rollback() // 确保在函数退出时事务能回滚

	// 加锁查询用户以确保数据一致性
	err := tx.Set("gorm:query_option", "FOR UPDATE").First(&user, user.Id).Error
	if err != nil {
		return err
	}

	// 再次检查用户的AffQuota是否足够
	if user.AffQuota < transferAmount {
		return errors.New("邀请额度不足！")
	}

	// 再次检查是否超出限额
	log.Println(transferAmount)
	log.Println(int(config.MiniQuota * config.QuotaPerUnit))
	if transferAmount < int(config.MiniQuota*config.QuotaPerUnit) {
		return errors.New("超出最低限额！")
	}

	// 更新用户额度
	user.AffQuota -= transferAmount
	user.Quota += transferAmount

	// 保存用户状态
	if err := tx.Save(user).Error; err != nil {
		return err
	}

	// 提交事务
	return tx.Commit().Error
}

func (user *User) AffQuotaToQuota(quota int, alipayAccount string) error {
	transferAmount := int(float64(quota) * config.QuotaPerUnit)

	// 开始数据库事务
	tx := DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer tx.Rollback() // 确保在函数退出时事务能回滚

	// 加锁查询用户以确保数据一致性
	err := tx.Set("gorm:query_option", "FOR UPDATE").First(&user, user.Id).Error
	if err != nil {
		return err
	}

	// 再次检查用户的AffQuota是否足够
	if user.AffQuota < transferAmount {
		return errors.New("提现额度不足！")
	}

	// 再次检查是否超出限额
	if transferAmount < int(config.MiniQuota*config.QuotaPerUnit) {
		return errors.New("超出最低限额！")
	}

	// 更新用户额度
	user.AffQuota -= transferAmount

	// 创建提现订单
	order := &WithdrawalOrder{
		UserID:           uint(user.Id),
		UserName:         user.Username,
		OrderNumber:      generateOrderNumber(),   // 这个函数用于生成唯一的订单号
		WithdrawalAmount: float64(transferAmount), // 注意转换类型，确认这里的单位是否正确
		AlipayAccount:    alipayAccount,
		Status:           StatusPending, // 提现订单的初始状态为'待处理'
		CreatedAt:        time.Now().Unix(),
		UpdatedAt:        time.Now().Unix(),
	}

	// 保存提现订单到数据库
	if err := tx.Create(order).Error; err != nil {
		return err
	}

	// 保存用户状态
	if err := tx.Save(user).Error; err != nil {
		return err
	}

	// 提交事务
	if err := tx.Commit().Error; err != nil {
		return err
	}

	// 操作成功，没有错误返回
	return nil
}

func generateOrderNumber() string {
	rand.Seed(time.Now().UnixNano()) // 初始化随机数种子
	timestamp := time.Now().Unix()   // 获取当前时间戳
	randomNumber := rand.Intn(9999)  // 生成一个随机数，这里假设为四位数

	// 格式化订单号，例如 "202303241234560123"
	orderNumber := fmt.Sprintf("%d%04d", timestamp, randomNumber)
	return orderNumber
}

func (user *User) Insert(inviterId int) error {
	var err error
	if user.Password != "" {
		user.Password, err = common.Password2Hash(user.Password)
		if err != nil {
			return err
		}
	}
	user.Quota = config.QuotaForNewUser
	user.AccessToken = common.GetUUID()
	user.AffCode = common.GetRandomString(4)
	result := DB.Create(user)
	if result.Error != nil {
		return result.Error
	}
	if config.QuotaForNewUser > 0 {
		RecordLog(user.Id, LogTypeSystem, 0, fmt.Sprintf("新用户注册赠送 %s", common.LogQuota(config.QuotaForNewUser)))
	}
	if inviterId != 0 {
		if config.QuotaForInvitee > 0 {
			_ = IncreaseUserQuota(user.Id, config.QuotaForInvitee)
			RecordLog(user.Id, LogTypeSystem, 0, fmt.Sprintf("使用邀请码赠送 %s", common.LogQuota(config.QuotaForInvitee)))
		}
		if config.QuotaForInviter > 0 {
			RecordLog(inviterId, LogTypeSystem, 0, fmt.Sprintf("邀请用户赠送 %s", common.LogQuota(config.QuotaForInviter)))
			_ = inviteUser(inviterId)
		} else if config.ProporTions > 0 {
			_ = inviteUser(inviterId)
		}

	}
	return nil
}

func VipInsert(userid int, affquota int) error {
	inviterId, err := GetInviterId(userid)
	if err != nil {
		return err
	}

	proportionsStr, _ := config.OptionMap["ProporTions"]
	proportions, err := strconv.ParseFloat(proportionsStr, 64)
	if err != nil {
		return fmt.Errorf("invalid ProporTions value: %v", err)
	}
	quota := float64(affquota) * (proportions / 100.0)

	if inviterId != 0 {
		RecordLog(inviterId, LogTypeSystem, 0, fmt.Sprintf("邀请用户充值返现 %s", common.LogQuota(int(quota))))
		_ = inviteUserVip(inviterId, int(quota))
	}
	return nil
}

func GetInviterId(userid int) (inviterId int, err error) {
	var user User
	err = DB.Select("inviter_id").Where("id = ?", userid).First(&user).Error
	if err != nil {
		return 0, err
	}
	return user.InviterId, nil
}

func inviteUserVip(inviterId int, affquota int) (err error) {
	user, err := GetUserById(inviterId, true)
	if err != nil {
		return err
	}
	user.AffQuota += affquota
	user.AffHistoryQuota += affquota
	return DB.Save(user).Error
}

func (user *User) Update(updatePassword bool) error {
	var err error
	if updatePassword {
		user.Password, err = common.Password2Hash(user.Password)
		if err != nil {
			return err
		}
	}
	newUser := *user
	DB.First(&user, user.Id)
	err = DB.Model(user).Updates(newUser).Error
	if err == nil {
		if common.RedisEnabled {
			_ = common.RedisSet(fmt.Sprintf("user_group:%d", user.Id), user.Group, time.Duration(UserId2GroupCacheSeconds)*time.Second)
		}
	}
	return err
}

func (user *User) Delete() error {
	if user.Id == 0 {
		return errors.New("id 为空！")
	}
	err := DB.Delete(user).Error
	return err
}

func (user *User) HardDelete() error {
	if user.Id == 0 {
		return errors.New("id 为空！")
	}
	err := DB.Unscoped().Delete(user).Error
	return err
}

// ValidateAndFill check password & user status
func (user *User) ValidateAndFill() (err error) {

	password := user.Password
	if user.Username == "" || password == "" {
		return errors.New("用户名或密码为空")
	}
	err = DB.Where("username = ?", user.Username).First(user).Error
	if err != nil {
		err := DB.Where("email = ?", user.Username).First(user).Error
		if err != nil {
			return errors.New("用户名或密码错误，或用户已被封禁")
		}
	}
	okay := common.ValidatePasswordAndHash(password, user.Password)
	if !okay || user.Status != common.UserStatusEnabled {
		return errors.New("用户名或密码错误，或用户已被封禁")
	}
	return nil
}

func (user *User) FillUserById() error {
	if user.Id == 0 {
		return errors.New("id 为空！")
	}
	DB.Where(User{Id: user.Id}).First(user)
	return nil
}

func (user *User) FillUserByEmail() error {
	if user.Email == "" {
		return errors.New("email 为空！")
	}
	DB.Where(User{Email: user.Email}).First(user)
	return nil
}

func (user *User) FillUserByGitHubId() error {
	if user.GitHubId == "" {
		return errors.New("GitHub id 为空！")
	}
	DB.Where(User{GitHubId: user.GitHubId}).First(user)
	return nil
}

func (user *User) FillUserByWeChatId() error {
	if user.WeChatId == "" {
		return errors.New("WeChat id 为空！")
	}
	DB.Where(User{WeChatId: user.WeChatId}).First(user)
	return nil
}

func (user *User) FillUserByUsername() error {
	if user.Username == "" {
		return errors.New("username 为空！")
	}
	DB.Where(User{Username: user.Username}).First(user)
	return nil
}

func IsEmailAlreadyTaken(email string) bool {
	return DB.Where("email = ?", email).Find(&User{}).RowsAffected == 1
}

func IsWeChatIdAlreadyTaken(wechatId string) bool {
	return DB.Where("wechat_id = ?", wechatId).Find(&User{}).RowsAffected == 1
}

func IsGitHubIdAlreadyTaken(githubId string) bool {
	return DB.Where("github_id = ?", githubId).Find(&User{}).RowsAffected == 1
}

func IsUsernameAlreadyTaken(username string) bool {
	return DB.Where("username = ?", username).Find(&User{}).RowsAffected == 1
}

func ResetUserPasswordByEmail(email string, password string) error {
	if email == "" || password == "" {
		return errors.New("邮箱地址或密码为空！")
	}
	hashedPassword, err := common.Password2Hash(password)
	if err != nil {
		return err
	}
	err = DB.Model(&User{}).Where("email = ?", email).Update("password", hashedPassword).Error
	return err
}

func IsAdmin(userId int) bool {
	if userId == 0 {
		return false
	}
	var user User
	err := DB.Where("id = ?", userId).Select("role").Find(&user).Error
	if err != nil {
		common.SysError("no such user " + err.Error())
		return false
	}
	return user.Role >= common.RoleAdminUser
}

func IsUserEnabled(userId int) (bool, error) {
	if userId == 0 {
		return false, errors.New("user id is empty")
	}
	var user User
	err := DB.Where("id = ?", userId).Select("status").Find(&user).Error
	if err != nil {
		return false, err
	}
	return user.Status == common.UserStatusEnabled, nil
}

func ValidateAccessToken(token string) (user *User) {
	if token == "" {
		return nil
	}
	token = strings.Replace(token, "Bearer ", "", 1)
	user = &User{}
	if DB.Where("access_token = ?", token).First(user).RowsAffected == 1 {
		return user
	}
	return nil
}

func GetUserQuota(id int) (quota int, err error) {
	err = DB.Model(&User{}).Where("id = ?", id).Select("quota").Find(&quota).Error
	return quota, err
}

func GetUserUsedQuota(id int) (quota int, err error) {
	err = DB.Model(&User{}).Where("id = ?", id).Select("used_quota").Find(&quota).Error
	return quota, err
}

func GetUserEmail(id int) (email string, err error) {
	err = DB.Model(&User{}).Where("id = ?", id).Select("email").Find(&email).Error
	return email, err
}

func GetUserGroup(id int) (group string, err error) {
	groupCol := "`group`"
	if common.UsingPostgreSQL {
		groupCol = `"group"`
	}

	err = DB.Model(&User{}).Where("id = ?", id).Select(groupCol).Find(&group).Error
	return group, err
}

func IncreaseUserQuota(id int, quota int) (err error) {
	if quota < 0 {
		return errors.New("quota 不能为负数！")
	}
	if config.BatchUpdateEnabled {
		addNewRecord(BatchUpdateTypeUserQuota, id, quota)
		return nil
	}
	return increaseUserQuota(id, quota)
}

func VipUserQuota(id int) (err error) {
	VipUserGroup := config.OptionMap["VipUserGroup"]
	Group, _ := GetUserGroup(id)
	UserGroup := config.OptionMap["UserGroup"]
	if UserGroup == Group {
		err = DB.Model(&User{}).Where("id = ?", id).Update("group", VipUserGroup).Error
		return err
	}
	return nil
}

func increaseUserQuota(id int, quota int) (err error) {
	// 启动一个事务处理增加配额
	err = DB.Transaction(func(tx *gorm.DB) error {
		// 更新用户配额
		if err := tx.Model(&User{}).Where("id = ?", id).Update("quota", gorm.Expr("quota + ?", quota)).Error; err != nil {
			return err
		}
		return nil
	})

	return err
}

func IncreaseRechargeQuota(id int, topupratio string, quota int) (err error) {
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
	err = DB.Transaction(func(tx *gorm.DB) error {

		// 只有当topupratio不为空时，才添加充值记录
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

		return nil
	})

	return err
}

func DecreaseUserQuota(id int, quota int) (err error) {
	if quota < 0 {
		return errors.New("quota 不能为负数！")
	}
	if config.BatchUpdateEnabled {
		addNewRecord(BatchUpdateTypeUserQuota, id, -quota)
		return nil
	}
	return decreaseUserQuota(id, quota)
}

func decreaseUserQuota(userID int, quotaToDecrease int) error {
	return DB.Transaction(func(tx *gorm.DB) error {
		// 1. 获取用户信息，包括当前配额
		var user User
		if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("id = ?", userID).First(&user).Error; err != nil {
			return err
		}

		// 2. 检查用户总配额是否足够
		if user.Quota < quotaToDecrease {
			return fmt.Errorf("insufficient user quota: available %d, required %d", user.Quota, quotaToDecrease)
		}

		// 3. 更新用户配额
		if err := tx.Model(&User{}).Where("id = ?", userID).Update("quota", gorm.Expr("quota - ?", quotaToDecrease)).Error; err != nil {
			return err
		}

		// 4. 获取充值记录
		var records []RechargeRecord
		if err := tx.Where("user_id = ? AND amount > 0", userID).
			Order("end_date ASC").
			Find(&records).Error; err != nil {
			return err
		}

		// 如果没有充值记录，直接返回，不进行后续操作
		if len(records) == 0 {
			log.Printf("No recharge records found for user %d, quota decreased without updating records", userID)
			return nil
		}

		// 5. 更新充值记录
		remainingDecrease := quotaToDecrease
		for i := range records {
			var newAmount int
			if records[i].Amount <= remainingDecrease {
				newAmount = 0
				remainingDecrease -= records[i].Amount
			} else {
				newAmount = records[i].Amount - remainingDecrease
				remainingDecrease = 0
			}

			if err := tx.Model(&RechargeRecord{}).Where("id = ?", records[i].ID).Update("amount", newAmount).Error; err != nil {
				return err
			}

			if remainingDecrease == 0 {
				break
			}
		}

		// 6. 检查是否所有配额都已正确扣除
		if remainingDecrease > 0 {
			log.Printf("Quota inconsistency detected for user %d: remaining decrease %d", userID, remainingDecrease)
		}

		return nil
	})
}

func GetRootUserEmail() (email string) {
	DB.Model(&User{}).Where("role = ?", common.RoleRootUser).Select("email").Find(&email)
	return email
}

func UpdateUserUsedQuotaAndRequestCount(id int, quota int) {
	if config.BatchUpdateEnabled {
		addNewRecord(BatchUpdateTypeUsedQuota, id, quota)
		addNewRecord(BatchUpdateTypeRequestCount, id, 1)
		return
	}
	updateUserUsedQuotaAndRequestCount(id, quota, 1)
}

func updateUserUsedQuotaAndRequestCount(id int, quota int, count int) {
	err := DB.Model(&User{}).Where("id = ?", id).Updates(
		map[string]interface{}{
			"used_quota":    gorm.Expr("used_quota + ?", quota),
			"request_count": gorm.Expr("request_count + ?", count),
		},
	).Error
	if err != nil {
		common.SysError("failed to update user used quota and request count: " + err.Error())
	}
}

func updateUserUsedQuota(id int, quota int) {
	err := DB.Model(&User{}).Where("id = ?", id).Updates(
		map[string]interface{}{
			"used_quota": gorm.Expr("used_quota + ?", quota),
		},
	).Error
	if err != nil {
		common.SysError("failed to update user used quota: " + err.Error())
	}
}

func updateUserRequestCount(id int, count int) {
	err := DB.Model(&User{}).Where("id = ?", id).Update("request_count", gorm.Expr("request_count + ?", count)).Error
	if err != nil {
		common.SysError("failed to update user request count: " + err.Error())
	}
}

func GetUsernameById(id int) (username string) {
	DB.Model(&User{}).Where("id = ?", id).Select("username").Find(&username)
	return username
}

func UpdateUserQuotaData() {
	ticker := time.NewTicker(time.Hour)
	defer ticker.Stop()

	for range ticker.C {
		common.SysLog("正在更新用户余额日期...")

		// 获取当前时间戳
		currentTime := time.Now().Unix()

		// 预查询是否存在过期记录，减少不必要的事务
		var count int64
		DB.Model(&RechargeRecord{}).Where("end_date <= ? AND end_date != -1 AND amount > 0", currentTime).Count(&count)
		if count == 0 {
			continue // 如果没有记录，跳过此次循环
		}

		// 启动一个事务来更新用户余额和处理过期的充值记录
		err := DB.Transaction(func(tx *gorm.DB) error {
			// 查找所有已经过期且金额大于0的充值记录
			var expiredRecords []RechargeRecord
			err := tx.Where("end_date <= ? AND end_date != -1 AND amount > 0", currentTime).Find(&expiredRecords).Error
			if err != nil {
				return err
			}

			// 对于每个过期的充值记录，减少对应用户在User主表中的配额，并将充值记录的Amount更新为0表示已处理
			for _, record := range expiredRecords {
				err = tx.Model(&User{}).Where("id = ?", record.UserID).
					Update("quota", gorm.Expr("quota - ?", record.Amount)).Error
				if err != nil {
					return err
				}

				// 设置过期记录的金额为0，表示已经从用户余额中扣除
				record.Amount = 0
				err = tx.Save(&record).Error
				if err != nil {
					return err
				}
			}

			// 执行删除所有处理过的过期记录（即金额为0的记录）
			err = tx.Where("amount = 0").Delete(&RechargeRecord{}).Error
			if err != nil {
				return err
			}

			return nil
		})

		if err != nil {
			common.SysLog(fmt.Sprintf("更新用户余额失败：%s", err))
		} else {
			common.SysLog("成功更新用户余额并清理过期充值记录。")
		}
	}
}

func GetRole(id int) int {
	var role int
	// 查询用户的角色
	err := DB.Table("users").Select("role").Where("id = ?", id).Scan(&role).Error
	if err != nil {
		log.Printf("Error retrieving role for user %d: %v", id, err)
		return 0 // 默认角色
	}
	return role
}
