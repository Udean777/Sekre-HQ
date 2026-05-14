package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
)

// TransactionRepository handles financial transaction persistence
type TransactionRepository interface {
	Create(ctx context.Context, orgID uuid.UUID, transaction *entity.Transaction) error
	GetByID(ctx context.Context, orgID, transactionID uuid.UUID) (*entity.Transaction, error)
	List(ctx context.Context, orgID, divisionID uuid.UUID) ([]entity.Transaction, error)
	// ListFiltered returns transactions filtered by the given optional
	// criteria (division, type, date range).
	ListFiltered(ctx context.Context, orgID uuid.UUID, filters entity.TransactionFilters) ([]entity.Transaction, error)
	ListFilteredPaginated(ctx context.Context, orgID uuid.UUID, filters entity.TransactionFilters, pagination types.PaginationParams) ([]entity.Transaction, int, error)
	Update(ctx context.Context, orgID uuid.UUID, transaction *entity.Transaction) error
	Delete(ctx context.Context, orgID, transactionID uuid.UUID) error
	// GetSummary aggregates income/expense for the org, optionally scoped
	// to a division. Pass nil divisionID for org-wide totals.
	GetSummary(ctx context.Context, orgID uuid.UUID, divisionID *uuid.UUID) (*entity.FinanceSummary, error)
	GetSummaryWithDateRange(ctx context.Context, orgID uuid.UUID, divisionID *uuid.UUID, startDate, endDate *time.Time) (*entity.FinanceSummary, error)
	CountRecentByDivision(ctx context.Context, orgID, divisionID uuid.UUID) (int64, error)
}
