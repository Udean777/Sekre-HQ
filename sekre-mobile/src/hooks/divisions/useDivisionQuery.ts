import { useQuery } from '@tanstack/react-query';
import { GetDivisionByIdUseCase } from '@core/usecases/divisions/GetDivisionByIdUseCase';
import { getDivisionRepository } from '@di/container';
import type { DivisionDetail, DivisionId } from '@core/domain/entities/Division';
import { DIVISIONS_QUERY_KEY } from './useDivisionsQuery';

export const useDivisionQuery = (id: DivisionId) => {
  return useQuery<DivisionDetail, Error>({
    queryKey: [DIVISIONS_QUERY_KEY, id],
    queryFn: () => {
      const useCase = new GetDivisionByIdUseCase(getDivisionRepository());
      return useCase.execute(id);
    },
    enabled: !!id,
  });
};
