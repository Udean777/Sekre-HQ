import type { AxiosInstance } from 'axios';
import type {
  IEventRepository,
  CreateEventParams,
  UpdateEventParams,
} from '@core/ports/IEventRepository';
import type { Event, EventId, EventFilter, EventListResult } from '@core/domain/entities/Event';
import { ENDPOINTS } from '@data/http/endpoints';
import type {
  EventDTO,
  EventListResponseDTO,
  CreateEventRequestDTO,
  UpdateEventRequestDTO,
} from '@data/dto/event.dto';
import { mapEventDTOToEntity, mapEventListDTOToResult } from '@data/mappers/event.mapper';

export class EventRepositoryImpl implements IEventRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getEvents(filter?: EventFilter): Promise<EventListResult> {
    const params: Record<string, string | number> = {};
    if (filter?.search) params.search = filter.search;
    if (filter?.page) params.page = filter.page;
    if (filter?.limit) params.limit = filter.limit;

    const { data } = await this.http.get<EventListResponseDTO>(ENDPOINTS.EVENTS.LIST, { params });
    return mapEventListDTOToResult(data);
  }

  async getEventById(id: EventId): Promise<Event> {
    const { data } = await this.http.get<EventDTO>(ENDPOINTS.EVENTS.DETAIL(id));
    return mapEventDTOToEntity(data);
  }

  async createEvent(params: CreateEventParams): Promise<Event> {
    const payload: CreateEventRequestDTO = {
      title: params.title,
      start_date: params.startDate,
      ...(params.description !== undefined && { description: params.description }),
      ...(params.location !== undefined && { location: params.location }),
      ...(params.endDate !== undefined && { end_date: params.endDate }),
    };
    const { data } = await this.http.post<EventDTO>(ENDPOINTS.EVENTS.CREATE, payload);
    return mapEventDTOToEntity(data);
  }

  async updateEvent(id: EventId, params: UpdateEventParams): Promise<Event> {
    const payload: UpdateEventRequestDTO = {
      ...(params.title !== undefined && { title: params.title }),
      ...(params.description !== undefined && { description: params.description }),
      ...(params.location !== undefined && { location: params.location }),
      ...(params.startDate !== undefined && { start_date: params.startDate }),
      ...(params.endDate !== undefined && { end_date: params.endDate }),
    };
    const { data } = await this.http.put<EventDTO>(ENDPOINTS.EVENTS.UPDATE(id), payload);
    return mapEventDTOToEntity(data);
  }

  async deleteEvent(id: EventId): Promise<void> {
    await this.http.delete(ENDPOINTS.EVENTS.DELETE(id));
  }
}
