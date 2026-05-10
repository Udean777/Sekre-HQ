package usecase

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/internal/task/repository"
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
	Create(ctx context.Context, orgID uuid.UUID, req *CreateTaskRequest) (*domain.TaskWithAssignee, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.TaskWithAssignee, error)
	List(ctx context.Context, orgID uuid.UUID, filters repository.TaskFilters) ([]domain.TaskWithAssignee, error)
	Update(ctx context.Context, id uuid.UUID, req *UpdateTaskRequest) (*domain.TaskWithAssignee, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status string) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type taskUsecase struct {
	repo repository.TaskRepository
}

func NewTaskUsecase(repo repository.TaskRepository) TaskUsecase {
	return &taskUsecase{repo: repo}
}

func (u *taskUsecase) Create(ctx context.Context, orgID uuid.UUID, req *CreateTaskRequest) (*domain.TaskWithAssignee, error) {
	if err := u.validateCreateRequest(req); err != nil {
		return nil, err
	}

	task := &domain.Task{
		ID:             uuid.New(),
		OrganizationID: orgID,
		DivisionID:     req.DivisionID,
		AssigneeID:     req.AssigneeID,
		Title:          strings.TrimSpace(req.Title),
		Description:    strings.TrimSpace(req.Description),
		Status:         "TODO",
		DueDate:        req.DueDate,
	}

	if err := u.repo.Create(ctx, task); err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	return u.repo.GetByID(ctx, task.ID)
}

func (u *taskUsecase) GetByID(ctx context.Context, id uuid.UUID) (*domain.TaskWithAssignee, error) {
	return u.repo.GetByID(ctx, id)
}

func (u *taskUsecase) List(ctx context.Context, orgID uuid.UUID, filters repository.TaskFilters) ([]domain.TaskWithAssignee, error) {
	return u.repo.GetByOrganization(ctx, orgID, filters)
}

func (u *taskUsecase) Update(ctx context.Context, id uuid.UUID, req *UpdateTaskRequest) (*domain.TaskWithAssignee, error) {
	if err := u.validateUpdateRequest(req); err != nil {
		return nil, err
	}

	existing, err := u.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	existing.Task.Title = strings.TrimSpace(req.Title)
	existing.Task.Description = strings.TrimSpace(req.Description)
	existing.Task.AssigneeID = req.AssigneeID
	existing.Task.DueDate = req.DueDate
	existing.Task.Status = req.Status

	if err := u.repo.Update(ctx, &existing.Task); err != nil {
		return nil, fmt.Errorf("failed to update task: %w", err)
	}

	return u.repo.GetByID(ctx, id)
}

func (u *taskUsecase) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	if !u.isValidStatus(status) {
		return fmt.Errorf("invalid status: must be TODO, IN_PROGRESS, or DONE")
	}
	return u.repo.UpdateStatus(ctx, id, status)
}

func (u *taskUsecase) Delete(ctx context.Context, id uuid.UUID) error {
	return u.repo.Delete(ctx, id)
}

func (u *taskUsecase) validateCreateRequest(req *CreateTaskRequest) error {
	if strings.TrimSpace(req.Title) == "" {
		return fmt.Errorf("task title is required")
	}
	if len(req.Title) > 500 {
		return fmt.Errorf("task title too long (max 500 characters)")
	}
	return nil
}

func (u *taskUsecase) validateUpdateRequest(req *UpdateTaskRequest) error {
	if strings.TrimSpace(req.Title) == "" {
		return fmt.Errorf("task title is required")
	}
	if len(req.Title) > 500 {
		return fmt.Errorf("task title too long (max 500 characters)")
	}
	if !u.isValidStatus(req.Status) {
		return fmt.Errorf("invalid status: must be TODO, IN_PROGRESS, or DONE")
	}
	return nil
}

func (u *taskUsecase) isValidStatus(status string) bool {
	return status == "TODO" || status == "IN_PROGRESS" || status == "DONE"
}
