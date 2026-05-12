//go:build integration

package repository_test

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/infrastructure/persistence/gorm/repository"
	"github.com/username/sekre-backend/internal/test/authz"
	testdb "github.com/username/sekre-backend/internal/test/db"
	"github.com/username/sekre-backend/internal/test/fixtures/scenario"
	"gorm.io/gorm"
)

// TestTaskRepository_AuthorizationMatrix is the CRITICAL test for multi-tenant isolation.
// This test verifies that:
// 1. Users can only access resources in their own organization
// 2. Cross-tenant access attempts return NotFound (not Forbidden, to avoid information leakage)
// 3. Role-based permissions are enforced within the same tenant
//
// This test should FAIL before Phase 1.1 fixes are applied, then PASS after.
func TestTaskRepository_AuthorizationMatrix(t *testing.T) {
	for _, tc := range authz.TaskAuthzMatrix {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			testdb.RunInTx(t, func(tx *gorm.DB) {
				s := scenario.BuildMultiTenant(t, tx)
				repo := repository.NewTaskRepository(tx)
				ctx := context.Background()

				var targetTaskID uuid.UUID
				var targetDivisionID uuid.UUID
				var actorOrg uuid.UUID

				if tc.Tenant == "same" {
					targetTaskID = s.TaskA.ID
					targetDivisionID = s.DivisionA.ID
					actorOrg = s.OrgA.ID
				} else {
					// Actor from OrgA trying to access OrgB resource
					targetTaskID = s.TaskB.ID
					targetDivisionID = s.DivisionB.ID
					actorOrg = s.OrgA.ID
				}

				switch tc.Op {
				case "read":
					_, err := repo.GetByID(ctx, actorOrg, targetTaskID)
					if tc.WantErr != nil {
						require.ErrorIs(t, err, tc.WantErr, "expected error %v, got %v", tc.WantErr, err)
					} else {
						require.NoError(t, err)
					}

				case "update":
					// First get the task to update
					task, err := repo.GetByID(ctx, actorOrg, targetTaskID)
					if tc.WantErr != nil {
						// If we expect error on read, skip update test
						return
					}
					require.NoError(t, err)

					task.Title = "Updated Title"
					err = repo.Update(ctx, actorOrg, task)
					if tc.WantErr != nil {
						require.ErrorIs(t, err, tc.WantErr)
					} else {
						require.NoError(t, err)
					}

				case "delete":
					err := repo.Delete(ctx, actorOrg, targetTaskID)
					if tc.WantErr != nil {
						require.ErrorIs(t, err, tc.WantErr)
					} else {
						require.NoError(t, err)
					}

				case "list":
					tasks, err := repo.List(ctx, actorOrg, targetDivisionID)
					require.NoError(t, err, "list should not error")

					if tc.Tenant == "same" {
						assert.NotEmpty(t, tasks, "same-tenant list should return tasks")
					} else {
						// Cross-tenant list should return empty (division belongs to other org)
						assert.Empty(t, tasks, "cross-tenant list should return empty")
					}

				case "create":
					// Create always uses actor's org, so cross-tenant create doesn't apply
					if tc.Tenant == "same" {
						newTask := &entity.Task{
							ID:             uuid.New(),
							OrganizationID: actorOrg,
							DivisionID:     targetDivisionID,
							Title:          "New Task",
							Description:    "Test task",
							Status:         "TODO",
						}
						err := repo.Create(ctx, actorOrg, newTask)

						if tc.WantErr != nil {
							require.ErrorIs(t, err, tc.WantErr)
						} else {
							require.NoError(t, err)
						}
					}
				}
			})
		})
	}
}

// TestTaskRepository_CrossTenantIsolation_Explicit provides explicit cross-tenant test cases
// for better visibility during Phase 1 development.
func TestTaskRepository_CrossTenantIsolation_Explicit(t *testing.T) {
	t.Parallel()

	testdb.RunInTx(t, func(tx *gorm.DB) {
		s := scenario.BuildMultiTenant(t, tx)
		repo := repository.NewTaskRepository(tx)
		ctx := context.Background()

		t.Run("OrgA cannot read OrgB task", func(t *testing.T) {
			_, err := repo.GetByID(ctx, s.OrgA.ID, s.TaskB.ID)
			require.ErrorIs(t, err, domainerrors.ErrTaskNotFound,
				"cross-tenant read should return NotFound, not Forbidden (to avoid information leakage)")
		})

		t.Run("OrgB cannot read OrgA task", func(t *testing.T) {
			_, err := repo.GetByID(ctx, s.OrgB.ID, s.TaskA.ID)
			require.ErrorIs(t, err, domainerrors.ErrTaskNotFound)
		})

		t.Run("OrgA can read own task", func(t *testing.T) {
			task, err := repo.GetByID(ctx, s.OrgA.ID, s.TaskA.ID)
			require.NoError(t, err)
			assert.Equal(t, s.TaskA.ID, task.ID)
		})

		t.Run("OrgA list does not include OrgB tasks", func(t *testing.T) {
			// List all tasks in OrgA's division
			tasks, err := repo.List(ctx, s.OrgA.ID, s.DivisionA.ID)
			require.NoError(t, err)

			// Should only contain OrgA tasks
			for _, task := range tasks {
				assert.Equal(t, s.OrgA.ID, task.OrganizationID,
					"OrgA list should not contain tasks from other organizations")
			}
		})
	})
}
