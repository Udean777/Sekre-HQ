package mapper

import (
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/models"
)

// AuditLogToModel converts domain entity to GORM model
func AuditLogToModel(e *entity.AuditLog) *models.AuditLog {
	if e == nil {
		return nil
	}
	
	// Convert map[string]interface{} to JSONB
	var details models.JSONB
	if e.Details != nil {
		details = models.JSONB(e.Details)
	}
	
	return &models.AuditLog{
		ID:             e.ID,
		OrganizationID: e.OrganizationID,
		UserID:         e.UserID,
		Action:         e.Action,
		TargetUserID:   e.TargetUserID,
		Details:        details,
		CreatedAt:      e.CreatedAt,
	}
}

// AuditLogToEntity converts GORM model to domain entity
func AuditLogToEntity(m *models.AuditLog) *entity.AuditLog {
	if m == nil {
		return nil
	}
	
	// Convert JSONB to map[string]interface{}
	var details map[string]interface{}
	if m.Details != nil {
		details = map[string]interface{}(m.Details)
	}
	
	return &entity.AuditLog{
		ID:             m.ID,
		OrganizationID: m.OrganizationID,
		UserID:         m.UserID,
		Action:         m.Action,
		TargetUserID:   m.TargetUserID,
		Details:        details,
		CreatedAt:      m.CreatedAt,
	}
}
