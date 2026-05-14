package repository

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/domain/valueobject"
	"github.com/username/sekre-backend/internal/infrastructure/persistence/gorm/mapper"
	"github.com/username/sekre-backend/internal/models"
	"gorm.io/gorm"
)

type transactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) repository.TransactionRepository {
	return &transactionRepository{db: db}
}

func (r *transactionRepository) Create(ctx context.Context, orgID uuid.UUID, transaction *entity.Transaction) error {
	transaction.OrganizationID = orgID
	model := mapper.TransactionToModel(transaction)
	if err := dbFor(ctx, r.db).Create(model).Error; err != nil {
		return domainerrors.Internal("create transaction", err)
	}
	transaction.CreatedAt = model.CreatedAt
	transaction.UpdatedAt = model.UpdatedAt
	return nil
}

func (r *transactionRepository) GetByID(ctx context.Context, orgID, transactionID uuid.UUID) (*entity.Transaction, error) {
	var model models.Transaction
	err := dbFor(ctx, r.db).
		Where("id = ? AND organization_id = ?", transactionID, orgID).
		First(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domainerrors.ErrTransactionNotFound
		}
		return nil, domainerrors.Internal("get transaction", err)
	}
	return mapper.TransactionToEntity(&model), nil
}

func (r *transactionRepository) List(ctx context.Context, orgID, divisionID uuid.UUID) ([]entity.Transaction, error) {
	var rows []models.Transaction
	err := dbFor(ctx, r.db).
		Where("organization_id = ? AND division_id = ?", orgID, divisionID).
		Order("created_at DESC").
		Find(&rows).Error
	if err != nil {
		return nil, domainerrors.Internal("list transactions", err)
	}

	transactions := make([]entity.Transaction, len(rows))
	for i := range rows {
		transactions[i] = *mapper.TransactionToEntity(&rows[i])
	}
	return transactions, nil
}

func (r *transactionRepository) ListFiltered(ctx context.Context, orgID uuid.UUID, filters entity.TransactionFilters) ([]entity.Transaction, error) {
	query := dbFor(ctx, r.db).
		Model(&models.Transaction{}).
		Where("organization_id = ?", orgID)

	if filters.DivisionID != nil {
		query = query.Where("division_id = ?", *filters.DivisionID)
	}
	if filters.Type != nil {
		query = query.Where("type = ?", *filters.Type)
	}
	if filters.StartDate != nil {
		query = query.Where("created_at >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		query = query.Where("created_at <= ?", *filters.EndDate)
	}

	var rows []models.Transaction
	if err := query.Order("created_at DESC").Find(&rows).Error; err != nil {
		return nil, domainerrors.Internal("list transactions", err)
	}

	transactions := make([]entity.Transaction, len(rows))
	for i := range rows {
		transactions[i] = *mapper.TransactionToEntity(&rows[i])
	}
	return transactions, nil
}

func (r *transactionRepository) ListFilteredPaginated(ctx context.Context, orgID uuid.UUID, filters entity.TransactionFilters, pagination types.PaginationParams) ([]entity.Transaction, int, error) {
	// Build base query for count
	baseQuery := dbFor(ctx, r.db).
		Model(&models.Transaction{}).
		Where("organization_id = ?", orgID)

	if filters.DivisionID != nil {
		baseQuery = baseQuery.Where("division_id = ?", *filters.DivisionID)
	}
	if filters.Type != nil {
		baseQuery = baseQuery.Where("type = ?", *filters.Type)
	}
	if filters.StartDate != nil {
		baseQuery = baseQuery.Where("created_at >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		baseQuery = baseQuery.Where("created_at <= ?", *filters.EndDate)
	}
	if filters.Search != nil && *filters.Search != "" {
		searchPattern := "%" + *filters.Search + "%"
		baseQuery = baseQuery.Where("LOWER(description) LIKE LOWER(?)", searchPattern)
	}
	if filters.MinAmount != nil {
		baseQuery = baseQuery.Where("amount_cents >= ?", *filters.MinAmount)
	}
	if filters.MaxAmount != nil {
		baseQuery = baseQuery.Where("amount_cents <= ?", *filters.MaxAmount)
	}

	// Get total count
	var totalCount int64
	if err := baseQuery.Count(&totalCount).Error; err != nil {
		return nil, 0, domainerrors.Internal("count transactions", err)
	}

	// Build query for paginated results
	query := dbFor(ctx, r.db).
		Model(&models.Transaction{}).
		Where("organization_id = ?", orgID)

	if filters.DivisionID != nil {
		query = query.Where("division_id = ?", *filters.DivisionID)
	}
	if filters.Type != nil {
		query = query.Where("type = ?", *filters.Type)
	}
	if filters.StartDate != nil {
		query = query.Where("created_at >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		query = query.Where("created_at <= ?", *filters.EndDate)
	}
	if filters.Search != nil && *filters.Search != "" {
		searchPattern := "%" + *filters.Search + "%"
		query = query.Where("LOWER(description) LIKE LOWER(?)", searchPattern)
	}
	if filters.MinAmount != nil {
		query = query.Where("amount_cents >= ?", *filters.MinAmount)
	}
	if filters.MaxAmount != nil {
		query = query.Where("amount_cents <= ?", *filters.MaxAmount)
	}

	var rows []models.Transaction
	if err := query.Order("created_at DESC").
		Limit(pagination.Limit).
		Offset(pagination.Offset).
		Find(&rows).Error; err != nil {
		return nil, 0, domainerrors.Internal("list transactions", err)
	}

	transactions := make([]entity.Transaction, len(rows))
	for i := range rows {
		transactions[i] = *mapper.TransactionToEntity(&rows[i])
	}
	return transactions, int(totalCount), nil
}

func (r *transactionRepository) Update(ctx context.Context, orgID uuid.UUID, transaction *entity.Transaction) error {
	// Default to IDR if currency is not set
	currency := transaction.Amount.Currency
	if currency == "" {
		currency = "IDR"
	}

	updates := map[string]interface{}{
		"type":         transaction.Type,
		"amount_cents": transaction.Amount.AmountCents,
		"currency":     currency,
		"description":  transaction.Description,
		"status":       transaction.Status,
		"approved_by":  transaction.ApprovedBy,
		"receipt_url":  transaction.ReceiptURL,
	}

	result := dbFor(ctx, r.db).
		Model(&models.Transaction{}).
		Where("id = ? AND organization_id = ?", transaction.ID, orgID).
		Updates(updates)
	if result.Error != nil {
		return domainerrors.Internal("update transaction", result.Error)
	}
	if result.RowsAffected == 0 {
		return domainerrors.ErrTransactionNotFound
	}
	return nil
}

func (r *transactionRepository) Delete(ctx context.Context, orgID, transactionID uuid.UUID) error {
	result := dbFor(ctx, r.db).
		Where("id = ? AND organization_id = ?", transactionID, orgID).
		Delete(&models.Transaction{})
	if result.Error != nil {
		return domainerrors.Internal("delete transaction", result.Error)
	}
	if result.RowsAffected == 0 {
		return domainerrors.ErrTransactionNotFound
	}
	return nil
}

func (r *transactionRepository) GetSummary(ctx context.Context, orgID uuid.UUID, divisionID *uuid.UUID) (*entity.FinanceSummary, error) {
	query := dbFor(ctx, r.db).
		Model(&models.Transaction{}).
		Where("organization_id = ? AND status = ?", orgID, types.TransactionStatusApproved)

	if divisionID != nil {
		query = query.Where("division_id = ?", *divisionID)
	}

	// Use integer arithmetic with amount_cents for precision
	var result struct {
		TotalIncomeCents  int64
		TotalExpenseCents int64
		Currency          string
	}

	err := query.Select(
		"COALESCE(SUM(CASE WHEN type = ? THEN amount_cents ELSE 0 END), 0) AS total_income_cents, "+
			"COALESCE(SUM(CASE WHEN type = ? THEN amount_cents ELSE 0 END), 0) AS total_expense_cents, "+
			"COALESCE(MAX(currency), 'IDR') AS currency",
		types.TransactionTypeIncome, types.TransactionTypeExpense,
	).Scan(&result).Error
	if err != nil {
		return nil, domainerrors.Internal("get finance summary", err)
	}

	// Default currency if no transactions
	if result.Currency == "" {
		result.Currency = "IDR"
	}

	return &entity.FinanceSummary{
		TotalIncome:  valueobject.NewMoney(result.TotalIncomeCents, result.Currency),
		TotalExpense: valueobject.NewMoney(result.TotalExpenseCents, result.Currency),
		Balance:      valueobject.NewMoney(result.TotalIncomeCents-result.TotalExpenseCents, result.Currency),
	}, nil
}

func (r *transactionRepository) GetSummaryWithDateRange(ctx context.Context, orgID uuid.UUID, divisionID *uuid.UUID, startDate, endDate *time.Time) (*entity.FinanceSummary, error) {
	query := dbFor(ctx, r.db).
		Model(&models.Transaction{}).
		Where("organization_id = ? AND status = ?", orgID, types.TransactionStatusApproved)

	if divisionID != nil {
		query = query.Where("division_id = ?", *divisionID)
	}
	if startDate != nil {
		query = query.Where("created_at >= ?", *startDate)
	}
	if endDate != nil {
		query = query.Where("created_at <= ?", *endDate)
	}

	// Use integer arithmetic with amount_cents for precision
	var result struct {
		TotalIncomeCents  int64
		TotalExpenseCents int64
		Currency          string
	}

	err := query.Select(
		"COALESCE(SUM(CASE WHEN type = ? THEN amount_cents ELSE 0 END), 0) AS total_income_cents, "+
			"COALESCE(SUM(CASE WHEN type = ? THEN amount_cents ELSE 0 END), 0) AS total_expense_cents, "+
			"COALESCE(MAX(currency), 'IDR') AS currency",
		types.TransactionTypeIncome, types.TransactionTypeExpense,
	).Scan(&result).Error
	if err != nil {
		return nil, domainerrors.Internal("get finance summary", err)
	}

	// Default currency if no transactions
	if result.Currency == "" {
		result.Currency = "IDR"
	}

	return &entity.FinanceSummary{
		TotalIncome:  valueobject.NewMoney(result.TotalIncomeCents, result.Currency),
		TotalExpense: valueobject.NewMoney(result.TotalExpenseCents, result.Currency),
		Balance:      valueobject.NewMoney(result.TotalIncomeCents-result.TotalExpenseCents, result.Currency),
	}, nil
}

func (r *transactionRepository) CountRecentByDivision(ctx context.Context, orgID, divisionID uuid.UUID) (int64, error) {
	var count int64
	err := dbFor(ctx, r.db).
		Model(&models.Transaction{}).
		Where("organization_id = ? AND division_id = ? AND created_at > NOW() - INTERVAL '30 days'", orgID, divisionID).
		Count(&count).Error
	if err != nil {
		return 0, domainerrors.Internal("count recent transactions", err)
	}
	return count, nil
}
