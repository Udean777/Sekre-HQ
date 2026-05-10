package domain

import (
	"time"

	"github.com/google/uuid"
)

// Task represents work item
type Task struct {
	ID             uuid.UUID  `json:"id"`
	OrganizationID uuid.UUID  `json:"organization_id"`
	DivisionID     uuid.UUID  `json:"division_id"`
	AssigneeID     *uuid.UUID `json:"assignee_id"`
	Title          string     `json:"title"`
	Description    string     `json:"description"`
	Status         string     `json:"status"` // TODO, IN_PROGRESS, DONE
	DueDate        *time.Time `json:"due_date"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

// TaskWithAssignee combines task + assignee user
type TaskWithAssignee struct {
	Task     Task  `json:"task"`
	Assignee *User `json:"assignee"`
}
