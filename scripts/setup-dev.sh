#!/bin/bash

# Development Environment Setup Script (Local PostgreSQL Version)

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

# Check if PostgreSQL is installed locally
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed locally. Please install PostgreSQL first."
    exit 1
fi

# Create .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
fi

# Start Docker containers (Redis only)
echo "🐳 Starting Docker containers (Redis only)..."
docker-compose up -d

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
until docker exec sekre-redis redis-cli ping > /dev/null 2>&1; do
    sleep 1
done

echo "✅ Redis is ready!"

# Setup PostgreSQL database
echo "📊 Setting up PostgreSQL database..."

# Check if database exists
DB_EXISTS=$(psql -U postgres -lqt | cut -d \| -f 1 | grep -w sekre_db | wc -l)

if [ $DB_EXISTS -eq 0 ]; then
    echo "📝 Creating database sekre_db..."
    psql -U postgres -c "CREATE DATABASE sekre_db;"
    
    echo "📝 Creating user sekre_user..."
    psql -U postgres -c "CREATE USER sekre_user WITH PASSWORD 'sekre_password';"
    
    echo "📝 Granting privileges..."
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE sekre_db TO sekre_user;"
    
    echo "📝 Initializing database schema..."
    psql -U postgres -d sekre_db -f scripts/init-db.sql
    
    echo "📝 Applying RLS policies..."
    psql -U postgres -d sekre_db -f scripts/rls-policies.sql
    
    echo "✅ Database setup complete!"
else
    echo "ℹ️  Database sekre_db already exists. Skipping creation."
fi

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📊 Services:"
echo "  - PostgreSQL: localhost:5432 (local installation)"
echo "  - Redis: localhost:6379"
echo "  - Redis Commander: http://localhost:8082"
echo ""
echo "🔐 Database Credentials:"
echo "  - User: sekre_user"
echo "  - Password: sekre_password"
echo "  - Database: sekre_db"
echo ""
echo "💡 Connect with PgAdmin:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: sekre_db"
echo "  Username: sekre_user"
echo "  Password: sekre_password"
echo ""
echo "📝 Next steps:"
echo "  1. cd sekre-backend && go run cmd/api/main.go"
echo "  2. cd sekre-frontend && bun run dev"
echo ""
