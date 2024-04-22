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

func filterByTools(channels []*Channel) []*Channel {
	var filteredChannels []*Channel
	for _, ch := range channels {
		if ch.IsTools != nil && *ch.IsTools {
			filteredChannels = append(filteredChannels, ch)
		}
	}
	return filteredChannels
}

// 使用map优化excludedChannelIds的查找
func contains(excluded map[int]struct{}, id int) bool {
	_, exists := excluded[id]
	return exists
}

// 优化后的CacheGetRandomSatisfiedChannel函数
func CacheGetRandomSatisfiedChannel(group string, model string, ignoreFirstPriority bool, isTools bool, excludedChannelIds []int, i int) (*Channel, error) {
	// 构建快速查找map
	excludedMap := make(map[int]struct{})
	for _, id := range excludedChannelIds {
		excludedMap[id] = struct{}{}
	}

	if strings.HasPrefix(model, "gpt-4-gizmo") {
		model = "gpt-4-gizmo-*"
	}

	// 检查缓存
	if !common.MemoryCacheEnabled {
		return GetRandomSatisfiedChannel(group, model, ignoreFirstPriority, isTools)
	}

	channelSyncLock.RLock()
	defer channelSyncLock.RUnlock()

	allChannels := group2model2channels[group][model]
	if len(allChannels) == 0 {
		return nil, errors.New("no channels found for group and model")
	}

	sortChannels(allChannels) // 封装排序逻辑到一个函数

	if isTools {
		allChannels = filterByTools(allChannels)
	}

	return selectChannel(allChannels, excludedMap, ignoreFirstPriority, i, model)
}

// 封装排序逻辑
func sortChannels(channels []*Channel) {
	sort.SliceStable(channels, func(i, j int) bool {
		if channels[i].GetPriority() == channels[j].GetPriority() {
			return channels[i].GetWeight() > channels[j].GetWeight()
		}
		return channels[i].GetPriority() > channels[j].GetPriority()
	})
}

// selectChannel 根据给定条件选择合适的频道
func selectChannel(channels []*Channel, excluded map[int]struct{}, ignoreFirstPriority bool, i int, model string) (*Channel, error) {
	if len(channels) == 0 {
		return nil, errors.New("频道列表为空")
	}

	currentPriority := channels[0].GetPriority()
	// 如果忽略第一优先级且i等于1，更新currentPriority为下一个优先级
	if ignoreFirstPriority && i == 1 {
		nextPriority, exists := getNextLowerPriority(channels, currentPriority)
		if !exists {
			return nil, errors.New("没有可用的更低优先级频道")
		}
		currentPriority = nextPriority
	}

	var priorityChannels []*Channel
	var totalWeight int

	for {
		if ignoreFirstPriority {
			priorityChannels, totalWeight = filterAndWeightChannels(channels, currentPriority, excluded)

		} else {
			for _, ch := range channels {
				if ch.GetPriority() == currentPriority {
					priorityChannels = append(priorityChannels, ch)
					totalWeight += ch.GetWeight()
				}

			}
		}

		if len(priorityChannels) == 0 {
			// 没有符合当前优先级的频道，尝试更低的优先级
			nextPriority, exists := getNextLowerPriority(channels, currentPriority)
			if !exists {
				break
			}
			currentPriority = nextPriority
			continue
		}

		selectedChannel, err := weightedRandomSelection(priorityChannels, totalWeight, model)
		if err == nil {
			return selectedChannel, nil
		}

		// 准备尝试下一个优先级
		nextPriority, exists := getNextLowerPriority(channels, currentPriority)
		if !exists {
			break
		}
		currentPriority = nextPriority
	}

	return nil, errors.New("没有可用的符合条件的频道")
}

// filterAndWeightChannels 过滤出同一优先级的频道，并计算总权重
func filterAndWeightChannels(channels []*Channel, priority int64, excluded map[int]struct{}) ([]*Channel, int) {
	var priorityChannels []*Channel
	totalWeight := 0
	for _, ch := range channels {
		if ch.GetPriority() == priority && !contains(excluded, ch.Id) {
			priorityChannels = append(priorityChannels, ch)
			totalWeight += ch.GetWeight()
		}
	}
	return priorityChannels, totalWeight
}

// weightedRandomSelection 根据权重随机选择一个频道
func weightedRandomSelection(channels []*Channel, totalWeight int, model string) (*Channel, error) {
	randomWeight := rand.Intn(totalWeight + 1)
	for _, channel := range channels {
		randomWeight -= channel.GetWeight()
		if randomWeight <= 0 {
			if channel.RateLimited != nil && *channel.RateLimited {
				_, ok := checkRateLimit(channel.Id, model)
				if !ok {
					log.Println("频道频率限制超出", channel.Id)
					continue
				}
			}
			updateRateLimitStatus(channel.Id, model)
			return channel, nil
		}
	}
	return nil, errors.New("在当前优先级未能选择有效的频道")
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

// getNextLowerPriority 查找比当前优先级低的下一个优先级
func getNextLowerPriority(channels []*Channel, currentPriority int64) (int64, bool) {
	var lowestFound int64 = -1
	found := false
	for _, ch := range channels {
		if ch.GetPriority() < currentPriority && (!found || ch.GetPriority() > lowestFound) {
			lowestFound = ch.GetPriority()
			found = true
		}
	}
	return lowestFound, found
}
