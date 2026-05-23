import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { GetTransactionsUseCase } from '@core/usecases/finance/GetTransactionsUseCase';
import { getFinanceRepository } from '@di/container';
import type { TransactionFilter, TransactionListResult } from '@core/domain/entities/Transaction';

export const TRANSACTIONS_QUERY_KEY = 'transactions';

export const useTransactionsQuery = (
  filter?: TransactionFilter,
): UseQueryResult<TransactionListResult, Error> => {
  return useQuery<TransactionListResult, Error>({
    queryKey: [TRANSACTIONS_QUERY_KEY, filter],
    queryFn: () => {
      const useCase = new GetTransactionsUseCase(getFinanceRepository());
      return useCase.execute(filter);
    },
  });
};
