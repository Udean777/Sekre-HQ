-- Rollback migration 002_divisions

DROP TABLE IF EXISTS division_members CASCADE;
DROP TABLE IF EXISTS divisions CASCADE;
