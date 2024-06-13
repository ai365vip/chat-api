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
	"one-api/common/config"
	"one-api/model"
	"one-api/relay/channel/midjourney"
	"one-api/relay/util"
	"strconv"
	"strings"
	"sync"
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
		time.Sleep(time.Duration(10) * time.Second)

		tasks := model.GetAllUnFinishTasks()

		if len(tasks) == 0 {
			continue
		}
		common.LogInfo(ctx, fmt.Sprintf("检测到未完成的任务数有: %v", len(tasks)))
		// 尝试批量更新, 如果成功则跳过单个任务更新
		success := UpdateMidjourneyTaskAll(ctx, tasks)
		if !success {
			// 批量更新失败,再并发更新单个任务
			ConcurrentUpdateMidjourneyTasks(ctx, tasks)
		}
	}
}

func ConcurrentUpdateMidjourneyTasks(ctx context.Context, tasks []*model.Midjourney) {
	var wg sync.WaitGroup

	// 为每个任务启动一个goroutines
	for _, task := range tasks {
		wg.Add(1) // 增加等待组的计数
		go func(task *model.Midjourney) {
			defer wg.Done() // 函数返回时减少等待组的计数

			// 将当前任务上下文传给 UpdateMidjourneyTaskOne
			UpdateMidjourneyTaskOne(ctx, task)
		}(task)
	}

	wg.Wait() // 等待所有goroutine完成
}

func UpdateMidjourneyTaskOne(ctx context.Context, task *model.Midjourney) {
	localCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	midjourneyChannel, err := model.GetChannelById(task.ChannelId, true)

	if err != nil {
		common.LogError(localCtx, fmt.Sprintf("获取渠道信息失败，请联系管理员，渠道ID：%d, 错误：%v", task.ChannelId, err))
		task.FailReason = "获取渠道信息失败，请联系管理员"
		task.Status = "FAILURE"
		task.Progress = "100%"
		if err := task.Update(); err != nil {
			common.LogError(localCtx, fmt.Sprintf("更新任务状态失败：%v", err))
		}
		return
	}

	requestUrl := fmt.Sprintf("%s/mj/task/%s/fetch", *midjourneyChannel.BaseURL, task.MjId)
	req, err := http.NewRequest("GET", requestUrl, nil)
	if err != nil {
		common.LogError(localCtx, fmt.Sprintf("创建请求失败：%v", err))
		return
	}
	req = req.WithContext(localCtx)

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("mj-api-secret", midjourneyChannel.Key)

	resp, err := util.HTTPClient.Do(req)
	if err != nil {
		common.LogError(localCtx, fmt.Sprintf("执行请求失败：%v", err))
		return
	}
	defer resp.Body.Close()
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response body: %v", err)
		return
	}
	//log.Printf("fetchResponseBody: %s", string(responseBody))
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
	if responseItem.Action != "MODAL" {
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
		if err := task.Update(); err != nil {
			log.Printf("更新任务失败: %v", err)
		}
		HandleTaskCompletion(ctx, task)
	}

}

func UpdateMidjourneyTaskAll(ctx context.Context, tasks []*model.Midjourney) bool {
	taskChannelM := make(map[int][]string)
	taskM := make(map[string]*model.Midjourney)
	for _, task := range tasks {
		if task.MjId == "" {
			log.Println("Task MJ ID is empty")
			return false
		}
		taskM[task.MjId] = task
		taskChannelM[task.ChannelId] = append(taskChannelM[task.ChannelId], task.MjId)
	}
	if len(taskChannelM) == 0 {
		log.Println("No tasks to update")
		return false
	}

	var wg sync.WaitGroup
	errors := make(chan error, len(taskChannelM)) // 收集错误信息

	for channelId, taskIds := range taskChannelM {
		wg.Add(1)
		go func(channelId int, taskIds []string) {
			defer wg.Done()
			if err := updateTasksForChannel(ctx, channelId, taskIds, taskM); err != nil {
				errors <- err
			}
		}(channelId, taskIds)
	}

	wg.Wait()
	close(errors)

	// 检查是否有错误发生
	for err := range errors {
		if err != nil {
			log.Printf("Error updating tasks: %v", err)
			return false
		}
	}

	return true
}

func updateTasksForChannel(ctx context.Context, channelId int, taskIds []string, taskMap map[string]*model.Midjourney) error {
	common.LogInfo(ctx, fmt.Sprintf("渠道 #%d 未完成的任务有: %d", channelId, len(taskIds)))
	if len(taskIds) == 0 {
		return nil
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
		return nil
	}
	requestUrl := fmt.Sprintf("%s/mj/task/list-by-condition", *midjourneyChannel.BaseURL)

	body, _ := json.Marshal(map[string]any{
		"ids": taskIds,
	})
	req, err := http.NewRequest("POST", requestUrl, bytes.NewBuffer(body))
	if err != nil {
		common.LogError(ctx, fmt.Sprintf("Get Task error: %v", err))
		return nil
	}
	// 设置超时时间
	timeout := time.Second * 8
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
		return nil
	}
	defer resp.Body.Close() // 使用 defer 来确保响应体会被关闭

	responseBody, err := io.ReadAll(resp.Body)

	if err != nil {
		common.LogError(ctx, fmt.Sprintf("Get Task parse body error: %v", err))
		return nil
	}
	//log.Printf("listResponseBody: %s", string(responseBody))
	var responseItems []midjourney.Midjourney
	err = json.Unmarshal(responseBody, &responseItems)
	if err != nil {
		common.LogError(ctx, fmt.Sprintf("Get Task parse body error2: %v", err))
		return nil
	}

	for _, responseItem := range responseItems {
		task := taskMap[responseItem.MjId]
		if !checkMjTaskNeedUpdate(task, responseItem) {
			continue
		}
		if responseItem.Action != "MODAL" {
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
			if err := task.Update(); err != nil {
				log.Printf("更新任务失败: %v", err)
			}
			// 确定任务进度是100%并且状态为SUCCESS
			HandleTaskCompletion(ctx, task)
		}
	}
	return nil
}

// HandleTaskCompletion 用于处理任务完成后的逻辑。
func HandleTaskCompletion(ctx context.Context, task *model.Midjourney) {
	// 检查任务是否成功完成
	if task.Progress == "100%" && task.Status == "SUCCESS" {
		// 处理成功完成的任务，获取ImageSeed
		fetchImageSeed(task)
	} else if task.FailReason != "" {
		// 处理失败的任务，更新用户配额
		compensateForTaskFailure(ctx, task)
	}

}

// fetchImageSeed 获取任务的ImageSeed信息。
func fetchImageSeed(task *model.Midjourney) {
	midjourneyChannel, err := model.CacheGetChannel(task.ChannelId)
	if err != nil {
		log.Printf("获取渠道信息失败: %v", err)
		return
	}

	// 构造获取ImageSeed的URL
	imageSeedUrl := fmt.Sprintf("%s/mj/task/%s/image-seed", *midjourneyChannel.BaseURL, task.MjId)
	req, err := http.NewRequest("GET", imageSeedUrl, nil)
	if err != nil {
		log.Printf("获取ImageSeed请求失败: %v", err)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("mj-api-secret", midjourneyChannel.Key)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("获取ImageSeed请求失败: %v", err)
		return
	}
	defer resp.Body.Close()

	isResponseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("读取ImageSeed响应体失败: %v", err)
		return
	}

	task.ImageSeed = json.RawMessage(isResponseBody)
	// 注意：这里应该调用保存更新到数据库的逻辑
	if err := task.InsertImageSeed(); err != nil {
		log.Printf("更新任务失败: %v", err)
	}
}

// compensateForTaskFailure 处理任务失败的补偿逻辑。
func compensateForTaskFailure(ctx context.Context, task *model.Midjourney) {

	if task.Progress != "100%" {
		common.LogInfo(ctx, task.MjId+" 构建失败，"+task.FailReason)
		task.Progress = "100%"
		if err := task.Update(); err != nil {
			log.Printf("更新任务失败: %v", err)
		}
	} else {
		common.LogInfo(ctx, task.MjId+" 返回失败，"+task.FailReason)
	}

	err := model.CacheUpdateUserQuota(ctx, task.UserId)
	if err != nil {
		common.LogError(ctx, "error update user quota cache: "+err.Error())
	} else {
		Mode, _ := model.GetByOnlyMJIdMode(task.MjId)
		if Mode == "fast" {
			Mode = ""
		} else {
			Mode = Mode + "_"
		}

		group, _ := model.GetUserGroup(task.UserId)
		modelRatio, _ := common.GetModelRatio2("mj_" + Mode + strings.ToLower(task.Action))
		groupRatio := common.GetGroupRatio(group)
		ratio := modelRatio * groupRatio
		quota := int(ratio * config.QuotaPerUnit)
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
func checkMjTaskNeedUpdate(oldTask *model.Midjourney, newTask midjourney.Midjourney) bool {
	if oldTask.Code != 1 {
		return true
	}
	// 检查任务基本信息是否发生变化
	if oldTask.Progress != newTask.Progress || oldTask.Status != newTask.Status {
		return true
	}

	// 如果任务失败，检查失败原因是否更新
	if oldTask.Status == "FAILURE" && oldTask.FailReason != newTask.FailReason {
		return true
	}

	// 检查时间戳是否发生变化，
	if oldTask.SubmitTime != newTask.SubmitTime ||
		oldTask.StartTime != newTask.StartTime ||
		oldTask.FinishTime != newTask.FinishTime {
		return true
	}

	// 检查其他可能影响任务显示或状态的变化
	if oldTask.PromptEn != newTask.PromptEn ||
		oldTask.ImageUrl != newTask.ImageUrl ||
		oldTask.State != newTask.State {
		return true
	}

	// 如果任务完成并且成功，但ImageSeed未设置，也需要更新
	if oldTask.Status == "SUCCESS" && oldTask.Progress == "100%" && len(oldTask.ImageSeed) == 0 {
		return true
	}

	// 如果到这里都没有返回true，那么就意味着无需更新
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

	logs := model.GetAllTasks(p*config.ItemsPerPage, config.ItemsPerPage, queryParams)
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

	logs := model.GetAllUserTask(userId, p*config.ItemsPerPage, config.ItemsPerPage, queryParams)
	if logs == nil {
		logs = make([]*model.Midjourney, 0)
	}
	for _, midjourney := range logs {
		midjourney.ChannelId = 0
	}
	if !strings.Contains(config.ServerAddress, "localhost") {
		for i, midjourney := range logs {
			midjourney.ImageUrl = config.ServerAddress + "/mj/image/" + midjourney.MjId
			logs[i] = midjourney
		}
	}
	c.JSON(200, gin.H{
		"success": true,
		"message": "",
		"data":    logs,
	})
}
