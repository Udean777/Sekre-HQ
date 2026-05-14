# Sekre Project - Development Commands
# Usage: make <command>

.PHONY: help db-seed db-reset dev-backend dev-frontend dev test-backend test-frontend check-frontend

# Default target - show help
help:
	@echo "🚀 Sekre Project - Available Commands"
	@echo ""
	@echo "Database:"
	@echo "  make db-seed         - Seed demo data to database"
	@echo "  make db-reset        - Reset database + seed demo data (RECOMMENDED)"
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

# Database commands (using new dbctl tool)
db-seed:
	@cd sekre-backend && go run cmd/dbctl/main.go seed

db-reset:
	@cd sekre-backend && go run cmd/dbctl/main.go reset --seed

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
