#!/bin/bash

# Apply RLS Policies to PostgreSQL (Local Version)

set -e

echo "🔒 Applying Row-Level Security (RLS) policies to PostgreSQL..."

# Check if PostgreSQL is accessible
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL (psql) is not installed or not in PATH."
    exit 1
fi

# Check if database exists
DB_EXISTS=$(psql -U postgres -lqt | cut -d \| -f 1 | grep -w sekre_db | wc -l)

if [ $DB_EXISTS -eq 0 ]; then
    echo "❌ Database sekre_db does not exist. Please run setup-dev.sh first."
    exit 1
fi

# Apply RLS policies
echo "📝 Executing RLS policies SQL script..."
psql -U postgres -d sekre_db -f scripts/rls-policies.sql

echo "✅ RLS policies applied successfully!"
echo ""
echo "🔐 Security Features Enabled:"
echo "  - Row-Level Security on all tenant-scoped tables"
echo "  - Automatic data isolation by organization_id"
echo "  - Role-based access control (RBAC) at database level"
echo "  - Session context functions for JWT integration"
echo ""
echo "📚 Usage in Application:"
echo "  1. After JWT validation, call: SELECT set_session_context(org_id, user_id);"
echo "  2. All subsequent queries will be automatically filtered by RLS policies"
echo ""
