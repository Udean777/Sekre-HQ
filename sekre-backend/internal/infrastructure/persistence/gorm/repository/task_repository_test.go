//go:build integration

package repository_test

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
	gormrepo "github.com/username/sekre-backend/internal/infrastructure/persistence/gorm/repository"
	testdb "github.com/username/sekre-backend/internal/test/db"
	"github.com/username/sekre-backend/internal/test/fixtures"
	"gorm.io/gorm"
)

func TestTaskRepository_Create(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewTaskRepository(tx)
		ctx := context.Background()

		// Setup org and division
		orgModel := fixtures.NewOrganization().Build()
		require.NoError(t, tx.Create(&orgModel).Error)

		divModel := fixtures.NewDivision().
			WithOrganizationID(orgModel.ID).
			Build()
		require.NoError(t, tx.Create(&divModel).Error)

		// Create task
		task := &entity.Task{
			ID:             uuid.New(),
			OrganizationID: orgModel.ID,
			DivisionID:     divModel.ID,
			Title:          "Test Task",
			Description:    "Test Description",
			Status:         types.TaskStatusTodo,
		}

		err := repo.Create(ctx, orgModel.ID, task)
		require.NoError(t, err)

		// Verify created
		found, err := repo.GetByID(ctx, orgModel.ID, task.ID)
		require.NoError(t, err)
		assert.Equal(t, task.ID, found.ID)
		assert.Equal(t, task.Title, found.Title)
		assert.Equal(t, types.TaskStatusTodo, found.Status)
	})
}

func TestTaskRepository_GetByID_CrossTenant(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewTaskRepository(tx)
		ctx := context.Background()

		// Create org A
		orgA := fixtures.NewOrganization().Build()
		require.NoError(t, tx.Create(&orgA).Error)

		divA := fixtures.NewDivision().WithOrganizationID(orgA.ID).Build()
		require.NoError(t, tx.Create(&divA).Error)

		// Create task in org A
		taskModel := fixtures.NewTask().
			WithOrganizationID(orgA.ID).
			WithDivisionID(divA.ID).
			Build()
		require.NoError(t, tx.Create(&taskModel).Error)

		// Create org B
		orgB := fixtures.NewOrganization().Build()
		require.NoError(t, tx.Create(&orgB).Error)

		// Try to access task from org B (should fail)
		_, err := repo.GetByID(ctx, orgB.ID, taskModel.ID)
		assert.Error(t, err, "Should not access task from different org")
	})
}

func TestTaskRepository_List_WithFilters(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewTaskRepository(tx)
		ctx := context.Background()

		// Setup
		orgModel := fixtures.NewOrganization().Build()
		require.NoError(t, tx.Create(&orgModel).Error)

		divModel := fixtures.NewDivision().WithOrganizationID(orgModel.ID).Build()
		require.NoError(t, tx.Create(&divModel).Error)

		// Create tasks with different statuses
		todoTask := fixtures.NewTask().
			WithOrganizationID(orgModel.ID).
			WithDivisionID(divModel.ID).
			WithStatus(types.TaskStatusTodo).
			Build()
		require.NoError(t, tx.Create(&todoTask).Error)

		doneTask := fixtures.NewTask().
			WithOrganizationID(orgModel.ID).
			WithDivisionID(divModel.ID).
			WithStatus(types.TaskStatusDone).
			Build()
		require.NoError(t, tx.Create(&doneTask).Error)

		// Filter by status
		todoStatus := "TODO"
		filters := entity.TaskFilters{
			Status: &todoStatus,
		}

		tasks, err := repo.ListFiltered(ctx, orgModel.ID, filters)
		require.NoError(t, err)
		assert.Len(t, tasks, 1)
		assert.Equal(t, types.TaskStatusTodo, tasks[0].Task.Status)
	})
}

func TestTaskRepository_UpdateStatus(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewTaskRepository(tx)
		ctx := context.Background()

		// Setup
		orgModel := fixtures.NewOrganization().Build()
		require.NoError(t, tx.Create(&orgModel).Error)

		divModel := fixtures.NewDivision().WithOrganizationID(orgModel.ID).Build()
		require.NoError(t, tx.Create(&divModel).Error)

		taskModel := fixtures.NewTask().
			WithOrganizationID(orgModel.ID).
			WithDivisionID(divModel.ID).
			WithStatus(types.TaskStatusTodo).
			Build()
		require.NoError(t, tx.Create(&taskModel).Error)

		// Update status
		err := repo.UpdateStatus(ctx, orgModel.ID, taskModel.ID, "DONE")
		require.NoError(t, err)

		// Verify updated
		found, err := repo.GetByID(ctx, orgModel.ID, taskModel.ID)
		require.NoError(t, err)
		assert.Equal(t, types.TaskStatusDone, found.Status)
	})
}

func TestTaskRepository_Delete(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewTaskRepository(tx)
		ctx := context.Background()

		// Setup
		orgModel := fixtures.NewOrganization().Build()
		require.NoError(t, tx.Create(&orgModel).Error)

		divModel := fixtures.NewDivision().WithOrganizationID(orgModel.ID).Build()
		require.NoError(t, tx.Create(&divModel).Error)

		taskModel := fixtures.NewTask().
			WithOrganizationID(orgModel.ID).
			WithDivisionID(divModel.ID).
			Build()
		require.NoError(t, tx.Create(&taskModel).Error)

		// Delete
		err := repo.Delete(ctx, orgModel.ID, taskModel.ID)
		require.NoError(t, err)

		// Verify deleted
		_, err = repo.GetByID(ctx, orgModel.ID, taskModel.ID)
		assert.Error(t, err)
	})
}

func TestTaskRepository_Update(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewTaskRepository(tx)
		ctx := context.Background()

		// Setup
		orgModel := fixtures.NewOrganization().Build()
		require.NoError(t, tx.Create(&orgModel).Error)

		divModel := fixtures.NewDivision().WithOrganizationID(orgModel.ID).Build()
		require.NoError(t, tx.Create(&divModel).Error)

		taskModel := fixtures.NewTask().
			WithOrganizationID(orgModel.ID).
			WithDivisionID(divModel.ID).
			WithTitle("Original Title").
			Build()
		require.NoError(t, tx.Create(&taskModel).Error)

		// Update
		dueDate := time.Now().Add(24 * time.Hour)
		updatedTask := &entity.Task{
			ID:             taskModel.ID,
			OrganizationID: orgModel.ID,
			DivisionID:     divModel.ID,
			Title:          "Updated Title",
			Description:    "Updated Description",
			Status:         types.TaskStatusInProgress,
			DueDate:        &dueDate,
		}

		err := repo.Update(ctx, orgModel.ID, updatedTask)
		require.NoError(t, err)

		// Verify updated
		found, err := repo.GetByID(ctx, orgModel.ID, taskModel.ID)
		require.NoError(t, err)
		assert.Equal(t, "Updated Title", found.Title)
		assert.Equal(t, "Updated Description", found.Description)
		assert.Equal(t, types.TaskStatusInProgress, found.Status)
		assert.NotNil(t, found.DueDate)
	})
}
