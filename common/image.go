package common

import (
	"bytes"
	"encoding/base64"
	"errors"
	"fmt"
	"image"
	"io"
	"net/http"
	"strings"

	"github.com/chai2010/webp"
)

func DecodeBase64ImageData(base64String string) (image.Config, string, error) {
	// 去除base64数据的URL前缀（如果有）
	if idx := strings.Index(base64String, ","); idx != -1 {
		base64String = base64String[idx+1:]
	}

	// 将base64字符串解码为字节切片
	decodedData, err := base64.StdEncoding.DecodeString(base64String)
	if err != nil {
		fmt.Println("Error: Failed to decode base64 string")
		return image.Config{}, "", err
	}

	// 创建一个bytes.Buffer用于存储解码后的数据
	reader := bytes.NewReader(decodedData)
	config, format, err := getImageConfig(reader)
	return config, format, err
}

func IsImageUrl(url string) (bool, error) {
	resp, err := http.Head(url)
	if err != nil {
		return false, err
	}
	if !strings.HasPrefix(resp.Header.Get("Content-Type"), "image/") {
		return false, nil
	}
	return true, nil
}

func GetImageFromUrl(url string) (mimeType string, data string, err error) {
	isImage, err := IsImageUrl(url)
	if !isImage {
		return
	}
	resp, err := http.Get(url)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	buffer := bytes.NewBuffer(nil)
	_, err = buffer.ReadFrom(resp.Body)
	if err != nil {
		return
	}
	mimeType = resp.Header.Get("Content-Type")
	data = base64.StdEncoding.EncodeToString(buffer.Bytes())
	return
}

func DecodeUrlImageData(imageUrl string) (image.Config, string, error) {
	response, err := http.Get(imageUrl)
	if err != nil {
		SysLog(fmt.Sprintf("fail to get image from url: %s", err.Error()))
		return image.Config{}, "", err
	}

	// 限制读取的字节数，防止下载整个图片
	limitReader := io.LimitReader(response.Body, 1024*20)
	//data, err := io.ReadAll(limitReader)
	//if err != nil {
	//	log.Fatal(err)
	//}
	//log.Printf("%x", data)
	config, format, err := getImageConfig(limitReader)
	response.Body.Close()
	return config, format, err
}

func getImageConfig(reader io.Reader) (image.Config, string, error) {
	buf := new(bytes.Buffer)
	teeReader := io.TeeReader(reader, buf)

	// 尝试解析标准图像格式（gif, jpg, png）
	config, format, err := image.DecodeConfig(teeReader)
	if err != nil {
		SysLog(fmt.Sprintf("fail to decode image config(gif, jpg, png): %s", err.Error()))
		reader = bytes.NewReader(buf.Bytes())

		// 尝试解析WebP格式
		if webpConfig, err := webp.DecodeConfig(reader); err == nil {
			config = image.Config{
				Width:      webpConfig.Width,
				Height:     webpConfig.Height,
				ColorModel: webpConfig.ColorModel,
			}
			format = "webp"
			return config, format, nil
		} else {
			err = errors.New(fmt.Sprintf("fail to decode image config(webp): %s", err.Error()))
			SysLog(err.Error())
		}
		format = "webp"
	}

	if err != nil {
		return image.Config{}, "", err
	}
	return config, format, nil
}
