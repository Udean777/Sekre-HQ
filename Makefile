# Sekre Project - Development Commands
# Usage: make <command>

.PHONY: help reset-db seed reset-and-seed dev-backend dev-frontend dev test

# Default target - show help
help:
	@echo "🚀 Sekre Project - Available Commands"
	@echo ""
	@echo "Database:"
	@echo "  make reset-db        - Reset database (drop & recreate)"
	@echo "  make seed            - Seed demo data only"
	@echo "  make reset-and-seed  - Reset database + seed demo data (RECOMMENDED)"
	@echo ""
	@echo "Development:"
	@echo "  make dev-backend     - Start backend server"
	@echo "  make dev-frontend    - Start frontend dev server"
	@echo "  make dev             - Start both backend & frontend"
	@echo ""
	@echo "Testing:"
	@echo "  make test-backend    - Run backend tests"
	@echo "  make test-frontend   - Run frontend tests"
	@echo ""

# Database commands
reset-db:
	@./scripts/reset-db.sh

seed:
	@./scripts/seed.sh

reset-and-seed:
	@./scripts/reset-and-seed.sh

# Development commands
dev-backend:
	@echo "🚀 Starting backend server..."
	@cd sekre-backend && go run cmd/api/main.go

dev-frontend:
	@echo "🚀 Starting frontend dev server..."
	@cd sekre-frontend && npm run dev

dev:
	@echo "🚀 Starting both backend & frontend..."
	@echo "⚠️  Note: Run 'make dev-backend' and 'make dev-frontend' in separate terminals"

# Testing commands
test-backend:
	@echo "🧪 Running backend tests..."
	@cd sekre-backend && go test ./...

test-frontend:
	@echo "🧪 Running frontend tests..."
	@cd sekre-frontend && npm run test

# Check commands
check-frontend:
	@echo "🔍 Checking frontend types..."
	@cd sekre-frontend && npm run check
