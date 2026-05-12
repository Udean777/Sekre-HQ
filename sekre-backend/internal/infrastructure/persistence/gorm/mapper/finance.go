package mapper

import (
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/valueobject"
	"github.com/username/sekre-backend/internal/models"
)

// TransactionToModel converts domain entity to GORM model
func TransactionToModel(e *entity.Transaction) *models.Transaction {
	if e == nil {
		return nil
	}

	// Default to IDR if currency is not set
	currency := e.Amount.Currency
	if currency == "" {
		currency = "IDR"
	}

	return &models.Transaction{
		ID:             e.ID,
		OrganizationID: e.OrganizationID,
		DivisionID:     e.DivisionID,
		EventID:        e.EventID,
		Type:           e.Type,
		AmountCents:    e.Amount.AmountCents,
		Currency:       currency,
		Description:    e.Description,
		Status:         e.Status,
		RequestedBy:    e.RequestedBy,
		ApprovedBy:     e.ApprovedBy,
		ReceiptURL:     e.ReceiptURL,
		CreatedAt:      e.CreatedAt,
		UpdatedAt:      e.UpdatedAt,
	}
}

// TransactionToEntity converts GORM model to domain entity
func TransactionToEntity(m *models.Transaction) *entity.Transaction {
	if m == nil {
		return nil
	}

	// Default to IDR if currency is not set
	currency := m.Currency
	if currency == "" {
		currency = "IDR"
	}

	return &entity.Transaction{
		ID:             m.ID,
		OrganizationID: m.OrganizationID,
		DivisionID:     m.DivisionID,
		EventID:        m.EventID,
		Type:           m.Type,
		Amount:         valueobject.NewMoney(m.AmountCents, currency),
		Description:    m.Description,
		Status:         m.Status,
		RequestedBy:    m.RequestedBy,
		ApprovedBy:     m.ApprovedBy,
		ReceiptURL:     m.ReceiptURL,
		CreatedAt:      m.CreatedAt,
		UpdatedAt:      m.UpdatedAt,
	}
}
