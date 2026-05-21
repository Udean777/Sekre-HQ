import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateTransactionUseCase } from '@core/usecases/finance/UpdateTransactionUseCase';
import { getFinanceRepository } from '@di/container';
import type { Transaction, TransactionId } from '@core/domain/entities/Transaction';
import type { UpdateTransactionParams } from '@core/ports/IFinanceRepository';
import { TRANSACTIONS_QUERY_KEY } from './useTransactionsQuery';
import { TRANSACTION_QUERY_KEY } from './useTransactionQuery';
import { FINANCE_SUMMARY_QUERY_KEY } from './useFinanceSummaryQuery';

interface UpdateTransactionVariables {
  id: TransactionId;
  params: UpdateTransactionParams;
}

export const useUpdateTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, UpdateTransactionVariables>({
    mutationFn: ({ id, params }) => {
      const useCase = new UpdateTransactionUseCase(getFinanceRepository());
      return useCase.execute(id, params);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [TRANSACTION_QUERY_KEY, variables.id] });
      void queryClient.invalidateQueries({ queryKey: [FINANCE_SUMMARY_QUERY_KEY] });
    },
  });
};
