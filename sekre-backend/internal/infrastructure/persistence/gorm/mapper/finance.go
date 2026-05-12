package mapper

import (
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/valueobject"
	"github.com/username/sekre-backend/internal/models"
)

// TransactionToModel converts domain entity to GORM model
// Dual-write: writes both old (Amount) and new (AmountCents, Currency) fields
func TransactionToModel(e *entity.Transaction) *models.Transaction {
	if e == nil {
		return nil
	}

	model := &models.Transaction{
		ID:             e.ID,
		OrganizationID: e.OrganizationID,
		DivisionID:     e.DivisionID,
		EventID:        e.EventID,
		Type:           e.Type,
		Description:    e.Description,
		Status:         e.Status,
		RequestedBy:    e.RequestedBy,
		ApprovedBy:     e.ApprovedBy,
		ReceiptURL:     e.ReceiptURL,
		CreatedAt:      e.CreatedAt,
		UpdatedAt:      e.UpdatedAt,
	}

	// Dual-write: populate both old and new fields
	if e.AmountMoney != nil {
		// New field takes precedence
		model.AmountCents = e.AmountMoney.AmountCents
		model.Currency = e.AmountMoney.Currency
		model.Amount = e.AmountMoney.ToFloat() // Backward compatibility
	} else if e.Amount != 0 {
		// Fallback to old field if new field not set
		model.Amount = e.Amount
		model.AmountCents = int64(e.Amount * 100) // Convert to cents
		model.Currency = "IDR"                     // Default currency
	}

	return model
}

// TransactionToEntity converts GORM model to domain entity
// Reads from new fields (AmountCents, Currency) if available, falls back to old field (Amount)
func TransactionToEntity(m *models.Transaction) *entity.Transaction {
	if m == nil {
		return nil
	}

	entity := &entity.Transaction{
		ID:             m.ID,
		OrganizationID: m.OrganizationID,
		DivisionID:     m.DivisionID,
		EventID:        m.EventID,
		Type:           m.Type,
		Description:    m.Description,
		Status:         m.Status,
		RequestedBy:    m.RequestedBy,
		ApprovedBy:     m.ApprovedBy,
		ReceiptURL:     m.ReceiptURL,
		CreatedAt:      m.CreatedAt,
		UpdatedAt:      m.UpdatedAt,
	}

	// Populate both old and new fields for backward compatibility
	if m.AmountCents != 0 || m.Currency != "" {
		// New fields available
		currency := m.Currency
		if currency == "" {
			currency = "IDR" // Default
		}
		money := valueobject.NewMoney(m.AmountCents, currency)
		entity.AmountMoney = &money
		entity.Amount = money.ToFloat() // Backward compatibility
	} else if m.Amount != 0 {
		// Fallback to old field
		entity.Amount = m.Amount
		money := valueobject.NewMoneyFromFloat(m.Amount, "IDR")
		entity.AmountMoney = &money
	}

	return entity
}
