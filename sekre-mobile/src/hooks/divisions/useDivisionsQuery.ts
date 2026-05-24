import { useInfiniteQuery, type UseInfiniteQueryResult, type InfiniteData } from '@tanstack/react-query';
import { GetDivisionsUseCase } from '@core/usecases/divisions/GetDivisionsUseCase';
import { getDivisionRepository } from '@di/container';
import type { DivisionFilter, DivisionPage } from '@core/domain/entities/Division';

export const DIVISIONS_QUERY_KEY = 'divisions';

export const useDivisionsQuery = (
  filter?: Omit<DivisionFilter, 'page'>,
): UseInfiniteQueryResult<InfiniteData<DivisionPage>, Error> => {
  return useInfiniteQuery<DivisionPage, Error, InfiniteData<DivisionPage>, unknown[], number>({
    queryKey: [DIVISIONS_QUERY_KEY, filter],
    queryFn: ({ pageParam }) => {
      const useCase = new GetDivisionsUseCase(getDivisionRepository());
      return useCase.execute({ ...filter, page: pageParam });
    },
    initialPageParam: 1,
    getNextPageParam: last => last.meta.nextPage ?? undefined,
  });
};
