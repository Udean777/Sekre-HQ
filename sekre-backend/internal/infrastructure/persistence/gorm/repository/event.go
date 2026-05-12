package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/infrastructure/persistence/gorm/mapper"
	"github.com/username/sekre-backend/internal/models"
	"gorm.io/gorm"
)

type eventRepository struct {
	db *gorm.DB
}

func NewEventRepository(db *gorm.DB) repository.EventRepository {
	return &eventRepository{db: db}
}

func (r *eventRepository) Create(ctx context.Context, orgID uuid.UUID, event *entity.Event) error {
	event.OrganizationID = orgID
	model := mapper.EventToModel(event)
	if err := dbFor(ctx, r.db).Create(model).Error; err != nil {
		return fmt.Errorf("failed to create event: %w", err)
	}
	event.CreatedAt = model.CreatedAt
	event.UpdatedAt = model.UpdatedAt
	return nil
}

func (r *eventRepository) GetByID(ctx context.Context, orgID, eventID uuid.UUID) (*entity.Event, error) {
	var model models.Event
	err := dbFor(ctx, r.db).
		Where("id = ? AND organization_id = ?", eventID, orgID).
		First(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrEventNotFound
		}
		return nil, fmt.Errorf("failed to get event: %w", err)
	}
	return mapper.EventToEntity(&model), nil
}

func (r *eventRepository) List(ctx context.Context, orgID, divisionID uuid.UUID) ([]entity.Event, error) {
	var models []models.Event
	err := dbFor(ctx, r.db).
		Where("organization_id = ? AND division_id = ?", orgID, divisionID).
		Order("start_time DESC").
		Find(&models).Error
	if err != nil {
		return nil, fmt.Errorf("failed to list events: %w", err)
	}

	events := make([]entity.Event, len(models))
	for i, m := range models {
		events[i] = *mapper.EventToEntity(&m)
	}
	return events, nil
}

func (r *eventRepository) Update(ctx context.Context, orgID uuid.UUID, event *entity.Event) error {
	result := dbFor(ctx, r.db).
		Model(&models.Event{}).
		Where("id = ? AND organization_id = ?", event.ID, orgID).
		Updates(map[string]interface{}{
			"title":       event.Title,
			"description": event.Description,
			"start_time":  event.StartTime,
			"end_time":    event.EndTime,
			"location":    event.Location,
		})
	if result.Error != nil {
		return fmt.Errorf("failed to update event: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return domain.ErrEventNotFound
	}
	return nil
}

func (r *eventRepository) Delete(ctx context.Context, orgID, eventID uuid.UUID) error {
	result := dbFor(ctx, r.db).
		Where("id = ? AND organization_id = ?", eventID, orgID).
		Delete(&models.Event{})
	if result.Error != nil {
		return fmt.Errorf("failed to delete event: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return domain.ErrEventNotFound
	}
	return nil
}

func (r *eventRepository) CountUpcomingByDivision(ctx context.Context, orgID, divisionID uuid.UUID) (int64, error) {
	var count int64
	err := dbFor(ctx, r.db).
		Model(&models.Event{}).
		Where("organization_id = ? AND division_id = ? AND start_time > NOW()", orgID, divisionID).
		Count(&count).Error
	if err != nil {
		return 0, fmt.Errorf("failed to count upcoming events: %w", err)
	}
	return count, nil
}
