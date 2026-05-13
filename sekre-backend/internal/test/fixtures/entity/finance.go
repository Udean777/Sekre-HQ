package entityfixtures

import (
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/domain/valueobject"
)

// TransactionBuilder builds test entity.Transaction instances.
type TransactionBuilder struct {
	tx entity.Transaction
}

// NewTransaction creates a new TransactionBuilder with sensible defaults.
func NewTransaction() *TransactionBuilder {
	return &TransactionBuilder{
		tx: entity.Transaction{
			ID:             uuid.New(),
			OrganizationID: uuid.New(),
			DivisionID:     uuid.New(),
			Type:           types.TransactionTypeIncome,
			Amount:         valueobject.NewMoney(100000, "IDR"),
			Description:    "Test transaction",
			Status:         types.TransactionStatusApproved,
			RequestedBy:    uuid.New(),
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
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

// AsIncome sets type to Income.
func (b *TransactionBuilder) AsIncome() *TransactionBuilder {
	return b.WithType(types.TransactionTypeIncome)
}

// AsExpense sets type to Expense.
func (b *TransactionBuilder) AsExpense() *TransactionBuilder {
	return b.WithType(types.TransactionTypeExpense)
}

// WithAmount sets the amount using Money value object.
func (b *TransactionBuilder) WithAmount(amount valueobject.Money) *TransactionBuilder {
	b.tx.Amount = amount
	return b
}

// WithAmountCents sets the amount using cents (default currency: IDR).
func (b *TransactionBuilder) WithAmountCents(cents int64) *TransactionBuilder {
	b.tx.Amount = valueobject.NewMoney(cents, "IDR")
	return b
}

// WithCurrency sets the currency while keeping the amount.
func (b *TransactionBuilder) WithCurrency(currency string) *TransactionBuilder {
	b.tx.Amount = valueobject.NewMoney(b.tx.Amount.AmountCents, currency)
	return b
}

// WithDescription sets the description.
func (b *TransactionBuilder) WithDescription(desc string) *TransactionBuilder {
	b.tx.Description = desc
	return b
}

// WithStatus sets the transaction status.
func (b *TransactionBuilder) WithStatus(status types.TransactionStatus) *TransactionBuilder {
	b.tx.Status = status
	return b
}

// AsPending sets status to Pending.
func (b *TransactionBuilder) AsPending() *TransactionBuilder {
	return b.WithStatus(types.TransactionStatusPending)
}

// AsApproved sets status to Approved.
func (b *TransactionBuilder) AsApproved() *TransactionBuilder {
	return b.WithStatus(types.TransactionStatusApproved)
}

// AsRejected sets status to Rejected.
func (b *TransactionBuilder) AsRejected() *TransactionBuilder {
	return b.WithStatus(types.TransactionStatusRejected)
}

// WithRequestedBy sets the requesting user ID.
func (b *TransactionBuilder) WithRequestedBy(userID uuid.UUID) *TransactionBuilder {
	b.tx.RequestedBy = userID
	return b
}

// WithApprovedBy sets the approving user ID.
func (b *TransactionBuilder) WithApprovedBy(userID uuid.UUID) *TransactionBuilder {
	b.tx.ApprovedBy = &userID
	return b
}

// Build returns the constructed entity.Transaction.
func (b *TransactionBuilder) Build() entity.Transaction {
	return b.tx
}

// BuildPtr returns a pointer to the constructed entity.Transaction.
func (b *TransactionBuilder) BuildPtr() *entity.Transaction {
	t := b.tx
	return &t
}
