import type { IEventRepository } from '@core/ports/IEventRepository';
import type { EventPage, EventFilter } from '@core/domain/entities/Event';

export class GetEventsUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(filter?: EventFilter): Promise<EventPage> {
    return this.eventRepository.getEvents(filter);
  }
}
