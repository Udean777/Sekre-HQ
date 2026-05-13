package fixtures

import (
	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/models"
)

// TaskBuilder builds test Task instances.
type TaskBuilder struct {
	task models.Task
}

// NewTask creates a new TaskBuilder with sensible defaults.
func NewTask() *TaskBuilder {
	return &TaskBuilder{
		task: models.Task{
			ID:             uuid.New(),
			OrganizationID: uuid.New(),
			DivisionID:     uuid.New(),
			Title:          "Test Task",
			Description:    "Test task description",
			Status:         types.TaskStatusTodo,
		},
	}
}

// WithID sets the task ID.
func (b *TaskBuilder) WithID(id uuid.UUID) *TaskBuilder {
	b.task.ID = id
	return b
}

// WithOrganizationID sets the organization ID.
func (b *TaskBuilder) WithOrganizationID(id uuid.UUID) *TaskBuilder {
	b.task.OrganizationID = id
	return b
}

// WithDivisionID sets the division ID.
func (b *TaskBuilder) WithDivisionID(id uuid.UUID) *TaskBuilder {
	b.task.DivisionID = id
	return b
}

// WithAssigneeID sets the assignee ID.
func (b *TaskBuilder) WithAssigneeID(id uuid.UUID) *TaskBuilder {
	b.task.AssigneeID = &id
	return b
}

// WithTitle sets the task title.
func (b *TaskBuilder) WithTitle(title string) *TaskBuilder {
	b.task.Title = title
	return b
}

// WithDescription sets the task description.
func (b *TaskBuilder) WithDescription(desc string) *TaskBuilder {
	b.task.Description = desc
	return b
}

// WithStatus sets the task status.
func (b *TaskBuilder) WithStatus(status types.TaskStatus) *TaskBuilder {
	b.task.Status = status
	return b
}

// Build returns the constructed Task.
func (b *TaskBuilder) Build() models.Task {
	return b.task
}
