-- Add soft delete columns to existing tables

-- Organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_organizations_deleted_at ON organizations(deleted_at);

-- Users
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

-- Divisions (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'divisions') THEN
        ALTER TABLE divisions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
        CREATE INDEX IF NOT EXISTS idx_divisions_deleted_at ON divisions(deleted_at);
    END IF;
END $$;

-- Events (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
        ALTER TABLE events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
        CREATE INDEX IF NOT EXISTS idx_events_deleted_at ON events(deleted_at);
    END IF;
END $$;

-- Tasks (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
        CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at);
    END IF;
END $$;

-- Transactions (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
        CREATE INDEX IF NOT EXISTS idx_transactions_deleted_at ON transactions(deleted_at);
    END IF;
END $$;

-- Audit Logs (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
        CREATE INDEX IF NOT EXISTS idx_audit_logs_deleted_at ON audit_logs(deleted_at);
    END IF;
END $$;

-- Invitations (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invitations') THEN
        ALTER TABLE invitations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
        CREATE INDEX IF NOT EXISTS idx_invitations_deleted_at ON invitations(deleted_at);
    END IF;
END $$;
