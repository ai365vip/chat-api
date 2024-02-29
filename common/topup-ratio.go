package common

import (
	"encoding/json"
)

var TopupGroupRatio = map[string]float64{
	"default": 1,
	"vip":     1,
	"svip":    1,
}
var TopupRatio = map[string]float64{
	"30":  7.3,
	"90":  7.3,
	"365": 7.3,
	"-1":  7.3,
}

var TopupAmount = map[string]float64{}

func TopupGroupRatio2JSONString() string {
	jsonBytes, err := json.Marshal(TopupGroupRatio)
	if err != nil {
		SysError("error marshalling model ratio: " + err.Error())
	}
	return string(jsonBytes)
}

func UpdateTopupGroupRatioByJSONString(jsonStr string) error {
	TopupGroupRatio = make(map[string]float64)
	return json.Unmarshal([]byte(jsonStr), &TopupGroupRatio)
}

func GetTopupGroupRatio(name string) float64 {
	ratio, ok := TopupGroupRatio[name]
	if !ok {
		SysError("topup group ratio not found: " + name)
		return 1
	}
	return ratio
}

func TopupRatioJSONString() string {
	jsonBytes, err := json.Marshal(TopupRatio)
	if err != nil {
		SysError("error marshalling model ratio: " + err.Error())
	}
	return string(jsonBytes)
}

func UpdateTopupRatioByJSONString(jsonStr string) error {
	TopupRatio = make(map[string]float64)
	return json.Unmarshal([]byte(jsonStr), &TopupRatio)
}

func GetTopupRatio(name string) float64 {
	topupratio, ok := TopupRatio[name]
	if !ok {
		SysError("topup group ratio not found: " + name)
		return 7.3
	}
	return topupratio
}

func TopupAmountJSONString() string {
	jsonBytes, err := json.Marshal(TopupAmount)
	if err != nil {
		SysError("error marshalling model ratio: " + err.Error())
	}
	return string(jsonBytes)
}

func UpdateAmountRatioByJSONString(jsonStr string) error {
	TopupAmount = make(map[string]float64)
	return json.Unmarshal([]byte(jsonStr), &TopupAmount)
}

func GetTopupAmount(name string) float64 {
	topupamount, ok := TopupAmount[name]
	if !ok {
		SysError("topup group ratio not found: " + name)
		return 1
	}
	return topupamount

}
