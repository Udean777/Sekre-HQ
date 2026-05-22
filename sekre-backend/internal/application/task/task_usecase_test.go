package task

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/test/mocks"
)

func TestTaskUsecase_Create_Success(t *testing.T) {
	t.Parallel()

	// Setup
	repo := mocks.NewTaskRepository(t)
	uc := NewTaskUsecase(repo, nil)

	ctx := context.Background()
	orgID := uuid.New()
	divisionID := uuid.New()
	dueDate := time.Now().Add(24 * time.Hour)

	req := &CreateTaskRequest{
		DivisionID:  divisionID,
		AssigneeID:  nil,
		Title:       "Test Task",
		Description: "Test Description",
		DueDate:     &dueDate,
	}

	// Expectations
	repo.EXPECT().
		Create(ctx, orgID, mock.MatchedBy(func(task *entity.Task) bool {
			return task.OrganizationID == orgID &&
				task.DivisionID == divisionID &&
				task.Title == "Test Task" &&
				task.Status == types.TaskStatusTodo
		})).
		Return(nil).
		Once()

	repo.EXPECT().
		GetByID(ctx, orgID, mock.AnythingOfType("uuid.UUID")).
		Return(&entity.Task{
			ID:             uuid.New(),
			OrganizationID: orgID,
			DivisionID:     divisionID,
			Title:          "Test Task",
			Status:         types.TaskStatusTodo,
		}, nil).
		Once()

	// Execute
	result, err := uc.Create(ctx, orgID, req)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, "Test Task", result.Task.Title)
	assert.Equal(t, types.TaskStatusTodo, result.Task.Status)
}

func TestTaskUsecase_Create_EmptyTitle(t *testing.T) {
	t.Parallel()

	// Setup
	uc := NewTaskUsecase(nil, nil)

	req := &CreateTaskRequest{
		DivisionID:  uuid.New(),
		Title:       "",
		Description: "Description",
	}

	// Execute
	result, err := uc.Create(context.Background(), uuid.New(), req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.True(t, domainerrors.Is(err, domainerrors.CodeInvalidInput))
}

func TestTaskUsecase_GetByID_Success(t *testing.T) {
	t.Parallel()

	// Setup
	repo := mocks.NewTaskRepository(t)
	uc := NewTaskUsecase(repo, nil)

	ctx := context.Background()
	orgID := uuid.New()
	taskID := uuid.New()

	expectedTask := &entity.TaskWithAssignee{
		Task: entity.Task{
			ID:             taskID,
			OrganizationID: orgID,
			Title:          "Test Task",
			Status:         types.TaskStatusTodo,
		},
	}

	repo.EXPECT().
		GetByIDWithAssignee(ctx, orgID, taskID).
		Return(expectedTask, nil).
		Once()

	// Execute
	result, err := uc.GetByID(ctx, orgID, taskID)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, taskID, result.Task.ID)
	assert.Equal(t, "Test Task", result.Task.Title)
}

func TestTaskUsecase_GetByID_NotFound(t *testing.T) {
	t.Parallel()

	// Setup
	repo := mocks.NewTaskRepository(t)
	uc := NewTaskUsecase(repo, nil)

	ctx := context.Background()
	orgID := uuid.New()
	taskID := uuid.New()

	repo.EXPECT().
		GetByIDWithAssignee(ctx, orgID, taskID).
		Return(nil, domainerrors.ErrTaskNotFound).
		Once()

	// Execute
	result, err := uc.GetByID(ctx, orgID, taskID)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.ErrorIs(t, err, domainerrors.ErrTaskNotFound)
}

func TestTaskUsecase_UpdateStatus_Success(t *testing.T) {
	t.Parallel()

	// Setup
	repo := mocks.NewTaskRepository(t)
	uc := NewTaskUsecase(repo, nil)

	ctx := context.Background()
	orgID := uuid.New()
	taskID := uuid.New()

	repo.EXPECT().
		UpdateStatus(ctx, orgID, taskID, "DONE").
		Return(nil).
		Once()

	// Execute
	err := uc.UpdateStatus(ctx, orgID, taskID, "DONE")

	// Assert
	assert.NoError(t, err)
}

func TestTaskUsecase_UpdateStatus_InvalidStatus(t *testing.T) {
	t.Parallel()

	// Setup
	uc := NewTaskUsecase(nil, nil)

	// Execute
	err := uc.UpdateStatus(context.Background(), uuid.New(), uuid.New(), "INVALID")

	// Assert
	assert.Error(t, err)
	assert.True(t, domainerrors.Is(err, domainerrors.CodeInvalidInput))
}

func TestTaskUsecase_Delete_Success(t *testing.T) {
	t.Parallel()

	// Setup
	repo := mocks.NewTaskRepository(t)
	uc := NewTaskUsecase(repo, nil)

	ctx := context.Background()
	orgID := uuid.New()
	taskID := uuid.New()

	repo.EXPECT().
		Delete(ctx, orgID, taskID).
		Return(nil).
		Once()

	// Execute
	err := uc.Delete(ctx, orgID, taskID)

	// Assert
	assert.NoError(t, err)
}

func TestTaskUsecase_List_Success(t *testing.T) {
	t.Parallel()

	// Setup
	repo := mocks.NewTaskRepository(t)
	uc := NewTaskUsecase(repo, nil)

	ctx := context.Background()
	orgID := uuid.New()
	status := "TODO"
	filters := entity.TaskFilters{
		Status: &status,
	}

	expectedTasks := []entity.TaskWithAssignee{
		{
			Task: entity.Task{
				ID:     uuid.New(),
				Title:  "Task 1",
				Status: types.TaskStatusTodo,
			},
		},
		{
			Task: entity.Task{
				ID:     uuid.New(),
				Title:  "Task 2",
				Status: types.TaskStatusTodo,
			},
		},
	}

	repo.EXPECT().
		ListFiltered(ctx, orgID, filters).
		Return(expectedTasks, nil).
		Once()

	// Execute
	result, err := uc.List(ctx, orgID, filters)

	// Assert
	assert.NoError(t, err)
	assert.Len(t, result, 2)
	assert.Equal(t, "Task 1", result[0].Task.Title)
	assert.Equal(t, "Task 2", result[1].Task.Title)
}
