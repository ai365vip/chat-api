package stability

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"one-api/common"
	"one-api/relay/model"
	"regexp"
	"strconv"
	"strings"
	"time"
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

func StreamStabilityHandler(c *gin.Context, resp *http.Response) *model.ErrorWithStatusCode {
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response body"})
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.Data(resp.StatusCode, "application/json", body)
		return nil
	}

	var stabilityResponse StabilityResponse
	if err := json.Unmarshal(body, &stabilityResponse); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse success response"})
		return nil
	}
	for index, artifact := range stabilityResponse.Artifacts {
		if artifact.FinishReason == "SUCCESS" {
			contentWithPrefix := "data:image/png;base64," + artifact.Base64
			urls, err := uploadToSmMs(contentWithPrefix)
			if err != nil {
				// 处理错误，例如打印日志、设置错误消息等
				log.Printf("上传失败: %v", err)
			}

			var firstURL string
			if len(urls) > 0 {
				firstURL = urls[0]
			} else {
				// 没有URL返回，可能需要处理这种情况
				log.Println("没有返回URL")
			}

			choice := map[string]interface{}{
				"index": index,
				"delta": map[string]string{
					"role":    "assistant",
					"content": firstURL + "\r\n", // 使用第一个URL
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
				"usage":   usage, // Include usage information in the response
			}

			jsonData, err := json.Marshal(jsonResponse)
			if err != nil {
				fmt.Println("error marshalling response: ", err)
				continue // or return an error; depends on your error handling policy
			}

			c.Render(-1, common.CustomEvent{Data: "data: " + string(jsonData)})
		}
	}

	// After all artifacts are processed, indicate completion.
	c.Render(-1, common.CustomEvent{Data: "data: [DONE]"})
	return nil
}

func StabilityHandler(c *gin.Context, resp *http.Response) (*model.ErrorWithStatusCode, *model.Usage) {
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		// 如果读取响应体失败，直接返回错误信息
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response body"})
		return nil, nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		// 如果状态码表明有错误，直接返回原始错误响应
		c.Data(resp.StatusCode, "application/json", body)
		return nil, nil
	}

	var stabilityResponse StabilityResponse
	if err := json.Unmarshal(body, &stabilityResponse); err != nil {
		// 如果成功响应不能被解析，返回解析错误
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse success response"})
		return nil, nil
	}

	var urls []string
	for _, artifact := range stabilityResponse.Artifacts {
		if artifact.FinishReason == "SUCCESS" {
			// 上传到sm.ms并获取URL
			url, err := uploadToSmMs("data:image/png;base64," + artifact.Base64)
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
	return nil, usage
}

// randomID 生成一个随机ID，这里只是示例，您可能需要一个更复杂的生成逻辑
func randomID() string {
	return fmt.Sprintf("%x", time.Now().UnixNano())
}

// uploadToSmMs 上传图像到指定URL并返回图像URLs
func uploadToSmMs(base64Data string) ([]string, error) {
	// 构造请求体
	reqBody := UploadRequest{
		Base64Array: []string{base64Data},
	}
	reqBodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %v", err)
	}

	// 创建请求
	req, err := http.NewRequest("POST", "http://142.171.123.86:8089/mj/submit/upload-discord-images", bytes.NewBuffer(reqBodyBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("mj-api-secret", "MkH3bs7ASlskdf2347IOSDH2w389DASH")

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
