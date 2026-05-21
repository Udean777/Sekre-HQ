import type { IEventRepository } from '@core/ports/IEventRepository';
import type { EventId } from '@core/domain/entities/Event';

export class DeleteEventUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(id: EventId): Promise<void> {
    return this.eventRepository.deleteEvent(id);
  }
}
