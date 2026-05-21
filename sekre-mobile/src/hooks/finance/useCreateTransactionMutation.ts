import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateTransactionUseCase } from '@core/usecases/finance/CreateTransactionUseCase';
import { getFinanceRepository } from '@di/container';
import type { Transaction } from '@core/domain/entities/Transaction';
import type { CreateTransactionParams } from '@core/ports/IFinanceRepository';
import { TRANSACTIONS_QUERY_KEY } from './useTransactionsQuery';
import { FINANCE_SUMMARY_QUERY_KEY } from './useFinanceSummaryQuery';

export const useCreateTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, CreateTransactionParams>({
    mutationFn: params => {
      const useCase = new CreateTransactionUseCase(getFinanceRepository());
      return useCase.execute(params);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [FINANCE_SUMMARY_QUERY_KEY] });
    },
  });
};
