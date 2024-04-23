package stability

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"one-api/common"
	"one-api/common/config"
	"one-api/relay/model"
	"one-api/relay/util"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// 请求参数结构体
type TextPrompt struct {
	Text   string  `json:"text"`
	Weight float64 `json:"weight,omitempty"` // 如果Weight是0，则在序列化时忽略
}

type StabilityAIRequest struct {
	CfgScale           float64      `json:"cfg_scale,omitempty"`            // 如果CfgScale是0，则在序列化时忽略
	ClipGuidancePreset string       `json:"clip_guidance_preset,omitempty"` // 如果ClipGuidancePreset是空字符串，则在序列化时忽略
	Height             int          `json:"height,omitempty"`               // 如果Height是0，则在序列化时忽略
	Width              int          `json:"width,omitempty"`                // 如果Width是0，则在序列化时忽略
	Sampler            string       `json:"sampler,omitempty"`              // 如果Sampler是空字符串，则在序列化时忽略
	Samples            int          `json:"samples,omitempty"`              // 如果Samples是0，则在序列化时忽略
	Steps              int          `json:"steps,omitempty"`                // 如果Steps是0，则在序列化时忽略
	TextPrompts        []TextPrompt `json:"text_prompts,omitempty"`         // 如果TextPrompts是空切片，则在序列化时忽略
}

func parseContentToStabilityRequest(content string) StabilityAIRequest {
	request := StabilityAIRequest{}

	// 使用正则表达式匹配命令行参数样式的文本
	paramPattern := `--(\w+):\s*([^-\s]+)`
	re := regexp.MustCompile(paramPattern)
	matches := re.FindAllStringSubmatch(content, -1)

	// 用于确定参数开始的位置，以便提取前面的文本内容
	var paramStartIndex int = len(content) // 默认为内容末尾，适用于没有参数的情况

	if len(matches) > 0 {
		paramStartIndex = re.FindStringIndex(content)[0]
	}

	var textContent string
	if paramStartIndex > 0 {
		textContent = strings.TrimSpace(content[:paramStartIndex])
	}

	if textContent != "" {
		request.TextPrompts = []TextPrompt{{Text: textContent, Weight: 1.0}}
	}
	var weight float64 = 1.0 // 默认权重

	for _, match := range matches {
		if len(match) == 3 {
			param := match[1]
			value := match[2]

			switch param {
			case "cfg_scale":
				if val, err := strconv.ParseFloat(value, 64); err == nil {
					request.CfgScale = val
				}
			case "clip_guidance_preset":
				request.ClipGuidancePreset = value
			case "height":
				if val, err := strconv.Atoi(value); err == nil {
					request.Height = val
				}
			case "width":
				if val, err := strconv.Atoi(value); err == nil {
					request.Width = val
				}
			case "sampler":
				request.Sampler = value
			case "samples":
				if val, err := strconv.Atoi(value); err == nil {
					request.Samples = val
				}
			case "steps":
				if val, err := strconv.Atoi(value); err == nil {
					request.Steps = val
				}
			case "weight": // 处理权重作为独立参数
				weight, _ = strconv.ParseFloat(value, 64)

			}
		}
	}
	if len(request.TextPrompts) > 0 {
		request.TextPrompts[0].Weight = weight
	}

	return request
}

func downloadImage(imageURL string) (string, error) {
	resp, err := http.Get(imageURL)
	if err != nil {
		return "", fmt.Errorf("error downloading image: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("server returned non-200 status: %d %s", resp.StatusCode, resp.Status)
	}

	tmpFile, err := os.CreateTemp("", "downloaded-image-*.png")
	if err != nil {
		return "", fmt.Errorf("error creating temp file: %w", err)
	}
	defer tmpFile.Close()

	_, err = io.Copy(tmpFile, resp.Body)
	if err != nil {
		return "", fmt.Errorf("error saving image to temp file: %w", err)
	}

	return tmpFile.Name(), nil
}

func prepareMultipartFormData(content string) (*bytes.Buffer, string) {
	var requestBody bytes.Buffer
	multipartWriter := multipart.NewWriter(&requestBody)

	// 使用正则匹配命令行参数
	paramsRegex := regexp.MustCompile(`--(\w+):?\s*([^\s]+)`)
	params := paramsRegex.FindAllStringSubmatch(content, -1)

	// 用于存储参数
	textPrompt := paramsRegex.ReplaceAllString(content, "") // 去除已识别的参数
	var weight string                                       // 特别存储weight值

	for _, param := range params {
		key := param[1]
		value := strings.TrimSpace(param[2])

		if key == "url" {
			imagePath, err := downloadImage(value)
			if err != nil {
				log.Printf("Failed to download image: %v", err)
				return nil, ""
			}

			file, err := os.Open(imagePath)
			if err != nil {
				log.Printf("Failed to open downloaded image: %v", err)
				return nil, ""
			}
			defer file.Close()

			part, err := multipartWriter.CreateFormFile("init_image", filepath.Base(imagePath))
			if err != nil {
				log.Printf("Failed to create form file for image: %v", err)
				return nil, ""
			}
			if _, err = io.Copy(part, file); err != nil {
				log.Printf("Failed to copy image data: %v", err)
				return nil, ""
			}
		} else if key == "weight" {
			weight = value // 直接使用参数中的weight值
		} else {
			// 直接将其他参数添加到表单数据中
			if err := multipartWriter.WriteField(key, value); err != nil {
				log.Printf("Failed to write field %s: %v", key, err)
				return nil, ""
			}
		}
	}

	// 从content中移除所有已识别的参数，剩下的部分视为textPrompt
	textPrompt = paramsRegex.ReplaceAllString(content, "")
	textPrompt = strings.TrimSpace(textPrompt) // 清理前后的空格

	if textPrompt == "" {
		log.Printf("text_prompt is empty after parsing content.")
		return nil, ""
	}

	// 添加textPrompt到表单中
	if err := multipartWriter.WriteField("text_prompts[0][text]", textPrompt); err != nil {
		log.Printf("Failed to write text prompt: %v", err)
		return nil, ""
	}
	if weight != "" { // 如果weight有值，也添加到表单中
		if err := multipartWriter.WriteField("text_prompts[0][weight]", weight); err != nil {
			log.Printf("Failed to write weight for text prompt: %v", err)
			return nil, ""
		}
	}

	if err := multipartWriter.Close(); err != nil {
		log.Printf("Failed to close multipart writer: %v", err)
		return nil, ""
	}

	return &requestBody, multipartWriter.FormDataContentType()
}

func StreamStabilityHandler(c *gin.Context, resp *http.Response, meta *util.RelayMeta) (*model.ErrorWithStatusCode, string) {
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response body"})
		return nil, ""
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.Data(resp.StatusCode, "application/json", body)
		return nil, ""
	}

	var stabilityResponse StabilityResponse
	if err := json.Unmarshal(body, &stabilityResponse); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse success response"})
		return nil, ""
	}

	var urls []string // 初始化urls变量

	for index, artifact := range stabilityResponse.Artifacts {
		if artifact.FinishReason == "SUCCESS" {
			contentWithPrefix := "data:image/png;base64," + artifact.Base64
			uploadedUrls, err := uploadToSmMs(meta, contentWithPrefix) // 假设这个函数现在接收meta参数
			if err != nil {
				log.Printf("上传失败: %v", err)
				continue
			}

			if len(uploadedUrls) > 0 {
				urls = append(urls, uploadedUrls...) // 将成功上传的URL添加到urls列表中

				firstURL := uploadedUrls[0] // 使用第一个URL
				choice := map[string]interface{}{
					"index": index,
					"delta": map[string]string{
						"role":    "assistant",
						"content": fmt.Sprintf("![image](%s)\r\n", firstURL),
					},
					"finish_reason": "",
				}

				usage := model.Usage{
					PromptTokens:     100,
					CompletionTokens: 100,
					TotalTokens:      100,
				}

				jsonResponse := map[string]interface{}{
					"id":      randomID(),
					"object":  "chat.completion.chunk",
					"created": int(time.Now().Unix()),
					"model":   "stable-diffusion",
					"choices": []map[string]interface{}{choice},
					"usage":   usage,
				}

				jsonData, err := json.Marshal(jsonResponse)
				if err != nil {
					fmt.Println("error marshalling response: ", err)
					continue
				}

				c.Render(-1, common.CustomEvent{Data: "data: " + string(jsonData)})
			}
		}
	}

	// After all artifacts are processed, indicate completion.
	c.Render(-1, common.CustomEvent{Data: "data: [DONE]"})
	return nil, strconv.Itoa(len(urls)) // 返回nil错误和成功上传的URL数量
}

func StabilityHandler(c *gin.Context, resp *http.Response, meta *util.RelayMeta) (*model.ErrorWithStatusCode, *model.Usage, string) {
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		// 如果读取响应体失败，直接返回错误信息
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response body"})
		return nil, nil, ""
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		// 如果状态码表明有错误，直接返回原始错误响应
		c.Data(resp.StatusCode, "application/json", body)
		return nil, nil, ""
	}

	var stabilityResponse StabilityResponse
	if err := json.Unmarshal(body, &stabilityResponse); err != nil {
		// 如果成功响应不能被解析，返回解析错误
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse success response"})
		return nil, nil, ""
	}

	var urls []string
	for _, artifact := range stabilityResponse.Artifacts {
		if artifact.FinishReason == "SUCCESS" {
			// 上传到sm.ms并获取URL
			url, err := uploadToSmMs(meta, "data:image/png;base64,"+artifact.Base64)
			if err != nil {
				// 处理上传失败的情况，这里简单地打印错误信息并继续处理其他图像
				fmt.Println("Failed to upload image:", err)
				continue
			}
			urls = append(urls, url...)
		}
	}

	usage := &model.Usage{
		PromptTokens:     100,
		CompletionTokens: 100,
		TotalTokens:      200, // Assuming each operation consumes 100 tokens
	}

	if len(urls) > 0 {
		// 将所有成功上传的图像URL合并到一个content字段里
		combinedURLs := strings.Join(urls, "\n") // 使用换行符作为URL分隔符

		choice := map[string]interface{}{
			"message": map[string]string{
				"role":    "assistant",
				"content": combinedURLs,
			},
			"finish_reason": "stop",
		}

		// 如果有成功的内容，将它作为响应返回
		c.JSON(http.StatusOK, gin.H{
			"id":      randomID(), // 确保您有实现randomID()函数或者使用其他方式生成唯一ID
			"object":  "chat.completion",
			"created": int(time.Now().Unix()),
			"model":   "stable-diffusion",
			"usage":   usage,
			"choices": []map[string]interface{}{choice}, // 包含单一choice的列表
		})
	} else {
		// 如果没有成功上传图像，直接返回通用错误信息
		c.JSON(http.StatusBadRequest, gin.H{"error": "Processing failed"})
	}

	return nil, usage, strconv.Itoa(len(urls))
}

// randomID 生成一个随机ID，这里只是示例，您可能需要一个更复杂的生成逻辑
func randomID() string {
	return fmt.Sprintf("%x", time.Now().UnixNano())
}

// uploadToSmMs 上传图像到指定URL并返回图像URLs
func uploadToSmMs(meta *util.RelayMeta, base64Data string) ([]string, error) {
	// 构造请求体
	reqBody := UploadRequest{
		Base64Array: []string{base64Data},
	}
	reqBodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %v", err)
	}

	MjUrl := config.ServerAddress
	reqUrl := fmt.Sprintf("%s/mj/submit/upload-discord-images", MjUrl)
	req, err := http.NewRequest("POST", reqUrl, bytes.NewBuffer(reqBodyBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	headers := meta.Headers
	for headerKey, headerValue := range headers {
		req.Header.Set(headerKey, headerValue)
		req.Header.Set("mj-api-secret", headerValue)
	}
	req.Header.Set("Content-Type", "application/json")

	// 发送请求
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	// 读取响应
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}
	// 解析响应
	var uploadResp UploadResponse
	err = json.Unmarshal(respBody, &uploadResp)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %v", err)
	}

	if uploadResp.Code != 1 {
		return nil, fmt.Errorf("upload failed: %s", uploadResp.Description)
	}
	// 返回图像URLs
	return uploadResp.Result, nil
}

// UploadResponse 定义了服务端响应的结构
type UploadResponse struct {
	Code        int      `json:"code"`
	Description string   `json:"description"`
	Result      []string `json:"result"` // 确保这里能够正确映射返回的结果
}
