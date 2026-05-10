package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
)

type TaskRepository interface {
	Create(ctx context.Context, task *domain.Task) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.TaskWithAssignee, error)
	GetByOrganization(ctx context.Context, orgID uuid.UUID, filters TaskFilters) ([]domain.TaskWithAssignee, error)
	Update(ctx context.Context, task *domain.Task) error
	UpdateStatus(ctx context.Context, id uuid.UUID, status string) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type TaskFilters struct {
	DivisionID *uuid.UUID
	AssigneeID *uuid.UUID
	Status     *string
}

type taskRepository struct {
	db *sql.DB
}

func NewTaskRepository(db *sql.DB) TaskRepository {
	return &taskRepository{db: db}
}

func (r *taskRepository) Create(ctx context.Context, task *domain.Task) error {
	query := `
		INSERT INTO tasks (id, organization_id, division_id, assignee_id, title, description, status, due_date)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING created_at, updated_at
	`
	return r.db.QueryRowContext(
		ctx, query,
		task.ID, task.OrganizationID, task.DivisionID, task.AssigneeID,
		task.Title, task.Description, task.Status, task.DueDate,
	).Scan(&task.CreatedAt, &task.UpdatedAt)
}

func (r *taskRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.TaskWithAssignee, error) {
	query := `
		SELECT t.id, t.organization_id, t.division_id, t.assignee_id, t.title, t.description,
		       t.status, t.due_date, t.created_at, t.updated_at,
		       u.id, u.email, u.full_name, u.created_at, u.updated_at
		FROM tasks t
		LEFT JOIN users u ON t.assignee_id = u.id
		WHERE t.id = $1
	`
	
	result := &domain.TaskWithAssignee{}
	var assigneeID, assigneeEmail, assigneeName sql.NullString
	var assigneeCreated, assigneeUpdated sql.NullTime
	
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&result.Task.ID, &result.Task.OrganizationID, &result.Task.DivisionID,
		&result.Task.AssigneeID, &result.Task.Title, &result.Task.Description,
		&result.Task.Status, &result.Task.DueDate, &result.Task.CreatedAt, &result.Task.UpdatedAt,
		&assigneeID, &assigneeEmail, &assigneeName, &assigneeCreated, &assigneeUpdated,
	)
	
	if err == sql.ErrNoRows {
		return nil, domain.ErrTaskNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get task: %w", err)
	}
	
	if assigneeID.Valid {
		uid, _ := uuid.Parse(assigneeID.String)
		result.Assignee = &domain.User{
			ID:        uid,
			Email:     assigneeEmail.String,
			FullName:  assigneeName.String,
			CreatedAt: assigneeCreated.Time,
			UpdatedAt: assigneeUpdated.Time,
		}
	}
	
	return result, nil
}

func (r *taskRepository) GetByOrganization(ctx context.Context, orgID uuid.UUID, filters TaskFilters) ([]domain.TaskWithAssignee, error) {
	query := `
		SELECT t.id, t.organization_id, t.division_id, t.assignee_id, t.title, t.description,
		       t.status, t.due_date, t.created_at, t.updated_at,
		       u.id, u.email, u.full_name, u.created_at, u.updated_at
		FROM tasks t
		LEFT JOIN users u ON t.assignee_id = u.id
		WHERE t.organization_id = $1
	`
	
	args := []interface{}{orgID}
	argCount := 1
	
	if filters.DivisionID != nil {
		argCount++
		query += fmt.Sprintf(" AND t.division_id = $%d", argCount)
		args = append(args, *filters.DivisionID)
	}
	
	if filters.AssigneeID != nil {
		argCount++
		query += fmt.Sprintf(" AND t.assignee_id = $%d", argCount)
		args = append(args, *filters.AssigneeID)
	}
	
	if filters.Status != nil {
		argCount++
		query += fmt.Sprintf(" AND t.status = $%d", argCount)
		args = append(args, *filters.Status)
	}
	
	query += " ORDER BY t.created_at DESC"
	
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get tasks: %w", err)
	}
	defer rows.Close()
	
	tasks := []domain.TaskWithAssignee{}
	for rows.Next() {
		var t domain.TaskWithAssignee
		var assigneeID, assigneeEmail, assigneeName sql.NullString
		var assigneeCreated, assigneeUpdated sql.NullTime
		
		if err := rows.Scan(
			&t.Task.ID, &t.Task.OrganizationID, &t.Task.DivisionID,
			&t.Task.AssigneeID, &t.Task.Title, &t.Task.Description,
			&t.Task.Status, &t.Task.DueDate, &t.Task.CreatedAt, &t.Task.UpdatedAt,
			&assigneeID, &assigneeEmail, &assigneeName, &assigneeCreated, &assigneeUpdated,
		); err != nil {
			return nil, fmt.Errorf("failed to scan task: %w", err)
		}
		
		if assigneeID.Valid {
			uid, _ := uuid.Parse(assigneeID.String)
			t.Assignee = &domain.User{
				ID:        uid,
				Email:     assigneeEmail.String,
				FullName:  assigneeName.String,
				CreatedAt: assigneeCreated.Time,
				UpdatedAt: assigneeUpdated.Time,
			}
		}
		
		tasks = append(tasks, t)
	}
	
	return tasks, nil
}

func (r *taskRepository) Update(ctx context.Context, task *domain.Task) error {
	query := `
		UPDATE tasks
		SET title = $1, description = $2, assignee_id = $3, due_date = $4, status = $5, updated_at = NOW()
		WHERE id = $6
		RETURNING updated_at
	`
	return r.db.QueryRowContext(
		ctx, query,
		task.Title, task.Description, task.AssigneeID, task.DueDate, task.Status, task.ID,
	).Scan(&task.UpdatedAt)
}

func (r *taskRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	query := `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2`
	result, err := r.db.ExecContext(ctx, query, status, id)
	if err != nil {
		return fmt.Errorf("failed to update status: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return domain.ErrTaskNotFound
	}
	return nil
}

func (r *taskRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM tasks WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete task: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return domain.ErrTaskNotFound
	}
	return nil
}
