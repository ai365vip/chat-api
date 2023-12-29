FROM node:16 as builder

# 构建 web-user 应用
WORKDIR /build/web-user
COPY web-user/package.json .
RUN npm install
COPY web-user/ .
RUN DISABLE_ESLINT_PLUGIN='true' REACT_APP_VERSION=$(cat ../VERSION) npm run build

# 构建 web-admin 应用
WORKDIR /build/web-admin
COPY web-admin/package.json .
RUN npm install
COPY web-admin/ .
RUN DISABLE_ESLINT_PLUGIN='true' REACT_APP_VERSION=$(cat ../VERSION) npm run build

FROM golang AS builder2

ENV GO111MODULE=on \
    CGO_ENABLED=1 \
    GOOS=linux

WORKDIR /build
ADD go.mod go.sum ./
RUN go mod download
COPY . .
# 将 web-user 和 web-admin 的构建结果复制到指定位置
COPY --from=builder /build/web-user/build ./web-user/build
COPY --from=builder /build/web-admin/build ./web-admin/build
RUN go build -ldflags "-s -w -X 'one-api/common.Version=$(cat VERSION)' -extldflags '-static'" -o chat-api

FROM alpine

RUN apk update \
    && apk upgrade \
    && apk add --no-cache ca-certificates tzdata \
    && update-ca-certificates 2>/dev/null || true

COPY --from=builder2 /build/chat-api /
EXPOSE 3000
WORKDIR /data
ENTRYPOINT ["/chat-api"]
