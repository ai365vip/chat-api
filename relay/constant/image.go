package constant

var DalleSizeRatios = map[string]map[string]float64{
	"dall-e-2": {
		"256x256":   1,
		"512x512":   1.125,
		"1024x1024": 1.25,
	},
	"dall-e-3": {
		"1024x1024": 1,
		"1024x1792": 2,
		"1792x1024": 2,
	},
	"gpt-image-1": {
		"1024x1024_low":    1.0,   // $0.011
		"1024x1536_low":    1.46,  // $0.016
		"1536x1024_low":    1.46,  // $0.016
		"1024x1024_medium": 3.82,  // $0.042
		"1024x1536_medium": 5.73,  // $0.063
		"1536x1024_medium": 5.73,  // $0.063
		"1024x1024_high":   15.18, // $0.167
		"1024x1536_high":   22.73, // $0.25
		"1536x1024_high":   22.73, // $0.25
	},
	"stable-diffusion-xl": {
		"512x1024":  1,
		"1024x768":  1,
		"1024x1024": 1,
		"576x1024":  1,
		"1024x576":  1,
	},
	"wanx-v1": {
		"1024x1024": 1,
		"720x1280":  1,
		"1280x720":  1,
	},
}

var DalleGenerationImageAmounts = map[string][2]int64{
	"dall-e-2":            {1, 10},
	"dall-e-3":            {1, 1}, // OpenAI allows n=1 currently.
	"gpt-image-1":         {1, 1}, // OpenAI allows n=1 currently.
	"stable-diffusion-xl": {1, 4}, // Ali
	"wanx-v1":             {1, 4}, // Ali
}

var DalleImagePromptLengthLimitations = map[string]int{
	"dall-e-2":            1000,
	"dall-e-3":            4000,
	"gpt-image-1":         4000,
	"stable-diffusion-xl": 4000,
	"wanx-v1":             4000,
	"cogview-3":           833,
}

// GPT Image 1 模型的tokens定价常量 (每百万tokens的价格，单位：美元)
var GPTImage1TokenPrices = struct {
	TextInputPrice   float64 // 文本输入token价格
	ImageInputPrice  float64 // 图像输入token价格
	ImageOutputPrice float64 // 图像输出token价格
}{
	TextInputPrice:   2.50,  // $5.00 per 1M tokens
	ImageInputPrice:  5.00,  // $10.00 per 1M tokens
	ImageOutputPrice: 20.00, // $40.00 per 1M tokens
}
