import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { CreateEventUseCase } from '@core/usecases/events/CreateEventUseCase';
import { getEventRepository } from '@di/container';
import type { Event } from '@core/domain/entities/Event';
import type { CreateEventParams } from '@core/ports/IEventRepository';
import { EVENTS_QUERY_KEY } from './useEventsQuery';

export const useCreateEventMutation = (): UseMutationResult<Event, Error, CreateEventParams> => {
  const queryClient = useQueryClient();

  return useMutation<Event, Error, CreateEventParams>({
    mutationFn: params => {
      const useCase = new CreateEventUseCase(getEventRepository());
      return useCase.execute(params);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
    },
  });
};
