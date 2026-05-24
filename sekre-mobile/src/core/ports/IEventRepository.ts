import type { Event, EventId, EventFilter, EventPage } from '@core/domain/entities/Event';

export interface CreateEventParams {
  divisionId: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string; // ISO string RFC3339
  endDate: string;   // ISO string RFC3339, required by backend
}

export interface UpdateEventParams {
  divisionId: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
}

export interface IEventRepository {
  getEvents(filter?: EventFilter): Promise<EventPage>;
  getEventById(id: EventId): Promise<Event>;
  createEvent(params: CreateEventParams): Promise<Event>;
  updateEvent(id: EventId, params: UpdateEventParams): Promise<Event>;
  deleteEvent(id: EventId): Promise<void>;
}
