#!/bin/bash

# Reset Database (Local PostgreSQL Version)

set -e

echo "⚠️  WARNING: This will delete all data in sekre_db database!"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled."
    exit 0
fi

echo "🗑️  Dropping database sekre_db..."
psql -U postgres -c "DROP DATABASE IF EXISTS sekre_db;"

echo "🗑️  Dropping user sekre_user..."
psql -U postgres -c "DROP USER IF EXISTS sekre_user;"

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

echo "✅ Database reset complete!"
echo ""
echo "🔐 Database Credentials:"
echo "  - User: sekre_user"
echo "  - Password: sekre_password"
echo "  - Database: sekre_db"
echo ""
