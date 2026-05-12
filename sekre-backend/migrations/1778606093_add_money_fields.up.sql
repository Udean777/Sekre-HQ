-- Add money fields to transactions table
-- This migration adds amount_cents (int64) and currency (varchar) columns
-- while keeping the existing amount (decimal) column for backward compatibility

-- Add new columns (nullable initially to allow existing data)
ALTER TABLE transactions 
  ADD COLUMN amount_cents BIGINT,
  ADD COLUMN currency VARCHAR(3) DEFAULT 'IDR';

-- Populate amount_cents from existing amount column
-- For IDR: multiply by 100 to convert to cents (50000.00 -> 5000000 cents)
UPDATE transactions 
SET amount_cents = ROUND(amount * 100)::BIGINT,
    currency = 'IDR' 
WHERE amount_cents IS NULL;

-- Add NOT NULL constraint after population
ALTER TABLE transactions 
  ALTER COLUMN amount_cents SET NOT NULL;

-- Add index on currency for potential multi-currency queries
CREATE INDEX idx_transactions_currency ON transactions(currency);

-- Add comment for documentation
COMMENT ON COLUMN transactions.amount IS 'Deprecated: Use amount_cents instead. Kept for backward compatibility.';
COMMENT ON COLUMN transactions.amount_cents IS 'Amount in smallest currency unit (cents/sen). For IDR: 50000 rupiah = 5000000 cents.';
COMMENT ON COLUMN transactions.currency IS 'ISO 4217 currency code (IDR, USD, etc). Default: IDR.';
