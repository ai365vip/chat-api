package common

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
)

var RDB *redis.Client
var RedisEnabled = true

// InitRedisClient This function is called after init()
func InitRedisClient() (err error) {
	if os.Getenv("REDIS_CONN_STRING") == "" {
		RedisEnabled = false
		SysLog("REDIS_CONN_STRING not set, Redis is not enabled")
		return nil
	}
	if os.Getenv("SYNC_FREQUENCY") == "" {
		RedisEnabled = false
		SysLog("SYNC_FREQUENCY not set, Redis is disabled")
		return nil
	}
	SysLog("Redis is enabled")
	opt, err := redis.ParseURL(os.Getenv("REDIS_CONN_STRING"))
	if err != nil {
		FatalLog("failed to parse Redis connection string: " + err.Error())
	}
	RDB = redis.NewClient(opt)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = RDB.Ping(ctx).Result()
	if err != nil {
		FatalLog("Redis ping test failed: " + err.Error())
	}
	return err
}

func ParseRedisOption() *redis.Options {
	opt, err := redis.ParseURL(os.Getenv("REDIS_CONN_STRING"))
	if err != nil {
		FatalLog("failed to parse Redis connection string: " + err.Error())
	}
	return opt
}

func RedisSet(key string, value string, expiration time.Duration) error {
	ctx := context.Background()
	return RDB.Set(ctx, key, value, expiration).Err()
}

func RedisGet(key string) (string, error) {
	ctx := context.Background()
	return RDB.Get(ctx, key).Result()
}

func RedisDel(key string) error {
	ctx := context.Background()
	return RDB.Del(ctx, key).Err()
}

func RedisDecrease(key string, value int64) error {
	ctx := context.Background()
	// 修改 Lua 脚本，使其返回简单的整数值
	script := `
        local current = redis.call('GET', KEYS[1])
        if not current then
            return -1  -- 键不存在
        end
        
        redis.call('DECRBY', KEYS[1], ARGV[1])
        
        local ttl = redis.call('TTL', KEYS[1])
        if ttl > 0 then
            redis.call('EXPIRE', KEYS[1], ttl)
        end
        
        return 0  -- 操作成功
    `
	result, err := RDB.Eval(ctx, script, []string{key}, value).Result()
	if err != nil {
		return err
	}
	// 检查返回值类型
	switch v := result.(type) {
	case int64:
		if v == -1 {
			return fmt.Errorf("key does not exist")
		}
		return nil
	default:
		return fmt.Errorf("unexpected result type: %T", result)
	}
}
