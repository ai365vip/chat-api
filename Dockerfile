FROM node:18.19.0-alpine as react-builder

WORKDIR /app
COPY ./VERSION .

# 复制 web-user 和 web-admin 的 package.json 和 package-lock.json
COPY web-user/package.json web-user/package-lock.json ./web-user/
COPY web-admin/package.json web-admin/package-lock.json ./web-admin/

# 为 web-user 和 web-admin 安装依赖项
RUN npm ci --prefix web-user
RUN npm ci --prefix web-admin

# 复制源代码
COPY web-user ./web-user
COPY web-admin ./web-admin

# 构建 web-user 和 web-admin 应用
RUN DISABLE_ESLINT_PLUGIN='true' REACT_APP_VERSION=$(cat VERSION) npm run build --prefix web-user
RUN DISABLE_ESLINT_PLUGIN='true' REACT_APP_VERSION=$(cat VERSION) npm run build --prefix web-admin

FROM golang:latest AS go-builder

WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .

# 复制构建结果
COPY --from=react-builder /app/web-user/build ./web-user/build
COPY --from=react-builder /app/web-admin/build ./web-admin/build

# 构建 Go 二进制文件
RUN go build -ldflags "-s -w -X 'one-api/common.Version=$(cat VERSION)' -extldflags '-static'" -o chat-api

FROM alpine:latest

RUN apk update \
    && apk upgrade \
    && apk add --no-cache ca-certificates tzdata ffmpeg ffmpeg-tools \
    && update-ca-certificates 2>/dev/null || true \
    && rm -rf /var/cache/apk/*

# 复制 Go 二进制文件
COPY --from=go-builder /build/chat-api /chat-api

EXPOSE 3000

WORKDIR /data
ENTRYPOINT ["/chat-api"]
