package aiproxy

import "one-api/relay/channel/openai"

var ModelList = []string{""}

func init() {
	ModelList = openai.ModelList
}
