package epay

import (
	"crypto/md5"
	"fmt"
	"sort"
	"strings"

	"github.com/samber/lo"
)

// ParamsFilter 过滤参数，生成签名时需删除 “sign” 和 “sign_type” 参数
func ParamsFilter(params map[string]string) map[string]string {
	return lo.PickBy[string, string](params, func(key string, value string) bool {
		return !(key == "sign" || key == "sign_type" || value == "")
	})
}

// ParamsSort 对参数进行排序，返回排序后的 keys 和 values （go 中 map 为乱序）
func ParamsSort(params map[string]string) ([]string, []string) {
	keys := lo.Keys(params)
	sort.Strings(keys)

	values := lo.Map(keys, func(key string, i int) string {
		return params[key]
	})

	return keys, values
}

// CreateUrlString 生成待签名字符串, ["a", "b", "c"], ["d", "e", "f"] => "a=d&b=e&c=f"
func CreateUrlString(keys []string, values []string) string {
	urlString := ""
	for i, key := range keys {
		urlString += key + "=" + values[i] + "&"
	}
	// trim 掉最后的 &
	return strings.TrimSuffix(urlString, "&")
}

// MD5String 生成 加盐(商户 key) MD5 字符串
func MD5String(urlString string, key string) string {
	digest := md5.Sum([]byte(urlString + key))
	return fmt.Sprintf("%x", digest)
}

// GenerateParams 生成加签参数
func GenerateParams(params map[string]string, key string) map[string]string {
	filtered := ParamsFilter(params)
	keys, values := ParamsSort(filtered)
	sign := MD5String(CreateUrlString(keys, values), key)
	params["sign"] = sign
	params["sign_type"] = "MD5"
	return params
}
