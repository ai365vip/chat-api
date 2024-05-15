# Stage 1: Build React applications
FROM node:18.19.0-alpine as react-builder

WORKDIR /app
COPY ./VERSION .
COPY web-user/package.json ./web-user/package.json
COPY web-admin/package.json ./web-admin/package.json

# Install dependencies
RUN npm install --prefix web-user
RUN npm install --prefix web-admin

# Copy only necessary files for the build
COPY web-user ./web-user
COPY web-admin ./web-admin

# Build web-user and web-admin applications
RUN DISABLE_ESLINT_PLUGIN='true' REACT_APP_VERSION=$(cat VERSION) npm run build --prefix web-user
RUN DISABLE_ESLINT_PLUGIN='true' REACT_APP_VERSION=$(cat VERSION) npm run build --prefix web-admin

# Stage 2: Build Go binary
FROM golang:latest AS go-builder

WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .

# Copy the React build results
COPY --from=react-builder /app/web-user/build ./web-user/build
COPY --from=react-builder /app/web-admin/build ./web-admin/build

# Build the Go binary
RUN go build -ldflags "-s -w -X 'one-api/common.Version=$(cat VERSION)' -extldflags '-static'" -o chat-api

# Stage 3: Create the final image
FROM alpine:latest

# Install certificates and time zone data, then clean up
RUN apk update && apk add --no-cache ca-certificates tzdata && update-ca-certificates && rm -rf /var/cache/apk/*

# Copy the compiled Go binary
COPY --from=go-builder /build/chat-api /chat-api

EXPOSE 3000

WORKDIR /data
ENTRYPOINT ["/chat-api"]
