import type { Page } from './Page';
import type { EventId } from '@core/domain/ids';

export type { EventId };

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
  pageSize?: number;
}

export type EventPage = Page<Event>;
