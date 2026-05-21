import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateEventUseCase } from '@core/usecases/events/UpdateEventUseCase';
import { getEventRepository } from '@di/container';
import type { Event, EventId } from '@core/domain/entities/Event';
import type { UpdateEventParams } from '@core/ports/IEventRepository';
import { EVENTS_QUERY_KEY } from './useEventsQuery';

export const useUpdateEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Event, Error, { id: EventId; params: UpdateEventParams }>({
    mutationFn: ({ id, params }) => {
      const useCase = new UpdateEventUseCase(getEventRepository());
      return useCase.execute(id, params);
    },
    onSuccess: updatedEvent => {
      queryClient.setQueryData([EVENTS_QUERY_KEY, updatedEvent.id], updatedEvent);
      void queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
    },
  });
};
