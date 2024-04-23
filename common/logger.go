package common

import (
	"context"
	"fmt"
	"io"
	"log"
	"one-api/common/config"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	loggerINFO  = "INFO"
	loggerWarn  = "WARN"
	loggerError = "ERR"
)

const maxLogCount = 1000000

var logCount int
var setupLogLock sync.Mutex
var setupLogWorking bool

func SetupLogger() {
	if *LogDir != "" {
		ok := setupLogLock.TryLock()
		if !ok {
			log.Println("setup log is already working")
			return
		}
		defer func() {
			setupLogLock.Unlock()
			setupLogWorking = false
		}()

		// 创建普通日志文件
		logPath := filepath.Join(*LogDir, fmt.Sprintf("chatapi-%s.log", time.Now().Format("20060102")))
		logFd, err := os.OpenFile(logPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			log.Fatal("failed to open log file:", err)
		}

		// 创建错误日志文件
		errorLogPath := filepath.Join(*LogDir, fmt.Sprintf("chatapi-error-%s.log", time.Now().Format("20060102")))
		errorFd, err := os.OpenFile(errorLogPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			log.Fatal("failed to open error log file:", err)
		}

		// 设置 Gin 的日志输出
		gin.DefaultWriter = io.MultiWriter(os.Stdout, logFd)

		// 设置 Gin 的错误日志输出
		gin.DefaultErrorWriter = io.MultiWriter(os.Stderr, errorFd)
	}
}

func SysLog(s string) {
	t := time.Now()
	_, _ = fmt.Fprintf(gin.DefaultWriter, "[SYS] %v | %s \n", t.Format("2006/01/02 - 15:04:05"), s)
}

func SysError(s string) {
	t := time.Now()
	_, _ = fmt.Fprintf(gin.DefaultErrorWriter, "[SYS] %v | %s \n", t.Format("2006/01/02 - 15:04:05"), s)
}

func LogInfo(ctx context.Context, msg string) {
	logHelper(ctx, loggerINFO, msg)
}

func LogWarn(ctx context.Context, msg string) {
	logHelper(ctx, loggerWarn, msg)
}

func LogError(ctx context.Context, msg string) {
	logHelper(ctx, loggerError, msg)
}

func logHelper(ctx context.Context, level string, msg string) {
	writer := gin.DefaultErrorWriter
	if level == loggerINFO {
		writer = gin.DefaultWriter
	}
	id := ctx.Value(RequestIdKey)
	now := time.Now()
	_, _ = fmt.Fprintf(writer, "[%s] %v | %s | %s \n", level, now.Format("2006/01/02 - 15:04:05"), id, msg)
	logCount++ // we don't need accurate count, so no lock here
	if logCount > maxLogCount && !setupLogWorking {
		logCount = 0
		setupLogWorking = true
		go func() {
			SetupLogger()
		}()
	}
}

func FatalLog(v ...any) {
	t := time.Now()
	_, _ = fmt.Fprintf(gin.DefaultErrorWriter, "[FATAL] %v | %v \n", t.Format("2006/01/02 - 15:04:05"), v)
	os.Exit(1)
}

func LogQuota(quota int) string {
	if config.DisplayInCurrencyEnabled {
		return fmt.Sprintf("＄%.2f 额度", float64(quota)/config.QuotaPerUnit)
	} else {
		return fmt.Sprintf("%d 点额度", quota)
	}
}

func Info(ctx context.Context, msg string) {
	logHelper(ctx, loggerINFO, msg)
}

func Warn(ctx context.Context, msg string) {
	logHelper(ctx, loggerWarn, msg)
}

func Error(ctx context.Context, msg string) {
	logHelper(ctx, loggerError, msg)
}

func Infof(ctx context.Context, format string, a ...any) {
	Info(ctx, fmt.Sprintf(format, a...))
}

func Warnf(ctx context.Context, format string, a ...any) {
	Warn(ctx, fmt.Sprintf(format, a...))
}

func Errorf(ctx context.Context, format string, a ...any) {
	Error(ctx, fmt.Sprintf(format, a...))
}
