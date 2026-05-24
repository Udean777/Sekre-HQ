import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { GetTransactionsUseCase } from '@core/usecases/finance/GetTransactionsUseCase';
import { getFinanceRepository } from '@di/container';
import type { TransactionFilter, TransactionPage } from '@core/domain/entities/Transaction';

export const TRANSACTIONS_QUERY_KEY = 'transactions';

export const useTransactionsQuery = (
  filter?: TransactionFilter,
): UseQueryResult<TransactionPage, Error> => {
  return useQuery<TransactionPage, Error>({
    queryKey: [TRANSACTIONS_QUERY_KEY, filter],
    queryFn: () => {
      const useCase = new GetTransactionsUseCase(getFinanceRepository());
      return useCase.execute(filter);
    },
  });
};
