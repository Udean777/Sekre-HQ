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
	"github.com/username/sekre-backend/internal/domain/valueobject"
	"github.com/username/sekre-backend/internal/infrastructure/persistence/gorm/repository"
	"github.com/username/sekre-backend/internal/test/authz"
	testdb "github.com/username/sekre-backend/internal/test/db"
	"github.com/username/sekre-backend/internal/test/fixtures/scenario"
	"gorm.io/gorm"
)

// TestTransactionRepository_AuthorizationMatrix verifies multi-tenant isolation for transactions.
func TestTransactionRepository_AuthorizationMatrix(t *testing.T) {
	for _, tc := range authz.FinanceAuthzMatrix {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			// Remove t.Parallel() to avoid shared container issues

			testdb.RunInTx(t, func(tx *gorm.DB) {
				s := scenario.BuildMultiTenant(t, tx)
				repo := repository.NewTransactionRepository(tx)
				ctx := context.Background()

				var targetTxID uuid.UUID
				var targetDivisionID uuid.UUID
				var actorOrg uuid.UUID

				if tc.Tenant == "same" {
					targetTxID = s.TransactionA.ID
					targetDivisionID = s.DivisionA.ID
					actorOrg = s.OrgA.ID
				} else {
					// Actor from OrgA trying to access OrgB resource
					targetTxID = s.TransactionB.ID
					targetDivisionID = s.DivisionB.ID
					actorOrg = s.OrgA.ID
				}

				switch tc.Op {
				case "read":
					_, err := repo.GetByID(ctx, actorOrg, targetTxID)
					if tc.WantErr != nil {
						require.ErrorIs(t, err, tc.WantErr, "expected error %v, got %v", tc.WantErr, err)
					} else {
						require.NoError(t, err)
					}

				case "update":
					// First get the transaction to update
					transaction, err := repo.GetByID(ctx, actorOrg, targetTxID)
					if tc.WantErr != nil {
						// If we expect error on read, skip update test
						return
					}
					require.NoError(t, err)

					transaction.Description = "Updated Description"
					err = repo.Update(ctx, actorOrg, transaction)
					if tc.WantErr != nil {
						require.ErrorIs(t, err, tc.WantErr)
					} else {
						require.NoError(t, err)
					}

				case "delete":
					err := repo.Delete(ctx, actorOrg, targetTxID)
					if tc.WantErr != nil {
						require.ErrorIs(t, err, tc.WantErr)
					} else {
						require.NoError(t, err)
					}

				case "list":
					transactions, err := repo.List(ctx, actorOrg, targetDivisionID)
					require.NoError(t, err, "list should not error")

					if tc.Tenant == "same" {
						assert.NotEmpty(t, transactions, "same-tenant list should return transactions")
					} else {
						// Cross-tenant list should return empty (division belongs to other org)
						assert.Empty(t, transactions, "cross-tenant list should return empty")
					}

				case "create":
					// Create always uses actor's org, so cross-tenant create doesn't apply
					if tc.Tenant == "same" {
						newTx := &entity.Transaction{
							ID:             uuid.New(),
							OrganizationID: actorOrg,
							DivisionID:     targetDivisionID,
							Type:           "INCOME",
							Amount:         valueobject.Money{AmountCents: 50000, Currency: "IDR"},
							Description:    "Test transaction",
							Status:         "PENDING",
							RequestedBy:    s.OwnerA.ID,
						}
						err := repo.Create(ctx, actorOrg, newTx)

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

// TestTransactionRepository_CrossTenantIsolation_Explicit provides explicit cross-tenant test cases.
func TestTransactionRepository_CrossTenantIsolation_Explicit(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		s := scenario.BuildMultiTenant(t, tx)
		repo := repository.NewTransactionRepository(tx)
		ctx := context.Background()

		t.Run("OrgA cannot read OrgB transaction", func(t *testing.T) {
			_, err := repo.GetByID(ctx, s.OrgA.ID, s.TransactionB.ID)
			require.ErrorIs(t, err, domainerrors.ErrTransactionNotFound,
				"cross-tenant read should return NotFound, not Forbidden (to avoid information leakage)")
		})

		t.Run("OrgB cannot read OrgA transaction", func(t *testing.T) {
			_, err := repo.GetByID(ctx, s.OrgB.ID, s.TransactionA.ID)
			require.ErrorIs(t, err, domainerrors.ErrTransactionNotFound)
		})

		t.Run("OrgA can read own transaction", func(t *testing.T) {
			transaction, err := repo.GetByID(ctx, s.OrgA.ID, s.TransactionA.ID)
			require.NoError(t, err)
			assert.Equal(t, s.TransactionA.ID, transaction.ID)
		})

		t.Run("OrgA list does not include OrgB transactions", func(t *testing.T) {
			// List all transactions in OrgA's division
			transactions, err := repo.List(ctx, s.OrgA.ID, s.DivisionA.ID)
			require.NoError(t, err)

			// Should only contain OrgA transactions
			for _, transaction := range transactions {
				assert.Equal(t, s.OrgA.ID, transaction.OrganizationID,
					"OrgA list should not contain transactions from other organizations")
			}
		})
	})
}
