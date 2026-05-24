import { useDivisionsQuery } from './useDivisionsQuery';
import { flattenPages } from '@shared/utils/infiniteQueryHelpers';
import type { DivisionId } from '@core/domain/ids';

/**
 * Resolve nama divisi dari cache divisions query.
 * Tidak trigger request baru jika data sudah ada di cache.
 */
export const useDivisionName = (divisionId: string | null): string | null => {
  const { data } = useDivisionsQuery({ pageSize: 100 });
  if (!divisionId || !data) return null;
  const items = flattenPages(data);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return items.find(d => d.id === (divisionId as DivisionId))?.name ?? null;
};
