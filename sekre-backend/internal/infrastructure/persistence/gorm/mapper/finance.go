package mapper

import (
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/models"
)

// TransactionToModel converts domain entity to GORM model
func TransactionToModel(e *entity.Transaction) *models.Transaction {
	if e == nil {
		return nil
	}
	return &models.Transaction{
		ID:             e.ID,
		OrganizationID: e.OrganizationID,
		DivisionID:     e.DivisionID,
		EventID:        e.EventID,
		Type:           e.Type,
		Amount:         e.Amount,
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
	return &entity.Transaction{
		ID:             m.ID,
		OrganizationID: m.OrganizationID,
		DivisionID:     m.DivisionID,
		EventID:        m.EventID,
		Type:           m.Type,
		Amount:         m.Amount,
		Description:    m.Description,
		Status:         m.Status,
		RequestedBy:    m.RequestedBy,
		ApprovedBy:     m.ApprovedBy,
		ReceiptURL:     m.ReceiptURL,
		CreatedAt:      m.CreatedAt,
		UpdatedAt:      m.UpdatedAt,
	}
}
