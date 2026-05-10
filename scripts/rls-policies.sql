-- Row-Level Security (RLS) Policies for Multi-Tenant Isolation
-- This ensures data isolation between organizations automatically at database level

-- Enable Row-Level Security on all tenant-scoped tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create function to get current organization_id from JWT context
-- This will be set by the application using SET LOCAL
CREATE OR REPLACE FUNCTION current_organization_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_organization_id', TRUE), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get current user_id from JWT context
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ==================== ORGANIZATIONS ====================
-- Users can only see organizations they are members of
CREATE POLICY organizations_select_policy ON organizations
    FOR SELECT
    USING (
        id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = current_user_id()
        )
    );

-- Only organization owners can update organization details
CREATE POLICY organizations_update_policy ON organizations
    FOR UPDATE
    USING (
        id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = current_user_id() 
            AND role = 'OWNER'
        )
    );

-- ==================== DIVISIONS ====================
-- Users can only see divisions in their organization
CREATE POLICY divisions_select_policy ON divisions
    FOR SELECT
    USING (organization_id = current_organization_id());

-- Only admins and owners can create divisions
CREATE POLICY divisions_insert_policy ON divisions
    FOR INSERT
    WITH CHECK (
        organization_id = current_organization_id()
        AND current_user_id() IN (
            SELECT user_id 
            FROM organization_members 
            WHERE organization_id = divisions.organization_id 
            AND role IN ('OWNER', 'ADMIN')
        )
    );

-- Only admins and owners can update divisions
CREATE POLICY divisions_update_policy ON divisions
    FOR UPDATE
    USING (
        organization_id = current_organization_id()
        AND current_user_id() IN (
            SELECT user_id 
            FROM organization_members 
            WHERE organization_id = divisions.organization_id 
            AND role IN ('OWNER', 'ADMIN')
        )
    );

-- Only admins and owners can delete divisions
CREATE POLICY divisions_delete_policy ON divisions
    FOR DELETE
    USING (
        organization_id = current_organization_id()
        AND current_user_id() IN (
            SELECT user_id 
            FROM organization_members 
            WHERE organization_id = divisions.organization_id 
            AND role IN ('OWNER', 'ADMIN')
        )
    );

-- ==================== TASKS ====================
-- Users can only see tasks in their organization
CREATE POLICY tasks_select_policy ON tasks
    FOR SELECT
    USING (organization_id = current_organization_id());

-- Division members can create tasks
CREATE POLICY tasks_insert_policy ON tasks
    FOR INSERT
    WITH CHECK (
        organization_id = current_organization_id()
        AND division_id IN (
            SELECT division_id 
            FROM division_members 
            WHERE user_id = current_user_id()
        )
    );

-- Task assignee or division head can update tasks
CREATE POLICY tasks_update_policy ON tasks
    FOR UPDATE
    USING (
        organization_id = current_organization_id()
        AND (
            assignee_id = current_user_id()
            OR division_id IN (
                SELECT division_id 
                FROM division_members 
                WHERE user_id = current_user_id() 
                AND division_role = 'HEAD'
            )
        )
    );

-- Division head can delete tasks
CREATE POLICY tasks_delete_policy ON tasks
    FOR DELETE
    USING (
        organization_id = current_organization_id()
        AND division_id IN (
            SELECT division_id 
            FROM division_members 
            WHERE user_id = current_user_id() 
            AND division_role = 'HEAD'
        )
    );

-- ==================== EVENTS ====================
-- Users can only see events in their organization
CREATE POLICY events_select_policy ON events
    FOR SELECT
    USING (organization_id = current_organization_id());

-- Division members can create events
CREATE POLICY events_insert_policy ON events
    FOR INSERT
    WITH CHECK (
        organization_id = current_organization_id()
        AND division_id IN (
            SELECT division_id 
            FROM division_members 
            WHERE user_id = current_user_id()
        )
    );

-- Division members can update events
CREATE POLICY events_update_policy ON events
    FOR UPDATE
    USING (
        organization_id = current_organization_id()
        AND division_id IN (
            SELECT division_id 
            FROM division_members 
            WHERE user_id = current_user_id()
        )
    );

-- Division head can delete events
CREATE POLICY events_delete_policy ON events
    FOR DELETE
    USING (
        organization_id = current_organization_id()
        AND division_id IN (
            SELECT division_id 
            FROM division_members 
            WHERE user_id = current_user_id() 
            AND division_role = 'HEAD'
        )
    );

-- ==================== TRANSACTIONS ====================
-- Users can only see transactions in their organization
CREATE POLICY transactions_select_policy ON transactions
    FOR SELECT
    USING (organization_id = current_organization_id());

-- Division members can create transactions
CREATE POLICY transactions_insert_policy ON transactions
    FOR INSERT
    WITH CHECK (
        organization_id = current_organization_id()
        AND division_id IN (
            SELECT division_id 
            FROM division_members 
            WHERE user_id = current_user_id()
        )
        AND requested_by = current_user_id()
    );

-- Transaction creator can update their own pending transactions
CREATE POLICY transactions_update_policy ON transactions
    FOR UPDATE
    USING (
        organization_id = current_organization_id()
        AND requested_by = current_user_id()
        AND status = 'PENDING'
    );

-- Only division head can delete transactions
CREATE POLICY transactions_delete_policy ON transactions
    FOR DELETE
    USING (
        organization_id = current_organization_id()
        AND division_id IN (
            SELECT division_id 
            FROM division_members 
            WHERE user_id = current_user_id() 
            AND division_role = 'HEAD'
        )
    );

-- ==================== ORGANIZATION_MEMBERS ====================
-- Users can see members of their organizations
CREATE POLICY organization_members_select_policy ON organization_members
    FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = current_user_id()
        )
    );

-- Only owners and admins can add members
CREATE POLICY organization_members_insert_policy ON organization_members
    FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = current_user_id() 
            AND role IN ('OWNER', 'ADMIN')
        )
    );

-- Only owners and admins can remove members
CREATE POLICY organization_members_delete_policy ON organization_members
    FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = current_user_id() 
            AND role IN ('OWNER', 'ADMIN')
        )
    );

-- ==================== DIVISION_MEMBERS ====================
-- Users can see division members in their organization
CREATE POLICY division_members_select_policy ON division_members
    FOR SELECT
    USING (
        division_id IN (
            SELECT id 
            FROM divisions 
            WHERE organization_id = current_organization_id()
        )
    );

-- Division heads and org admins can add division members
CREATE POLICY division_members_insert_policy ON division_members
    FOR INSERT
    WITH CHECK (
        division_id IN (
            SELECT d.id 
            FROM divisions d
            WHERE d.organization_id = current_organization_id()
            AND (
                -- Division head
                d.id IN (
                    SELECT division_id 
                    FROM division_members 
                    WHERE user_id = current_user_id() 
                    AND division_role = 'HEAD'
                )
                -- Or org admin/owner
                OR current_user_id() IN (
                    SELECT user_id 
                    FROM organization_members 
                    WHERE organization_id = d.organization_id 
                    AND role IN ('OWNER', 'ADMIN')
                )
            )
        )
    );

-- Division heads and org admins can remove division members
CREATE POLICY division_members_delete_policy ON division_members
    FOR DELETE
    USING (
        division_id IN (
            SELECT d.id 
            FROM divisions d
            WHERE d.organization_id = current_organization_id()
            AND (
                d.id IN (
                    SELECT division_id 
                    FROM division_members 
                    WHERE user_id = current_user_id() 
                    AND division_role = 'HEAD'
                )
                OR current_user_id() IN (
                    SELECT user_id 
                    FROM organization_members 
                    WHERE organization_id = d.organization_id 
                    AND role IN ('OWNER', 'ADMIN')
                )
            )
        )
    );

-- Enable RLS on pivot tables
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE division_members ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to application user
-- Note: In production, create a dedicated application role
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sekre_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sekre_user;

-- Create helper function to set session context (to be called by application)
CREATE OR REPLACE FUNCTION set_session_context(org_id UUID, usr_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_organization_id', org_id::text, false);
    PERFORM set_config('app.current_user_id', usr_id::text, false);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION set_session_context IS 'Set session context for RLS policies. Call this after JWT validation in application.';
COMMENT ON FUNCTION current_organization_id IS 'Get current organization_id from session context for RLS policies.';
COMMENT ON FUNCTION current_user_id IS 'Get current user_id from session context for RLS policies.';
