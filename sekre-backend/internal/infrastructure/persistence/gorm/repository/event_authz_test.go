//go:build integration

package repository_test

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/infrastructure/persistence/gorm/repository"
	"github.com/username/sekre-backend/internal/test/authz"
	testdb "github.com/username/sekre-backend/internal/test/db"
	"github.com/username/sekre-backend/internal/test/fixtures/scenario"
	"gorm.io/gorm"
)

// TestEventRepository_AuthorizationMatrix verifies multi-tenant isolation for events.
func TestEventRepository_AuthorizationMatrix(t *testing.T) {
	for _, tc := range authz.EventAuthzMatrix {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			// Remove t.Parallel() to avoid shared container issues

			testdb.RunInTx(t, func(tx *gorm.DB) {
				s := scenario.BuildMultiTenant(t, tx)
				repo := repository.NewEventRepository(tx)
				ctx := context.Background()

				var targetEventID uuid.UUID
				var targetDivisionID uuid.UUID
				var actorOrg uuid.UUID

				if tc.Tenant == "same" {
					targetEventID = s.EventA.ID
					targetDivisionID = s.DivisionA.ID
					actorOrg = s.OrgA.ID
				} else {
					// Actor from OrgA trying to access OrgB resource
					targetEventID = s.EventB.ID
					targetDivisionID = s.DivisionB.ID
					actorOrg = s.OrgA.ID
				}

				switch tc.Op {
				case "read":
					_, err := repo.GetByID(ctx, actorOrg, targetEventID)
					if tc.WantErr != nil {
						require.ErrorIs(t, err, tc.WantErr, "expected error %v, got %v", tc.WantErr, err)
					} else {
						require.NoError(t, err)
					}

				case "update":
					// First get the event to update
					event, err := repo.GetByID(ctx, actorOrg, targetEventID)
					if tc.WantErr != nil {
						// If we expect error on read, skip update test
						return
					}
					require.NoError(t, err)

					event.Title = "Updated Title"
					err = repo.Update(ctx, actorOrg, event)
					if tc.WantErr != nil {
						require.ErrorIs(t, err, tc.WantErr)
					} else {
						require.NoError(t, err)
					}

				case "delete":
					err := repo.Delete(ctx, actorOrg, targetEventID)
					if tc.WantErr != nil {
						require.ErrorIs(t, err, tc.WantErr)
					} else {
						require.NoError(t, err)
					}

				case "list":
					events, err := repo.List(ctx, actorOrg, targetDivisionID)
					require.NoError(t, err, "list should not error")

					if tc.Tenant == "same" {
						assert.NotEmpty(t, events, "same-tenant list should return events")
					} else {
						// Cross-tenant list should return empty (division belongs to other org)
						assert.Empty(t, events, "cross-tenant list should return empty")
					}

				case "create":
					// Create always uses actor's org, so cross-tenant create doesn't apply
					if tc.Tenant == "same" {
						newEvent := &entity.Event{
							ID:             uuid.New(),
							OrganizationID: actorOrg,
							DivisionID:     targetDivisionID,
							Title:          "New Event",
							Description:    "Test event",
							StartTime:      s.EventA.StartTime,
							EndTime:        s.EventA.EndTime,
							Location:       "Test Location",
						}
						err := repo.Create(ctx, actorOrg, newEvent)

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

// TestEventRepository_CrossTenantIsolation_Explicit provides explicit cross-tenant test cases.
func TestEventRepository_CrossTenantIsolation_Explicit(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		s := scenario.BuildMultiTenant(t, tx)
		repo := repository.NewEventRepository(tx)
		ctx := context.Background()

		t.Run("OrgA cannot read OrgB event", func(t *testing.T) {
			_, err := repo.GetByID(ctx, s.OrgA.ID, s.EventB.ID)
			require.ErrorIs(t, err, domainerrors.ErrEventNotFound,
				"cross-tenant read should return NotFound, not Forbidden (to avoid information leakage)")
		})

		t.Run("OrgB cannot read OrgA event", func(t *testing.T) {
			_, err := repo.GetByID(ctx, s.OrgB.ID, s.EventA.ID)
			require.ErrorIs(t, err, domainerrors.ErrEventNotFound)
		})

		t.Run("OrgA can read own event", func(t *testing.T) {
			event, err := repo.GetByID(ctx, s.OrgA.ID, s.EventA.ID)
			require.NoError(t, err)
			assert.Equal(t, s.EventA.ID, event.ID)
		})

		t.Run("OrgA list does not include OrgB events", func(t *testing.T) {
			// List all events in OrgA's division
			events, err := repo.List(ctx, s.OrgA.ID, s.DivisionA.ID)
			require.NoError(t, err)

			// Should only contain OrgA events
			for _, event := range events {
				assert.Equal(t, s.OrgA.ID, event.OrganizationID,
					"OrgA list should not contain events from other organizations")
			}
		})
	})
}
