import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { GetEventsUseCase } from '@core/usecases/events/GetEventsUseCase';
import { getEventRepository } from '@di/container';
import type { EventFilter, EventPage } from '@core/domain/entities/Event';

export const EVENTS_QUERY_KEY = 'events';

export const useEventsQuery = (filter?: EventFilter): UseQueryResult<EventPage, Error> => {
  return useQuery<EventPage, Error>({
    queryKey: [EVENTS_QUERY_KEY, filter],
    queryFn: () => {
      const useCase = new GetEventsUseCase(getEventRepository());
      return useCase.execute(filter);
    },
  });
};
