package domain

import (
	"time"

	"github.com/google/uuid"
)

// Transaction represents financial transaction
type Transaction struct {
	ID             uuid.UUID  `json:"id"`
	OrganizationID uuid.UUID  `json:"organization_id"`
	DivisionID     uuid.UUID  `json:"division_id"`
	EventID        *uuid.UUID `json:"event_id"`
	Type           string     `json:"type"` // INCOME, EXPENSE
	Amount         float64    `json:"amount"`
	Description    string     `json:"description"`
	Status         string     `json:"status"` // PENDING, APPROVED, REJECTED
	RequestedBy    uuid.UUID  `json:"requested_by"`
	ApprovedBy     *uuid.UUID `json:"approved_by"`
	ReceiptURL     *string    `json:"receipt_url"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

// FinanceSummary represents balance summary
type FinanceSummary struct {
	TotalIncome  float64 `json:"total_income"`
	TotalExpense float64 `json:"total_expense"`
	Balance      float64 `json:"balance"`
}
