package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/infrastructure/persistence/gorm/mapper"
	"github.com/username/sekre-backend/internal/models"
	"gorm.io/gorm"
)

type taskRepository struct {
	db *gorm.DB
}

func NewTaskRepository(db *gorm.DB) repository.TaskRepository {
	return &taskRepository{db: db}
}

func (r *taskRepository) Create(ctx context.Context, orgID uuid.UUID, task *entity.Task) error {
	task.OrganizationID = orgID
	model := mapper.TaskToModel(task)
	if err := dbFor(ctx, r.db).Create(model).Error; err != nil {
		return domainerrors.Internal("create task", err)
	}
	task.CreatedAt = model.CreatedAt
	task.UpdatedAt = model.UpdatedAt
	return nil
}

func (r *taskRepository) GetByID(ctx context.Context, orgID, taskID uuid.UUID) (*entity.Task, error) {
	var model models.Task
	err := dbFor(ctx, r.db).
		Where("id = ? AND organization_id = ?", taskID, orgID).
		First(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domainerrors.ErrTaskNotFound
		}
		return nil, domainerrors.Internal("get task", err)
	}
	return mapper.TaskToEntity(&model), nil
}

func (r *taskRepository) List(ctx context.Context, orgID, divisionID uuid.UUID) ([]entity.Task, error) {
	var models []models.Task
	err := dbFor(ctx, r.db).
		Where("organization_id = ? AND division_id = ?", orgID, divisionID).
		Order("created_at DESC").
		Find(&models).Error
	if err != nil {
		return nil, domainerrors.Internal("list tasks", err)
	}

	tasks := make([]entity.Task, len(models))
	for i, m := range models {
		tasks[i] = *mapper.TaskToEntity(&m)
	}
	return tasks, nil
}

func (r *taskRepository) ListWithAssignee(ctx context.Context, orgID, divisionID uuid.UUID) ([]entity.TaskWithAssignee, error) {
	var rows []models.Task
	err := dbFor(ctx, r.db).
		Preload("Assignee").
		Where("organization_id = ? AND division_id = ?", orgID, divisionID).
		Order("created_at DESC").
		Find(&rows).Error
	if err != nil {
		return nil, domainerrors.Internal("list tasks with assignee", err)
	}

	tasks := make([]entity.TaskWithAssignee, len(rows))
	for i := range rows {
		tasks[i] = entity.TaskWithAssignee{
			Task:     *mapper.TaskToEntity(&rows[i]),
			Assignee: mapper.UserToEntity(rows[i].Assignee),
		}
	}
	return tasks, nil
}

func (r *taskRepository) ListFiltered(ctx context.Context, orgID uuid.UUID, filters entity.TaskFilters) ([]entity.TaskWithAssignee, error) {
	query := dbFor(ctx, r.db).
		Preload("Assignee").
		Where("organization_id = ?", orgID)

	if filters.DivisionID != nil {
		query = query.Where("division_id = ?", *filters.DivisionID)
	}
	if filters.AssigneeID != nil {
		query = query.Where("assignee_id = ?", *filters.AssigneeID)
	}
	if filters.Status != nil {
		query = query.Where("status = ?", *filters.Status)
	}

	var rows []models.Task
	if err := query.Order("created_at DESC").Find(&rows).Error; err != nil {
		return nil, domainerrors.Internal("list tasks", err)
	}

	tasks := make([]entity.TaskWithAssignee, len(rows))
	for i := range rows {
		tasks[i] = entity.TaskWithAssignee{
			Task:     *mapper.TaskToEntity(&rows[i]),
			Assignee: mapper.UserToEntity(rows[i].Assignee),
		}
	}
	return tasks, nil
}

func (r *taskRepository) ListFilteredPaginated(ctx context.Context, orgID uuid.UUID, filters entity.TaskFilters, pagination types.PaginationParams) ([]entity.TaskWithAssignee, int, error) {
	// Build base query
	baseQuery := dbFor(ctx, r.db).
		Model(&models.Task{}).
		Where("organization_id = ?", orgID)

	if filters.DivisionID != nil {
		baseQuery = baseQuery.Where("division_id = ?", *filters.DivisionID)
	}
	if filters.AssigneeID != nil {
		baseQuery = baseQuery.Where("assignee_id = ?", *filters.AssigneeID)
	}
	if filters.Status != nil {
		baseQuery = baseQuery.Where("status = ?", *filters.Status)
	}

	// Get total count
	var totalCount int64
	if err := baseQuery.Count(&totalCount).Error; err != nil {
		return nil, 0, domainerrors.Internal("count tasks", err)
	}

	// Get paginated results
	query := dbFor(ctx, r.db).
		Preload("Assignee").
		Where("organization_id = ?", orgID)

	if filters.DivisionID != nil {
		query = query.Where("division_id = ?", *filters.DivisionID)
	}
	if filters.AssigneeID != nil {
		query = query.Where("assignee_id = ?", *filters.AssigneeID)
	}
	if filters.Status != nil {
		query = query.Where("status = ?", *filters.Status)
	}

	var rows []models.Task
	if err := query.Order("created_at DESC").
		Limit(pagination.Limit).
		Offset(pagination.Offset).
		Find(&rows).Error; err != nil {
		return nil, 0, domainerrors.Internal("list tasks", err)
	}

	tasks := make([]entity.TaskWithAssignee, len(rows))
	for i := range rows {
		tasks[i] = entity.TaskWithAssignee{
			Task:     *mapper.TaskToEntity(&rows[i]),
			Assignee: mapper.UserToEntity(rows[i].Assignee),
		}
	}
	return tasks, int(totalCount), nil
}

func (r *taskRepository) Update(ctx context.Context, orgID uuid.UUID, task *entity.Task) error {
	result := dbFor(ctx, r.db).
		Model(&models.Task{}).
		Where("id = ? AND organization_id = ?", task.ID, orgID).
		Updates(map[string]interface{}{
			"title":       task.Title,
			"description": task.Description,
			"status":      task.Status,
			"assignee_id": task.AssigneeID,
			"due_date":    task.DueDate,
		})
	if result.Error != nil {
		return domainerrors.Internal("update task", result.Error)
	}
	if result.RowsAffected == 0 {
		return domainerrors.ErrTaskNotFound
	}
	return nil
}

func (r *taskRepository) Delete(ctx context.Context, orgID, taskID uuid.UUID) error {
	result := dbFor(ctx, r.db).
		Where("id = ? AND organization_id = ?", taskID, orgID).
		Delete(&models.Task{})
	if result.Error != nil {
		return domainerrors.Internal("delete task", result.Error)
	}
	if result.RowsAffected == 0 {
		return domainerrors.ErrTaskNotFound
	}
	return nil
}

func (r *taskRepository) UpdateStatus(ctx context.Context, orgID, taskID uuid.UUID, status string) error {
	result := dbFor(ctx, r.db).
		Model(&models.Task{}).
		Where("id = ? AND organization_id = ?", taskID, orgID).
		Update("status", status)
	if result.Error != nil {
		return domainerrors.Internal("update task status", result.Error)
	}
	if result.RowsAffected == 0 {
		return domainerrors.ErrTaskNotFound
	}
	return nil
}

func (r *taskRepository) CountActiveByDivision(ctx context.Context, orgID, divisionID uuid.UUID) (int64, error) {
	var count int64
	err := dbFor(ctx, r.db).
		Model(&models.Task{}).
		Where("organization_id = ? AND division_id = ? AND status != ?", orgID, divisionID, "DONE").
		Count(&count).Error
	if err != nil {
		return 0, domainerrors.Internal("count active tasks", err)
	}
	return count, nil
}
