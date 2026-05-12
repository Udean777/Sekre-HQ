package finance

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/types"
)

// FinanceUsecase defines business operations for finance transactions.
// Operates on entity.Transaction directly.
type FinanceUsecase interface {
	CreateTransaction(ctx context.Context, tx *entity.Transaction) error
	GetByID(ctx context.Context, orgID, id uuid.UUID) (*entity.Transaction, error)
	List(ctx context.Context, orgID uuid.UUID, filters entity.TransactionFilters) ([]entity.Transaction, error)
	Update(ctx context.Context, orgID, id uuid.UUID, tx *entity.Transaction) error
	Delete(ctx context.Context, orgID, id uuid.UUID) error
	GetSummary(ctx context.Context, orgID uuid.UUID, divisionID *uuid.UUID) (*entity.FinanceSummary, error)
}

type financeUsecase struct {
	repo repository.TransactionRepository
}

// NewFinanceUsecase returns a new finance usecase backed by the given repository.
func NewFinanceUsecase(repo repository.TransactionRepository) FinanceUsecase {
	return &financeUsecase{repo: repo}
}

func (u *financeUsecase) CreateTransaction(ctx context.Context, tx *entity.Transaction) error {
	if !tx.Amount.IsPositive() {
		return domainerrors.ErrInvalidAmount
	}
	if err := tx.Amount.Validate(); err != nil {
		return domainerrors.InvalidInput("currency", err.Error())
	}
	if tx.Description == "" {
		return domainerrors.ErrRequired
	}
	if err := tx.Type.Validate(); err != nil {
		return err
	}

	// For MVP: auto-approve all transactions
	tx.ID = uuid.New()
	tx.Status = types.TransactionStatusApproved
	now := time.Now()
	tx.CreatedAt = now
	tx.UpdatedAt = now

	return u.repo.Create(ctx, tx.OrganizationID, tx)
}

func (u *financeUsecase) GetByID(ctx context.Context, orgID, id uuid.UUID) (*entity.Transaction, error) {
	return u.repo.GetByID(ctx, orgID, id)
}

func (u *financeUsecase) List(ctx context.Context, orgID uuid.UUID, filters entity.TransactionFilters) ([]entity.Transaction, error) {
	return u.repo.ListFiltered(ctx, orgID, filters)
}

func (u *financeUsecase) Update(ctx context.Context, orgID, id uuid.UUID, tx *entity.Transaction) error {
	if !tx.Amount.IsPositive() {
		return domainerrors.ErrInvalidAmount
	}
	if err := tx.Amount.Validate(); err != nil {
		return domainerrors.InvalidInput("currency", err.Error())
	}
	if tx.Description == "" {
		return domainerrors.ErrRequired
	}
	if err := tx.Type.Validate(); err != nil {
		return err
	}

	tx.ID = id
	tx.UpdatedAt = time.Now()
	return u.repo.Update(ctx, orgID, tx)
}

func (u *financeUsecase) Delete(ctx context.Context, orgID, id uuid.UUID) error {
	return u.repo.Delete(ctx, orgID, id)
}

func (u *financeUsecase) GetSummary(ctx context.Context, orgID uuid.UUID, divisionID *uuid.UUID) (*entity.FinanceSummary, error) {
	return u.repo.GetSummary(ctx, orgID, divisionID)
}
