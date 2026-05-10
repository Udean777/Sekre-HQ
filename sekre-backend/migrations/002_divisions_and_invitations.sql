-- Migration: 002_divisions_and_invitations
-- Description: Add description to divisions, update roles, create invitations table
-- Created: 2026-05-10

-- ============================================================================
-- ADD DESCRIPTION TO DIVISIONS
-- ============================================================================
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS description TEXT;

-- ============================================================================
-- UPDATE USER_ORGANIZATIONS ROLE TO INCLUDE ADMIN
-- ============================================================================
-- Drop old constraint
ALTER TABLE user_organizations DROP CONSTRAINT IF EXISTS user_organizations_role_check;

-- Add new constraint with ADMIN
ALTER TABLE user_organizations 
  ADD CONSTRAINT user_organizations_role_check 
  CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER'));

-- ============================================================================
-- CREATE INVITATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED')),
    invited_by UUID REFERENCES users(id),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for invitations
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_org ON invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- ============================================================================
-- ROW LEVEL SECURITY FOR INVITATIONS
-- ============================================================================
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY invitations_isolation_policy ON invitations
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = current_setting('app.current_user_id', true)::UUID
        )
    );
