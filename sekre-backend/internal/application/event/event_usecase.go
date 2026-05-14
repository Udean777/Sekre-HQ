package event

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/types"
)

// EventUsecase defines business operations for events. Operates on entity.Event.
type EventUsecase interface {
	Create(ctx context.Context, orgID uuid.UUID, event *entity.Event) error
	GetByID(ctx context.Context, orgID, id uuid.UUID) (*entity.Event, error)
	List(ctx context.Context, orgID, divisionID uuid.UUID) ([]entity.Event, error)
	ListPaginated(ctx context.Context, orgID uuid.UUID, divisionID *uuid.UUID, pagination types.PaginationParams) ([]entity.Event, int, error)
	Update(ctx context.Context, orgID, id uuid.UUID, event *entity.Event) error
	Delete(ctx context.Context, orgID, id uuid.UUID) error
}

type eventUsecase struct {
	repo repository.EventRepository
}

// NewEventUsecase returns a new event usecase backed by the given repository.
func NewEventUsecase(repo repository.EventRepository) EventUsecase {
	return &eventUsecase{repo: repo}
}

func (u *eventUsecase) Create(ctx context.Context, orgID uuid.UUID, event *entity.Event) error {
	if event.EndTime.Before(event.StartTime) || event.EndTime.Equal(event.StartTime) {
		return domainerrors.ErrInvalidTimeRange
	}
	if event.Title == "" {
		return domainerrors.ErrRequired
	}

	event.ID = uuid.New()
	event.OrganizationID = orgID
	now := time.Now()
	event.CreatedAt = now
	event.UpdatedAt = now

	return u.repo.Create(ctx, orgID, event)
}

func (u *eventUsecase) GetByID(ctx context.Context, orgID, id uuid.UUID) (*entity.Event, error) {
	return u.repo.GetByID(ctx, orgID, id)
}

func (u *eventUsecase) List(ctx context.Context, orgID, divisionID uuid.UUID) ([]entity.Event, error) {
	return u.repo.List(ctx, orgID, divisionID)
}

func (u *eventUsecase) ListPaginated(ctx context.Context, orgID uuid.UUID, divisionID *uuid.UUID, pagination types.PaginationParams) ([]entity.Event, int, error) {
	return u.repo.ListPaginated(ctx, orgID, divisionID, pagination)
}

func (u *eventUsecase) Update(ctx context.Context, orgID, id uuid.UUID, event *entity.Event) error {
	if event.EndTime.Before(event.StartTime) || event.EndTime.Equal(event.StartTime) {
		return domainerrors.ErrInvalidTimeRange
	}
	if event.Title == "" {
		return domainerrors.ErrRequired
	}

	event.ID = id
	event.OrganizationID = orgID
	event.UpdatedAt = time.Now()

	return u.repo.Update(ctx, orgID, event)
}

func (u *eventUsecase) Delete(ctx context.Context, orgID, id uuid.UUID) error {
	return u.repo.Delete(ctx, orgID, id)
}
