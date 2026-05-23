import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { DeleteEventUseCase } from '@core/usecases/events/DeleteEventUseCase';
import { getEventRepository } from '@di/container';
import type { EventId } from '@core/domain/entities/Event';
import { EVENTS_QUERY_KEY } from './useEventsQuery';

export const useDeleteEventMutation = (): UseMutationResult<void, Error, EventId> => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, EventId>({
    mutationFn: id => {
      const useCase = new DeleteEventUseCase(getEventRepository());
      return useCase.execute(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
    },
  });
};
