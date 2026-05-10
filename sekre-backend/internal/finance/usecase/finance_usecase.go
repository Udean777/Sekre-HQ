package usecase

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/internal/finance/repository"
)

type FinanceUsecase struct {
	repo repository.FinanceRepository
}

func NewFinanceUsecase(repo repository.FinanceRepository) *FinanceUsecase {
	return &FinanceUsecase{repo: repo}
}

func (u *FinanceUsecase) CreateTransaction(ctx context.Context, tx *domain.Transaction) error {
	// Validate amount
	if tx.Amount <= 0 {
		return domain.ErrInvalidAmount
	}

	// Validate required fields
	if tx.Description == "" {
		return domain.ErrRequired
	}

	// For MVP: auto-approve all transactions
	tx.ID = uuid.New()
	tx.Status = "APPROVED"
	tx.CreatedAt = time.Now()
	tx.UpdatedAt = time.Now()

	return u.repo.Create(ctx, tx)
}

func (u *FinanceUsecase) GetByID(ctx context.Context, id uuid.UUID) (*domain.Transaction, error) {
	return u.repo.GetByID(ctx, id)
}

func (u *FinanceUsecase) List(ctx context.Context, orgID uuid.UUID, filters map[string]interface{}) ([]*domain.Transaction, error) {
	return u.repo.List(ctx, orgID, filters)
}

func (u *FinanceUsecase) Update(ctx context.Context, id uuid.UUID, tx *domain.Transaction) error {
	// Validate amount
	if tx.Amount <= 0 {
		return domain.ErrInvalidAmount
	}

	// Validate required fields
	if tx.Description == "" {
		return domain.ErrRequired
	}

	tx.ID = id
	tx.UpdatedAt = time.Now()
	return u.repo.Update(ctx, tx)
}

func (u *FinanceUsecase) Delete(ctx context.Context, id uuid.UUID) error {
	return u.repo.Delete(ctx, id)
}

func (u *FinanceUsecase) GetSummary(ctx context.Context, orgID uuid.UUID, divisionID *uuid.UUID) (*domain.FinanceSummary, error) {
	return u.repo.GetSummary(ctx, orgID, divisionID)
}
