-- Rollback soft delete columns

-- Organizations
DROP INDEX IF EXISTS idx_organizations_deleted_at;
ALTER TABLE organizations DROP COLUMN IF EXISTS deleted_at;

-- Users
DROP INDEX IF EXISTS idx_users_deleted_at;
ALTER TABLE users DROP COLUMN IF EXISTS deleted_at;

-- Divisions
DROP INDEX IF EXISTS idx_divisions_deleted_at;
ALTER TABLE divisions DROP COLUMN IF EXISTS deleted_at;

-- Events
DROP INDEX IF EXISTS idx_events_deleted_at;
ALTER TABLE events DROP COLUMN IF EXISTS deleted_at;

-- Tasks
DROP INDEX IF EXISTS idx_tasks_deleted_at;
ALTER TABLE tasks DROP COLUMN IF EXISTS deleted_at;

-- Transactions
DROP INDEX IF EXISTS idx_transactions_deleted_at;
ALTER TABLE transactions DROP COLUMN IF EXISTS deleted_at;

-- Audit Logs
DROP INDEX IF EXISTS idx_audit_logs_deleted_at;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS deleted_at;

-- Invitations
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invitations') THEN
        DROP INDEX IF EXISTS idx_invitations_deleted_at;
        ALTER TABLE invitations DROP COLUMN IF EXISTS deleted_at;
    END IF;
END $$;

-- Password Resets
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'password_resets') THEN
        DROP INDEX IF EXISTS idx_password_resets_deleted_at;
        ALTER TABLE password_resets DROP COLUMN IF EXISTS deleted_at;
    END IF;
END $$;
