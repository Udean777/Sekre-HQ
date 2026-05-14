package task

import (
	"context"
	"fmt"
	"strings"
	"time"

	domainerrors "github.com/username/sekre-backend/internal/domain/errors"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/types"
)

type CreateTaskRequest struct {
	DivisionID  uuid.UUID  `json:"division_id"`
	AssigneeID  *uuid.UUID `json:"assignee_id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	DueDate     *time.Time `json:"due_date"`
}

type UpdateTaskRequest struct {
	Title       string     `json:"title"`
	Description string     `json:"description"`
	AssigneeID  *uuid.UUID `json:"assignee_id"`
	DueDate     *time.Time `json:"due_date"`
	Status      string     `json:"status"`
}

type TaskUsecase interface {
	Create(ctx context.Context, orgID uuid.UUID, req *CreateTaskRequest) (*entity.TaskWithAssignee, error)
	GetByID(ctx context.Context, orgID, id uuid.UUID) (*entity.TaskWithAssignee, error)
	List(ctx context.Context, orgID uuid.UUID, filters entity.TaskFilters) ([]entity.TaskWithAssignee, error)
	ListPaginated(ctx context.Context, orgID uuid.UUID, filters entity.TaskFilters, pagination types.PaginationParams) ([]entity.TaskWithAssignee, int, error)
	Update(ctx context.Context, orgID, id uuid.UUID, req *UpdateTaskRequest) (*entity.TaskWithAssignee, error)
	UpdateStatus(ctx context.Context, orgID, id uuid.UUID, status string) error
	Delete(ctx context.Context, orgID, id uuid.UUID) error
}

type taskUsecase struct {
	repo        repository.TaskRepository
	divisionRepo repository.DivisionRepository
}

func NewTaskUsecase(repo repository.TaskRepository, divisionRepo repository.DivisionRepository) TaskUsecase {
	return &taskUsecase{repo: repo, divisionRepo: divisionRepo}
}

func (u *taskUsecase) Create(ctx context.Context, orgID uuid.UUID, req *CreateTaskRequest) (*entity.TaskWithAssignee, error) {
	if err := u.validateCreateRequest(req); err != nil {
		return nil, err
	}

	task := &entity.Task{
		ID:             uuid.New(),
		OrganizationID: orgID,
		DivisionID:     req.DivisionID,
		AssigneeID:     req.AssigneeID,
		Title:          strings.TrimSpace(req.Title),
		Description:    strings.TrimSpace(req.Description),
		Status:         types.TaskStatusTodo,
		DueDate:        req.DueDate,
	}

	if req.AssigneeID != nil {
		if u.divisionRepo == nil {
			return nil, domainerrors.Internal("validate assignee membership", fmt.Errorf("division repository is not configured"))
		}
		isMember, err := u.divisionRepo.IsUserMemberOfDivision(ctx, orgID, req.DivisionID, *req.AssigneeID)
		if err != nil {
			return nil, err
		}
		if !isMember {
			return nil, domainerrors.InvalidInput("assignee_id", "assignee must be a member of the task division")
		}
	}

	if err := u.repo.Create(ctx, orgID, task); err != nil {
		return nil, domainerrors.Internal("create task", err)
	}

	created, err := u.repo.GetByID(ctx, orgID, task.ID)
	if err != nil {
		return nil, err
	}
	return &entity.TaskWithAssignee{Task: *created}, nil
}

func (u *taskUsecase) GetByID(ctx context.Context, orgID, id uuid.UUID) (*entity.TaskWithAssignee, error) {
	task, err := u.repo.GetByID(ctx, orgID, id)
	if err != nil {
		return nil, err
	}
	return &entity.TaskWithAssignee{Task: *task}, nil
}

func (u *taskUsecase) List(ctx context.Context, orgID uuid.UUID, filters entity.TaskFilters) ([]entity.TaskWithAssignee, error) {
	return u.repo.ListFiltered(ctx, orgID, filters)
}

func (u *taskUsecase) ListPaginated(ctx context.Context, orgID uuid.UUID, filters entity.TaskFilters, pagination types.PaginationParams) ([]entity.TaskWithAssignee, int, error) {
	return u.repo.ListFilteredPaginated(ctx, orgID, filters, pagination)
}

func (u *taskUsecase) Update(ctx context.Context, orgID, id uuid.UUID, req *UpdateTaskRequest) (*entity.TaskWithAssignee, error) {
	status, err := u.validateUpdateRequest(req)
	if err != nil {
		return nil, err
	}

	existing, err := u.repo.GetByID(ctx, orgID, id)
	if err != nil {
		return nil, err
	}

	existing.Title = strings.TrimSpace(req.Title)
	existing.Description = strings.TrimSpace(req.Description)
	existing.AssigneeID = req.AssigneeID
	existing.DueDate = req.DueDate
	existing.Status = status

	if req.AssigneeID != nil {
		if u.divisionRepo == nil {
			return nil, domainerrors.Internal("validate assignee membership", fmt.Errorf("division repository is not configured"))
		}
		isMember, err := u.divisionRepo.IsUserMemberOfDivision(ctx, orgID, existing.DivisionID, *req.AssigneeID)
		if err != nil {
			return nil, err
		}
		if !isMember {
			return nil, domainerrors.InvalidInput("assignee_id", "assignee must be a member of the task division")
		}
	}

	if err := u.repo.Update(ctx, orgID, existing); err != nil {
		return nil, domainerrors.Internal("update task", err)
	}

	updated, err := u.repo.GetByID(ctx, orgID, id)
	if err != nil {
		return nil, err
	}
	return &entity.TaskWithAssignee{Task: *updated}, nil
}

func (u *taskUsecase) UpdateStatus(ctx context.Context, orgID, id uuid.UUID, status string) error {
	parsed := types.TaskStatus(status)
	if err := parsed.Validate(); err != nil {
		return domainerrors.InvalidInput("status", err.Error())
	}
	return u.repo.UpdateStatus(ctx, orgID, id, string(parsed))
}

func (u *taskUsecase) Delete(ctx context.Context, orgID, id uuid.UUID) error {
	return u.repo.Delete(ctx, orgID, id)
}

func (u *taskUsecase) validateCreateRequest(req *CreateTaskRequest) error {
	if strings.TrimSpace(req.Title) == "" {
		return domainerrors.InvalidInput("task title", "is required")
	}
	if len(req.Title) > 500 {
		return domainerrors.InvalidInput("task title", "too long (max 500 characters)")
	}
	return nil
}

// validateUpdateRequest validates an UpdateTaskRequest and returns the parsed
// typed status so callers avoid a second conversion.
func (u *taskUsecase) validateUpdateRequest(req *UpdateTaskRequest) (types.TaskStatus, error) {
	if strings.TrimSpace(req.Title) == "" {
		return "", fmt.Errorf("task title is required")
	}
	if len(req.Title) > 500 {
		return "", fmt.Errorf("task title too long (max 500 characters)")
	}
	status := types.TaskStatus(req.Status)
	if err := status.Validate(); err != nil {
		return "", fmt.Errorf("invalid status: %w", err)
	}
	return status, nil
}
