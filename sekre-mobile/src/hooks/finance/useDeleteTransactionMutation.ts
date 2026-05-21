import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteTransactionUseCase } from '@core/usecases/finance/DeleteTransactionUseCase';
import { getFinanceRepository } from '@di/container';
import type { TransactionId } from '@core/domain/entities/Transaction';
import { TRANSACTIONS_QUERY_KEY } from './useTransactionsQuery';
import { FINANCE_SUMMARY_QUERY_KEY } from './useFinanceSummaryQuery';

export const useDeleteTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, TransactionId>({
    mutationFn: id => {
      const useCase = new DeleteTransactionUseCase(getFinanceRepository());
      return useCase.execute(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [FINANCE_SUMMARY_QUERY_KEY] });
    },
  });
};
