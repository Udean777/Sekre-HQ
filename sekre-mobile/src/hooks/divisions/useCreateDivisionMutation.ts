import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateDivisionUseCase } from '@core/usecases/divisions/CreateDivisionUseCase';
import { getDivisionRepository } from '@di/container';
import type { Division } from '@core/domain/entities/Division';
import type { CreateDivisionParams } from '@core/ports/IDivisionRepository';
import { DIVISIONS_QUERY_KEY } from './useDivisionsQuery';

export const useCreateDivisionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Division, Error, CreateDivisionParams>({
    mutationFn: params => {
      const useCase = new CreateDivisionUseCase(getDivisionRepository());
      return useCase.execute(params);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [DIVISIONS_QUERY_KEY] });
    },
  });
};
