import type { IEventRepository, CreateEventParams } from '@core/ports/IEventRepository';
import type { Event } from '@core/domain/entities/Event';

export class CreateEventUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(params: CreateEventParams): Promise<Event> {
    return this.eventRepository.createEvent(params);
  }
}
