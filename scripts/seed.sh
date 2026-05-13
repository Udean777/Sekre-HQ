#!/bin/bash

# Seed demo data to database
# Usage: ./scripts/seed.sh

set -e

echo "🌱 Seeding demo data..."

# Database connection details
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-sekre_db}"
DB_USER="${DB_USER:-postgres}"

# Check if database is accessible
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\q' 2>/dev/null; then
    echo "❌ Cannot connect to database. Make sure PostgreSQL is running."
    echo "   Connection: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
    exit 1
fi

# Run seed script
echo "📝 Running seed script..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/seed-demo.sql

echo ""
echo "✅ Demo data seeded successfully!"
echo ""
echo "You can now login with:"
echo "  - Email: sajudin@himti.org"
echo "  - Password: password123"
