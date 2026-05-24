/**
 * Unit tests untuk pagination mapper.
 *
 * Verifikasi:
 * 1. mapPaginationMeta memetakan field DTO ke domain dengan benar
 * 2. hasNextPage dan nextPage diderive dengan benar dari page + total_pages
 * 3. Edge cases: halaman terakhir, halaman pertama, single page
 */

import { mapPaginationMeta } from '../../src/data/mappers/pagination.mapper';
import type { PaginationMetaDTO } from '../../src/data/dto/pagination.dto';

const makeDTO = (overrides: Partial<PaginationMetaDTO> = {}): PaginationMetaDTO => ({
  page: 1,
  page_size: 20,
  total_items: 100,
  total_pages: 5,
  ...overrides,
});

describe('mapPaginationMeta', () => {
  describe('field mapping', () => {
    it('maps page correctly', () => {
      expect(mapPaginationMeta(makeDTO({ page: 3 })).page).toBe(3);
    });

    it('maps page_size to pageSize', () => {
      expect(mapPaginationMeta(makeDTO({ page_size: 50 })).pageSize).toBe(50);
    });

    it('maps total_items to total', () => {
      expect(mapPaginationMeta(makeDTO({ total_items: 250 })).total).toBe(250);
    });

    it('maps total_pages to totalPages', () => {
      expect(mapPaginationMeta(makeDTO({ total_pages: 13 })).totalPages).toBe(13);
    });
  });

  describe('hasNextPage derivation', () => {
    it('returns true when page < total_pages', () => {
      expect(mapPaginationMeta(makeDTO({ page: 1, total_pages: 5 })).hasNextPage).toBe(true);
    });

    it('returns true when page is second-to-last', () => {
      expect(mapPaginationMeta(makeDTO({ page: 4, total_pages: 5 })).hasNextPage).toBe(true);
    });

    it('returns false when page === total_pages', () => {
      expect(mapPaginationMeta(makeDTO({ page: 5, total_pages: 5 })).hasNextPage).toBe(false);
    });

    it('returns false when total_pages is 1', () => {
      expect(mapPaginationMeta(makeDTO({ page: 1, total_pages: 1 })).hasNextPage).toBe(false);
    });

    it('returns false when total_pages is 0 (empty result)', () => {
      expect(mapPaginationMeta(makeDTO({ page: 1, total_pages: 0 })).hasNextPage).toBe(false);
    });
  });

  describe('nextPage derivation', () => {
    it('returns page + 1 when hasNextPage is true', () => {
      expect(mapPaginationMeta(makeDTO({ page: 2, total_pages: 5 })).nextPage).toBe(3);
    });

    it('returns null when on last page', () => {
      expect(mapPaginationMeta(makeDTO({ page: 5, total_pages: 5 })).nextPage).toBeNull();
    });

    it('returns null when single page', () => {
      expect(mapPaginationMeta(makeDTO({ page: 1, total_pages: 1 })).nextPage).toBeNull();
    });

    it('returns 2 when on first page of multi-page result', () => {
      expect(mapPaginationMeta(makeDTO({ page: 1, total_pages: 10 })).nextPage).toBe(2);
    });
  });

  describe('full mapping', () => {
    it('maps all fields correctly for mid-page result', () => {
      const dto = makeDTO({ page: 3, page_size: 20, total_items: 100, total_pages: 5 });
      expect(mapPaginationMeta(dto)).toEqual({
        page: 3,
        pageSize: 20,
        total: 100,
        totalPages: 5,
        hasNextPage: true,
        nextPage: 4,
      });
    });

    it('maps all fields correctly for last page', () => {
      const dto = makeDTO({ page: 5, page_size: 20, total_items: 100, total_pages: 5 });
      expect(mapPaginationMeta(dto)).toEqual({
        page: 5,
        pageSize: 20,
        total: 100,
        totalPages: 5,
        hasNextPage: false,
        nextPage: null,
      });
    });
  });
});
