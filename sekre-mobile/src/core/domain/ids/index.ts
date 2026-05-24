/**
 * Branded ID types — centralized type-safe identifiers.
 *
 * Menggunakan `unique symbol` sebagai brand supaya setiap type benar-benar
 * opaque dan tidak bisa di-assign satu sama lain secara tidak sengaja.
 *
 * Contoh:
 *   const taskId: TaskId = 'abc' as TaskId;   // OK — di mapper boundary
 *   const memberId: MemberId = taskId;         // TS error — tidak bisa cross-assign
 *
 * Cast `as TaskId` hanya boleh di `src/data/mappers/*` — enforced via ESLint
 * `consistent-type-assertions` rule dengan override di mappers directory.
 */

declare const __taskId: unique symbol;
declare const __memberId: unique symbol;
declare const __divisionId: unique symbol;
declare const __eventId: unique symbol;
declare const __transactionId: unique symbol;
declare const __organizationId: unique symbol;
declare const __userId: unique symbol;

export type TaskId = string & { readonly [__taskId]: never };
export type MemberId = string & { readonly [__memberId]: never };
export type DivisionId = string & { readonly [__divisionId]: never };
export type EventId = string & { readonly [__eventId]: never };
export type TransactionId = string & { readonly [__transactionId]: never };
export type OrganizationId = string & { readonly [__organizationId]: never };
export type UserId = string & { readonly [__userId]: never };
