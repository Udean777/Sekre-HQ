-- Rollback migration 000007_add_sort_order_to_tasks

DROP INDEX IF EXISTS idx_tasks_sort_order;
ALTER TABLE tasks DROP COLUMN IF EXISTS sort_order;
