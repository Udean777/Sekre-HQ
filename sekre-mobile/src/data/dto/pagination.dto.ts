/**
 * PaginationMetaDTO — shape pagination dari backend Go.
 *
 * Backend response envelope:
 * {
 *   "success": true,
 *   "data": {
 *     "data": [...],          ← items
 *     "pagination": { ... }   ← meta ini
 *   }
 * }
 *
 * Backend TIDAK expose has_next_page / next_page — di-derive di mapper.
 */
export interface PaginationMetaDTO {
  readonly page: number;
  readonly page_size: number;
  readonly total_items: number;
  readonly total_pages: number;
}

export interface PaginatedDTO<T> {
  readonly data: readonly T[];
  readonly pagination: PaginationMetaDTO;
}
