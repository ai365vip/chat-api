package common

func AsString(v any) string {
	str, _ := v.(string)
	return str
}
