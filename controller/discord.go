package controller

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"one-api/common"
	"one-api/common/config"
	"one-api/model"
	"strconv"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/ravener/discord-oauth2"
	"golang.org/x/oauth2"
)

type DiscordOAuthResponse struct {
	AccessToken  string `json:"access_token"`
	IDToken      string `json:"id_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	Scope        string `json:"scope"`
}

type DiscordUser struct {
	UID  string `json:"id"`
	ID   string `json:"username"`
	Name string `json:"global_name"`
}

func getDiscordUserInfoByCode(code string) (*DiscordUser, error) {
	if code == "" {
		return nil, errors.New("无效的参数")
	}

	conf := &oauth2.Config{
		RedirectURL:  fmt.Sprintf("%s/oauth/discord", config.ServerAddress),
		ClientID:     config.DiscordClientId,
		ClientSecret: config.DiscordClientSecret,
		Scopes:       []string{"identify", "openid"},
		Endpoint:     discord.Endpoint,
	}
	token, err := conf.Exchange(context.Background(), code)
	if err != nil {
		return nil, err
	}

	res, err := conf.Client(context.Background(), token).Get("https://discord.com/api/users/@me")
	if err != nil {
		return nil, err
	}
	if res.StatusCode != http.StatusOK {
		common.SysError("Discord 获取用户信息失败！请检查设置！")
		return nil, errors.New("Discord 获取用户信息失败！请检查设置！")
	}
	defer res.Body.Close()

	var discordUser DiscordUser
	err = json.NewDecoder(res.Body).Decode(&discordUser)
	if err != nil {
		return nil, err
	}
	if discordUser.UID == "" {
		common.SysError("Discord 获取用户信息为空！请检查设置！")
		return nil, errors.New("Discord 获取用户信息为空！请检查设置！")
	}
	return &discordUser, nil
}

func DiscordOAuth(c *gin.Context) {
	session := sessions.Default(c)
	state := c.Query("state")
	if state == "" || session.Get("oauth_state") == nil || state != session.Get("oauth_state").(string) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "state is empty or not same",
		})
		return
	}
	username := session.Get("username")
	if username != nil {
		DiscordBind(c)
		return
	}
	if !config.DiscordOAuthEnabled {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "管理员未开启通过 Discord 登录以及注册",
		})
		return
	}
	code := c.Query("code")
	discordUser, err := getDiscordUserInfoByCode(code)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	user := model.User{
		DiscordId: discordUser.UID,
	}
	if model.IsDiscordIdAlreadyTaken(user.DiscordId) {
		err := user.FillUserByDiscordId()
		if err != nil {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}
	} else {
		if config.RegisterEnabled {
			if discordUser.ID != "" {
				user.Username = discordUser.ID
			} else {
				user.Username = "discord_" + strconv.Itoa(model.GetMaxUserId()+1)
			}

			if discordUser.Name != "" {
				user.DisplayName = discordUser.Name
			} else {
				user.DisplayName = "Discord User"
			}
			user.Role = common.RoleCommonUser
			user.Status = common.UserStatusEnabled

			if err := user.Insert(0); err != nil {
				c.JSON(http.StatusOK, gin.H{
					"success": false,
					"message": err.Error(),
				})
				return
			}
		} else {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "管理员关闭了新用户注册",
			})
			return
		}
	}

	if user.Status != common.UserStatusEnabled {
		c.JSON(http.StatusOK, gin.H{
			"message": "用户已被封禁",
			"success": false,
		})
		return
	}
	setupLogin(&user, c)
}

func DiscordBind(c *gin.Context) {
	if !config.DiscordOAuthEnabled {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "管理员未开启通过 Discord 登录以及注册",
		})
		return
	}
	code := c.Query("code")
	discordUser, err := getDiscordUserInfoByCode(code)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	user := model.User{
		DiscordId: discordUser.UID,
	}
	if model.IsDiscordIdAlreadyTaken(user.DiscordId) {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "该 Discord 账户已被绑定",
		})
		return
	}
	session := sessions.Default(c)
	id := session.Get("id")
	// id := c.GetInt("id")  // critical bug!
	user.Id = id.(int)
	err = user.FillUserById()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	user.DiscordId = discordUser.UID
	err = user.Update(false)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "bind",
	})
	return
}
