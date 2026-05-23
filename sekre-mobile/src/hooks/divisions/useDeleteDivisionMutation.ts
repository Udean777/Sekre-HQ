import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { DeleteDivisionUseCase } from '@core/usecases/divisions/DeleteDivisionUseCase';
import { getDivisionRepository } from '@di/container';
import type { DivisionId } from '@core/domain/entities/Division';
import { DIVISIONS_QUERY_KEY } from './useDivisionsQuery';

export const useDeleteDivisionMutation = (): UseMutationResult<void, Error, DivisionId> => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DivisionId>({
    mutationFn: id => {
      const useCase = new DeleteDivisionUseCase(getDivisionRepository());
      return useCase.execute(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [DIVISIONS_QUERY_KEY] });
    },
  });
};
