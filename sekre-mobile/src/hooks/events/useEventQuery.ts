import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { GetEventByIdUseCase } from '@core/usecases/events/GetEventByIdUseCase';
import { getEventRepository } from '@di/container';
import type { Event, EventId } from '@core/domain/entities/Event';
import { EVENTS_QUERY_KEY } from './useEventsQuery';

export const useEventQuery = (id: EventId): UseQueryResult<Event, Error> => {
  return useQuery<Event, Error>({
    queryKey: [EVENTS_QUERY_KEY, id],
    queryFn: () => {
      const useCase = new GetEventByIdUseCase(getEventRepository());
      return useCase.execute(id);
    },
    enabled: !!id,
  });
};
