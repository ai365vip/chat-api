package constant

import "strings"

const (
	RelayModeUnknown = iota
	RelayModeChatCompletions
	RelayModeCompletions
	RelayModeEmbeddings
	RelayModeModerations
	RelayModeImagesGenerations
	RelayModeEdits
	RelayModeAudioSpeech
	RelayModeAudioTranscription
	RelayModeAudioTranslation
	RelayModeMidjourneyImagine
	RelayModeMidjourneyDescribe
	RelayModeMidjourneyBlend
	RelayModeMidjourneyChange
	RelayModeMidjourneyAction
	RelayModeMidjourneyModal
	RelayModeMidjourneyShorten
	RelayModeMidjourneyFace
	RelayModeMidjourneySimpleChange
	RelayModeMidjourneyUploads
	RelayModeMidjourneyNotify
	RelayModeMidjourneyTaskFetch
	RelayModeMidjourneyImageSeed
	RelayModeMidjourneyTaskFetchByCondition
	RelayMidjourneyImage
	RelayModeMessages
	RelayRealtime
	RelayResponses
)

func Path2RelayMode(path string) int {
	relayMode := RelayModeUnknown
	if strings.HasPrefix(path, "/v1/chat/completions") {
		relayMode = RelayModeChatCompletions
	} else if strings.HasPrefix(path, "/v1/completions") {
		relayMode = RelayModeCompletions
	} else if strings.HasPrefix(path, "/v1/embeddings") {
		relayMode = RelayModeEmbeddings
	} else if strings.HasSuffix(path, "embeddings") {
		relayMode = RelayModeEmbeddings
	} else if strings.HasPrefix(path, "/v1/moderations") {
		relayMode = RelayModeModerations
	} else if strings.HasPrefix(path, "/v1/images/generations") {
		relayMode = RelayModeImagesGenerations
	} else if strings.HasPrefix(path, "/v1/images/edits") {
		relayMode = RelayModeEdits
	} else if strings.HasPrefix(path, "/v1/audio/speech") {
		relayMode = RelayModeAudioSpeech
	} else if strings.HasPrefix(path, "/v1/audio/transcriptions") {
		relayMode = RelayModeAudioTranscription
	} else if strings.HasPrefix(path, "/v1/audio/translations") {
		relayMode = RelayModeAudioTranslation
	} else if strings.HasPrefix(path, "/v1/messages") {
		relayMode = RelayModeMessages
	} else if strings.HasPrefix(path, "/v1/realtime") {
		relayMode = RelayRealtime
	} else if strings.HasPrefix(path, "/v1/responses") {
		relayMode = RelayResponses
	}
	return relayMode
}

func MidjourneyRelayMode(path string) int {
	relayMode := RelayModeUnknown
	if strings.Contains(path, "/mj/submit/imagine") {
		relayMode = RelayModeMidjourneyImagine
	} else if strings.Contains(path, "/mj/submit/blend") {
		relayMode = RelayModeMidjourneyBlend
	} else if strings.Contains(path, "/mj/submit/describe") {
		relayMode = RelayModeMidjourneyDescribe
	} else if strings.Contains(path, "/mj/notify") {
		relayMode = RelayModeMidjourneyNotify
	} else if strings.Contains(path, "/mj/submit/change") {
		relayMode = RelayModeMidjourneyChange
	} else if strings.Contains(path, "/mj/submit/simple-change") {
		relayMode = RelayModeMidjourneySimpleChange
	} else if strings.Contains(path, "/mj/submit/action") {
		relayMode = RelayModeMidjourneyAction
	} else if strings.Contains(path, "/mj/submit/modal") {
		relayMode = RelayModeMidjourneyModal
	} else if strings.Contains(path, "/mj/submit/shorten") {
		relayMode = RelayModeMidjourneyShorten
	} else if strings.Contains(path, "/mj/insight-face/swap") {
		relayMode = RelayModeMidjourneyFace
	} else if strings.Contains(path, "/mj/submit/upload-discord-images") {
		relayMode = RelayModeMidjourneyUploads
	} else if strings.HasSuffix(path, "/fetch") {
		relayMode = RelayModeMidjourneyTaskFetch
	} else if strings.HasSuffix(path, "/image-seed") {
		relayMode = RelayModeMidjourneyImageSeed
	} else if strings.HasSuffix(path, "/list-by-condition") {
		relayMode = RelayModeMidjourneyTaskFetchByCondition
	}
	return relayMode
}
