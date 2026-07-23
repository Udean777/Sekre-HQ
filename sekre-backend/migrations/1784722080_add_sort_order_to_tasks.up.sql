-- Migration: 000007_add_sort_order_to_tasks
-- Description: Add sort_order column to tasks table for drag-and-drop reordering
-- Created: 2026-07-22

ALTER TABLE tasks ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- Index for efficient ordering queries
CREATE INDEX idx_tasks_sort_order ON tasks(sort_order);
