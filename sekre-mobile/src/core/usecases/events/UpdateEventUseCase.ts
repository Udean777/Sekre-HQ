import type { IEventRepository, UpdateEventParams } from '@core/ports/IEventRepository';
import type { Event, EventId } from '@core/domain/entities/Event';

export class UpdateEventUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(id: EventId, params: UpdateEventParams): Promise<Event> {
    return this.eventRepository.updateEvent(id, params);
  }
}
