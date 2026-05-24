import { useInfiniteQuery, type UseInfiniteQueryResult, type InfiniteData } from '@tanstack/react-query';
import { GetTransactionsUseCase } from '@core/usecases/finance/GetTransactionsUseCase';
import { getFinanceRepository } from '@di/container';
import type { TransactionFilter, TransactionPage } from '@core/domain/entities/Transaction';

export const TRANSACTIONS_QUERY_KEY = 'transactions';

export const useTransactionsQuery = (
  filter?: Omit<TransactionFilter, 'page'>,
): UseInfiniteQueryResult<InfiniteData<TransactionPage>, Error> => {
  return useInfiniteQuery<TransactionPage, Error, InfiniteData<TransactionPage>, unknown[], number>({
    queryKey: [TRANSACTIONS_QUERY_KEY, filter],
    queryFn: ({ pageParam }) => {
      const useCase = new GetTransactionsUseCase(getFinanceRepository());
      return useCase.execute({ ...filter, page: pageParam });
    },
    initialPageParam: 1,
    getNextPageParam: last => last.meta.nextPage ?? undefined,
  });
};
