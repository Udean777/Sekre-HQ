import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { GetTransactionByIdUseCase } from '@core/usecases/finance/GetTransactionByIdUseCase';
import { getFinanceRepository } from '@di/container';
import type { Transaction, TransactionId } from '@core/domain/entities/Transaction';

export const TRANSACTION_QUERY_KEY = 'transaction';

export const useTransactionQuery = (id: TransactionId): UseQueryResult<Transaction, Error> => {
  return useQuery<Transaction, Error>({
    queryKey: [TRANSACTION_QUERY_KEY, id],
    queryFn: () => {
      const useCase = new GetTransactionByIdUseCase(getFinanceRepository());
      return useCase.execute(id);
    },
    enabled: !!id,
  });
};
