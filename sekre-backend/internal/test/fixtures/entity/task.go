package entityfixtures

import (
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
)

// TaskBuilder builds test entity.Task instances.
type TaskBuilder struct {
	task entity.Task
}

// NewTask creates a new TaskBuilder with sensible defaults.
func NewTask() *TaskBuilder {
	return &TaskBuilder{
		task: entity.Task{
			ID:             uuid.New(),
			OrganizationID: uuid.New(),
			DivisionID:     uuid.New(),
			Title:          "Test Task",
			Description:    "Test task description",
			Status:         types.TaskStatusTodo,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
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

// WithAssignee sets the assignee ID.
func (b *TaskBuilder) WithAssignee(id uuid.UUID) *TaskBuilder {
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

// AsTodo sets status to Todo.
func (b *TaskBuilder) AsTodo() *TaskBuilder {
	return b.WithStatus(types.TaskStatusTodo)
}

// AsInProgress sets status to InProgress.
func (b *TaskBuilder) AsInProgress() *TaskBuilder {
	return b.WithStatus(types.TaskStatusInProgress)
}

// AsDone sets status to Done.
func (b *TaskBuilder) AsDone() *TaskBuilder {
	return b.WithStatus(types.TaskStatusDone)
}

// WithDueDate sets the due date.
func (b *TaskBuilder) WithDueDate(due time.Time) *TaskBuilder {
	b.task.DueDate = &due
	return b
}

// WithDueIn sets the due date relative to now.
func (b *TaskBuilder) WithDueIn(d time.Duration) *TaskBuilder {
	due := time.Now().Add(d)
	b.task.DueDate = &due
	return b
}

// Overdue sets a due date in the past (useful for testing overdue logic).
func (b *TaskBuilder) Overdue() *TaskBuilder {
	return b.WithDueIn(-24 * time.Hour)
}

// Build returns the constructed entity.Task.
func (b *TaskBuilder) Build() entity.Task {
	return b.task
}

// BuildPtr returns a pointer to the constructed entity.Task.
func (b *TaskBuilder) BuildPtr() *entity.Task {
	t := b.task
	return &t
}

// TaskWithAssigneeBuilder builds test entity.TaskWithAssignee instances.
type TaskWithAssigneeBuilder struct {
	twa entity.TaskWithAssignee
}

// NewTaskWithAssignee creates a new TaskWithAssigneeBuilder with defaults.
func NewTaskWithAssignee() *TaskWithAssigneeBuilder {
	return &TaskWithAssigneeBuilder{
		twa: entity.TaskWithAssignee{
			Task: NewTask().Build(),
		},
	}
}

// WithTask sets the task.
func (b *TaskWithAssigneeBuilder) WithTask(t entity.Task) *TaskWithAssigneeBuilder {
	b.twa.Task = t
	return b
}

// WithAssignee sets the assignee user.
func (b *TaskWithAssigneeBuilder) WithAssignee(u *entity.User) *TaskWithAssigneeBuilder {
	b.twa.Assignee = u
	return b
}

// Build returns the constructed entity.TaskWithAssignee.
func (b *TaskWithAssigneeBuilder) Build() entity.TaskWithAssignee {
	return b.twa
}

// BuildPtr returns a pointer to the constructed entity.TaskWithAssignee.
func (b *TaskWithAssigneeBuilder) BuildPtr() *entity.TaskWithAssignee {
	twa := b.twa
	return &twa
}
