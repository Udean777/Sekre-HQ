import { useInfiniteQuery, type UseInfiniteQueryResult, type InfiniteData } from '@tanstack/react-query';
import { GetEventsUseCase } from '@core/usecases/events/GetEventsUseCase';
import { getEventRepository } from '@di/container';
import type { EventFilter, EventPage } from '@core/domain/entities/Event';

export const EVENTS_QUERY_KEY = 'events';

export const useEventsQuery = (
  filter?: Omit<EventFilter, 'page'>,
): UseInfiniteQueryResult<InfiniteData<EventPage>, Error> => {
  return useInfiniteQuery<EventPage, Error, InfiniteData<EventPage>, unknown[], number>({
    queryKey: [EVENTS_QUERY_KEY, filter],
    queryFn: ({ pageParam }) => {
      const useCase = new GetEventsUseCase(getEventRepository());
      return useCase.execute({ ...filter, page: pageParam });
    },
    initialPageParam: 1,
    getNextPageParam: last => last.meta.nextPage ?? undefined,
  });
};
