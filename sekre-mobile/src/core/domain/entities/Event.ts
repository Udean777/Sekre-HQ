// Branded types untuk type safety
export type EventId = string & { __brand: 'EventId' };

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'DONE';

export interface Event {
  id: EventId;
  title: string;
  description: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventFilter {
  search?: string;
  page?: number;
  limit?: number;
}

export interface EventListResult {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
