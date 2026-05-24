/**
 * Page<T> — generic paginated result type untuk semua list endpoint.
 *
 * Dipakai di seluruh stack: core/ports, core/usecases, data/repositories,
 * hooks, dan screens. Menggantikan *ListResult types yang tidak konsisten.
 *
 * `hasNextPage` dan `nextPage` di-derive di mapper layer dari
 * `page < totalPages` — backend tidak expose field ini secara eksplisit.
 */

export interface PageMeta {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly nextPage: number | null;
}

export interface Page<T> {
  readonly items: readonly T[];
  readonly meta: PageMeta;
}
