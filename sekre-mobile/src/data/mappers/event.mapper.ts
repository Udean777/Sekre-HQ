import type { Event, EventId, EventListResult } from '@core/domain/entities/Event';
import type { EventDTO, EventListResponseDTO, EventResponseDTO } from '@data/dto/event.dto';

export const mapEventDTOToEntity = (dto: EventDTO): Event => ({
  id: dto.id as EventId,
  title: dto.title,
  description: dto.description,
  location: dto.location,
  startDate: new Date(dto.start_time),
  endDate: dto.end_time ? new Date(dto.end_time) : null,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});

export const mapEventListDTOToResult = (dto: EventListResponseDTO): EventListResult => ({
  events: dto.data.data.map(mapEventDTOToEntity),
  total: dto.data.pagination.total_items,
  page: dto.data.pagination.page,
  limit: dto.data.pagination.page_size,
  totalPages: dto.data.pagination.total_pages,
});

export const mapEventResponseDTOToEntity = (dto: EventResponseDTO): Event =>
  mapEventDTOToEntity(dto.data);
