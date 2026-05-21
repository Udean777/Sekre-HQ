import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateDivisionUseCase } from '@core/usecases/divisions/UpdateDivisionUseCase';
import { getDivisionRepository } from '@di/container';
import type { Division, DivisionId } from '@core/domain/entities/Division';
import type { UpdateDivisionParams } from '@core/ports/IDivisionRepository';
import { DIVISIONS_QUERY_KEY } from './useDivisionsQuery';

export const useUpdateDivisionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Division, Error, { id: DivisionId; params: UpdateDivisionParams }>({
    mutationFn: ({ id, params }) => {
      const useCase = new UpdateDivisionUseCase(getDivisionRepository());
      return useCase.execute(id, params);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [DIVISIONS_QUERY_KEY] });
    },
  });
};
