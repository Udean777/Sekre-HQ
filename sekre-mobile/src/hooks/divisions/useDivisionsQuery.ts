import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { GetDivisionsUseCase } from '@core/usecases/divisions/GetDivisionsUseCase';
import { getDivisionRepository } from '@di/container';
import type { DivisionFilter, DivisionPage } from '@core/domain/entities/Division';

export const DIVISIONS_QUERY_KEY = 'divisions';

export const useDivisionsQuery = (
  filter?: DivisionFilter,
): UseQueryResult<DivisionPage, Error> => {
  return useQuery<DivisionPage, Error>({
    queryKey: [DIVISIONS_QUERY_KEY, filter],
    queryFn: () => {
      const useCase = new GetDivisionsUseCase(getDivisionRepository());
      return useCase.execute(filter);
    },
  });
};
