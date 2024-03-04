package controller

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"one-api/common"
	"one-api/model"
	"one-api/relay/channel/midjourney"
	"one-api/relay/util"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type ImageSeedResponse struct {
	Code        int    `json:"code"`
	Description string `json:"description"`
	Result      string `json:"result"`
}

func UpdateMidjourneyTask() {
	ctx := context.TODO()
	defer func() {
		if err := recover(); err != nil {
			log.Printf("UpdateMidjourneyTask panic: %v", err)
		}
	}()

	for {
		time.Sleep(time.Duration(5) * time.Second)

		tasks := model.GetAllUnFinishTasks()

		if len(tasks) == 0 {
			continue
		}
		common.LogInfo(ctx, fmt.Sprintf("检测到未完成的任务数有: %v", len(tasks)))
		// 尝试批量更新, 如果成功则跳过单个任务更新
		batchUpdateSuccess := UpdateMidjourneyTaskAll(ctx, tasks)
		if !batchUpdateSuccess {
			common.LogInfo(ctx, "批量更新失败，使用单个任务更新")
			// 使用备用的单个任务更新
			for _, task := range tasks {
				UpdateMidjourneyTaskOne(ctx, task)
			}
		}
	}
}

func UpdateMidjourneyTaskOne(ctx context.Context, task *model.Midjourney) {
	//common.LogInfo(ctx, fmt.Sprintf("未完成的任务信息: %v", task))
	midjourneyChannel, err := model.GetChannelById(task.ChannelId, true)
	if err != nil {
		common.LogError(ctx, fmt.Sprintf("UpdateMidjourneyTask: %v", err))
		task.FailReason = fmt.Sprintf("获取渠道信息失败，请联系管理员，渠道ID：%d", task.ChannelId)
		task.Status = "FAILURE"
		task.Progress = "100%"
		err := task.Update()
		if err != nil {
			common.LogInfo(ctx, fmt.Sprintf("UpdateMidjourneyTask error: %v", err))

		}
		return
	}
	requestUrl := fmt.Sprintf("%s/mj/task/%s/fetch", *midjourneyChannel.BaseURL, task.MjId)
	common.LogInfo(ctx, fmt.Sprintf("requestUrl: %s", requestUrl))

	if err != nil {
		log.Printf("Get ImageSeed error: %v", err)
		return
	}
	req, err := http.NewRequest("GET", requestUrl, bytes.NewBuffer([]byte("")))
	if err != nil {
		common.LogInfo(ctx, fmt.Sprintf("Get Task error: %v", err))
		return
	}

	// 设置超时时间
	timeout := time.Second * 5
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	// 使用带有超时的 context 创建新的请求
	req = req.WithContext(ctx)

	req.Header.Set("Content-Type", "application/json")
	//req.Header.Set("Authorization", "Bearer midjourney-proxy")
	req.Header.Set("mj-api-secret", midjourneyChannel.Key)
	resp, err := util.HTTPClient.Do(req)
	if err != nil {
		log.Printf("UpdateMidjourneyTask error: %v", err)
		return
	}
	defer resp.Body.Close()
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response body: %v", err)
		return
	}
	//log.Printf("responseBody: %s", string(responseBody))
	var responseItem midjourney.Midjourney
	// err = json.NewDecoder(resp.Body).Decode(&responseItem)
	err = json.Unmarshal(responseBody, &responseItem)
	if err != nil {
		if strings.Contains(err.Error(), "cannot unmarshal number into Go struct field Midjourney.status of type string") {
			var responseWithoutStatus midjourney.MidjourneyWithoutStatus
			var responseStatus midjourney.MidjourneyStatus
			err1 := json.Unmarshal(responseBody, &responseWithoutStatus)
			err2 := json.Unmarshal(responseBody, &responseStatus)
			if err1 == nil && err2 == nil {
				jsonData, err3 := json.Marshal(responseWithoutStatus)
				if err3 != nil {
					log.Printf("UpdateMidjourneyTask error1: %v", err3)
					return
				}
				err4 := json.Unmarshal(jsonData, &responseStatus)
				if err4 != nil {
					log.Printf("UpdateMidjourneyTask error2: %v", err4)
					return
				}
				responseItem.Status = strconv.Itoa(responseStatus.Status)
			} else {
				log.Printf("UpdateMidjourneyTask error3: %v", err)
				return
			}
		} else {
			log.Printf("UpdateMidjourneyTask error4: %v", err)
			return
		}
	}

	task.Code = 1
	task.Progress = responseItem.Progress
	task.PromptEn = responseItem.PromptEn
	task.State = responseItem.State
	task.SubmitTime = responseItem.SubmitTime
	task.StartTime = responseItem.StartTime
	task.FinishTime = responseItem.FinishTime
	task.ImageUrl = responseItem.ImageUrl
	task.Status = responseItem.Status
	task.FailReason = responseItem.FailReason
	task.Buttons = responseItem.Buttons
	task.Properties = responseItem.Properties

	// 确定任务进度是100%并且状态为SUCCESS
	if task.Progress == "100%" && task.Status == "SUCCESS" {
		imageSeedUrl := fmt.Sprintf("%s/mj/task/%s/image-seed", *midjourneyChannel.BaseURL, task.MjId)
		isReq, err := http.NewRequest("GET", imageSeedUrl, nil)
		if err != nil {
			log.Printf("Get ImageSeed error: %v", err)
			task.ImageSeed = json.RawMessage("{}") // 设置空的ImageSeed
		} else { // 只有没有错误时，才设置Header和进行请求
			isReq.Header.Set("Content-Type", "application/json")
			isReq.Header.Set("mj-api-secret", midjourneyChannel.Key)

			client := &http.Client{
				Timeout: 5 * time.Second,
			}
			isResp, err := client.Do(isReq)
			if err != nil {
				log.Printf("Get ImageSeed Do req error: %v", err)
				task.ImageSeed = json.RawMessage("{}") // 设置空的ImageSeed
			} else {
				defer isResp.Body.Close()

				// 读取响应体
				isResponseBody, err := io.ReadAll(isResp.Body)
				if err != nil {
					log.Printf("Read ImageSeed response body error: %v", err)
					task.ImageSeed = json.RawMessage("{}") // 发生错误时设置为空
				} else {
					// 尝试解析响应体到ImageSeedResponse结构
					var resp ImageSeedResponse
					if json.Unmarshal(isResponseBody, &resp) == nil {
						// 解析成功，使用原始的响应体作为ImageSeed的值
						task.ImageSeed = isResponseBody
					} else {
						// 解析失败，设置空的ImageSeed
						task.ImageSeed = json.RawMessage("{}")
					}
				}
			}
		}
	}

	if task.Progress != "100%" && responseItem.FailReason != "" {
		log.Println(task.MjId + " 构建失败，" + task.FailReason)
		task.Progress = "100%"
		err = model.CacheUpdateUserQuota(task.UserId)
		group, _ := model.GetUserGroup(task.UserId)
		if err != nil {
			log.Println("error update user quota cache: " + err.Error())
		} else {
			Mode, _ := model.GetByOnlyMJIdMode(task.MjId)
			if Mode == "fast" {
				Mode = ""
			} else {
				Mode = Mode + "_"
			}

			modelRatio, _ := common.GetModelRatio2("mj_" + Mode + strings.ToLower(responseItem.Action))

			groupRatio := common.GetGroupRatio(group)
			ratio := modelRatio * groupRatio
			quota := int(ratio * common.QuotaPerUnit)
			if quota != 0 {
				err := model.IncreaseUserQuota(task.UserId, quota)
				if err != nil {
					log.Println("fail to increase user quota")
				}
				logContent := fmt.Sprintf("%s 构图失败，补偿 %s", task.MjId, common.LogQuota(quota))

				model.RecordLog(task.UserId, 4, 0, logContent)
			}
		}
	}

	err = task.Update()
	if err != nil {
		log.Printf("UpdateMidjourneyTask error5: %v", err)
	}
	//slog.Printf("UpdateMidjourneyTask success: %v", task)
	cancel()

}

func UpdateMidjourneyTaskAll(ctx context.Context, tasks []*model.Midjourney) bool {

	taskChannelM := make(map[int][]string)
	taskM := make(map[string]*model.Midjourney)
	for _, task := range tasks {
		if task.MjId == "" {
			return false
		}
		taskM[task.MjId] = task
		taskChannelM[task.ChannelId] = append(taskChannelM[task.ChannelId], task.MjId)
	}
	if len(taskChannelM) == 0 {
		return false
	}

	for channelId, taskIds := range taskChannelM {
		common.LogInfo(ctx, fmt.Sprintf("渠道 #%d 未完成的任务有: %d", channelId, len(taskIds)))
		if len(taskIds) == 0 {
			continue
		}
		midjourneyChannel, err := model.CacheGetChannel(channelId)
		if err != nil {
			common.LogError(ctx, fmt.Sprintf("CacheGetChannel: %v", err))
			err := model.MjBulkUpdate(taskIds, map[string]any{
				"fail_reason": fmt.Sprintf("获取渠道信息失败，请联系管理员，渠道ID：%d", channelId),
				"status":      "FAILURE",
				"progress":    "100%",
			})
			if err != nil {
				common.LogInfo(ctx, fmt.Sprintf("UpdateMidjourneyTask error: %v", err))
			}
			continue
		}
		requestUrl := fmt.Sprintf("%s/mj/task/list-by-condition", *midjourneyChannel.BaseURL)

		body, _ := json.Marshal(map[string]any{
			"ids": taskIds,
		})
		req, err := http.NewRequest("POST", requestUrl, bytes.NewBuffer(body))
		if err != nil {
			common.LogError(ctx, fmt.Sprintf("Get Task error: %v", err))
			continue
		}
		// 设置超时时间
		timeout := time.Second * 5
		ctx, cancel := context.WithTimeout(context.Background(), timeout)
		defer cancel() // 确保结束时取消上下文

		// 使用带有超时的 context 创建新的请求
		req = req.WithContext(ctx)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("mj-api-secret", midjourneyChannel.Key)

		// 发送请求并获取响应
		resp, err := util.HTTPClient.Do(req)
		if err != nil {
			common.LogError(ctx, fmt.Sprintf("Get Task Do req error: %v", err))
			return false
		}
		defer resp.Body.Close() // 使用 defer 来确保响应体会被关闭

		responseBody, err := io.ReadAll(resp.Body)

		if err != nil {
			common.LogError(ctx, fmt.Sprintf("Get Task parse body error: %v", err))
			return false
		}
		//log.Printf("responseBody: %s", string(responseBody))
		var responseItems []midjourney.Midjourney
		err = json.Unmarshal(responseBody, &responseItems)
		if err != nil {
			common.LogError(ctx, fmt.Sprintf("Get Task parse body error2: %v", err))
			return false
		}

		for _, responseItem := range responseItems {
			task := taskM[responseItem.MjId]
			if !checkMjTaskNeedUpdate(task, responseItem) {
				return false
			}
			var isResponseBody []byte // 声明这个变量保存ImageSeed响应体

			task.Code = 1
			task.Progress = responseItem.Progress
			task.PromptEn = responseItem.PromptEn
			task.State = responseItem.State
			task.SubmitTime = responseItem.SubmitTime
			task.StartTime = responseItem.StartTime
			task.FinishTime = responseItem.FinishTime
			task.ImageUrl = responseItem.ImageUrl
			task.Status = responseItem.Status
			task.FailReason = responseItem.FailReason
			task.Buttons = responseItem.Buttons
			task.Properties = responseItem.Properties
			task.ImageSeed = isResponseBody
			// 确定任务进度是100%并且状态为SUCCESS
			if task.Progress == "100%" && task.Status == "SUCCESS" {
				imageSeedUrl := fmt.Sprintf("%s/mj/task/%s/image-seed", *midjourneyChannel.BaseURL, task.MjId)
				isReq, err := http.NewRequest("GET", imageSeedUrl, nil)
				if err != nil {
					log.Printf("Get ImageSeed error: %v", err)
					task.ImageSeed = json.RawMessage("{}") // 设置空的ImageSeed
				} else { // 只有没有错误时，才设置Header和进行请求
					isReq.Header.Set("Content-Type", "application/json")
					isReq.Header.Set("mj-api-secret", midjourneyChannel.Key)

					client := &http.Client{
						Timeout: 5 * time.Second,
					}
					isResp, err := client.Do(isReq)
					if err != nil {
						log.Printf("Get ImageSeed Do req error: %v", err)
						task.ImageSeed = json.RawMessage("{}") // 设置空的ImageSeed
					} else {
						defer isResp.Body.Close()

						// 读取响应体
						isResponseBody, err := io.ReadAll(isResp.Body)
						if err != nil {
							log.Printf("Read ImageSeed response body error: %v", err)
							task.ImageSeed = json.RawMessage("{}") // 发生错误时设置为空
						} else {
							// 尝试解析响应体到ImageSeedResponse结构
							var resp ImageSeedResponse
							if json.Unmarshal(isResponseBody, &resp) == nil {
								// 解析成功，使用原始的响应体作为ImageSeed的值
								task.ImageSeed = isResponseBody
							} else {
								// 解析失败，设置空的ImageSeed
								task.ImageSeed = json.RawMessage("{}")
							}
						}
					}
				}
			}

			if task.Progress != "100%" && responseItem.FailReason != "" {
				common.LogInfo(ctx, task.MjId+" 构建失败，"+task.FailReason)
				task.Progress = "100%"
				err = model.CacheUpdateUserQuota(task.UserId)
				group, _ := model.GetUserGroup(task.UserId)
				if err != nil {
					common.LogError(ctx, "error update user quota cache: "+err.Error())
				} else {
					Mode, _ := model.GetByOnlyMJIdMode(task.MjId)
					if Mode == "fast" {
						Mode = ""
					} else {
						Mode = Mode + "_"
					}

					modelRatio, _ := common.GetModelRatio2("mj_" + Mode + strings.ToLower(responseItem.Action))
					groupRatio := common.GetGroupRatio(group)
					ratio := modelRatio * groupRatio
					quota := int(ratio * common.QuotaPerUnit)
					if quota != 0 {
						err := model.IncreaseUserQuota(task.UserId, quota)
						if err != nil {
							log.Println("fail to increase user quota")
						}
						logContent := fmt.Sprintf("%s 构图失败，补偿 %s", task.MjId, common.LogQuota(quota))

						model.RecordLog(task.UserId, 4, 0, logContent)
					}
				}
			}
			err = task.Update()
			if err != nil {
				common.LogError(ctx, "UpdateMidjourneyTask task error: "+err.Error())
			}
		}
	}
	return true
}

func checkMjTaskNeedUpdate(oldTask *model.Midjourney, newTask midjourney.Midjourney) bool {
	if oldTask.Code != 1 {
		return true
	}
	if oldTask.Progress != newTask.Progress {
		return true
	}
	if oldTask.PromptEn != newTask.PromptEn {
		return true
	}
	if oldTask.State != newTask.State {
		return true
	}
	if oldTask.SubmitTime != newTask.SubmitTime {
		return true
	}
	if oldTask.StartTime != newTask.StartTime {
		return true
	}
	if oldTask.FinishTime != newTask.FinishTime {
		return true
	}
	if oldTask.ImageUrl != newTask.ImageUrl {
		return true
	}
	if oldTask.Status != newTask.Status {
		return true
	}
	if oldTask.FailReason != newTask.FailReason {
		return true
	}
	if oldTask.FinishTime != newTask.FinishTime {
		return true
	}

	if len(oldTask.Buttons) != len(newTask.Buttons) {
		return true
	}

	// 检查 Properties 是否非空
	if len(oldTask.Properties) != len(newTask.Properties) {
		return true
	}
	if oldTask.Progress != "100%" && newTask.FailReason != "" {
		return true
	}

	return false
}

func GetAllMidjourney(c *gin.Context) {
	p, _ := strconv.Atoi(c.Query("p"))
	if p < 0 {
		p = 0
	}

	// 解析其他查询参数
	queryParams := model.TaskQueryParams{
		ChannelID:      c.Query("channel_id"),
		MjID:           c.Query("mj_id"),
		StartTimestamp: c.Query("start_timestamp"),
		EndTimestamp:   c.Query("end_timestamp"),
	}

	logs := model.GetAllTasks(p*common.ItemsPerPage, common.ItemsPerPage, queryParams)
	if logs == nil {
		logs = make([]*model.Midjourney, 0)
	}
	c.JSON(200, gin.H{
		"success": true,
		"message": "",
		"data":    logs,
	})
}

func GetUserMidjourney(c *gin.Context) {
	p, _ := strconv.Atoi(c.Query("p"))
	if p < 0 {
		p = 0
	}

	userId := c.GetInt("id")
	log.Printf("userId = %d \n", userId)

	queryParams := model.TaskQueryParams{
		MjID:           c.Query("mj_id"),
		StartTimestamp: c.Query("start_timestamp"),
		EndTimestamp:   c.Query("end_timestamp"),
	}

	logs := model.GetAllUserTask(userId, p*common.ItemsPerPage, common.ItemsPerPage, queryParams)
	if logs == nil {
		logs = make([]*model.Midjourney, 0)
	}
	if !strings.Contains(common.ServerAddress, "localhost") {
		for i, midjourney := range logs {
			midjourney.ImageUrl = common.ServerAddress + "/mj/image/" + midjourney.MjId
			logs[i] = midjourney
		}
	}
	c.JSON(200, gin.H{
		"success": true,
		"message": "",
		"data":    logs,
	})
}
