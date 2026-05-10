#!/bin/bash

# Apply RLS Policies to PostgreSQL

set -e

echo "🔒 Applying Row-Level Security (RLS) policies to PostgreSQL..."

# Check if PostgreSQL container is running
if ! docker ps | grep -q sekre-postgres; then
    echo "❌ PostgreSQL container is not running. Please run 'docker-compose up -d' first."
    exit 1
fi

# Apply RLS policies
echo "📝 Executing RLS policies SQL script..."
docker exec -i sekre-postgres psql -U sekre_user -d sekre_db < scripts/rls-policies.sql

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
