-- Migration: 005_invitations
-- Description: Create invitations table
-- Created: 2026-05-14

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
