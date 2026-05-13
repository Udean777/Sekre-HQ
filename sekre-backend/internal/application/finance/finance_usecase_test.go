package finance

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/domain/valueobject"
	"github.com/username/sekre-backend/internal/test/mocks"
)

func TestFinanceUsecase_CreateTransaction_Success(t *testing.T) {
	t.Parallel()

	// Setup
	repo := mocks.NewTransactionRepository(t)
	uc := NewFinanceUsecase(repo)

	ctx := context.Background()
	orgID := uuid.New()
	divisionID := uuid.New()

	tx := &entity.Transaction{
		OrganizationID: orgID,
		DivisionID:     divisionID,
		Type:           types.TransactionTypeIncome,
		Amount:         valueobject.NewMoney(100000, "IDR"),
		Description:    "Test transaction",
	}

	// Expectations
	repo.EXPECT().
		Create(ctx, orgID, mock.MatchedBy(func(t *entity.Transaction) bool {
			return t.OrganizationID == orgID &&
				t.Amount.AmountCents == 100000 &&
				t.Status == types.TransactionStatusApproved
		})).
		Return(nil).
		Once()

	// Execute
	err := uc.CreateTransaction(ctx, tx)

	// Assert
	assert.NoError(t, err)
	assert.NotEqual(t, uuid.Nil, tx.ID)
	assert.Equal(t, types.TransactionStatusApproved, tx.Status)
}

func TestFinanceUsecase_CreateTransaction_InvalidAmount(t *testing.T) {
	t.Parallel()

	// Setup
	uc := NewFinanceUsecase(nil)

	tx := &entity.Transaction{
		OrganizationID: uuid.New(),
		Type:           types.TransactionTypeIncome,
		Amount:         valueobject.NewMoney(0, "IDR"), // Zero amount
		Description:    "Test",
	}

	// Execute
	err := uc.CreateTransaction(context.Background(), tx)

	// Assert
	assert.Error(t, err)
	assert.ErrorIs(t, err, domainerrors.ErrInvalidAmount)
}

func TestFinanceUsecase_CreateTransaction_EmptyDescription(t *testing.T) {
	t.Parallel()

	// Setup
	uc := NewFinanceUsecase(nil)

	tx := &entity.Transaction{
		OrganizationID: uuid.New(),
		Type:           types.TransactionTypeIncome,
		Amount:         valueobject.NewMoney(100000, "IDR"),
		Description:    "", // Empty description
	}

	// Execute
	err := uc.CreateTransaction(context.Background(), tx)

	// Assert
	assert.Error(t, err)
	assert.ErrorIs(t, err, domainerrors.ErrRequired)
}

func TestFinanceUsecase_GetByID_Success(t *testing.T) {
	t.Parallel()

	// Setup
	repo := mocks.NewTransactionRepository(t)
	uc := NewFinanceUsecase(repo)

	ctx := context.Background()
	orgID := uuid.New()
	txID := uuid.New()

	expectedTx := &entity.Transaction{
		ID:             txID,
		OrganizationID: orgID,
		Type:           types.TransactionTypeIncome,
		Amount:         valueobject.NewMoney(100000, "IDR"),
		Description:    "Test",
	}

	repo.EXPECT().
		GetByID(ctx, orgID, txID).
		Return(expectedTx, nil).
		Once()

	// Execute
	result, err := uc.GetByID(ctx, orgID, txID)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, txID, result.ID)
}

func TestFinanceUsecase_GetByID_NotFound(t *testing.T) {
	t.Parallel()

	// Setup
	repo := mocks.NewTransactionRepository(t)
	uc := NewFinanceUsecase(repo)

	ctx := context.Background()
	orgID := uuid.New()
	txID := uuid.New()

	repo.EXPECT().
		GetByID(ctx, orgID, txID).
		Return(nil, domainerrors.ErrTransactionNotFound).
		Once()

	// Execute
	result, err := uc.GetByID(ctx, orgID, txID)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.ErrorIs(t, err, domainerrors.ErrTransactionNotFound)
}

func TestFinanceUsecase_Delete_Success(t *testing.T) {
	t.Parallel()

	// Setup
	repo := mocks.NewTransactionRepository(t)
	uc := NewFinanceUsecase(repo)

	ctx := context.Background()
	orgID := uuid.New()
	txID := uuid.New()

	repo.EXPECT().
		Delete(ctx, orgID, txID).
		Return(nil).
		Once()

	// Execute
	err := uc.Delete(ctx, orgID, txID)

	// Assert
	assert.NoError(t, err)
}

func TestFinanceUsecase_GetSummary_Success(t *testing.T) {
	t.Parallel()

	// Setup
	repo := mocks.NewTransactionRepository(t)
	uc := NewFinanceUsecase(repo)

	ctx := context.Background()
	orgID := uuid.New()

	expectedSummary := &entity.FinanceSummary{
		TotalIncome:  valueobject.NewMoney(500000, "IDR"),
		TotalExpense: valueobject.NewMoney(300000, "IDR"),
		Balance:      valueobject.NewMoney(200000, "IDR"),
	}

	repo.EXPECT().
		GetSummary(ctx, orgID, (*uuid.UUID)(nil)).
		Return(expectedSummary, nil).
		Once()

	// Execute
	result, err := uc.GetSummary(ctx, orgID, nil)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, int64(500000), result.TotalIncome.AmountCents)
	assert.Equal(t, int64(300000), result.TotalExpense.AmountCents)
	assert.Equal(t, int64(200000), result.Balance.AmountCents)
}

func TestFinanceUsecase_List_Success(t *testing.T) {
	t.Parallel()

	// Setup
	repo := mocks.NewTransactionRepository(t)
	uc := NewFinanceUsecase(repo)

	ctx := context.Background()
	orgID := uuid.New()
	txType := types.TransactionTypeIncome
	filters := entity.TransactionFilters{
		Type: &txType,
	}

	expectedTxs := []entity.Transaction{
		{
			ID:          uuid.New(),
			Type:        types.TransactionTypeIncome,
			Amount:      valueobject.NewMoney(100000, "IDR"),
			Description: "Income 1",
		},
		{
			ID:          uuid.New(),
			Type:        types.TransactionTypeIncome,
			Amount:      valueobject.NewMoney(200000, "IDR"),
			Description: "Income 2",
		},
	}

	repo.EXPECT().
		ListFiltered(ctx, orgID, filters).
		Return(expectedTxs, nil).
		Once()

	// Execute
	result, err := uc.List(ctx, orgID, filters)

	// Assert
	assert.NoError(t, err)
	assert.Len(t, result, 2)
	assert.Equal(t, "Income 1", result[0].Description)
	assert.Equal(t, "Income 2", result[1].Description)
}
