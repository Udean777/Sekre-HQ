import type { PageMeta } from '@core/domain/entities/Page';
import type { PaginationMetaDTO } from '@data/dto/pagination.dto';

/**
 * mapPaginationMeta — konversi PaginationMetaDTO → PageMeta.
 *
 * `hasNextPage` dan `nextPage` di-derive dari `page < total_pages`
 * karena backend tidak expose field ini secara eksplisit.
 */
export const mapPaginationMeta = (dto: PaginationMetaDTO): PageMeta => ({
  page: dto.page,
  pageSize: dto.page_size,
  total: dto.total_items,
  totalPages: dto.total_pages,
  hasNextPage: dto.page < dto.total_pages,
  nextPage: dto.page < dto.total_pages ? dto.page + 1 : null,
});
