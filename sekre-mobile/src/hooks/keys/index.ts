/**
 * Typed query key factories — satu file per domain.
 *
 * Pattern:
 * - `all`     — invalidate semua query domain ini
 * - `lists`   — invalidate semua list query
 * - `list`    — query spesifik dengan filter
 * - `details` — invalidate semua detail query
 * - `detail`  — query spesifik dengan ID
 *
 * Semua key adalah `as const` supaya TypeScript bisa narrow ke literal type.
 * Ini memungkinkan `queryClient.invalidateQueries({ queryKey: taskKeys.all })`
 * bekerja dengan type-safe tanpa string literal yang bisa typo.
 */

import type { TaskFilter, TaskId } from '@core/domain/entities/Task';
import type { MemberFilter, MemberId } from '@core/domain/entities/Member';
import type { DivisionFilter, DivisionId } from '@core/domain/entities/Division';
import type { EventFilter, EventId } from '@core/domain/entities/Event';
import type { TransactionFilter, TransactionId } from '@core/domain/entities/Transaction';

// ─── Task Keys ────────────────────────────────────────────────────────────────

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filter?: Omit<TaskFilter, 'page'>) => [...taskKeys.lists(), filter] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: TaskId) => [...taskKeys.details(), id] as const,
} as const;

// ─── Member Keys ──────────────────────────────────────────────────────────────

export const memberKeys = {
  all: ['members'] as const,
  lists: () => [...memberKeys.all, 'list'] as const,
  list: (filter?: Omit<MemberFilter, 'page'>) => [...memberKeys.lists(), filter] as const,
  details: () => [...memberKeys.all, 'detail'] as const,
  detail: (id: MemberId) => [...memberKeys.details(), id] as const,
} as const;

// ─── Division Keys ────────────────────────────────────────────────────────────

export const divisionKeys = {
  all: ['divisions'] as const,
  lists: () => [...divisionKeys.all, 'list'] as const,
  list: (filter?: Omit<DivisionFilter, 'page'>) => [...divisionKeys.lists(), filter] as const,
  details: () => [...divisionKeys.all, 'detail'] as const,
  detail: (id: DivisionId) => [...divisionKeys.details(), id] as const,
} as const;

// ─── Event Keys ───────────────────────────────────────────────────────────────

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filter?: Omit<EventFilter, 'page'>) => [...eventKeys.lists(), filter] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: EventId) => [...eventKeys.details(), id] as const,
} as const;

// ─── Transaction Keys ─────────────────────────────────────────────────────────

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filter?: Omit<TransactionFilter, 'page'>) => [...transactionKeys.lists(), filter] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: TransactionId) => [...transactionKeys.details(), id] as const,
  summary: () => [...transactionKeys.all, 'summary'] as const,
} as const;

// ─── Auth Keys ────────────────────────────────────────────────────────────────

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
} as const;
