package mapper

import (
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/models"
)

// EventToModel converts domain entity to GORM model
func EventToModel(e *entity.Event) *models.Event {
	if e == nil {
		return nil
	}
	return &models.Event{
		ID:             e.ID,
		OrganizationID: e.OrganizationID,
		DivisionID:     e.DivisionID,
		Title:          e.Title,
		Description:    e.Description,
		StartTime:      e.StartTime,
		EndTime:        e.EndTime,
		Location:       e.Location,
		CreatedAt:      e.CreatedAt,
		UpdatedAt:      e.UpdatedAt,
	}
}

// EventToEntity converts GORM model to domain entity
func EventToEntity(m *models.Event) *entity.Event {
	if m == nil {
		return nil
	}
	return &entity.Event{
		ID:             m.ID,
		OrganizationID: m.OrganizationID,
		DivisionID:     m.DivisionID,
		Title:          m.Title,
		Description:    m.Description,
		StartTime:      m.StartTime,
		EndTime:        m.EndTime,
		Location:       m.Location,
		CreatedAt:      m.CreatedAt,
		UpdatedAt:      m.UpdatedAt,
	}
}
