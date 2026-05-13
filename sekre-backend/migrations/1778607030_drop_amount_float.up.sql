-- Drop deprecated amount column from transactions table
-- The amount_cents column (added in previous migration) is now the single source of truth

-- Remove comment from amount column (if exists)
COMMENT ON COLUMN transactions.amount IS NULL;

-- Drop the deprecated amount column
ALTER TABLE transactions DROP COLUMN amount;

-- Remove the now-obsolete default from currency column (it's now always set)
-- Keep NOT NULL constraint
