package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
)

// EventRepository handles event persistence
type EventRepository interface {
	Create(ctx context.Context, orgID uuid.UUID, event *entity.Event) error
	GetByID(ctx context.Context, orgID, eventID uuid.UUID) (*entity.Event, error)
	List(ctx context.Context, orgID, divisionID uuid.UUID) ([]entity.Event, error)
	ListPaginated(ctx context.Context, orgID uuid.UUID, divisionID *uuid.UUID, pagination types.PaginationParams) ([]entity.Event, int, error)
	ListPaginatedFiltered(ctx context.Context, orgID uuid.UUID, divisionID *uuid.UUID, search *string, pagination types.PaginationParams) ([]entity.Event, int, error)
	Update(ctx context.Context, orgID uuid.UUID, event *entity.Event) error
	Delete(ctx context.Context, orgID, eventID uuid.UUID) error
	CountUpcomingByDivision(ctx context.Context, orgID, divisionID uuid.UUID) (int64, error)
}
