import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { RemoveDivisionMemberUseCase } from '@core/usecases/divisions/RemoveDivisionMemberUseCase';
import { getDivisionRepository } from '@di/container';
import type { DivisionId } from '@core/domain/entities/Division';
import { DIVISIONS_QUERY_KEY } from './useDivisionsQuery';

export const useRemoveDivisionMemberMutation = (): UseMutationResult<
  void,
  Error,
  { id: DivisionId; userId: string }
> => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: DivisionId; userId: string }>({
    mutationFn: ({ id, userId }) => {
      const useCase = new RemoveDivisionMemberUseCase(getDivisionRepository());
      return useCase.execute(id, userId);
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: [DIVISIONS_QUERY_KEY, id] });
    },
  });
};
