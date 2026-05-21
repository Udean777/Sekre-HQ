import type { IEventRepository } from '@core/ports/IEventRepository';
import type { Event, EventId } from '@core/domain/entities/Event';

export class GetEventByIdUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(id: EventId): Promise<Event> {
    return this.eventRepository.getEventById(id);
  }
}
