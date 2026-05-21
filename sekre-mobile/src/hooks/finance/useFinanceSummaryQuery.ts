import { useQuery } from '@tanstack/react-query';
import { GetFinanceSummaryUseCase } from '@core/usecases/finance/GetFinanceSummaryUseCase';
import { getFinanceRepository } from '@di/container';
import type { FinanceSummary } from '@core/domain/entities/Transaction';
import type { SummaryFilter } from '@core/ports/IFinanceRepository';

export const FINANCE_SUMMARY_QUERY_KEY = 'finance-summary';

export const useFinanceSummaryQuery = (filter?: SummaryFilter) => {
  return useQuery<FinanceSummary, Error>({
    queryKey: [FINANCE_SUMMARY_QUERY_KEY, filter],
    queryFn: () => {
      const useCase = new GetFinanceSummaryUseCase(getFinanceRepository());
      return useCase.execute(filter);
    },
  });
};
