import type { InfiniteData } from '@tanstack/react-query';
import type { Page, PageMeta } from '@core/domain/entities/Page';

/**
 * Flatten semua pages dari InfiniteData menjadi satu array items.
 * Dipakai di FlashList data prop.
 *
 * @example
 * const items = flattenPages(data); // Task[]
 */
export const flattenPages = <T>(data: InfiniteData<Page<T>> | undefined): readonly T[] => {
  if (!data) return [];
  return data.pages.flatMap(p => p.items);
};

/**
 * Ambil PageMeta dari halaman terakhir.
 * Dipakai untuk total count, hasNextPage, dll.
 */
export const lastPageMeta = <T>(data: InfiniteData<Page<T>> | undefined): PageMeta | undefined => {
  if (!data || data.pages.length === 0) return undefined;
  return data.pages[data.pages.length - 1]?.meta;
};
