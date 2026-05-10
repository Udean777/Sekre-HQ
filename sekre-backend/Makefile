.PHONY: help dev run build test clean migrate

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Run with live reload (air)
	@echo "Starting development server with live reload..."
	@air

run: ## Run without live reload
	@echo "Starting server..."
	@go run cmd/api/main.go

build: ## Build binary
	@echo "Building..."
	@go build -o bin/sekre-api cmd/api/main.go
	@echo "Build complete: bin/sekre-api"

test: ## Run tests
	@echo "Running tests..."
	@go test -v ./...

test-coverage: ## Run tests with coverage
	@echo "Running tests with coverage..."
	@go test -v -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report: coverage.html"

clean: ## Clean build artifacts
	@echo "Cleaning..."
	@rm -rf tmp/
	@rm -rf bin/
	@rm -f build-errors.log
	@rm -f coverage.out coverage.html
	@echo "Clean complete"

migrate: ## Run database migrations
	@echo "Running migrations..."
	@cd .. && ./scripts/migrate.sh

install-tools: ## Install development tools
	@echo "Installing air..."
	@go install github.com/cosmtrek/air@latest
	@echo "Tools installed"
