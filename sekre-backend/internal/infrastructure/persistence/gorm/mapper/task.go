package mapper

import (
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/models"
)

// TaskToModel converts domain entity to GORM model
func TaskToModel(e *entity.Task) *models.Task {
	if e == nil {
		return nil
	}
	return &models.Task{
		ID:             e.ID,
		OrganizationID: e.OrganizationID,
		DivisionID:     e.DivisionID,
		AssigneeID:     e.AssigneeID,
		Title:          e.Title,
		Description:    e.Description,
		Status:         e.Status,
		DueDate:        e.DueDate,
		CreatedAt:      e.CreatedAt,
		UpdatedAt:      e.UpdatedAt,
	}
}

// TaskToEntity converts GORM model to domain entity
func TaskToEntity(m *models.Task) *entity.Task {
	if m == nil {
		return nil
	}
	return &entity.Task{
		ID:             m.ID,
		OrganizationID: m.OrganizationID,
		DivisionID:     m.DivisionID,
		AssigneeID:     m.AssigneeID,
		Title:          m.Title,
		Description:    m.Description,
		Status:         m.Status,
		DueDate:        m.DueDate,
		CreatedAt:      m.CreatedAt,
		UpdatedAt:      m.UpdatedAt,
	}
}
