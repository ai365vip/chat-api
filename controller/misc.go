package controller

import (
	"encoding/json"
	"fmt"
	"net/http"
	"one-api/common"
	"one-api/common/config"
	"one-api/model"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"version":             common.Version,
			"start_time":          common.StartTime,
			"email_verification":  config.EmailVerificationEnabled,
			"discord_oauth":       config.DiscordOAuthEnabled,
			"discord_client_id":   config.DiscordClientId,
			"github_oauth":        config.GitHubOAuthEnabled,
			"github_client_id":    config.GitHubClientId,
			"system_name":         config.SystemName,
			"system_text":         config.SystemText,
			"logo":                config.Logo,
			"footer_html":         config.Footer,
			"wechat_qrcode":       config.WeChatAccountQRCodeImageURL,
			"wechat_login":        config.WeChatAuthEnabled,
			"server_address":      config.ServerAddress,
			"price":               config.Price,
			"turnstile_check":     config.TurnstileCheckEnabled,
			"turnstile_site_key":  config.TurnstileSiteKey,
			"top_up_link":         config.TopUpLink,
			"chat_link":           config.ChatLink,
			"quota_per_unit":      config.QuotaPerUnit,
			"display_in_currency": config.DisplayInCurrencyEnabled,
			"enable_batch_update": config.BatchUpdateEnabled,
			"enable_drawing":      config.DrawingEnabled,
			"enable_data_export":  config.DataExportEnabled,
		},
	})
	return
}

func GetNotice(c *gin.Context) {
	config.OptionMapRWMutex.RLock()
	defer config.OptionMapRWMutex.RUnlock()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    config.OptionMap["Notice"],
	})
	return
}

func GetAbout(c *gin.Context) {
	config.OptionMapRWMutex.RLock()
	defer config.OptionMapRWMutex.RUnlock()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    config.OptionMap["About"],
	})
}

func GetMidjourney(c *gin.Context) {
	config.OptionMapRWMutex.RLock()
	defer config.OptionMapRWMutex.RUnlock()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    config.OptionMap["Midjourney"],
	})
	return
}

func GetHomePageContent(c *gin.Context) {
	config.OptionMapRWMutex.RLock()
	defer config.OptionMapRWMutex.RUnlock()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    config.OptionMap["HomePageContent"],
	})
	return
}

func SendEmailVerification(c *gin.Context) {
	email := c.Query("email")
	if err := common.Validate.Var(email, "required,email"); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的参数",
		})
		return
	}
	if config.EmailDomainRestrictionEnabled {
		parts := strings.Split(email, "@")
		localPart := parts[0]
		domainPart := parts[1]

		containsSpecialSymbols := strings.Contains(localPart, "+") || strings.Count(localPart, ".") > 1
		allowed := false
		for _, domain := range config.EmailDomainWhitelist {
			if domainPart == domain {
				allowed = true
				break
			}
		}
		if allowed && !containsSpecialSymbols {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "Your email address is allowed.",
			})
		} else {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "管理员启用了邮箱域名白名单，您的邮箱地址的域名不在白名单中",
			})
			return
		}
	}
	if model.IsEmailAlreadyTaken(email) {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "邮箱地址已被占用",
		})
		return
	}
	code := common.GenerateVerificationCode(6)
	common.RegisterVerificationCodeWithKey(email, code, common.EmailVerificationPurpose)
	subject := fmt.Sprintf("%s邮箱验证邮件", config.SystemName)
	content := fmt.Sprintf("<p>您好，你正在进行%s邮箱验证。</p>"+
		"<p>您的验证码为: <strong>%s</strong></p>"+
		"<p>验证码 %d 分钟内有效，如果不是本人操作，请忽略。</p>", config.SystemName, code, common.VerificationValidMinutes)
	err := common.SendEmail(subject, email, content)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})
	return
}

func SendPasswordResetEmail(c *gin.Context) {
	email := c.Query("email")
	if err := common.Validate.Var(email, "required,email"); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的参数",
		})
		return
	}
	if !model.IsEmailAlreadyTaken(email) {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "该邮箱地址未注册",
		})
		return
	}
	code := common.GenerateVerificationCode(0)
	common.RegisterVerificationCodeWithKey(email, code, common.PasswordResetPurpose)
	link := fmt.Sprintf("%s/user/reset?email=%s&token=%s", config.ServerAddress, email, code)
	subject := fmt.Sprintf("%s密码重置", config.SystemName)
	content := fmt.Sprintf("<p>您好，你正在进行%s密码重置。</p>"+
		"<p>点击 <a href='%s'>此处</a> 进行密码重置。</p>"+
		"<p>如果链接无法点击，请尝试点击下面的链接或将其复制到浏览器中打开：<br> %s </p>"+
		"<p>重置链接 %d 分钟内有效，如果不是本人操作，请忽略。</p>", config.SystemName, link, link, common.VerificationValidMinutes)
	err := common.SendEmail(subject, email, content)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})
	return
}

type PasswordResetRequest struct {
	Email string `json:"email"`
	Token string `json:"token"`
}

func ResetPassword(c *gin.Context) {
	var req PasswordResetRequest
	err := json.NewDecoder(c.Request.Body).Decode(&req)
	if req.Email == "" || req.Token == "" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的参数",
		})
		return
	}
	if !common.VerifyCodeWithKey(req.Email, req.Token, common.PasswordResetPurpose) {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "重置链接非法或已过期",
		})
		return
	}
	password := common.GenerateVerificationCode(12)
	err = model.ResetUserPasswordByEmail(req.Email, password)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	common.DeleteKey(req.Email, common.PasswordResetPurpose)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    password,
	})
	return
}
