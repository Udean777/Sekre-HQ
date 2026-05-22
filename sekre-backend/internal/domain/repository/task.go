package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
)

// TaskRepository handles task persistence
type TaskRepository interface {
	Create(ctx context.Context, orgID uuid.UUID, task *entity.Task) error
	GetByID(ctx context.Context, orgID, taskID uuid.UUID) (*entity.Task, error)
	GetByIDWithAssignee(ctx context.Context, orgID, taskID uuid.UUID) (*entity.TaskWithAssignee, error)
	List(ctx context.Context, orgID, divisionID uuid.UUID) ([]entity.Task, error)
	ListWithAssignee(ctx context.Context, orgID, divisionID uuid.UUID) ([]entity.TaskWithAssignee, error)
	ListFiltered(ctx context.Context, orgID uuid.UUID, filters entity.TaskFilters) ([]entity.TaskWithAssignee, error)
	ListFilteredPaginated(ctx context.Context, orgID uuid.UUID, filters entity.TaskFilters, pagination types.PaginationParams) ([]entity.TaskWithAssignee, int, error)
	Update(ctx context.Context, orgID uuid.UUID, task *entity.Task) error
	UpdateStatus(ctx context.Context, orgID, taskID uuid.UUID, status string) error
	Delete(ctx context.Context, orgID, taskID uuid.UUID) error
	CountActiveByDivision(ctx context.Context, orgID, divisionID uuid.UUID) (int64, error)
}
