package controller

import (
	"errors"
	"fmt"
	"net/http"
	"one-api/common"
	"one-api/common/config"
	"one-api/model"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// QuotaAlert 处理用户额度提醒设置
func SetUserQuotaAlert(c *gin.Context) {
	userId := c.GetInt("id")
	var alertSettings model.QuotaAlertSettings
	if err := c.ShouldBindJSON(&alertSettings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的请求参数",
		})
		return
	}

	alertSettings.UserId = userId
	if err := model.SaveQuotaAlertSettings(&alertSettings); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "额度提醒设置已保存",
	})
}

// GetUserQuotaAlertSettings 获取用户的额度提醒设置
func GetUserQuotaAlertSettings(c *gin.Context) {
	userId := c.GetInt("id")
	settings, err := model.GetQuotaAlertSettingsByUserId(userId)
	if err != nil {
		// 如果是未找到记录的错误，返回空数据而不是错误
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "",
				"data":    nil, // 返回 null，前端会使用默认值
			})
			return
		}
		// 其他错误正常返回
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    settings,
	})
}

// StartQuotaAlertChecker 启动定时检查额度提醒的任务
func StartQuotaAlertChecker() {
	go func() {
		// 等待到下一个整点
		now := time.Now()
		next := now.Add(time.Hour).Truncate(time.Hour)
		time.Sleep(next.Sub(now))

		// 在整点执行
		for {
			checkAndSendQuotaAlerts()
			// 等待到下一个整点
			now := time.Now()
			next := now.Add(time.Hour).Truncate(time.Hour)
			time.Sleep(next.Sub(now))
		}
	}()
}

// checkAndSendQuotaAlerts 检查并发送额度提醒
func checkAndSendQuotaAlerts() {
	// 获取所有启用了提醒的设置
	settings, err := model.GetEnabledQuotaAlertSettings()
	if err != nil {
		common.SysError("获取额度提醒设置失败: " + err.Error())
		return
	}

	for _, setting := range settings {
		// 检查是否需要发送提醒
		if time.Now().Unix()-setting.LastAlertTime >= int64(setting.AlertInterval*3600) {
			// 获取用户当前额度
			user, err := model.GetUserById(setting.UserId, false)
			if err != nil {
				common.SysError(fmt.Sprintf("获取用户 %d 信息失败: %s", setting.UserId, err.Error()))
				continue
			}

			userQuota := float64(user.Quota) / config.QuotaPerUnit

			// 添加条件：用户现有额度必须大于0且小于等于设定的最小额度
			if userQuota > 0 && userQuota <= float64(setting.MinQuota) {
				// 发送提醒邮件
				topUpLink := fmt.Sprintf("%s/topup", config.ServerAddress)
				err = common.SendEmail(
					"额度不足提醒",
					setting.Email,
					fmt.Sprintf("尊敬的「%s」用户，您当前剩余额度为 %.2f，低于设定的 %d，为了不影响您的使用，请及时充值。<br/>充值链接：<a href='%s'>%s</a>", user.Username, userQuota, setting.MinQuota, topUpLink, topUpLink),
				)
				if err != nil {
					common.SysError("发送提醒邮件失败: " + err.Error())
				} else {
					// 更新上次提醒时间
					setting.LastAlertTime = time.Now().Unix()
					err = model.UpdateQuotaAlertSettings(&setting)
					if err != nil {
						common.SysError(fmt.Sprintf("更新用户 %d 的提醒时间失败: %s", setting.UserId, err.Error()))
					}
				}
			}
		}
	}
}
