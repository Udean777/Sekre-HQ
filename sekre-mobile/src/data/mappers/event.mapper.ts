import type { Event, EventId, EventListResult } from '@core/domain/entities/Event';
import type { EventDTO, EventListResponseDTO } from '@data/dto/event.dto';

export const mapEventDTOToEntity = (dto: EventDTO): Event => ({
  id: dto.id as EventId,
  title: dto.title,
  description: dto.description,
  location: dto.location,
  startDate: new Date(dto.start_date),
  endDate: dto.end_date ? new Date(dto.end_date) : null,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});

export const mapEventListDTOToResult = (dto: EventListResponseDTO): EventListResult => ({
  events: dto.events.map(mapEventDTOToEntity),
  total: dto.total,
  page: dto.page,
  limit: dto.limit,
  totalPages: dto.total_pages,
});
