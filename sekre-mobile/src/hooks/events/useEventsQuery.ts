import { useQuery } from '@tanstack/react-query';
import { GetEventsUseCase } from '@core/usecases/events/GetEventsUseCase';
import { getEventRepository } from '@di/container';
import type { EventFilter, EventListResult } from '@core/domain/entities/Event';

export const EVENTS_QUERY_KEY = 'events';

export const useEventsQuery = (filter?: EventFilter) => {
  return useQuery<EventListResult, Error>({
    queryKey: [EVENTS_QUERY_KEY, filter],
    queryFn: () => {
      const useCase = new GetEventsUseCase(getEventRepository());
      return useCase.execute(filter);
    },
  });
};
