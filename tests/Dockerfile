FROM golang:1.24-alpine AS builder

RUN apk add --no-cache bash git build-base musl-dev

RUN go install go.k6.io/xk6/cmd/xk6@latest

WORKDIR /build

# Build k6 with dashboard extension
RUN xk6 build --with github.com/grafana/xk6-dashboard@latest

# Second process build image
FROM alpine:3.18

RUN apk add --no-cache bash ca-certificates

COPY --from=builder /build/k6 /usr/bin/k6

WORKDIR /scripts
COPY ./load-test.js /scripts/load-test.js

EXPOSE 5665

ENTRYPOINT ["k6"] 
