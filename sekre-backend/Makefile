.PHONY: help test test-unit test-integration test-e2e test-cover test-cover-check test-short test-fuzz bench bench-save fuzz fuzz-money fuzz-auth mocks clean build run migrate lint lint-ci vet fmt setup-hooks pre-commit ci install-tools db-seed db-reset build-dbctl

# Coverage threshold for CI (matches .github/workflows/backend-ci.yml)
COVERAGE_THRESHOLD ?= 60

# Default target
help:
	@echo "Available targets:"
	@echo ""
	@echo "  Testing:"
	@echo "    make test              - Run all tests"
	@echo "    make test-unit         - Run unit tests only"
	@echo "    make test-integration  - Run integration tests (requires Docker)"
	@echo "    make test-e2e          - Run end-to-end tests"
	@echo "    make test-cover        - Run tests with HTML coverage report"
	@echo "    make test-cover-check  - Run tests and check coverage threshold ($(COVERAGE_THRESHOLD)%)"
	@echo "    make test-short        - Run tests in short mode (skip slow tests)"
	@echo "    make test-fuzz         - Run all fuzz tests (30s each)"
	@echo "    make bench             - Run benchmarks"
	@echo "    make bench-save        - Run benchmarks and save baseline to docs/benchmarks/"
	@echo "    make fuzz-money        - Run Money fuzz tests (30s)"
	@echo "    make fuzz-auth         - Run auth validator fuzz tests"
	@echo ""
	@echo "  Code Quality:"
	@echo "    make lint              - Run linter"
	@echo "    make lint-ci           - Run linter with CI config (strict)"
	@echo "    make vet               - Run go vet"
	@echo "    make fmt               - Format code"
	@echo ""
	@echo "  Mocks:"
	@echo "    make mocks             - Generate mocks"
	@echo ""
	@echo "  Build:"
	@echo "    make build             - Build binaries"
	@echo "    make build-dbctl       - Build dbctl CLI tool"
	@echo "    make run               - Run API server"
	@echo "    make migrate           - Run database migrations"
	@echo "    make clean             - Clean build artifacts"
	@echo ""
	@echo "  Database:"
	@echo "    make db-seed           - Seed demo data to database"
	@echo "    make db-reset          - Reset database (drop, recreate, migrate, seed)"
	@echo ""
	@echo "  Setup:"
	@echo "    make install-tools     - Install required development tools"
	@echo "    make setup-hooks       - Setup git pre-commit hooks"
	@echo ""
	@echo "  Convenience:"
	@echo "    make pre-commit        - Run fast pre-commit checks"
	@echo "    make ci                - Run full CI checks locally"

# Test targets
test:
	@echo "Running all tests..."
	go test -v -race ./...

test-unit:
	@echo "Running unit tests..."
	go test -v -race -short ./...

test-integration:
	@echo "Running integration tests..."
	go test -v -race -tags=integration -p 1 ./...

test-e2e:
	@echo "Running end-to-end tests..."
	go test -v -race -tags=e2e ./...

test-cover:
	@echo "Running tests with coverage..."
	go test -race -short -coverprofile=coverage.out -covermode=atomic ./...
	go tool cover -html=coverage.out -o coverage.html
	go tool cover -func=coverage.out
	@echo ""
	@echo "Coverage report generated: coverage.html"

test-cover-check: test-cover
	@echo ""
	@echo "Checking coverage threshold ($(COVERAGE_THRESHOLD)%)..."
	@COVERAGE=$$(go tool cover -func=coverage.out | grep '^total:' | awk '{print $$3}' | sed 's/%//'); \
	echo "Total coverage: $${COVERAGE}%"; \
	if [ $$(echo "$${COVERAGE} < $(COVERAGE_THRESHOLD)" | bc -l) -eq 1 ]; then \
		echo "ERROR: Coverage $${COVERAGE}% is below threshold $(COVERAGE_THRESHOLD)%"; \
		exit 1; \
	fi; \
	echo "OK: Coverage $${COVERAGE}% meets threshold $(COVERAGE_THRESHOLD)%"

test-short:
	@echo "Running tests in short mode..."
	go test -short -race ./...

test-fuzz:
	@echo "Running all fuzz tests (30s each)..."
	@echo "Fuzzing Money..."
	-go test -fuzz=FuzzNewMoney -fuzztime=30s -run=^$$ ./internal/domain/valueobject
	@echo "Fuzzing auth validators..."
	-go test -fuzz=FuzzValidateEmail -fuzztime=30s -run=^$$ ./internal/infrastructure/auth
	-go test -fuzz=FuzzValidatePassword -fuzztime=30s -run=^$$ ./internal/infrastructure/auth
	-go test -fuzz=FuzzValidateSubdomain -fuzztime=30s -run=^$$ ./internal/infrastructure/auth
	@echo "Fuzzing handlers..."
	-go test -fuzz=FuzzParseUUIDFromPath -fuzztime=30s -run=^$$ ./internal/delivery/http/handler

# Benchmark
bench:
	@echo "Running benchmarks..."
	go test -bench=. -benchmem -run=^$$ ./...

bench-save:
	@echo "Running benchmarks and saving baseline..."
	@mkdir -p docs/benchmarks
	go test -bench=. -benchmem -run=^$$ ./... | tee docs/benchmarks/$$(date +%Y-%m).md
	@echo "Baseline saved to docs/benchmarks/$$(date +%Y-%m).md"

# Fuzz tests
fuzz:
	@echo "Running fuzz tests (30s each)..."
	@echo "Note: Run specific fuzz with 'make fuzz-money' or 'make fuzz-auth'"
	@echo "Example: go test -fuzz=FuzzValidateEmail -fuzztime=30s ./internal/infrastructure/auth"

fuzz-money:
	@echo "Fuzzing Money value object (30s)..."
	go test -fuzz=FuzzNewMoney -fuzztime=30s -run=^$$ ./internal/domain/valueobject

fuzz-auth:
	@echo "Fuzzing auth validators (30s each)..."
	go test -fuzz=FuzzValidateEmail -fuzztime=30s -run=^$$ ./internal/infrastructure/auth
	go test -fuzz=FuzzValidatePassword -fuzztime=30s -run=^$$ ./internal/infrastructure/auth
	go test -fuzz=FuzzValidateSubdomain -fuzztime=30s -run=^$$ ./internal/infrastructure/auth

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

lint-ci:
	@echo "Running linter (CI mode)..."
	@if ! command -v golangci-lint &> /dev/null; then \
		echo "golangci-lint not found, installing..."; \
		go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest; \
	fi
	golangci-lint run --timeout=5m ./...

vet:
	@echo "Running go vet..."
	go vet ./...

fmt:
	@echo "Formatting code..."
	go fmt ./...
	@if command -v goimports &> /dev/null; then \
		goimports -w .; \
	fi

# Build targets
build:
	@echo "Building binaries..."
	CGO_ENABLED=0 go build -ldflags="-w -s" -o bin/api ./cmd/api
	CGO_ENABLED=0 go build -ldflags="-w -s" -o bin/migrate ./cmd/migrate
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
	rm -f coverage.out coverage.html coverage.txt
	rm -f unit.xml unit.cov integration.xml
	@echo "Clean complete"

# Database commands
db-seed:
	@echo "🌱 Seeding demo data..."
	@go run cmd/dbctl/main.go seed

db-reset:
	@echo "🔄 Resetting database..."
	@go run cmd/dbctl/main.go reset --seed

build-dbctl:
	@echo "🔨 Building dbctl..."
	@go build -o bin/dbctl cmd/dbctl/main.go
	@echo "✅ dbctl built successfully: bin/dbctl"

# Install required development tools
install-tools:
	@echo "Installing development tools..."
	go install github.com/vektra/mockery/v2@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install gotest.tools/gotestsum@latest
	go install golang.org/x/tools/cmd/goimports@latest
	@echo "Tools installed successfully"

# Setup git hooks
setup-hooks:
	@echo "Setting up git hooks..."
	@cd .. && git config core.hooksPath sekre-backend/.githooks
	@chmod +x .githooks/pre-commit
	@echo "Git hooks configured. Pre-commit hook will run on every commit."

# Pre-commit checks (fast)
pre-commit: fmt vet lint test-short
	@echo "OK: Pre-commit checks passed"

# CI checks (comprehensive)
ci: vet lint-ci test-cover-check
	@echo "OK: CI checks passed"
