FROM node:18-alpine as react-builder

ARG GIT_TAG
ENV REACT_APP_VERSION=$GIT_TAG

# Create app directory
WORKDIR /app

# Install dependencies first to leverage Docker cache
COPY web-user/package*.json ./
RUN npm install

# Copy the source code and build the React applications
COPY . .

# Build web-user application
RUN DISABLE_ESLINT_PLUGIN="true" npm run build --prefix web-user

# Build web-admin application
RUN DISABLE_ESLINT_PLUGIN="true" npm run build --prefix web-admin

FROM golang AS go-builder

ENV GO111MODULE=on \
    CGO_ENABLED=1 \
    GOOS=linux

WORKDIR /build
ADD go.mod go.sum ./
RUN go mod download
COPY . .
# 将 web-user 和 web-admin 的构建结果复制到指定位置
COPY --from=react-builder /app/web-user/build ./web-user/build
COPY --from=react-builder /app/web-admin/build ./web-admin/build
RUN go build -ldflags "-s -w -X 'one-api/common.Version=${GIT_TAG}' -extldflags '-static'" -o chat-api

# Use a minimal alpine image for the final stage
FROM alpine

# Install certificates and time zone data
RUN apk update && apk add --no-cache ca-certificates tzdata && update-ca-certificates

# Copy the compiled Go binary.
COPY --from=go-builder /build/chat-api /chat-api

EXPOSE 3000

WORKDIR /data
ENTRYPOINT ["/chat-api"]
