package model

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"one-api/common"
	"one-api/common/config"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
)

var (
	TokenCacheSeconds         = common.SyncFrequency
	UserId2GroupCacheSeconds  = common.SyncFrequency
	UserId2QuotaCacheSeconds  = common.SyncFrequency
	UserId2StatusCacheSeconds = common.SyncFrequency
	GroupModelsCacheSeconds   = common.SyncFrequency
)

func init() {
	rand.Seed(time.Now().UnixNano())
}
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
	if quota <= config.PreConsumedQuota { // when user's quota is less than pre-consumed quota, we need to fetch from db
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

func CacheDecreaseUserQuota(ctx context.Context, id int, quota int) error {
	if !common.RedisEnabled {
		return nil
	}

	key := fmt.Sprintf("user_quota:%d", id)

	for i := 0; i < 2; i++ { // 最多尝试两次
		err := common.RedisDecrease(key, int64(quota))
		if err == nil {
			return nil // 操作成功
		}

		if err.Error() == "Key does not exist" { // 匹配具体的错误信息
			// 如果键不存在，从数据库获取并更新缓存
			_, fetchErr := fetchAndUpdateUserQuota(ctx, id)
			if fetchErr != nil {
				return fmt.Errorf("failed to fetch user quota: %w", fetchErr)
			}
			continue // 继续下一次尝试
		}

		// 其他错误（如配额不足）直接返回
		return err
	}

	return fmt.Errorf("failed to decrease quota after retry")
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

func filterByTools(channels []*Channel, claudeoriginalrequest bool) []*Channel {
	var filteredChannels []*Channel
	for _, ch := range channels {
		if (ch.IsTools != nil && *ch.IsTools) || (claudeoriginalrequest && *ch.ClaudeOriginalRequest) {
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
func CacheGetRandomSatisfiedChannel(group string, model string, ignoreFirstPriority bool, isTools bool, claudeoriginalrequest bool, excludedChannelIds []int, i int) (*Channel, error) {
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
		return GetRandomSatisfiedChannel(group, model, excludedMap, ignoreFirstPriority, isTools, claudeoriginalrequest, i)
	}

	// 使用更细粒度的锁
	channelSyncLock.RLock()
	allChannels := group2model2channels[group][model]
	channelSyncLock.RUnlock()

	if len(allChannels) == 0 {
		return nil, errors.New("no channels found for group and model")
	}

	sortChannels(allChannels) // 封装排序逻辑到一个函数

	if isTools || claudeoriginalrequest {
		allChannels = filterByTools(allChannels, claudeoriginalrequest)
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

	currentPriority, err := resolveInitialPriority(channels, ignoreFirstPriority, i)
	if err != nil {
		return nil, err
	}

	for {
		filteredChannels, totalWeight := filterAndWeightChannels(channels, currentPriority, excluded)
		if len(filteredChannels) == 0 {
			if nextPriority, exists := getNextLowerPriority(channels, currentPriority); exists {
				currentPriority = nextPriority
				continue
			}
			return nil, errors.New("没有可用的更低优先级频道")
		}

		if selectedChannel, err := trySelectChannel(filteredChannels, totalWeight, model); err == nil {
			return selectedChannel, nil
		}

		if nextPriority, exists := getNextLowerPriority(channels, currentPriority); exists {
			currentPriority = nextPriority
		} else {
			break
		}
	}

	return nil, errors.New("没有可用的符合条件的频道")
}

func resolveInitialPriority(channels []*Channel, ignoreFirstPriority bool, i int) (int64, error) {
	if ignoreFirstPriority && i == 1 {
		if nextPriority, exists := getNextLowerPriority(channels, channels[0].GetPriority()); exists {
			return nextPriority, nil
		}
		return 0, errors.New("没有可用的更低优先级频道")
	}
	return channels[0].GetPriority(), nil
}

func trySelectChannel(channels []*Channel, totalWeight int, model string) (*Channel, error) {
	return weightedRandomSelection(channels, totalWeight, model)
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

func randomSelection(channels []*Channel, model string) (*Channel, error) {
	filteredChannels := make([]*Channel, 0)
	for _, channel := range channels {
		if channel.RateLimited == nil || (channel.RateLimited != nil && !*channel.RateLimited) {
			filteredChannels = append(filteredChannels, channel)
		}
	}
	if len(filteredChannels) == 0 {
		return nil, errors.New("没有未受限的频道可用")
	}
	selected := filteredChannels[rand.Intn(len(filteredChannels))]
	updateRateLimitStatus(selected.Id, model)
	return selected, nil
}

// weightedRandomSelection 根据权重随机选择一个频道
func weightedRandomSelection(channels []*Channel, totalWeight int, model string) (*Channel, error) {
	if totalWeight == 0 {
		// 所有权重都是0，随机选择一个频道
		return randomSelection(channels, model)
	}

	// 创建一个新的切片，只包含未被频率限制的通道
	validChannels := make([]*Channel, 0, len(channels))
	validTotalWeight := 0

	for _, channel := range channels {
		if !isRedisLimited(*channel, channel.Id, model) {
			validChannels = append(validChannels, channel)
			validTotalWeight += channel.GetWeight()
		}
	}

	if len(validChannels) == 0 {
		return nil, errors.New("所有通道都被频率限制")
	}

	// 使用有效通道的总权重进行随机选择
	randomWeight := rand.Intn(validTotalWeight)
	for _, channel := range validChannels {
		randomWeight -= channel.GetWeight()
		if randomWeight < 0 {
			return channel, nil
		}
	}

	// 这种情况理论上不应该发生
	return nil, errors.New("在当前优先级未能选择有效的通道")
}
func isRedisLimited(channel Channel, channelId int, model string) bool {
	if channel.RateLimited != nil && *channel.RateLimited && channel.RateLimitCount != nil && *channel.RateLimitCount > 0 {
		if !checkRedisLimit(channel, channelId, model) {
			return true
		}
	}
	return false
}

func checkRedisLimit(channel Channel, channelId int, model string) bool {
	key := fmt.Sprintf("rate_limit:%d:%s", channelId, model)

	countStr, err := common.RedisGet(key)
	if err == redis.Nil {
		// Key doesn't exist, set it with expiration
		err = common.RedisSet(key, "1", time.Minute)
		if err != nil {
			log.Printf("Error setting rate limit: %v", err)
			return false
		}
		return true
	} else if err != nil {
		log.Printf("Error checking rate limit: %v", err)
		return false
	}

	count, err := strconv.ParseInt(countStr, 10, 64)
	if err != nil {
		log.Printf("Error parsing rate limit count: %v", err)
		return false
	}

	if count >= int64(*channel.RateLimitCount) {
		return false // 已达到或超过限制
	}

	// 增加计数
	newCount := strconv.FormatInt(count+1, 10)
	err = common.RedisSet(key, newCount, time.Minute) // 增加计数并重置过期时间
	if err != nil {
		log.Printf("Error incrementing rate limit: %v", err)
		return false
	}

	return true
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
func CacheGetGroupModels(ctx context.Context, group string) ([]string, error) {
	if !common.RedisEnabled {
		return GetGroupModels(group)
	}
	modelsStr, err := common.RedisGet(fmt.Sprintf("group_models:%s", group))
	if err == nil {
		return strings.Split(modelsStr, ","), nil
	}
	models, err := GetGroupModels(group)
	if err != nil {
		return nil, err
	}
	err = common.RedisSet(fmt.Sprintf("group_models:%s", group), strings.Join(models, ","), time.Duration(GroupModelsCacheSeconds)*time.Second)
	if err != nil {
		common.SysError("Redis set group models error: " + err.Error())
	}
	return models, nil
}
