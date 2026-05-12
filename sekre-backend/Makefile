.PHONY: help test test-unit test-integration test-e2e test-cover test-short bench mocks clean build run migrate lint vet fmt

# Default target
help:
	@echo "Available targets:"
	@echo "  make test              - Run all tests"
	@echo "  make test-unit         - Run unit tests only"
	@echo "  make test-integration  - Run integration tests (requires Docker)"
	@echo "  make test-e2e          - Run end-to-end tests"
	@echo "  make test-cover        - Run tests with coverage report"
	@echo "  make test-short        - Run tests in short mode (skip slow tests)"
	@echo "  make bench             - Run benchmarks"
	@echo "  make mocks             - Generate mocks"
	@echo "  make lint              - Run linter"
	@echo "  make vet               - Run go vet"
	@echo "  make fmt               - Format code"
	@echo "  make build             - Build binaries"
	@echo "  make run               - Run API server"
	@echo "  make migrate           - Run database migrations"
	@echo "  make clean             - Clean build artifacts"

# Test targets
test:
	@echo "Running all tests..."
	go test -v -race ./...

test-unit:
	@echo "Running unit tests..."
	go test -v -race -short ./...

test-integration:
	@echo "Running integration tests..."
	go test -v -race -tags=integration ./...

test-e2e:
	@echo "Running end-to-end tests..."
	go test -v -race -tags=e2e ./...

test-cover:
	@echo "Running tests with coverage..."
	go test -v -race -coverprofile=coverage.out -covermode=atomic ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

test-short:
	@echo "Running tests in short mode..."
	go test -short -race ./...

# Benchmark
bench:
	@echo "Running benchmarks..."
	go test -bench=. -benchmem -run=^$$ ./...

# Mock generation
mocks:
	@echo "Generating mocks..."
	@if ! command -v mockery &> /dev/null; then \
		echo "mockery not found, installing..."; \
		go install github.com/vektra/mockery/v2@latest; \
	fi
	mockery
	@echo "Mocks generated successfully"

# Code quality
lint:
	@echo "Running linter..."
	@if ! command -v golangci-lint &> /dev/null; then \
		echo "golangci-lint not found, installing..."; \
		go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest; \
	fi
	golangci-lint run ./...

vet:
	@echo "Running go vet..."
	go vet ./...

fmt:
	@echo "Formatting code..."
	go fmt ./...
	goimports -w .

# Build targets
build:
	@echo "Building binaries..."
	go build -o bin/api ./cmd/api
	go build -o bin/migrate ./cmd/migrate
	@echo "Binaries built in bin/"

run:
	@echo "Starting API server..."
	go run ./cmd/api

migrate:
	@echo "Running database migrations..."
	go run ./cmd/migrate

# Clean
clean:
	@echo "Cleaning build artifacts..."
	rm -rf bin/
	rm -f coverage.out coverage.html
	@echo "Clean complete"

# Pre-commit checks (fast)
pre-commit: vet lint test-short
	@echo "✓ Pre-commit checks passed"

# CI checks (comprehensive)
ci: vet lint test-cover
	@echo "✓ CI checks passed"
