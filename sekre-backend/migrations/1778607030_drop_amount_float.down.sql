-- Rollback: restore amount column from amount_cents
ALTER TABLE transactions 
  ADD COLUMN amount DECIMAL(15,2);

-- Populate from amount_cents (divide by 100 to convert back to float)
UPDATE transactions 
SET amount = amount_cents / 100.0;

-- Set NOT NULL constraint to match original schema
ALTER TABLE transactions 
  ALTER COLUMN amount SET NOT NULL;
