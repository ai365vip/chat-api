package coze

import "one-api/relay/channel/coze/constant/event"

func event2StopReason(e *string) string {
	if e == nil || *e == event.Message {
		return ""
	}
	return "stop"
}
