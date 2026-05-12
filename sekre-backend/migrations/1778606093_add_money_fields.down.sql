-- Rollback money fields migration
-- This removes the amount_cents and currency columns

-- Drop index
DROP INDEX IF EXISTS idx_transactions_currency;

-- Drop new columns
ALTER TABLE transactions 
  DROP COLUMN IF EXISTS amount_cents,
  DROP COLUMN IF EXISTS currency;

-- Remove comments
COMMENT ON COLUMN transactions.amount IS NULL;
