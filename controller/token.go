package controller

import (
	"fmt"
	"log"
	"net/http"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/network"
	"one-api/model"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetAllTokens(c *gin.Context) {
	userId := c.GetInt("id")
	p, _ := strconv.Atoi(c.Query("p"))
	size, _ := strconv.Atoi(c.Query("size"))
	if p < 0 {
		p = 0
	}
	if size <= 0 {
		size = config.ItemsPerPage
	} else if size > 100 {
		size = 100
	}
	tokens, err := model.GetAllUserTokens(userId, p*size, size)
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
		"data":    tokens,
	})
	return
}

func SearchTokens(c *gin.Context) {
	userId := c.GetInt("id")
	keyword := c.Query("keyword")
	token := c.Query("token")
	tokens, err := model.SearchUserTokens(userId, keyword, token)
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
		"data":    tokens,
	})
	return
}

func GetToken(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	userId := c.GetInt("id")
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	token, err := model.GetTokenByIds(id, userId)
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
		"data":    token,
	})
	return
}

func GetTokenStatus(c *gin.Context) {
	tokenId := c.GetInt("token_id")
	userId := c.GetInt("id")
	token, err := model.GetTokenByIds(tokenId, userId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	expiredAt := token.ExpiredTime
	if expiredAt == -1 {
		expiredAt = 0
	}
	c.JSON(http.StatusOK, gin.H{
		"object":          "credit_summary",
		"total_granted":   token.RemainQuota,
		"total_used":      0, // not supported currently
		"total_available": token.RemainQuota,
		"expires_at":      expiredAt * 1000,
	})
}

func AddToken(c *gin.Context) {
	token := model.Token{}
	userId := c.GetInt("id")
	err := c.ShouldBindJSON(&token)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	if len(token.Name) > 30 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "令牌名称过长",
		})
		return
	}
	if token.Group != "" {
		role := model.GetRole(userId)
		if role < 10 {
			if _, exists := common.GroupUserRatio[token.Group]; !exists {
				c.JSON(http.StatusOK, gin.H{
					"success": false,
					"message": "无效的用户组",
				})
				return
			}
		} else {
			if _, exists := common.GroupRatio[token.Group]; !exists {
				c.JSON(http.StatusOK, gin.H{
					"success": false,
					"message": "无效的用户组",
				})
				return
			}
		}
	}
	cleanToken := model.Token{
		UserId:         c.GetInt("id"),
		Name:           token.Name,
		Key:            common.GenerateKey(),
		CreatedTime:    common.GetTimestamp(),
		AccessedTime:   common.GetTimestamp(),
		ExpiredTime:    token.ExpiredTime,
		RemainQuota:    token.RemainQuota,
		UnlimitedQuota: token.UnlimitedQuota,
		Group:          token.Group,
		BillingEnabled: token.BillingEnabled,
		Models:         token.Models,
		FixedContent:   token.FixedContent,
	}
	err = cleanToken.Insert()
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

func DeleteToken(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	userId := c.GetInt("id")
	err := model.DeleteTokenById(id, userId)
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

func UpdateToken(c *gin.Context) {
	userId := c.GetInt("id")
	statusOnly := c.Query("status_only")
	billingStrategyOnly := c.Query("billing_strategy_only") // 新增查询参数
	token := model.Token{}
	err := c.ShouldBindJSON(&token)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	if len(token.Name) > 30 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "令牌名称过长",
		})
		return
	}
	if token.Group != "" {
		role := model.GetRole(userId)
		if role < 10 {
			if _, exists := common.GroupUserRatio[token.Group]; !exists {
				c.JSON(http.StatusOK, gin.H{
					"success": false,
					"message": "无效的用户组",
				})
				return
			}
		} else {
			if _, exists := common.GroupRatio[token.Group]; !exists {
				c.JSON(http.StatusOK, gin.H{
					"success": false,
					"message": "无效的用户组",
				})
				return
			}
		}
	}
	cleanToken, err := model.GetTokenByIds(token.Id, userId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	if token.Status == common.TokenStatusEnabled {
		if cleanToken.Status == common.TokenStatusExpired && cleanToken.ExpiredTime <= common.GetTimestamp() && cleanToken.ExpiredTime != -1 {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "令牌已过期，无法启用，请先修改令牌过期时间，或者设置为永不过期",
			})
			return
		}
		if cleanToken.Status == common.TokenStatusExhausted && cleanToken.RemainQuota <= 0 && !cleanToken.UnlimitedQuota {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "令牌可用额度已用尽，无法启用，请先修改令牌剩余额度，或者设置为无限额度",
			})
			return
		}
	}
	if statusOnly != "" {
		cleanToken.Status = token.Status
	} else if billingStrategyOnly != "" {
		cleanToken.BillingEnabled = token.BillingEnabled
	} else {
		// If you add more fields, please also update token.Update()
		cleanToken.Name = token.Name
		cleanToken.ExpiredTime = token.ExpiredTime
		cleanToken.RemainQuota = token.RemainQuota
		cleanToken.UnlimitedQuota = token.UnlimitedQuota
		cleanToken.Group = token.Group
		cleanToken.Models = token.Models
		cleanToken.FixedContent = token.FixedContent
		cleanToken.Subnet = token.Subnet
	}
	err = cleanToken.Update()
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
		"data":    cleanToken,
	})
	return
}

func UpdateTokenBillingStrategy(c *gin.Context) {
	userId := c.GetInt("id")
	tokenId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid token ID",
			"data":    nil,
		})
		return
	}
	log.Println(userId, tokenId)

	// 使用Token结构体的部分实例来绑定billing_enabled字段
	var partialToken struct {
		BillingEnabled int `json:"billing_enabled"` // 前端传来的是1或0
	}
	err = c.ShouldBindJSON(&partialToken)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
		})
		return
	}

	// 获取token对象，确认它确实属于操作的用户
	cleanToken, err := model.GetTokenByIds(tokenId, userId)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Token not found",
		})
		return
	}

	// 将整数值转换为布尔值
	billingEnabled := false
	if partialToken.BillingEnabled == 1 {
		billingEnabled = true
	}

	// 更新BillingEnabled字段
	cleanToken.BillingEnabled = billingEnabled
	err = cleanToken.UpdateTokenBilling()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update billing strategy",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Billing strategy updated successfully",
		"data":    cleanToken,
	})
}
func validateToken(c *gin.Context, token model.Token) error {
	if len(token.Name) > 30 {
		return fmt.Errorf("令牌名称过长")
	}
	if token.Subnet != nil && *token.Subnet != "" {
		err := network.IsValidSubnets(*token.Subnet)
		if err != nil {
			return fmt.Errorf("无效的网段：%s", err.Error())
		}
	}
	return nil
}
