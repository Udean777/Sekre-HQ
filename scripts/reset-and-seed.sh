#!/bin/bash

# Reset Database & Seed Demo Data
# This script will:
# 1. Terminate all database connections
# 2. Drop and recreate database
# 3. Initialize schema
# 4. Seed demo data

set -e

echo "🔄 Reset Database & Seed Demo Data"
echo "===================================="
echo ""
echo "⚠️  WARNING: This will delete ALL data in sekre_db database!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled."
    exit 0
fi

echo ""
echo "🔌 Step 1: Terminating all database connections..."
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'sekre_db' AND pid <> pg_backend_pid();" 2>/dev/null || true

echo "🗑️  Step 2: Dropping database sekre_db..."
psql -U postgres -c "DROP DATABASE IF EXISTS sekre_db;"

echo "🗑️  Step 3: Dropping user sekre_user..."
psql -U postgres -c "DROP USER IF EXISTS sekre_user;" 2>/dev/null || true

echo "📝 Step 4: Creating database sekre_db..."
psql -U postgres -c "CREATE DATABASE sekre_db;"

echo "📝 Step 5: Creating user sekre_user..."
psql -U postgres -c "CREATE USER sekre_user WITH PASSWORD 'sekre_password';" 2>/dev/null || true

echo "📝 Step 6: Granting privileges..."
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE sekre_db TO sekre_user;"

echo "📝 Step 7: Initializing database schema..."
psql -U postgres -d sekre_db -f scripts/init-db.sql

echo "📝 Step 8: Applying RLS policies..."
if [ -f scripts/rls-policies.sql ]; then
    psql -U postgres -d sekre_db -f scripts/rls-policies.sql
else
    echo "⚠️  RLS policies file not found, skipping..."
fi

echo "🌱 Step 9: Seeding demo data..."
psql -U postgres -d sekre_db -f scripts/seed-demo.sql

echo ""
echo "✅ Database reset & seed complete!"
echo ""
echo "===================================="
echo "📊 Demo Data Summary:"
echo "===================================="
echo ""
echo "🏢 Organizations: 2"
echo "   - HIMTI UNPAB (FREE plan)"
echo "   - BEM Universitas (LITE plan)"
echo ""
echo "👥 Users: 4"
echo "   - sajudin@himti.org (OWNER)"
echo "   - zulhamdani@himti.org (ADMIN)"
echo "   - gilang@himti.org (MEMBER)"
echo "   - admin@bem.org (OWNER)"
echo ""
echo "📁 Divisions: 5"
echo "   - Divisi IPTEK (HIMTI)"
echo "   - Divisi Humas (HIMTI)"
echo "   - Divisi Kewirausahaan (HIMTI)"
echo "   - Departemen Sosmas (BEM)"
echo "   - Departemen Akademik (BEM)"
echo ""
echo "✅ Tasks: 3"
echo "📅 Events: 3"
echo "💰 Transactions: 6"
echo ""
echo "===================================="
echo "🔐 Login Credentials:"
echo "===================================="
echo ""
echo "All passwords: password123"
echo ""
echo "HIMTI UNPAB:"
echo "  - sajudin@himti.org"
echo "  - zulhamdani@himti.org"
echo "  - gilang@himti.org"
echo ""
echo "BEM Universitas:"
echo "  - admin@bem.org"
echo ""
echo "===================================="
echo "⚡ Next Steps:"
echo "===================================="
echo ""
echo "1. Restart backend server (if running)"
echo "2. Clear browser cookies or use Incognito mode"
echo "3. Login with any account above"
echo ""
