package model

type MJ struct {
	Id          int    `json:"id"`
	MjId        string `json:"mj_id" gorm:"index"`
	Prompt      string `json:"prompt"`
	PromptEn    string `json:"prompt_en"`
	Description string `json:"description"`
	State       string `json:"state"`
	SubmitTime  int64  `json:"submit_time"`
	StartTime   int64  `json:"start_time"`
	FinishTime  int64  `json:"finish_time"`
	ImageUrl    string `json:"image_url"`
	Status      string `json:"status"`
	Progress    string `json:"progress"`
	FailReason  string `json:"fail_reason"`
}

func (MJ) TableName() string {
	return "mj"
}

type Midjourney struct {
	Id          int    `json:"id"`
	Code        int    `json:"code"`
	UserId      int    `json:"user_id" gorm:"index"`
	Action      string `json:"action"`
	MjId        string `json:"mj_id" gorm:"index"`
	Prompt      string `json:"prompt"`
	PromptEn    string `json:"prompt_en"`
	Description string `json:"description"`
	State       string `json:"state"`
	SubmitTime  int64  `json:"submit_time"`
	StartTime   int64  `json:"start_time"`
	FinishTime  int64  `json:"finish_time"`
	ImageUrl    string `json:"image_url"`
	Status      string `json:"status"`
	Progress    string `json:"progress"`
	FailReason  string `json:"fail_reason"`
	ChannelId   int    `json:"channel_id"`
}

func GetAllUserTask(userId int, startIdx int, num int) []*Midjourney {
	var tasks []*Midjourney
	var err error
	err = DB.Where("user_id = ?", userId).Order("id desc").Limit(num).Offset(startIdx).Find(&tasks).Error
	if err != nil {
		return nil
	}
	for _, task := range tasks {
		task.ImageUrl = task.ImageUrl
	}
	return tasks
}

func GetAllTasks(startIdx int, num int) []*Midjourney {
	var tasks []*Midjourney
	var err error
	err = DB.Order("id desc").Limit(num).Offset(startIdx).Find(&tasks).Error
	if err != nil {
		return nil
	}
	for _, task := range tasks {
		task.ImageUrl = task.ImageUrl
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

func GetByMJId(mjId string) *Midjourney {
	var mj *Midjourney
	var err error
	err = DB.Where("mj_id = ?", mjId).First(&mj).Error
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
func (mj *MJ) Insert() error {
	return DB.Create(mj).Error
}
func GetMJAndChannelData(MjId string, channelId int) (*MJ, *Midjourney, error) {
	var mj MJ
	var midjourneys Midjourney

	err := DB.Table("mj").Select("mj.mj_id, mj.progress, mj.prompt_en, mj.state, mj.submit_time, mj.start_time, mj.finish_time, mj.image_url, mj.status, mj.fail_reason, midjourneys.channel_id as channel_id").Joins("left join midjourneys on mj.mj_id = midjourneys.mj_id ").Where("mj.mj_id = ? AND midjourneys.channel_id = ?", MjId, channelId).First(&mj, &midjourneys).Error

	if err != nil {
		return nil, nil, err
	}

	return &mj, &midjourneys, nil
}
