//go:build integration

package repository_test

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/domain/valueobject"
	gormrepo "github.com/username/sekre-backend/internal/infrastructure/persistence/gorm/repository"
	testdb "github.com/username/sekre-backend/internal/test/db"
	"github.com/username/sekre-backend/internal/test/fixtures"
	"gorm.io/gorm"
)

func TestTransactionRepository_Create(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewTransactionRepository(tx)
		ctx := context.Background()

		// Setup
		orgModel := fixtures.NewOrganization().Build()
		require.NoError(t, tx.Create(&orgModel).Error)

		divModel := fixtures.NewDivision().WithOrganizationID(orgModel.ID).Build()
		require.NoError(t, tx.Create(&divModel).Error)

		userModel := fixtures.NewUser().Build()
		require.NoError(t, tx.Create(&userModel).Error)

		// Create transaction
		transaction := &entity.Transaction{
			ID:             uuid.New(),
			OrganizationID: orgModel.ID,
			DivisionID:     divModel.ID,
			Type:           types.TransactionTypeIncome,
			Amount:         valueobject.NewMoney(100000, "IDR"),
			Description:    "Test Income",
			Status:         types.TransactionStatusApproved,
			RequestedBy:    userModel.ID,
		}

		err := repo.Create(ctx, orgModel.ID, transaction)
		require.NoError(t, err)

		// Verify created
		found, err := repo.GetByID(ctx, orgModel.ID, transaction.ID)
		require.NoError(t, err)
		assert.Equal(t, transaction.ID, found.ID)
		assert.Equal(t, int64(100000), found.Amount.AmountCents)
		assert.Equal(t, "IDR", found.Amount.Currency)
		assert.Equal(t, types.TransactionTypeIncome, found.Type)
	})
}

func TestTransactionRepository_GetSummary(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewTransactionRepository(tx)
		ctx := context.Background()

		// Setup
		orgModel := fixtures.NewOrganization().Build()
		require.NoError(t, tx.Create(&orgModel).Error)

		divModel := fixtures.NewDivision().WithOrganizationID(orgModel.ID).Build()
		require.NoError(t, tx.Create(&divModel).Error)

		userModel := fixtures.NewUser().Build()
		require.NoError(t, tx.Create(&userModel).Error)

		// Create income transactions
		for i := 0; i < 3; i++ {
			txModel := fixtures.NewTransaction().
				WithOrganizationID(orgModel.ID).
				WithDivisionID(divModel.ID).
				WithType(types.TransactionTypeIncome).
				WithAmountCents(100000).
				WithRequestedBy(userModel.ID).
				Build()
			require.NoError(t, tx.Create(&txModel).Error)
		}

		// Create expense transactions
		for i := 0; i < 2; i++ {
			txModel := fixtures.NewTransaction().
				WithOrganizationID(orgModel.ID).
				WithDivisionID(divModel.ID).
				WithType(types.TransactionTypeExpense).
				WithAmountCents(50000).
				WithRequestedBy(userModel.ID).
				Build()
			require.NoError(t, tx.Create(&txModel).Error)
		}

		// Get summary
		summary, err := repo.GetSummary(ctx, orgModel.ID, nil)
		require.NoError(t, err)

		// Verify: 3 x 100,000 = 300,000 income
		//         2 x 50,000 = 100,000 expense
		//         Balance = 200,000
		assert.Equal(t, int64(300000), summary.TotalIncome.AmountCents)
		assert.Equal(t, int64(100000), summary.TotalExpense.AmountCents)
		assert.Equal(t, int64(200000), summary.Balance.AmountCents)
	})
}

func TestTransactionRepository_GetSummary_ByDivision(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewTransactionRepository(tx)
		ctx := context.Background()

		// Setup
		orgModel := fixtures.NewOrganization().Build()
		require.NoError(t, tx.Create(&orgModel).Error)

		divA := fixtures.NewDivision().WithOrganizationID(orgModel.ID).Build()
		require.NoError(t, tx.Create(&divA).Error)

		divB := fixtures.NewDivision().WithOrganizationID(orgModel.ID).Build()
		require.NoError(t, tx.Create(&divB).Error)

		userModel := fixtures.NewUser().Build()
		require.NoError(t, tx.Create(&userModel).Error)

		// Create transactions in division A
		txA := fixtures.NewTransaction().
			WithOrganizationID(orgModel.ID).
			WithDivisionID(divA.ID).
			WithType(types.TransactionTypeIncome).
			WithAmountCents(100000).
			WithRequestedBy(userModel.ID).
			Build()
		require.NoError(t, tx.Create(&txA).Error)

		// Create transactions in division B
		txB := fixtures.NewTransaction().
			WithOrganizationID(orgModel.ID).
			WithDivisionID(divB.ID).
			WithType(types.TransactionTypeIncome).
			WithAmountCents(200000).
			WithRequestedBy(userModel.ID).
			Build()
		require.NoError(t, tx.Create(&txB).Error)

		// Get summary for division A only
		summary, err := repo.GetSummary(ctx, orgModel.ID, &divA.ID)
		require.NoError(t, err)

		// Should only include division A transactions
		assert.Equal(t, int64(100000), summary.TotalIncome.AmountCents)
		assert.Equal(t, int64(0), summary.TotalExpense.AmountCents)
	})
}

func TestTransactionRepository_List_WithFilters(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewTransactionRepository(tx)
		ctx := context.Background()

		// Setup
		orgModel := fixtures.NewOrganization().Build()
		require.NoError(t, tx.Create(&orgModel).Error)

		divModel := fixtures.NewDivision().WithOrganizationID(orgModel.ID).Build()
		require.NoError(t, tx.Create(&divModel).Error)

		userModel := fixtures.NewUser().Build()
		require.NoError(t, tx.Create(&userModel).Error)

		// Create income
		income := fixtures.NewTransaction().
			WithOrganizationID(orgModel.ID).
			WithDivisionID(divModel.ID).
			WithType(types.TransactionTypeIncome).
			WithRequestedBy(userModel.ID).
			Build()
		require.NoError(t, tx.Create(&income).Error)

		// Create expense
		expense := fixtures.NewTransaction().
			WithOrganizationID(orgModel.ID).
			WithDivisionID(divModel.ID).
			WithType(types.TransactionTypeExpense).
			WithRequestedBy(userModel.ID).
			Build()
		require.NoError(t, tx.Create(&expense).Error)

		// Filter by type
		txType := types.TransactionTypeIncome
		filters := entity.TransactionFilters{
			Type: &txType,
		}

		transactions, err := repo.ListFiltered(ctx, orgModel.ID, filters)
		require.NoError(t, err)
		assert.Len(t, transactions, 1)
		assert.Equal(t, types.TransactionTypeIncome, transactions[0].Type)
	})
}

func TestTransactionRepository_Delete(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewTransactionRepository(tx)
		ctx := context.Background()

		// Setup
		orgModel := fixtures.NewOrganization().Build()
		require.NoError(t, tx.Create(&orgModel).Error)

		divModel := fixtures.NewDivision().WithOrganizationID(orgModel.ID).Build()
		require.NoError(t, tx.Create(&divModel).Error)

		userModel := fixtures.NewUser().Build()
		require.NoError(t, tx.Create(&userModel).Error)

		txModel := fixtures.NewTransaction().
			WithOrganizationID(orgModel.ID).
			WithDivisionID(divModel.ID).
			WithRequestedBy(userModel.ID).
			Build()
		require.NoError(t, tx.Create(&txModel).Error)

		// Delete
		err := repo.Delete(ctx, orgModel.ID, txModel.ID)
		require.NoError(t, err)

		// Verify deleted
		_, err = repo.GetByID(ctx, orgModel.ID, txModel.ID)
		assert.Error(t, err)
	})
}
