package controller

import (
	"net/http"
	"one-api/common"

	"github.com/gin-gonic/gin"
)

func GetGroups(c *gin.Context) {
	groupNames := make([]string, 0)
	for groupName, _ := range common.GroupRatio {
		groupNames = append(groupNames, groupName)
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    groupNames,
	})
}
func GetUserGroups(c *gin.Context) {
	type GroupInfo struct {
		Key   string `json:"key"`
		Value string `json:"value"`
	}

	groupInfos := make([]GroupInfo, 0, len(common.GroupUserRatio))
	for key, value := range common.GroupUserRatio {
		groupInfos = append(groupInfos, GroupInfo{Key: key, Value: value})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    groupInfos,
	})
}
