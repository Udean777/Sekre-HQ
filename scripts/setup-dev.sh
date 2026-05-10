#!/bin/bash

# Development Environment Setup Script

set -e

echo "🚀 Setting up Sekre Project Development Environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
fi

# Start Docker containers
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec sekre-postgres pg_isready -U sekre_user -d sekre_db > /dev/null 2>&1; do
    sleep 1
done

echo "✅ PostgreSQL is ready!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
until docker exec sekre-redis redis-cli ping > /dev/null 2>&1; do
    sleep 1
done

echo "✅ Redis is ready!"

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📊 Services:"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo "  - Adminer (DB UI): http://localhost:8081"
echo "  - Redis Commander: http://localhost:8082"
echo ""
echo "🔐 Database Credentials:"
echo "  - User: sekre_user"
echo "  - Password: sekre_password"
echo "  - Database: sekre_db"
echo ""
echo "📝 Next steps:"
echo "  1. cd sekre-backend && go run cmd/api/main.go"
echo "  2. cd sekre-frontend && bun run dev"
echo ""
