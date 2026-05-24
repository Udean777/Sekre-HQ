import type { Event, EventId, EventPage, EventStatus } from '@core/domain/entities/Event';
import type { EventDTO, EventListResponseDTO, EventResponseDTO } from '@data/dto/event.dto';
import { mapPaginationMeta } from './pagination.mapper';

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

export const mapEventListDTOToPage = (dto: EventListResponseDTO): EventPage => ({
  items: dto.data.data.map(mapEventDTOToEntity),
  meta: mapPaginationMeta(dto.data.pagination),
});

export const mapEventResponseDTOToEntity = (dto: EventResponseDTO): Event =>
  mapEventDTOToEntity(dto.data);
