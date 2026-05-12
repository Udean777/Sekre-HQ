package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/types"
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

func (r *transactionRepository) Update(ctx context.Context, orgID uuid.UUID, transaction *entity.Transaction) error {
	result := dbFor(ctx, r.db).
		Model(&models.Transaction{}).
		Where("id = ? AND organization_id = ?", transaction.ID, orgID).
		Updates(map[string]interface{}{
			"type":        transaction.Type,
			"amount":      transaction.Amount,
			"description": transaction.Description,
			"status":      transaction.Status,
			"approved_by": transaction.ApprovedBy,
			"receipt_url": transaction.ReceiptURL,
		})
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

	var result struct {
		TotalIncome  float64
		TotalExpense float64
	}

	err := query.Select(
		"COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS total_income, "+
			"COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS total_expense",
		types.TransactionTypeIncome, types.TransactionTypeExpense,
	).Scan(&result).Error
	if err != nil {
		return nil, domainerrors.Internal("get finance summary", err)
	}

	return &entity.FinanceSummary{
		TotalIncome:  result.TotalIncome,
		TotalExpense: result.TotalExpense,
		Balance:      result.TotalIncome - result.TotalExpense,
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
