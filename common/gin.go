package common

import (
	"bytes"
	"encoding/json"
	"io"

	"github.com/gin-gonic/gin"
)

func UnmarshalBodyReusable(c *gin.Context, v any) error {
	requestBody, err := io.ReadAll(c.Request.Body)
	if err != nil {
		return err
	}
	err = c.Request.Body.Close()
	if err != nil {
		return err
	}
	err = json.Unmarshal(requestBody, &v)
	if err != nil {
		return err
	}
	// Reset request body
	c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
	return nil
}
func SetEventStreamHeaders(c *gin.Context) {
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Transfer-Encoding", "chunked")
	c.Writer.Header().Set("X-Accel-Buffering", "no")
}
