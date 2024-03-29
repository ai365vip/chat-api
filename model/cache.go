package model

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"one-api/common"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

var (
	TokenCacheSeconds         = common.SyncFrequency
	UserId2GroupCacheSeconds  = common.SyncFrequency
	UserId2QuotaCacheSeconds  = common.SyncFrequency
	UserId2StatusCacheSeconds = common.SyncFrequency
)

func CacheGetTokenByKey(key string) (*Token, error) {
	keyCol := "`key`"
	if common.UsingPostgreSQL {
		keyCol = `"key"`
	}
	var token Token
	if !common.RedisEnabled {
		err := DB.Where(keyCol+" = ?", key).First(&token).Error
		return &token, err
	}
	tokenObjectString, err := common.RedisGet(fmt.Sprintf("token:%s", key))
	if err != nil {
		err := DB.Where(keyCol+" = ?", key).First(&token).Error
		if err != nil {
			return nil, err
		}
		jsonBytes, err := json.Marshal(token)
		if err != nil {
			return nil, err
		}
		err = common.RedisSet(fmt.Sprintf("token:%s", key), string(jsonBytes), time.Duration(TokenCacheSeconds)*time.Second)
		if err != nil {
			common.SysError("Redis set token error: " + err.Error())
		}
		return &token, nil
	}
	err = json.Unmarshal([]byte(tokenObjectString), &token)
	return &token, err
}

func CacheGetUserGroup(id int) (group string, err error) {
	if !common.RedisEnabled {
		return GetUserGroup(id)
	}
	group, err = common.RedisGet(fmt.Sprintf("user_group:%d", id))
	if err != nil {
		group, err = GetUserGroup(id)
		if err != nil {
			return "", err
		}
		err = common.RedisSet(fmt.Sprintf("user_group:%d", id), group, time.Duration(UserId2GroupCacheSeconds)*time.Second)
		if err != nil {
			common.SysError("Redis set user group error: " + err.Error())
		}
	}
	return group, err
}

func fetchAndUpdateUserQuota(ctx context.Context, id int) (quota int, err error) {
	quota, err = GetUserQuota(id)
	if err != nil {
		return 0, err
	}
	err = common.RedisSet(fmt.Sprintf("user_quota:%d", id), fmt.Sprintf("%d", quota), time.Duration(UserId2QuotaCacheSeconds)*time.Second)
	if err != nil {
		common.SysError("Redis set user quota error: " + err.Error())
		common.Error(ctx, "Redis set user quota error: "+err.Error())
	}
	return
}

func CacheGetUserQuota(ctx context.Context, id int) (quota int, err error) {
	if !common.RedisEnabled {
		return GetUserQuota(id)
	}
	quotaString, err := common.RedisGet(fmt.Sprintf("user_quota:%d", id))
	if err != nil {
		return fetchAndUpdateUserQuota(ctx, id)
	}
	quota, err = strconv.Atoi(quotaString)
	if err != nil {
		return 0, nil
	}
	if quota <= common.PreConsumedQuota { // when user's quota is less than pre-consumed quota, we need to fetch from db
		common.Infof(ctx, "user %d's cached quota is too low: %d, refreshing from db", quota, id)
		return fetchAndUpdateUserQuota(ctx, id)
	}
	return quota, nil
}

func CacheUpdateUserQuota(ctx context.Context, id int) error {
	if !common.RedisEnabled {
		return nil
	}
	quota, err := CacheGetUserQuota(ctx, id)
	if err != nil {
		return err
	}
	err = common.RedisSet(fmt.Sprintf("user_quota:%d", id), fmt.Sprintf("%d", quota), time.Duration(UserId2QuotaCacheSeconds)*time.Second)
	return err
}

func CacheDecreaseUserQuota(id int, quota int) error {
	if !common.RedisEnabled {
		return nil
	}
	err := common.RedisDecrease(fmt.Sprintf("user_quota:%d", id), int64(quota))
	return err
}

func CacheIsUserEnabled(userId int) (bool, error) {
	if !common.RedisEnabled {
		return IsUserEnabled(userId)
	}
	enabled, err := common.RedisGet(fmt.Sprintf("user_enabled:%d", userId))
	if err == nil {
		return enabled == "1", nil
	}

	userEnabled, err := IsUserEnabled(userId)
	if err != nil {
		return false, err
	}
	enabled = "0"
	if userEnabled {
		enabled = "1"
	}
	err = common.RedisSet(fmt.Sprintf("user_enabled:%d", userId), enabled, time.Duration(UserId2StatusCacheSeconds)*time.Second)
	if err != nil {
		common.SysError("Redis set user enabled error: " + err.Error())
	}
	return userEnabled, err
}

var group2model2channels map[string]map[string][]*Channel
var channelsIDM map[int]*Channel
var channelSyncLock sync.RWMutex

func InitChannelCache() {
	newChannelId2channel := make(map[int]*Channel)
	var channels []*Channel
	DB.Where("status = ?", common.ChannelStatusEnabled).Find(&channels)
	for _, channel := range channels {
		newChannelId2channel[channel.Id] = channel
	}
	var abilities []*Ability
	DB.Find(&abilities)
	groups := make(map[string]bool)
	for _, ability := range abilities {
		groups[ability.Group] = true
	}
	newGroup2model2channels := make(map[string]map[string][]*Channel)
	newChannelsIDM := make(map[int]*Channel)
	for group := range groups {
		newGroup2model2channels[group] = make(map[string][]*Channel)
	}
	for _, channel := range channels {
		newChannelsIDM[channel.Id] = channel
		groups := strings.Split(channel.Group, ",")
		for _, group := range groups {
			models := strings.Split(channel.Models, ",")
			for _, model := range models {
				if _, ok := newGroup2model2channels[group][model]; !ok {
					newGroup2model2channels[group][model] = make([]*Channel, 0)
				}
				newGroup2model2channels[group][model] = append(newGroup2model2channels[group][model], channel)
			}
		}
	}

	// sort by priority
	for group, model2channels := range newGroup2model2channels {
		for model, channels := range model2channels {
			sort.Slice(channels, func(i, j int) bool {
				return channels[i].GetPriority() > channels[j].GetPriority()
			})
			newGroup2model2channels[group][model] = channels
		}
	}

	channelSyncLock.Lock()
	group2model2channels = newGroup2model2channels
	channelsIDM = newChannelsIDM
	channelSyncLock.Unlock()
	common.SysLog("channels synced from database")
}

func SyncChannelCache(frequency int) {
	for {
		time.Sleep(time.Duration(frequency) * time.Second)
		common.SysLog("syncing channels from database")
		InitChannelCache()
	}
}

func CacheGetRandomSatisfiedChannel(group string, model string, ignoreFirstPriority bool) (*Channel, error) {
	if strings.HasPrefix(model, "gpt-4-gizmo") {
		model = "gpt-4-gizmo-*"
	}

	// if memory cache is disabled, get channel directly from database
	if !common.MemoryCacheEnabled {
		return GetRandomSatisfiedChannel(group, model, ignoreFirstPriority)
	}

	channelSyncLock.RLock()
	defer channelSyncLock.RUnlock()

	allChannels := group2model2channels[group][model]
	if len(allChannels) == 0 {
		return nil, errors.New("channel not found")
	}

	// 对所有频道按优先级和权重进行排序
	sort.SliceStable(allChannels, func(i, j int) bool {
		if allChannels[i].GetPriority() == allChannels[j].GetPriority() {
			return allChannels[i].GetWeight() > allChannels[j].GetWeight()
		}
		return allChannels[i].GetPriority() > allChannels[j].GetPriority()
	})

	// 初始化当前优先级变量
	var currentPriority int64 = allChannels[0].GetPriority()

	for {
		var priorityChannels []*Channel
		var totalWeight int

		// 筛选出当前优先级的所有频道
		for _, ch := range allChannels {
			if ch.GetPriority() == currentPriority {
				priorityChannels = append(priorityChannels, ch)
				totalWeight += ch.GetWeight()
			}
		}

		if len(priorityChannels) == 0 {
			break // 如果没有剩下的频道，则跳出循环
		}
		originalLength := len(priorityChannels)
		// 尝试在当前优先级找到一个可以使用的频道
		for len(priorityChannels) > 0 {
			index := chooseIndexByWeight(priorityChannels, totalWeight)
			selectedChannel := priorityChannels[index]
			// 检查选定频道是否启用了频率限制
			if selectedChannel.RateLimited != nil && *selectedChannel.RateLimited {
				_, ok := checkRateLimit(selectedChannel.Id, model)
				if !ok {
					// 频道超过频率限制，从列表中移除该频道
					log.Println("渠道被限制", selectedChannel.Id, model)
					priorityChannels = append(priorityChannels[:index], priorityChannels[index+1:]...)
					continue
				} else {
					updateRateLimitStatus(selectedChannel.Id, model)
					return selectedChannel, nil
				}
			} else {
				return selectedChannel, nil
			}
		}

		// 寻找下一个较低的优先级继续循环
		if originalLength > 0 && len(priorityChannels) == 0 {
			nextPriority := getNextLowerPriority(allChannels, currentPriority)
			if nextPriority == -1 {
				return nil, errors.New("no channels available within rate limits")
			}
			currentPriority = nextPriority
		} else if originalLength == 0 { // 若此优先级无渠道，直接寻找下一优先级
			nextPriority := getNextLowerPriority(allChannels, currentPriority)
			if nextPriority == -1 {
				return nil, errors.New("no channels available within rate limits")
			}
			currentPriority = nextPriority
		}
	}

	return nil, errors.New("no channels available within rate limits")
}

// 辅助函数，根据权重选择索引
func chooseIndexByWeight(channels []*Channel, totalWeight int) int {
	if totalWeight == 0 {
		return rand.Intn(len(channels))
	}

	randomWeight := rand.Intn(totalWeight)
	for i, ch := range channels {
		randomWeight -= ch.GetWeight()
		if randomWeight < 0 {
			return i
		}
	}
	return len(channels) - 1
}

// 辅助函数，获取下一个较低的优先级
func getNextLowerPriority(channels []*Channel, currentPriority int64) int64 {
	for _, ch := range channels {
		if ch.GetPriority() < currentPriority {
			return ch.GetPriority()
		}
	}
	return -1
}

func CacheGetChannel(id int) (*Channel, error) {
	if !common.MemoryCacheEnabled {
		return GetChannelById(id, true)
	}
	channelSyncLock.RLock()
	defer channelSyncLock.RUnlock()

	c, ok := channelsIDM[id]
	if !ok {
		return nil, errors.New(fmt.Sprintf("当前渠道# %d，已不存在", id))
	}
	return c, nil
}
