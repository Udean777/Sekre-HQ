import { useDivisionsQuery } from './useDivisionsQuery';
import type { DivisionId } from '@core/domain/entities/Division';

/**
 * Resolve nama divisi dari cache divisions query.
 * Tidak trigger request baru jika data sudah ada di cache.
 */
export const useDivisionName = (divisionId: string | null): string | null => {
  const { data } = useDivisionsQuery({ limit: 100 });
  if (!divisionId || !data) return null;
  return data.divisions.find(d => d.id === (divisionId as DivisionId))?.name ?? null;
};
