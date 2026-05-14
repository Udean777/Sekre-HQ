-- Migration: Add password reset flag and audit log
-- Created: 2026-05-12

-- Add must_reset_password flag to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN DEFAULT FALSE;

-- Create audit_logs table for tracking member additions and other actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'MEMBER_ADDED', 'MEMBER_REMOVED', 'ROLE_UPDATED', etc.
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    details JSONB, -- Additional details about the action
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Add comment
COMMENT ON TABLE audit_logs IS 'Audit trail for tracking user actions in the organization';
COMMENT ON COLUMN users.must_reset_password IS 'Flag to force password reset on next login';
