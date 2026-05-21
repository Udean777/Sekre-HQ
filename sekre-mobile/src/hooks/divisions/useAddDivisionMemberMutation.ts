import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AddDivisionMemberUseCase } from '@core/usecases/divisions/AddDivisionMemberUseCase';
import { getDivisionRepository } from '@di/container';
import type { DivisionId } from '@core/domain/entities/Division';
import type { AddDivisionMemberParams } from '@core/ports/IDivisionRepository';
import { DIVISIONS_QUERY_KEY } from './useDivisionsQuery';

export const useAddDivisionMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: DivisionId; params: AddDivisionMemberParams }>({
    mutationFn: ({ id, params }) => {
      const useCase = new AddDivisionMemberUseCase(getDivisionRepository());
      return useCase.execute(id, params);
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: [DIVISIONS_QUERY_KEY, id] });
    },
  });
};
