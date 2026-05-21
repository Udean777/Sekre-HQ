import type { Event, EventId, EventFilter, EventListResult } from '@core/domain/entities/Event';

export interface CreateEventParams {
  title: string;
  description?: string;
  location?: string;
  startDate: string; // ISO string
  endDate?: string; // ISO string
}

export interface UpdateEventParams {
  title?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
}

export interface IEventRepository {
  getEvents(filter?: EventFilter): Promise<EventListResult>;
  getEventById(id: EventId): Promise<Event>;
  createEvent(params: CreateEventParams): Promise<Event>;
  updateEvent(id: EventId, params: UpdateEventParams): Promise<Event>;
  deleteEvent(id: EventId): Promise<void>;
}
