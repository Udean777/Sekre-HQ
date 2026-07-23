package entity

import (
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
)

// Task represents work item - pure business entity
type Task struct {
	ID             uuid.UUID        `json:"id"`
	OrganizationID uuid.UUID        `json:"organization_id"`
	DivisionID     uuid.UUID        `json:"division_id"`
	AssigneeID     *uuid.UUID       `json:"assignee_id"`
	Title          string           `json:"title"`
	Description    string           `json:"description"`
	Status         types.TaskStatus `json:"status"`
	DueDate        *time.Time       `json:"due_date"`
	SortOrder      int              `json:"sort_order"`
	CreatedAt      time.Time        `json:"created_at"`
	UpdatedAt      time.Time        `json:"updated_at"`
}

// TaskWithAssignee combines task + assignee user
type TaskWithAssignee struct {
	Task     Task      `json:"task"`
	Assignee *User     `json:"assignee"`
	Division *Division `json:"division"`
}

// TaskFilters holds optional filters for listing tasks
type TaskFilters struct {
	DivisionID *uuid.UUID
	AssigneeID *uuid.UUID
	Status     *string
	Search     *string
}

// TaskPosition holds a task ID and its new sort order for batch reordering
type TaskPosition struct {
	ID        uuid.UUID `json:"id"`
	SortOrder int       `json:"sort_order"`
}
