package midjourney

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"one-api/common"
	"one-api/common/client"
	"one-api/common/config"
	"one-api/common/logger"
	"one-api/model"
	"one-api/relay/constant"
	"one-api/relay/util"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func RelayMidjourneyImage(c *gin.Context) {
	taskId := c.Param("id")
	midjourneyTask, err := model.GetByOnlyMJId(taskId)
	if err != nil {
		log.Printf("获取任务失败: %v", err)
		c.JSON(500, gin.H{
			"error":   "failed_to_get_task",
			"message": err.Error(),
		})
		return
	}
	if midjourneyTask == nil {
		c.JSON(400, gin.H{
			"error": "midjourney_task_not_found",
		})
		return
	}

	if midjourneyTask.ImageUrl == "" {
		c.JSON(400, gin.H{
			"error": "image_url_not_found",
		})
		return
	}

	resp, err := client.ProxiedHttpGet(midjourneyTask.ImageUrl, config.OutProxyUrl)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "http_get_image_failed",
		})
		return
	}

	if resp == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "empty_response",
		})
		return
	}

	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		responseBody, _ := io.ReadAll(resp.Body)
		c.JSON(resp.StatusCode, gin.H{
			"error": string(responseBody),
		})
		return
	}
	// 从Content-Type头获取MIME类型
	contentType := resp.Header.Get("Content-Type")
	if contentType == "" {
		// 如果无法确定内容类型，则默认为jpeg
		contentType = "image/jpeg"
	}
	// 设置响应的内容类型
	c.Writer.Header().Set("Content-Type", contentType)
	// 将图片流式传输到响应体
	_, err = io.Copy(c.Writer, resp.Body)
	if err != nil {
		log.Println("Failed to stream image:", err)
	}
}

func RelayMidjourneyNotify(c *gin.Context) *MidjourneyResponse {
	var midjRequest Midjourney
	err := common.UnmarshalBodyReusable(c, &midjRequest)
	if err != nil {
		return &MidjourneyResponse{
			Code:        4,
			Description: "bind_request_body_failed",
			Properties:  nil,
			Result:      "",
		}
	}

	midjourneyTask, _ := model.GetByOnlyMJId(midjRequest.MjId)
	if midjourneyTask == nil {
		return &MidjourneyResponse{
			Code:        4,
			Description: "midjourney_task_not_found",
			Properties:  nil,
			Result:      "",
		}
	}
	midjourneyTask.Progress = midjRequest.Progress
	midjourneyTask.PromptEn = midjRequest.PromptEn
	midjourneyTask.State = midjRequest.State
	midjourneyTask.SubmitTime = midjRequest.SubmitTime
	midjourneyTask.StartTime = midjRequest.StartTime
	midjourneyTask.FinishTime = midjRequest.FinishTime
	midjourneyTask.ImageUrl = midjRequest.ImageUrl
	midjourneyTask.Status = midjRequest.Status
	midjourneyTask.FailReason = midjRequest.FailReason
	err = midjourneyTask.Update()
	if err != nil {
		return &MidjourneyResponse{
			Code:        4,
			Description: "update_midjourney_task_failed",
		}
	}

	return nil
}

func getMidjourneyTaskModel(c *gin.Context, originTask *model.Midjourney) (midjourneyTask TaskMidjourney) {
	midjourneyTask.MjId = originTask.MjId
	midjourneyTask.Progress = originTask.Progress
	midjourneyTask.PromptEn = originTask.PromptEn
	midjourneyTask.State = originTask.State
	midjourneyTask.SubmitTime = originTask.SubmitTime
	midjourneyTask.StartTime = originTask.StartTime
	midjourneyTask.FinishTime = originTask.FinishTime
	midjourneyTask.Buttons = originTask.Buttons
	midjourneyTask.Properties = originTask.Properties
	midjourneyTask.ImageUrl = ""

	// 如果图片地址功能被明确开启 (即 isImageURLEnabled == 1)
	if originTask.IsImageURLEnabled != nil && *originTask.IsImageURLEnabled == 1 {
		// 直接使用originTask的ImageUrl
		midjourneyTask.ImageUrl = originTask.ImageUrl
	} else {
		// 否则，使用之前的逻辑来设置ImageUrl
		midjourneyTask.ImageUrl = ""
		if originTask.ImageUrl != "" {
			midjourneyTask.ImageUrl = config.ServerAddress + "/mj/image/" + originTask.MjId
			if originTask.Status != "SUCCESS" {
				midjourneyTask.ImageUrl += "?rand=" + strconv.FormatInt(time.Now().UnixNano(), 10)
			}
		}
	}

	midjourneyTask.Status = originTask.Status
	midjourneyTask.FailReason = originTask.FailReason
	midjourneyTask.Action = originTask.Action
	midjourneyTask.Description = originTask.Description
	midjourneyTask.Prompt = originTask.Prompt
	return
}

func (c *Condition) UnmarshalJSON(data []byte) error {
	var raw map[string][]json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	for _, v := range raw["ids"] {
		var strVal string
		var numVal int
		if err := json.Unmarshal(v, &strVal); err == nil {
			c.IDs = append(c.IDs, strVal)
		} else if err := json.Unmarshal(v, &numVal); err == nil {
			c.IDs = append(c.IDs, strconv.Itoa(numVal))
		} else {
			return fmt.Errorf("cannot unmarshal ID to string or number")
		}
	}
	return nil
}

func RelayMidjourneyTask(c *gin.Context, relayMode int) *MidjourneyResponse {
	userId := c.GetInt("id")
	var err error
	var respBody []byte
	switch relayMode {
	case constant.RelayModeMidjourneyTaskFetch:
		taskId := c.Param("id")
		originTask := model.GetByMJId(userId, taskId)
		if originTask == nil {
			return &MidjourneyResponse{
				Code:        4,
				Description: "task_no_found",
			}
		}

		midjourneyTask := getMidjourneyTaskModel(c, originTask)
		respBody, err = json.Marshal(midjourneyTask)

		if err != nil {
			return &MidjourneyResponse{
				Code:        4,
				Description: "unmarshal_response_fetch_body_failed",
			}
		}
	case constant.RelayModeMidjourneyTaskFetchByCondition:
		var condition Condition
		err = c.BindJSON(&condition)
		if err != nil {
			return &MidjourneyResponse{
				Code:        4,
				Description: "do_request_failed",
			}
		}
		var tasks []TaskMidjourney
		if len(condition.IDs) != 0 {
			originTasks := model.GetByMJIds(userId, condition.IDs)
			for _, originTask := range originTasks {
				midjourneyTask := getMidjourneyTaskModel(c, originTask)
				tasks = append(tasks, midjourneyTask)
			}
		}
		if tasks == nil {
			tasks = make([]TaskMidjourney, 0)
		}
		respBody, err = json.Marshal(tasks)
		if err != nil {
			return &MidjourneyResponse{
				Code:        4,
				Description: "unmarshal_response_fetchBy_body_failed",
			}
		}
	}

	c.Writer.Header().Set("Content-Type", "application/json")

	_, err = io.Copy(c.Writer, bytes.NewBuffer(respBody))
	if err != nil {
		return &MidjourneyResponse{
			Code:        4,
			Description: "copy_response_body_failed",
		}
	}
	return nil
}

func RelayMidjourneyImageSeed(c *gin.Context) *MidjourneyResponse {
	userId := c.GetInt("id")
	taskId := c.Param("id")
	originTask := model.GetImageSeed(userId, taskId)
	if originTask == nil {
		return &MidjourneyResponse{
			Code:        4,
			Description: "task_no_found",
		}
	}

	// 直接设置响应的Content-Type
	c.Writer.Header().Set("Content-Type", "application/json")

	_, err := c.Writer.Write([]byte(originTask.ImageSeed))
	if err != nil {
		// 如果在写入过程中出现错误，返回相应的错误信息
		return &MidjourneyResponse{
			Code:        4,
			Description: "copy_response_body_failed",
		}
	}
	return nil
}

const (
	// type 1 根据 mode 价格不同
	MJSubmitActionImagine   = "IMAGINE"
	MJSubmitActionVariation = "VARIATION" //变换
	MJSubmitActionBlend     = "BLEND"     //混图

	MJSubmitActionReroll = "REROLL" //重新生成
	// type 2 固定价格
	MJSubmitActionDescribe = "DESCRIBE"
	MJSubmitActionUpscale  = "UPSCALE" // 放大
)

func RelayMidjourneySubmit(c *gin.Context, relayMode int) *MidjourneyResponse {
	imageModel := c.GetString("model")

	tokenId := c.GetInt("token_id")
	channelType := c.GetInt("channel")
	userId := c.GetInt("id")
	consumeQuota := c.GetBool("consume_quota")
	group := c.GetString("group")
	channelId := c.GetInt("channel_id")
	channelName := c.GetString("channel_name")
	ip := c.GetString("relayIp")
	var midjRequest MidjourneyRequest
	if consumeQuota {
		err := common.UnmarshalBodyReusable(c, &midjRequest)
		if err != nil {
			return &MidjourneyResponse{
				Code:        4,
				Description: "bind_request_body_failed",
			}
		}
	}

	if relayMode == constant.RelayModeMidjourneyImagine { //绘画任务，此类任务可重复
		if midjRequest.Prompt == "" {
			return &MidjourneyResponse{
				Code:        4,
				Description: "prompt_is_required",
			}
		}

		midjRequest.Action = "IMAGINE"
	} else if relayMode == constant.RelayModeMidjourneyDescribe { //按图生文任务，此类任务可重复
		midjRequest.Action = "DESCRIBE"
	} else if relayMode == constant.RelayModeMidjourneyShorten { //prompt分析
		midjRequest.Action = "SHORTEN"
	} else if relayMode == constant.RelayModeMidjourneyUploads {
		if midjRequest.Base64Array == nil {
			return &MidjourneyResponse{
				Code:        4,
				Description: "Base64Array_is_required",
			}
		}
		midjRequest.Action = "UPLOADS"
	} else if relayMode == constant.RelayModeMidjourneyFace { //换脸
		if midjRequest.TargetBase64 == "" {
			return &MidjourneyResponse{
				Code:        4,
				Description: "targetBase64_is_required",
			}
		}
		if midjRequest.SourceBase64 == "" {
			return &MidjourneyResponse{
				Code:        4,
				Description: "sourceBase64_is_required",
			}
		}
		midjRequest.Action = "SWAPFACE"
	} else if relayMode == constant.RelayModeMidjourneyBlend { //绘画任务，此类任务可重复
		midjRequest.Action = "BLEND"
	} else if midjRequest.TaskId != "" { //放大、变换任务，此类任务，如果重复且已有结果，远端api会直接返回最终结果
		mjId := ""
		if relayMode == constant.RelayModeMidjourneyChange {
			if midjRequest.TaskId == "" {
				return &MidjourneyResponse{
					Code:        4,
					Description: "taskId_is_required",
				}
			} else if midjRequest.Action == "" {
				return &MidjourneyResponse{
					Code:        4,
					Description: "action_is_required",
				}
			} else if midjRequest.Index == 0 {
				return &MidjourneyResponse{
					Code:        4,
					Description: "index_can_only_be_1_2_3_4",
				}
			}
			mjId = midjRequest.TaskId
		} else if relayMode == constant.RelayModeMidjourneySimpleChange {
			if midjRequest.Content == "" {
				return &MidjourneyResponse{
					Code:        4,
					Description: "content_is_required",
				}
			}
			params := convertSimpleChangeParams(midjRequest.Content)
			if params == nil {
				return &MidjourneyResponse{
					Code:        4,
					Description: "content_parse_failed",
				}
			}
			mjId = params.ID
			midjRequest.Action = params.Action
		} else if relayMode == constant.RelayModeMidjourneyAction { //ACTION动作
			if midjRequest.TaskId == "" {
				return &MidjourneyResponse{
					Code:        4,
					Description: "taskId_is_required",
				}
			} else if midjRequest.CustomId == "" {
				return &MidjourneyResponse{
					Code:        4,
					Description: "customId_is_required",
				}
			}
			//action = midjRequest.Action
			mjId = midjRequest.TaskId
			params := convertActionParams(midjRequest.CustomId)
			midjRequest.Action = *params
		} else if relayMode == constant.RelayModeMidjourneyModal { //MODAL局部重绘
			if midjRequest.TaskId == "" {
				return &MidjourneyResponse{
					Code:        4,
					Description: "taskId_is_required",
				}
			}
			mjId = midjRequest.TaskId
			midjRequest.Action = "MODAL"
		}
		originTask := model.GetByMJId(userId, mjId)

		if originTask == nil {
			return &MidjourneyResponse{
				Code:        4,
				Description: "task_no_found",
			}
		} else if originTask.Status == "SUCCESS" {
			channel, err := model.GetChannelById(originTask.ChannelId, false)
			if err != nil {
				return &MidjourneyResponse{
					Code:        4,
					Description: "channel_not_found",
				}
			}
			c.Set("base_url", channel.GetBaseURL())
			c.Set("channel_id", originTask.ChannelId)
			log.Printf("检测到此操作为放大、变换，获取原channel信息: %s,%s", strconv.Itoa(originTask.ChannelId), channel.GetBaseURL())

		}
		midjRequest.Prompt = originTask.Prompt
	}

	// map model name
	modelMapping := c.GetString("model_mapping")
	isModelMapped := false
	if modelMapping != "" {
		modelMap := make(map[string]string)
		err := json.Unmarshal([]byte(modelMapping), &modelMap)
		if err != nil {
			//return errorWrapper(err, "unmarshal_model_mapping_failed", http.StatusInternalServerError)
			return &MidjourneyResponse{
				Code:        4,
				Description: "unmarshal_model_mapping_failed",
			}
		}
		if modelMap[imageModel] != "" {
			imageModel = modelMap[imageModel]
			isModelMapped = true
		}
	}

	baseURL := common.ChannelBaseURLs[channelType]
	requestURL := c.Request.URL.String()

	prefixes := []string{"/mj-relax", "/mj-turbo", "/mj-fast"}

	// 遍历前缀，尝试从requestURL中移除
	for _, prefix := range prefixes {
		// 如果当前前缀匹配，则移除并停止循环
		if strings.HasPrefix(requestURL, prefix) {
			requestURL = strings.TrimPrefix(requestURL, prefix)
			break // 假定只有一个前缀会匹配，找到后即停止
		}
	}
	if c.GetString("base_url") != "" {
		baseURL = c.GetString("base_url")
	}

	//midjRequest.NotifyHook = "http://127.0.0.1:3000/mj/notify"

	fullRequestURL := fmt.Sprintf("%s%s", baseURL, requestURL)

	var m map[string]interface{}
	var requestBody io.Reader

	if isModelMapped {
		// 将 midjRequest 转为一个 map
		inrec, _ := json.Marshal(midjRequest)
		json.Unmarshal(inrec, &m)
		jsonStr, err := json.Marshal(m)
		if err != nil {
			return &MidjourneyResponse{
				Code:        4,
				Description: "marshal_text_request_failed",
			}
		}
		requestBody = bytes.NewBuffer(jsonStr)
	} else {
		requestBody = c.Request.Body
	}
	var modelRatio float64
	var mjAction string

	if imageModel == "midjourney-turbo" {
		mjAction = "mj_turbo_" + strings.ToLower(midjRequest.Action)
		midjRequest.Mode = "turbo"
	} else if imageModel == "midjourney-relax" {
		mjAction = "mj_relax_" + strings.ToLower(midjRequest.Action)
		midjRequest.Mode = "relax"
	} else {
		mjAction = "mj_" + strings.ToLower(midjRequest.Action)
		midjRequest.Mode = "fast"
	}

	// 如果没有配置价格，则使用默认价格
	defaultPrice, ok := common.ModelPrice[mjAction]
	if !ok {
		modelRatio = 0.1
	} else {
		modelRatio = defaultPrice
	}
	groupRatio := common.GetGroupRatio(group)

	ratio := modelRatio * groupRatio

	userQuota, err := model.CacheGetUserQuota(c, userId)
	if err != nil {
		return &MidjourneyResponse{
			Code:        4,
			Description: err.Error(),
		}
	}
	excludedActions := map[string]bool{
		"mj_modal":       true,
		"mj_turbo_modal": true,
		"mj_relax_modal": true,
	}
	modalActions := map[string]bool{
		"mj_inpaint":          true,
		"mj_turbo_inpaint":    true,
		"mj_relax_inpaint":    true,
		"mj_customzoom":       true,
		"mj_turbo_customzoom": true,
		"mj_relax_customzoom": true,
	}
	quota := int(ratio * config.QuotaPerUnit)
	if excludedActions[mjAction] {
		consumeQuota = false
	}
	if consumeQuota && userQuota-quota < 0 {
		consumeQuota = false
		return &MidjourneyResponse{
			Code:        4,
			Description: "quota_not_enough",
		}
	}

	req, err := http.NewRequest(c.Request.Method, fullRequestURL, requestBody)
	if err != nil {
		consumeQuota = false
		return &MidjourneyResponse{
			Code:        4,
			Description: "create_request_failed",
		}
	}
	//req.Header.Set("Authorization", c.Request.Header.Get("Authorization"))

	req.Header.Set("Content-Type", c.Request.Header.Get("Content-Type"))
	req.Header.Set("Accept", c.Request.Header.Get("Accept"))
	req.Header.Set("mj-api-secret", strings.Split(c.Request.Header.Get("Authorization"), " ")[1])
	//req.Header.Set("Authorization", "Bearer midjourney-proxy")
	//req.Header.Set("mj-api-secret", strings.Split(c.Request.Header.Get("Authorization"), " ")[1])
	// print request header

	resp, err := util.HTTPClient.Do(req)
	if err != nil {
		consumeQuota = false
		return &MidjourneyResponse{
			Code:        4,
			Description: "do_request_failed",
		}
	}

	err = req.Body.Close()
	if err != nil {
		consumeQuota = false
		return &MidjourneyResponse{
			Code:        4,
			Description: "close_request_body_failed",
		}
	}
	err = c.Request.Body.Close()
	if err != nil {
		consumeQuota = false
		return &MidjourneyResponse{
			Code:        4,
			Description: "close_request_body_failed",
		}
	}
	var midjResponse MidjourneyResponse
	var mjuploadsResponse MidjourneyUploadsResponse

	defer func(ctx context.Context) {

		if consumeQuota && !excludedActions[mjAction] {
			err := model.PostConsumeTokenQuota(tokenId, quota)
			if err != nil {
				common.SysError("error consuming token remain quota: " + err.Error())
			}
			err = model.CacheDecreaseUserQuota(ctx, userId, quota)
			if err != nil {
				logger.Error(ctx, "decrease_user_quota_failed"+err.Error())
			}
			//err = model.CacheUpdateUserQuota(c, userId)
			//if err != nil {
			//	common.SysError("error update user quota cache: " + err.Error())
			//}
			if quota != 0 {
				tokenName := c.GetString("token_name")
				multiplier := fmt.Sprintf("模型固定价格 %.2f，分组倍率 %.2f，操作 %s", modelRatio, groupRatio, mjAction)
				model.RecordConsumeLog(ctx, userId, channelId, channelName, 0, 0, imageModel, tokenName, quota, midjResponse.Result, tokenId, multiplier, userQuota, 0, false, "", ip)
				model.UpdateUserUsedQuotaAndRequestCount(userId, quota)
				channelId := c.GetInt("channel_id")
				model.UpdateChannelUsedQuota(channelId, quota)
			}
		}
	}(c.Request.Context())

	responseBody, err := io.ReadAll(resp.Body)

	if err != nil {
		consumeQuota = false
		return &MidjourneyResponse{
			Code:        4,
			Description: "read_response_body_failed",
		}
	}
	err = resp.Body.Close()
	if err != nil {
		return &MidjourneyResponse{
			Code:        4,
			Description: "close_response_body_failed",
		}
	}

	if resp.StatusCode != 200 {
		consumeQuota = false
		return &MidjourneyResponse{
			Code:        4,
			Description: "fail_to_fetch_midjourney status_code: " + strconv.Itoa(resp.StatusCode),
		}
	}

	err = json.Unmarshal(responseBody, &midjResponse)
	if err != nil {
		// 如果解码失败，尝试将响应体反序列化为MidjourneyUploadsResponse
		err = json.Unmarshal(responseBody, &mjuploadsResponse)
		if err != nil {
			consumeQuota = false
			return &MidjourneyResponse{
				Code:        4,
				Description: "unmarshal_response_body_failed",
			}
		}
	}

	// 文档：https://github.com/novicezk/midjourney-proxy/blob/main/docs/api.md
	//1-提交成功
	// 21-任务已存在（处理中或者有结果了） {"code":21,"description":"任务已存在","result":"0741798445574458","properties":{"status":"SUCCESS","imageUrl":"https://xxxx"}}
	// 22-排队中 {"code":22,"description":"排队中，前面还有1个任务","result":"0741798445574458","properties":{"numberOfQueues":1,"discordInstanceId":"1118138338562560102"}}
	// 23-队列已满，请稍后再试 {"code":23,"description":"队列已满，请稍后尝试","result":"14001929738841620","properties":{"discordInstanceId":"1118138338562560102"}}
	// 24-prompt包含敏感词 {"code":24,"description":"可能包含敏感词","properties":{"promptEn":"nude body","bannedWord":"nude"}}
	// other: 提交错误，description为错误描述
	ChannelIsImageURLEnabled, _ := model.GetChannelByIdIsImageURLEnabled(c.GetInt("channel_id"))
	midjourneyTask := &model.Midjourney{
		UserId:            userId,
		Code:              midjResponse.Code,
		Action:            midjRequest.Action,
		MjId:              midjResponse.Result,
		Prompt:            midjRequest.Prompt,
		PromptEn:          "",
		Description:       midjResponse.Description,
		State:             "",
		Mode:              midjRequest.Mode,
		SubmitTime:        time.Now().UnixNano() / int64(time.Millisecond),
		StartTime:         0,
		FinishTime:        0,
		ImageUrl:          "",
		Status:            "",
		Progress:          "0%",
		FailReason:        "",
		ChannelId:         c.GetInt("channel_id"),
		IsImageURLEnabled: ChannelIsImageURLEnabled,
	}

	if midjResponse.Code != 1 && midjResponse.Code != 21 && midjResponse.Code != 22 {
		//非1-提交成功,21-任务已存在和22-排队中，则记录错误原因
		midjourneyTask.FailReason = midjResponse.Description
		consumeQuota = false
	}
	if midjResponse.Result == "" || midjRequest.Action == "UPLOADS" {
		//没有返回id
		midjourneyTask.Progress = "100%"
	}

	if midjResponse.Code == 21 { //21-任务已存在（处理中或者有结果了）
		// 将 properties 转换为一个 map
		properties, ok := midjResponse.Properties.(map[string]interface{})
		if ok {
			imageUrl, ok1 := properties["imageUrl"].(string)
			status, ok2 := properties["status"].(string)
			if ok1 && ok2 {
				midjourneyTask.ImageUrl = imageUrl
				midjourneyTask.Status = status
				if status == "SUCCESS" {
					midjourneyTask.Progress = "100%"
					midjourneyTask.StartTime = time.Now().UnixNano() / int64(time.Millisecond)
					midjourneyTask.FinishTime = time.Now().UnixNano() / int64(time.Millisecond)
					midjResponse.Code = 1
				}
			}
		}
		//修改返回值
		if !modalActions[mjAction] {
			newBody := strings.Replace(string(responseBody), `"code":21`, `"code":1`, -1)
			responseBody = []byte(newBody)
		}
	}
	if excludedActions[mjAction] && midjResponse.Code == 1 {
		midjourneyTask.Status = "SUCCESS"
		midjourneyTask.Progress = "100%"
	}
	err = midjourneyTask.Insert()
	if err != nil {
		consumeQuota = false
		return &MidjourneyResponse{
			Code:        4,
			Description: "insert_midjourney_task_failed",
		}
	}

	if midjResponse.Code == 22 { //22-排队中，说明任务已存在
		newBody := strings.Replace(string(responseBody), `"code":22`, `"code":1`, -1)
		responseBody = []byte(newBody)
	}

	resp.Body = io.NopCloser(bytes.NewBuffer(responseBody))

	for k, v := range resp.Header {
		c.Writer.Header().Set(k, v[0])
	}
	c.Writer.WriteHeader(resp.StatusCode)

	_, err = io.Copy(c.Writer, resp.Body)
	if err != nil {
		consumeQuota = false
		return &MidjourneyResponse{
			Code:        4,
			Description: "copy_response_body_failed",
		}
	}
	err = resp.Body.Close()
	if err != nil {
		consumeQuota = false
		return &MidjourneyResponse{
			Code:        4,
			Description: "close_response_body_failed",
		}
	}
	return nil
}

type taskChangeParams struct {
	ID     string
	Action string
	Index  int
}

func convertSimpleChangeParams(customid string) *taskChangeParams {
	split := strings.Split(customid, " ")
	if len(split) != 2 {
		return nil
	}

	action := strings.ToLower(split[1])
	changeParams := &taskChangeParams{}
	changeParams.ID = split[0]

	if action[0] == 'u' {
		changeParams.Action = "UPSCALE"
	} else if action[0] == 'v' {
		changeParams.Action = "VARIATION"
	} else if action == "r" {
		changeParams.Action = "REROLL"
		return changeParams
	} else {
		return nil
	}

	index, err := strconv.Atoi(action[1:2])
	if err != nil || index < 1 || index > 4 {
		return nil
	}
	changeParams.Index = index
	return changeParams
}

func convertActionParams(content string) *string {
	// 使用 "::" 分割输入字符串
	parts := strings.Split(content, "::")
	// 确保分割后的部分数量正确
	if len(parts) < 3 {
		return nil
	}

	// 检查并匹配操作，根据匹配返回对应的大写字符串
	action := parts[2]
	action1 := parts[1]
	var actionLiteral string // 定义一个变量来存储结果字符串
	switch action {
	case "upsample":
		actionLiteral = "UPSCALE"
	case "variation":
		actionLiteral = "VARIATION"
	case "reroll":
		actionLiteral = "REROLL"
	default:
		switch action1 { // 当action不匹配时，检查action1
		case "Inpaint":
			actionLiteral = "INPAINT"
		case "CustomZoom":
			actionLiteral = "CUSTOMZOOM"
		default:
			actionLiteral = "ACTION"
		}
	}

	return &actionLiteral
}
