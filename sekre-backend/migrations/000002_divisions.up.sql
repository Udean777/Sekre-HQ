-- Migration: 002_divisions
-- Description: Create divisions and division_members tables
-- Created: 2026-05-14

-- ============================================================================
-- DIVISIONS TABLE
-- ============================================================================
CREATE TABLE divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_divisions_organization_id ON divisions(organization_id);

-- Updated at trigger
CREATE TRIGGER update_divisions_updated_at
    BEFORE UPDATE ON divisions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DIVISION_MEMBERS TABLE
-- ============================================================================
CREATE TABLE division_members (
    division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    division_role VARCHAR(50) DEFAULT 'STAFF' CHECK (division_role IN ('HEAD', 'STAFF')),
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (division_id, user_id)
);

-- Indexes
CREATE INDEX idx_division_members_division_id ON division_members(division_id);
CREATE INDEX idx_division_members_user_id ON division_members(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on divisions
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see divisions in their organizations
CREATE POLICY divisions_isolation_policy ON divisions
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = current_setting('app.current_user_id', true)::UUID
        )
    );

-- Enable RLS on division_members
ALTER TABLE division_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see division members in their organizations
CREATE POLICY division_members_isolation_policy ON division_members
    FOR ALL
    USING (
        division_id IN (
            SELECT id 
            FROM divisions 
            WHERE organization_id IN (
                SELECT organization_id 
                FROM user_organizations 
                WHERE user_id = current_setting('app.current_user_id', true)::UUID
            )
        )
    );
