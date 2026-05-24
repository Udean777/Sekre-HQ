/**
 * Unit tests untuk branded ID types.
 *
 * Tujuan:
 * 1. Verifikasi branded IDs tidak bisa di-cross-assign satu sama lain
 *    (ini sebenarnya compile-time check, tapi kita test runtime behavior)
 * 2. Verifikasi nilai string tetap accessible setelah di-brand
 * 3. Verifikasi mapper boundary cast menghasilkan nilai yang benar
 */

import type {
  TaskId,
  MemberId,
  DivisionId,
  EventId,
  TransactionId,
  OrganizationId,
  UserId,
} from '../../src/core/domain/ids';

// Helper untuk simulate mapper boundary cast
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const asTaskId = (id: string): TaskId => id as TaskId;
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const asMemberId = (id: string): MemberId => id as MemberId;
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const asDivisionId = (id: string): DivisionId => id as DivisionId;
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const asEventId = (id: string): EventId => id as EventId;
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const asTransactionId = (id: string): TransactionId => id as TransactionId;
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const asOrganizationId = (id: string): OrganizationId => id as OrganizationId;
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const asUserId = (id: string): UserId => id as UserId;

describe('Branded ID types', () => {
  describe('runtime value preservation', () => {
    it('TaskId preserves string value', () => {
      const raw = 'task-123';
      const id = asTaskId(raw);
      expect(id).toBe(raw);
      expect(typeof id).toBe('string');
    });

    it('MemberId preserves string value', () => {
      const raw = 'member-456';
      const id = asMemberId(raw);
      expect(id).toBe(raw);
      expect(typeof id).toBe('string');
    });

    it('DivisionId preserves string value', () => {
      const raw = 'division-789';
      const id = asDivisionId(raw);
      expect(id).toBe(raw);
      expect(typeof id).toBe('string');
    });

    it('EventId preserves string value', () => {
      const raw = 'event-abc';
      const id = asEventId(raw);
      expect(id).toBe(raw);
      expect(typeof id).toBe('string');
    });

    it('TransactionId preserves string value', () => {
      const raw = 'txn-def';
      const id = asTransactionId(raw);
      expect(id).toBe(raw);
      expect(typeof id).toBe('string');
    });

    it('OrganizationId preserves string value', () => {
      const raw = 'org-ghi';
      const id = asOrganizationId(raw);
      expect(id).toBe(raw);
      expect(typeof id).toBe('string');
    });

    it('UserId preserves string value', () => {
      const raw = 'user-jkl';
      const id = asUserId(raw);
      expect(id).toBe(raw);
      expect(typeof id).toBe('string');
    });
  });

  describe('equality comparison', () => {
    it('same raw string produces equal branded IDs', () => {
      const raw = 'same-id';
      expect(asTaskId(raw)).toBe(asTaskId(raw));
    });

    it('different raw strings produce different branded IDs', () => {
      expect(asTaskId('id-1')).not.toBe(asTaskId('id-2'));
    });

    it('branded ID equals its raw string value', () => {
      const raw = 'raw-value';
      const branded = asTaskId(raw);
      // Runtime: branded ID is just a string
      expect(branded).toBe(raw);
    });
  });

  describe('usability as object key', () => {
    it('TaskId can be used as Record key', () => {
      const map: Record<string, number> = {};
      const id = asTaskId('task-key');
      map[id] = 42;
      expect(map[id]).toBe(42);
    });

    it('branded IDs from different types with same value are equal at runtime', () => {
      // Runtime: both are just strings — type safety is compile-time only
      const taskId = asTaskId('shared-id');
      const memberId = asMemberId('shared-id');
      expect(String(taskId)).toBe(String(memberId));
    });
  });
});
