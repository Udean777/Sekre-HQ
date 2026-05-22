import type { Event, EventId, EventListResult, EventStatus } from '@core/domain/entities/Event';
import type { EventDTO, EventListResponseDTO, EventResponseDTO } from '@data/dto/event.dto';

const deriveEventStatus = (startDate: Date, endDate: Date | null): EventStatus => {
  const now = new Date();
  if (now < startDate) return 'UPCOMING';
  if (endDate != null) {
    return now <= endDate ? 'ONGOING' : 'DONE';
  }
  // No endDate: ongoing on the day of startDate, done after
  const startDayEnd = new Date(startDate);
  startDayEnd.setHours(23, 59, 59, 999);
  return now <= startDayEnd ? 'ONGOING' : 'DONE';
};

export const mapEventDTOToEntity = (dto: EventDTO): Event => {
  const startDate = new Date(dto.start_time);
  const endDate = dto.end_time ? new Date(dto.end_time) : null;
  return {
    id: dto.id as EventId,
    title: dto.title,
    description: dto.description,
    location: dto.location,
    startDate,
    endDate,
    status: deriveEventStatus(startDate, endDate),
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
};

export const mapEventListDTOToResult = (dto: EventListResponseDTO): EventListResult => ({
  events: dto.data.data.map(mapEventDTOToEntity),
  total: dto.data.pagination.total_items,
  page: dto.data.pagination.page,
  limit: dto.data.pagination.page_size,
  totalPages: dto.data.pagination.total_pages,
});

export const mapEventResponseDTOToEntity = (dto: EventResponseDTO): Event =>
  mapEventDTOToEntity(dto.data);
