# Stage 1: Build
FROM golang:1.26-alpine AS builder

WORKDIR /app

# Install git (needed for some go modules)
RUN apk --no-cache add git

# Download dependencies first (layer cache)
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o bin/api ./cmd/api

# Stage 2: Runtime
FROM alpine:3.20

# ca-certificates: for HTTPS outbound calls
# tzdata: for correct timezone in cron jobs
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/bin/api .

# Copy OpenAPI docs (served at /docs)
COPY --from=builder /app/docs ./docs

# Copy SQL migration files (consumed by auto-migrate at startup)
COPY --from=builder /app/migrations ./migrations

EXPOSE 1000

CMD ["./api"]
