#!/bin/bash

# Database migration script
# Usage: ./scripts/migrate.sh

set -e

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Default values
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-sekre_db}

# DB_PASSWORD must be set via environment variable
if [ -z "$DB_PASSWORD" ]; then
    echo "Error: DB_PASSWORD environment variable is not set"
    echo "Please set DB_PASSWORD before running this script"
    exit 1
fi

echo "Running database migrations..."
echo "Database: $DB_NAME on $DB_HOST:$DB_PORT"

# Check if database exists, if not create it
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME"

# Run migrations
for migration in sekre-backend/migrations/*.sql; do
    echo "Running migration: $migration"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration"
done

echo "Migrations completed successfully!"
