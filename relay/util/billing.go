package util

import (
	"context"
	"one-api/common"
	"one-api/model"
)

func ReturnPreConsumedQuota(ctx context.Context, preConsumedQuota int, tokenId int) {
	if preConsumedQuota != 0 {
		go func(ctx context.Context) {
			// return pre-consumed quota
			err := model.PostConsumeTokenQuota(tokenId, -preConsumedQuota, 0, 0, false)
			if err != nil {
				common.LogError(ctx, "error return pre-consumed quota: "+err.Error())
			}
		}(ctx)
	}
}
