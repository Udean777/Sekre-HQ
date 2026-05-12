package fixtures

import (
	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/models"
)

// TransactionBuilder builds test Transaction instances.
type TransactionBuilder struct {
	tx models.Transaction
}

// NewTransaction creates a new TransactionBuilder with sensible defaults.
func NewTransaction() *TransactionBuilder {
	return &TransactionBuilder{
		tx: models.Transaction{
			ID:             uuid.New(),
			OrganizationID: uuid.New(),
			DivisionID:     uuid.New(),
			Type:           types.TransactionTypeIncome,
			AmountCents:    100000, // 1000.00
			Currency:       "IDR",
			Description:    "Test transaction",
			Status:         types.TransactionStatusPending,
			RequestedBy:    uuid.New(),
		},
	}
}

// WithID sets the transaction ID.
func (b *TransactionBuilder) WithID(id uuid.UUID) *TransactionBuilder {
	b.tx.ID = id
	return b
}

// WithOrganizationID sets the organization ID.
func (b *TransactionBuilder) WithOrganizationID(id uuid.UUID) *TransactionBuilder {
	b.tx.OrganizationID = id
	return b
}

// WithDivisionID sets the division ID.
func (b *TransactionBuilder) WithDivisionID(id uuid.UUID) *TransactionBuilder {
	b.tx.DivisionID = id
	return b
}

// WithType sets the transaction type.
func (b *TransactionBuilder) WithType(t types.TransactionType) *TransactionBuilder {
	b.tx.Type = t
	return b
}

// WithAmountCents sets the amount in cents.
func (b *TransactionBuilder) WithAmountCents(amount int64) *TransactionBuilder {
	b.tx.AmountCents = amount
	return b
}

// WithCurrency sets the currency.
func (b *TransactionBuilder) WithCurrency(currency string) *TransactionBuilder {
	b.tx.Currency = currency
	return b
}

// WithDescription sets the description.
func (b *TransactionBuilder) WithDescription(desc string) *TransactionBuilder {
	b.tx.Description = desc
	return b
}

// WithStatus sets the status.
func (b *TransactionBuilder) WithStatus(status types.TransactionStatus) *TransactionBuilder {
	b.tx.Status = status
	return b
}

// WithRequestedBy sets the requester ID.
func (b *TransactionBuilder) WithRequestedBy(id uuid.UUID) *TransactionBuilder {
	b.tx.RequestedBy = id
	return b
}

// WithApprovedBy sets the approver ID.
func (b *TransactionBuilder) WithApprovedBy(id uuid.UUID) *TransactionBuilder {
	b.tx.ApprovedBy = &id
	return b
}

// Build returns the constructed Transaction.
func (b *TransactionBuilder) Build() models.Transaction {
	return b.tx
}
