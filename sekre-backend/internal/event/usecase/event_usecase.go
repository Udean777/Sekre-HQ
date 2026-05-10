package usecase

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/internal/event/repository"
)

type EventUsecase struct {
	repo repository.EventRepository
}

func NewEventUsecase(repo repository.EventRepository) *EventUsecase {
	return &EventUsecase{repo: repo}
}

func (u *EventUsecase) Create(ctx context.Context, event *domain.Event) error {
	// Validate time range
	if event.EndTime.Before(event.StartTime) || event.EndTime.Equal(event.StartTime) {
		return domain.ErrInvalidTimeRange
	}

	// Validate required fields
	if event.Title == "" {
		return domain.ErrRequired
	}

	event.ID = uuid.New()
	event.CreatedAt = time.Now()
	event.UpdatedAt = time.Now()

	return u.repo.Create(ctx, event)
}

func (u *EventUsecase) GetByID(ctx context.Context, id uuid.UUID) (*domain.Event, error) {
	return u.repo.GetByID(ctx, id)
}

func (u *EventUsecase) List(ctx context.Context, orgID uuid.UUID, filters map[string]interface{}) ([]*domain.Event, error) {
	return u.repo.List(ctx, orgID, filters)
}

func (u *EventUsecase) Update(ctx context.Context, id uuid.UUID, event *domain.Event) error {
	// Validate time range
	if event.EndTime.Before(event.StartTime) || event.EndTime.Equal(event.StartTime) {
		return domain.ErrInvalidTimeRange
	}

	// Validate required fields
	if event.Title == "" {
		return domain.ErrRequired
	}

	event.ID = id
	event.UpdatedAt = time.Now()
	return u.repo.Update(ctx, event)
}

func (u *EventUsecase) Delete(ctx context.Context, id uuid.UUID) error {
	return u.repo.Delete(ctx, id)
}
