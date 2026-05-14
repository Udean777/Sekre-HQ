-- Rollback migration 004_events_and_transactions

DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS events CASCADE;
