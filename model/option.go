package model

import (
	"one-api/common"
	"one-api/common/config"
	"strconv"
	"strings"
	"time"
)

type Option struct {
	Key   string `json:"key" gorm:"primaryKey"`
	Value string `json:"value"`
}

func AllOption() ([]*Option, error) {
	var options []*Option
	var err error
	err = DB.Find(&options).Error
	return options, err
}

func InitOptionMap() {
	config.OptionMapRWMutex.Lock()
	config.OptionMap = make(map[string]string)
	config.OptionMap["FileUploadPermission"] = strconv.Itoa(common.FileUploadPermission)
	config.OptionMap["FileDownloadPermission"] = strconv.Itoa(common.FileDownloadPermission)
	config.OptionMap["ImageUploadPermission"] = strconv.Itoa(common.ImageUploadPermission)
	config.OptionMap["ImageDownloadPermission"] = strconv.Itoa(common.ImageDownloadPermission)
	config.OptionMap["PasswordLoginEnabled"] = strconv.FormatBool(config.PasswordLoginEnabled)
	config.OptionMap["PasswordRegisterEnabled"] = strconv.FormatBool(config.PasswordRegisterEnabled)
	config.OptionMap["EmailVerificationEnabled"] = strconv.FormatBool(config.EmailVerificationEnabled)
	config.OptionMap["GitHubOAuthEnabled"] = strconv.FormatBool(config.GitHubOAuthEnabled)
	config.OptionMap["WeChatAuthEnabled"] = strconv.FormatBool(config.WeChatAuthEnabled)
	config.OptionMap["TurnstileCheckEnabled"] = strconv.FormatBool(config.TurnstileCheckEnabled)
	config.OptionMap["RegisterEnabled"] = strconv.FormatBool(config.RegisterEnabled)
	config.OptionMap["AutomaticDisableChannelEnabled"] = strconv.FormatBool(config.AutomaticDisableChannelEnabled)
	config.OptionMap["LogConsumeEnabled"] = strconv.FormatBool(config.LogConsumeEnabled)
	config.OptionMap["DisplayInCurrencyEnabled"] = strconv.FormatBool(config.DisplayInCurrencyEnabled)
	config.OptionMap["DisplayTokenStatEnabled"] = strconv.FormatBool(config.DisplayTokenStatEnabled)
	config.OptionMap["DrawingEnabled"] = strconv.FormatBool(config.DrawingEnabled)
	config.OptionMap["TopupRatioEnabled"] = strconv.FormatBool(config.TopupRatioEnabled)
	config.OptionMap["TopupAmountEnabled"] = strconv.FormatBool(config.TopupAmountEnabled)
	config.OptionMap["DataExportEnabled"] = strconv.FormatBool(config.DataExportEnabled)
	config.OptionMap["BlankReplyRetryEnabled"] = strconv.FormatBool(config.BlankReplyRetryEnabled)
	config.OptionMap["ChannelDisableThreshold"] = strconv.FormatFloat(config.ChannelDisableThreshold, 'f', -1, 64)
	config.OptionMap["EmailDomainRestrictionEnabled"] = strconv.FormatBool(config.EmailDomainRestrictionEnabled)
	config.OptionMap["EmailDomainWhitelist"] = strings.Join(config.EmailDomainWhitelist, ",")
	config.OptionMap["SMTPServer"] = ""
	config.OptionMap["SMTPFrom"] = ""
	config.OptionMap["SMTPPort"] = strconv.Itoa(config.SMTPPort)
	config.OptionMap["SMTPAccount"] = ""
	config.OptionMap["SMTPToken"] = ""
	config.OptionMap["Notice"] = ""
	config.OptionMap["About"] = ""
	config.OptionMap["Faqs"] = ""
	config.OptionMap["GroupModelLimits"] = ""
	config.OptionMap["Models"] = ""
	config.OptionMap["PerUseData"] = ""
	config.OptionMap["PricingData"] = ""
	config.OptionMap["HomePageContent"] = ""
	config.OptionMap["Footer"] = config.Footer
	config.OptionMap["SystemName"] = config.SystemName
	config.OptionMap["SystemText "] = config.SystemText
	config.OptionMap["Logo"] = config.Logo
	config.OptionMap["ServerAddress"] = ""
	config.OptionMap["PayAddress"] = ""
	config.OptionMap["EpayId"] = ""
	config.OptionMap["EpayKey"] = ""
	config.OptionMap["Price"] = strconv.FormatFloat(config.Price, 'f', -1, 64)
	config.OptionMap["TopupGroupRatio"] = common.TopupGroupRatio2JSONString()
	config.OptionMap["TopupRatio"] = common.TopupRatioJSONString()
	config.OptionMap["TopupAmount"] = common.TopupAmountJSONString()
	config.OptionMap["GroupUserRatio"] = common.GroupUserRatioJSONString()
	config.OptionMap["UserGroupEnabled"] = strconv.FormatBool(config.UserGroupEnabled)
	config.OptionMap["GitHubClientId"] = ""
	config.OptionMap["GitHubClientSecret"] = ""
	config.OptionMap["WeChatServerAddress"] = ""
	config.OptionMap["WeChatServerToken"] = ""
	config.OptionMap["WeChatAccountQRCodeImageURL"] = ""
	config.OptionMap["TurnstileSiteKey"] = ""
	config.OptionMap["TurnstileSecretKey"] = ""
	config.OptionMap["QuotaForNewUser"] = strconv.Itoa(config.QuotaForNewUser)
	config.OptionMap["QuotaForInviter"] = strconv.Itoa(config.QuotaForInviter)
	config.OptionMap["QuotaForInvitee"] = strconv.Itoa(config.QuotaForInvitee)
	config.OptionMap["QuotaRemindThreshold"] = strconv.Itoa(config.QuotaRemindThreshold)
	config.OptionMap["PreConsumedQuota"] = strconv.Itoa(config.PreConsumedQuota)
	config.OptionMap["ModelRatio"] = common.ModelRatioJSONString()
	config.OptionMap["ModelPrice"] = common.ModelRatio2JSONString()
	config.OptionMap["GroupRatio"] = common.GroupRatio2JSONString()
	config.OptionMap["CompletionRatio"] = common.CompletionRatio2JSONString()
	config.OptionMap["TopUpLink"] = config.TopUpLink
	config.OptionMap["ChatLink"] = config.ChatLink
	config.OptionMap["QuotaPerUnit"] = strconv.FormatFloat(config.QuotaPerUnit, 'f', -1, 64)
	config.OptionMap["RetryTimes"] = strconv.Itoa(config.RetryTimes)
	config.OptionMap["AppToken"] = ""
	config.OptionMap["Uids"] = ""
	config.OptionMap["NotificationEmail"] = ""
	config.OptionMap["WxPusherNotificationsEnabled"] = strconv.FormatBool(config.WxPusherNotificationsEnabled)
	config.OptionMap["EmailNotificationsEnabled"] = strconv.FormatBool(config.EmailNotificationsEnabled)
	config.OptionMap["BillingByRequestEnabled"] = strconv.FormatBool(config.BillingByRequestEnabled)
	config.OptionMap["GroupModelEnabled"] = strconv.FormatBool(config.GroupModelEnabled)
	config.OptionMap["GroupModelLimitsEnabled"] = strconv.FormatBool(config.GroupModelLimitsEnabled)
	config.OptionMap["ModelRatioEnabled"] = strconv.FormatBool(config.ModelRatioEnabled)
	config.OptionMap["YzfZfb"] = strconv.FormatBool(config.Zfb)
	config.OptionMap["YzfWx"] = strconv.FormatBool(config.Wx)
	config.OptionMap["GroupEnable"] = strconv.FormatBool(config.GroupEnable)
	config.OptionMap["LogContentEnabled"] = strconv.FormatBool(config.LogContentEnabled)
	config.OptionMap["DataExportInterval"] = strconv.Itoa(config.DataExportInterval)
	config.OptionMap["UserGroup"] = config.UserGroup
	config.OptionMap["VipUserGroup"] = config.VipUserGroup
	config.OptionMap["MiniQuota"] = strconv.FormatFloat(config.MiniQuota, 'f', -1, 64)
	config.OptionMap["ProporTions"] = strconv.Itoa(config.ProporTions)
	config.OptionMap["RedempTionCount"] = strconv.Itoa(config.RedempTionCount)
	config.OptionMap["OutProxyUrl"] = ""
	config.OptionMapRWMutex.Unlock()
	loadOptionsFromDatabase()
}

func loadOptionsFromDatabase() {
	options, _ := AllOption()
	for _, option := range options {
		err := updateOptionMap(option.Key, option.Value)
		if err != nil {
			common.SysError("failed to update option map: " + err.Error())
		}
	}
}

func SyncOptions(frequency int) {
	ticker := time.NewTicker(time.Duration(frequency) * time.Second)
	defer ticker.Stop()

	for {
		<-ticker.C // 等待下一个tick
		common.SysLog("syncing options from database")
		loadOptionsFromDatabase()
	}
}

func UpdateOption(key string, value string) error {
	// Save to database first
	option := Option{
		Key: key,
	}
	// https://gorm.io/docs/update.html#Save-All-Fields
	DB.FirstOrCreate(&option, Option{Key: key})
	option.Value = value
	// Save is a combination function.
	// If save value does not contain primary key, it will execute Create,
	// otherwise it will execute Update (with all fields).
	DB.Save(&option)
	// Update OptionMap
	return updateOptionMap(key, value)
}

func updateOptionMap(key string, value string) (err error) {
	config.OptionMapRWMutex.Lock()
	defer config.OptionMapRWMutex.Unlock()
	config.OptionMap[key] = value
	if strings.HasSuffix(key, "Permission") {
		intValue, _ := strconv.Atoi(value)
		switch key {
		case "FileUploadPermission":
			common.FileUploadPermission = intValue
		case "FileDownloadPermission":
			common.FileDownloadPermission = intValue
		case "ImageUploadPermission":
			common.ImageUploadPermission = intValue
		case "ImageDownloadPermission":
			common.ImageDownloadPermission = intValue
		}
	}
	if strings.HasSuffix(key, "Enabled") {
		boolValue := value == "true"
		switch key {
		case "PasswordRegisterEnabled":
			config.PasswordRegisterEnabled = boolValue
		case "PasswordLoginEnabled":
			config.PasswordLoginEnabled = boolValue
		case "EmailVerificationEnabled":
			config.EmailVerificationEnabled = boolValue
		case "GitHubOAuthEnabled":
			config.GitHubOAuthEnabled = boolValue
		case "WeChatAuthEnabled":
			config.WeChatAuthEnabled = boolValue
		case "TurnstileCheckEnabled":
			config.TurnstileCheckEnabled = boolValue
		case "RegisterEnabled":
			config.RegisterEnabled = boolValue
		case "EmailDomainRestrictionEnabled":
			config.EmailDomainRestrictionEnabled = boolValue
		case "AutomaticDisableChannelEnabled":
			config.AutomaticDisableChannelEnabled = boolValue
		case "LogConsumeEnabled":
			config.LogConsumeEnabled = boolValue
		case "DisplayInCurrencyEnabled":
			config.DisplayInCurrencyEnabled = boolValue
		case "WxPusherNotificationsEnabled":
			config.WxPusherNotificationsEnabled = boolValue
		case "EmailNotificationsEnabled":
			config.EmailNotificationsEnabled = boolValue
		case "BillingByRequestEnabled":
			config.BillingByRequestEnabled = boolValue
		case "GroupModelEnabled":
			config.GroupModelEnabled = boolValue
		case "GroupModelLimitsEnabled":
			config.GroupModelLimitsEnabled = boolValue
		case "ModelRatioEnabled":
			config.ModelRatioEnabled = boolValue
		case "YzfZfb":
			config.Zfb = boolValue
		case "YzfWx":
			config.Wx = boolValue
		case "GroupEnable":
			config.GroupEnable = boolValue
		case "LogContentEnabled":
			config.LogContentEnabled = boolValue
		case "DisplayTokenStatEnabled":
			config.DisplayTokenStatEnabled = boolValue
		case "DrawingEnabled":
			config.DrawingEnabled = boolValue
		case "DataExportEnabled":
			config.DataExportEnabled = boolValue
		case "TopupRatioEnabled":
			config.TopupRatioEnabled = boolValue
		case "TopupAmountEnabled":
			config.TopupAmountEnabled = boolValue
		case "BlankReplyRetryEnabled":
			config.BlankReplyRetryEnabled = boolValue
		case "UserGroupEnabled":
			config.UserGroupEnabled = boolValue

		}
	}
	switch key {
	case "EmailDomainWhitelist":
		config.EmailDomainWhitelist = strings.Split(value, ",")
	case "SMTPServer":
		config.SMTPServer = value
	case "SMTPPort":
		intValue, _ := strconv.Atoi(value)
		config.SMTPPort = intValue
	case "SMTPAccount":
		config.SMTPAccount = value
	case "SMTPFrom":
		config.SMTPFrom = value
	case "SMTPToken":
		config.SMTPToken = value
	case "ServerAddress":
		config.ServerAddress = value
	case "PayAddress":
		config.PayAddress = value
	case "EpayId":
		config.EpayId = value
	case "EpayKey":
		config.EpayKey = value
	case "Price":
		config.Price, _ = strconv.ParseFloat(value, 64)
	case "MiniQuota":
		config.MiniQuota, _ = strconv.ParseFloat(value, 64)
	case "TopupGroupRatio":
		err = common.UpdateTopupGroupRatioByJSONString(value)
	case "TopupRatio":
		err = common.UpdateTopupRatioByJSONString(value)
	case "TopupAmount":
		err = common.UpdateAmountRatioByJSONString(value)
	case "GitHubClientId":
		config.GitHubClientId = value
	case "GitHubClientSecret":
		config.GitHubClientSecret = value
	case "Footer":
		config.Footer = value
	case "SystemName":
		config.SystemName = value
	case "SystemText":
		config.SystemText = value
	case "Logo":
		config.Logo = value
	case "WeChatServerAddress":
		config.WeChatServerAddress = value
	case "WeChatServerToken":
		config.WeChatServerToken = value
	case "WeChatAccountQRCodeImageURL":
		config.WeChatAccountQRCodeImageURL = value
	case "TurnstileSiteKey":
		config.TurnstileSiteKey = value
	case "TurnstileSecretKey":
		config.TurnstileSecretKey = value
	case "QuotaForNewUser":
		config.QuotaForNewUser, _ = strconv.Atoi(value)
	case "QuotaForInviter":
		config.QuotaForInviter, _ = strconv.Atoi(value)
	case "QuotaForInvitee":
		config.QuotaForInvitee, _ = strconv.Atoi(value)
	case "QuotaRemindThreshold":
		config.QuotaRemindThreshold, _ = strconv.Atoi(value)
	case "PreConsumedQuota":
		config.PreConsumedQuota, _ = strconv.Atoi(value)
	case "RetryTimes":
		config.RetryTimes, _ = strconv.Atoi(value)
	case "DataExportInterval":
		config.DataExportInterval, _ = strconv.Atoi(value)
	case "ProporTions":
		config.ProporTions, _ = strconv.Atoi(value)
	case "RedempTionCount":
		config.RedempTionCount, _ = strconv.Atoi(value)
	case "ModelRatio":
		err = common.UpdateModelRatioByJSONString(value)
	case "ModelPrice":
		err = common.UpdateModelRatio2ByJSONString(value)
	case "GroupRatio":
		err = common.UpdateGroupRatioByJSONString(value)
	case "CompletionRatio":
		err = common.UpdateCompletionRatioByJSONString(value)
	case "GroupUserRatio":
		err = common.UpdateGroupUserRatioByJSONString(value)
	case "TopUpLink":
		config.TopUpLink = value
	case "ChatLink":
		config.ChatLink = value
	case "ChannelDisableThreshold":
		config.ChannelDisableThreshold, _ = strconv.ParseFloat(value, 64)
	case "QuotaPerUnit":
		config.QuotaPerUnit, _ = strconv.ParseFloat(value, 64)
	case "AppToken":
		config.AppToken = value
	case "Uids":
		config.Uids = value
	case "UserGroup":
		config.UserGroup = value
	case "VipUserGroup":
		config.VipUserGroup = value
	case "OutProxyUrl":
		config.OutProxyUrl = value
	}

	return err
}

// GetOptionFromMap retrieves an option value from the shared OptionMap based on its key.
func GetOptionFromMap(key string) (string, bool) {
	config.OptionMapRWMutex.RLock()
	defer config.OptionMapRWMutex.RUnlock()
	value, exists := config.OptionMap[key]
	return value, exists
}
