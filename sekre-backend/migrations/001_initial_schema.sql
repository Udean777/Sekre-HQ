-- Migration: 001_initial_schema
-- Description: Create initial tables for multi-tenant authentication
-- Created: 2026-05-10

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ORGANIZATIONS TABLE
-- ============================================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    subscription_plan VARCHAR(20) DEFAULT 'FREE' CHECK (subscription_plan IN ('FREE', 'LITE', 'PRO')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for subdomain lookup
CREATE INDEX idx_organizations_subdomain ON organizations(subdomain);

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for email lookup
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- USER_ORGANIZATIONS TABLE (Many-to-Many)
-- ============================================================================
CREATE TABLE user_organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- Indexes for lookups
CREATE INDEX idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_organization_id ON user_organizations(organization_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see organizations they belong to
CREATE POLICY organizations_isolation_policy ON organizations
    FOR ALL
    USING (
        id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = current_setting('app.current_user_id', true)::UUID
        )
    );

-- Enable RLS on user_organizations
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own organization memberships
CREATE POLICY user_organizations_isolation_policy ON user_organizations
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = current_setting('app.current_user_id', true)::UUID
        )
    );

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to organizations
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
