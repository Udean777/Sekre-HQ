package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
)

type FinanceRepository struct {
	db *sql.DB
}

func NewFinanceRepository(db *sql.DB) *FinanceRepository {
	return &FinanceRepository{db: db}
}

func (r *FinanceRepository) Create(ctx context.Context, tx *domain.Transaction) error {
	query := `
		INSERT INTO transactions (id, organization_id, division_id, event_id, type, amount, description, status, requested_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err := r.db.ExecContext(ctx, query,
		tx.ID, tx.OrganizationID, tx.DivisionID, tx.EventID, tx.Type, tx.Amount, tx.Description, tx.Status, tx.RequestedBy, tx.CreatedAt, tx.UpdatedAt,
	)
	return err
}

func (r *FinanceRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Transaction, error) {
	query := `SELECT id, organization_id, division_id, event_id, type, amount, description, status, requested_by, approved_by, receipt_url, created_at, updated_at FROM transactions WHERE id = $1`

	tx := &domain.Transaction{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&tx.ID, &tx.OrganizationID, &tx.DivisionID, &tx.EventID, &tx.Type, &tx.Amount, &tx.Description, &tx.Status, &tx.RequestedBy, &tx.ApprovedBy, &tx.ReceiptURL, &tx.CreatedAt, &tx.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, domain.ErrTransactionNotFound
	}
	return tx, err
}

func (r *FinanceRepository) List(ctx context.Context, orgID uuid.UUID, filters map[string]interface{}) ([]*domain.Transaction, error) {
	query := `SELECT id, organization_id, division_id, event_id, type, amount, description, status, requested_by, approved_by, receipt_url, created_at, updated_at FROM transactions WHERE organization_id = $1`
	args := []interface{}{orgID}
	argPos := 2

	if divID, ok := filters["division_id"]; ok {
		query += fmt.Sprintf(" AND division_id = $%d", argPos)
		args = append(args, divID)
		argPos++
	}

	if txType, ok := filters["type"]; ok {
		query += fmt.Sprintf(" AND type = $%d", argPos)
		args = append(args, txType)
		argPos++
	}

	query += " ORDER BY created_at DESC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []*domain.Transaction
	for rows.Next() {
		tx := &domain.Transaction{}
		if err := rows.Scan(&tx.ID, &tx.OrganizationID, &tx.DivisionID, &tx.EventID, &tx.Type, &tx.Amount, &tx.Description, &tx.Status, &tx.RequestedBy, &tx.ApprovedBy, &tx.ReceiptURL, &tx.CreatedAt, &tx.UpdatedAt); err != nil {
			return nil, err
		}
		transactions = append(transactions, tx)
	}

	return transactions, nil
}

func (r *FinanceRepository) Update(ctx context.Context, tx *domain.Transaction) error {
	query := `UPDATE transactions SET type = $1, amount = $2, description = $3, updated_at = $4 WHERE id = $5`
	_, err := r.db.ExecContext(ctx, query, tx.Type, tx.Amount, tx.Description, tx.UpdatedAt, tx.ID)
	return err
}

func (r *FinanceRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM transactions WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *FinanceRepository) GetSummary(ctx context.Context, orgID uuid.UUID, divisionID *uuid.UUID) (*domain.FinanceSummary, error) {
	query := `
		SELECT 
			COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as total_income,
			COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as total_expense
		FROM transactions 
		WHERE organization_id = $1 AND status = 'APPROVED'
	`
	args := []interface{}{orgID}

	if divisionID != nil {
		query += " AND division_id = $2"
		args = append(args, *divisionID)
	}

	summary := &domain.FinanceSummary{}
	err := r.db.QueryRowContext(ctx, query, args...).Scan(&summary.TotalIncome, &summary.TotalExpense)
	if err != nil {
		return nil, err
	}

	summary.Balance = summary.TotalIncome - summary.TotalExpense
	return summary, nil
}
