package model

import (
	"encoding/json"
)

type Midjourney struct {
	Id                int             `json:"id"`
	Code              int             `json:"code"`
	UserId            int             `json:"user_id" gorm:"index"`
	Action            string          `json:"action" gorm:"type:varchar(40);index`
	MjId              string          `json:"mj_id" gorm:"index"`
	Prompt            string          `json:"prompt"`
	PromptEn          string          `json:"prompt_en"`
	Description       string          `json:"description"`
	State             string          `json:"state"`
	Mode              string          `json:"mode"`
	SubmitTime        int64           `json:"submit_time"`
	StartTime         int64           `json:"start_time"`
	FinishTime        int64           `json:"finish_time"`
	ImageUrl          string          `json:"image_url"`
	Status            string          `json:"status" gorm:"type:varchar(20);index`
	Progress          string          `json:"progress" gorm:"type:varchar(30);index`
	FailReason        string          `json:"fail_reason"`
	Buttons           json.RawMessage `json:"buttons"`
	Properties        json.RawMessage `json:"properties"`
	ImageSeed         json.RawMessage `json:"image_seed"`
	ChannelId         int             `json:"channel_id"`
	IsImageURLEnabled *int            `json:"is_image_url_enabled"`
}

type MjImageSeed struct {
	Id        int             `json:"id"`
	UserId    int             `json:"user_id" gorm:"index"`
	MjId      string          `json:"mj_id" gorm:"index"`
	ImageSeed json.RawMessage `json:"image_seed"`
}

// TaskQueryParams 用于包含所有搜索条件的结构体，可以根据需求添加更多字段
type TaskQueryParams struct {
	ChannelID      string
	MjID           string
	StartTimestamp string
	EndTimestamp   string
}

func GetAllUserTask(userId int, startIdx int, num int, queryParams TaskQueryParams) []*Midjourney {
	var tasks []*Midjourney
	var err error

	// 初始化查询构建器
	query := DB.Where("user_id = ?", userId)

	if queryParams.MjID != "" {
		query = query.Where("mj_id = ?", queryParams.MjID)
	}
	if queryParams.StartTimestamp != "" {
		// 假设您已将前端传来的时间戳转换为数据库所需的时间格式，并处理了时间戳的验证和解析
		query = query.Where("submit_time >= ?", queryParams.StartTimestamp)
	}
	if queryParams.EndTimestamp != "" {
		query = query.Where("submit_time <= ?", queryParams.EndTimestamp)
	}

	// 获取数据
	err = query.Order("id desc").Limit(num).Offset(startIdx).Find(&tasks).Error
	if err != nil {
		return nil
	}

	return tasks
}

func GetAllTasks(startIdx int, num int, queryParams TaskQueryParams) []*Midjourney {
	var tasks []*Midjourney
	var err error

	// 初始化查询构建器
	query := DB

	// 添加过滤条件
	if queryParams.ChannelID != "" {
		query = query.Where("channel_id = ?", queryParams.ChannelID)
	}
	if queryParams.MjID != "" {
		query = query.Where("mj_id = ?", queryParams.MjID)
	}
	if queryParams.StartTimestamp != "" {
		query = query.Where("submit_time >= ?", queryParams.StartTimestamp)
	}
	if queryParams.EndTimestamp != "" {
		query = query.Where("submit_time <= ?", queryParams.EndTimestamp)
	}

	// 获取数据
	err = query.Order("id desc").Limit(num).Offset(startIdx).Find(&tasks).Error
	if err != nil {
		return nil
	}

	return tasks
}

func GetAllUnFinishTasks() []*Midjourney {
	var tasks []*Midjourney
	var err error
	// get all tasks progress is not 100%
	err = DB.Where("progress != ?", "100%").Find(&tasks).Error
	if err != nil {
		return nil
	}
	return tasks
}

func GetByOnlyMJId(mjId string) (*Midjourney, error) {
	var mj *Midjourney
	err := DB.Where("mj_id = ?", mjId).First(&mj).Error
	if err != nil {
		// 如果你想在这里处理特定的错误，比如记录未找到的情况
		// 可以使用 errors.Is(err, gorm.ErrRecordNotFound) 来判断
		return nil, err
	}
	return mj, nil
}

func GetByOnlyMJIdMode(mjId string) (string, error) {
	var mode string
	err := DB.Model(&Midjourney{}).Where("mj_id = ?", mjId).Select("mode").First(&mode).Error
	if err != nil {
		return "", err // 如果出错，则返回空字符串和错误信息
	}
	return mode, nil // 如果找到匹配的记录，则返回Mode字段的值和nil表示没有错误
}

func GetByMJId(userId int, mjId string) *Midjourney {
	var mj *Midjourney
	var err error
	err = DB.Where("user_id = ? and mj_id = ?", userId, mjId).First(&mj).Error
	if err != nil {
		return nil
	}
	return mj
}

func GetByMJIds(userId int, mjIds []string) []*Midjourney {
	var mj []*Midjourney
	var err error
	err = DB.Where("user_id = ? and mj_id in (?)", userId, mjIds).Find(&mj).Error
	if err != nil {
		return nil
	}
	return mj
}

func GetMjByuId(id int) *Midjourney {
	var mj *Midjourney
	var err error
	err = DB.Where("id = ?", id).First(&mj).Error
	if err != nil {
		return nil
	}
	return mj
}

func UpdateProgress(id int, progress string) error {
	return DB.Model(&Midjourney{}).Where("id = ?", id).Update("progress", progress).Error
}

func (midjourney *Midjourney) Insert() error {
	var err error
	err = DB.Create(midjourney).Error
	return err
}

func (midjourney *Midjourney) Update() error {
	var err error
	err = DB.Save(midjourney).Error
	return err
}
func MjBulkUpdate(taskIDs []string, params map[string]any) error {
	return DB.Model(&Midjourney{}).
		Where("mj_id in (?)", taskIDs).
		Updates(params).Error
}
func (mj *Midjourney) InsertImageSeed() error {
	mjImageSeed := MjImageSeed{
		MjId:      mj.MjId,
		UserId:    mj.UserId,
		ImageSeed: mj.ImageSeed,
	}

	// 使用GORM插入到数据库
	err := DB.Create(&mjImageSeed).Error
	if err != nil {
		return err
	}

	return nil
}

func GetImageSeed(userId int, mjId string) *MjImageSeed {
	var mj *MjImageSeed
	var err error
	err = DB.Where("user_id = ? and mj_id = ?", userId, mjId).First(&mj).Error
	if err != nil {
		return nil
	}
	return mj
}
