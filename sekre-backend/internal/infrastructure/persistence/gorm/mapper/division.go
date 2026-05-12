package mapper

import (
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/models"
)

// DivisionToModel converts domain entity to GORM model
func DivisionToModel(e *entity.Division) *models.Division {
	if e == nil {
		return nil
	}
	return &models.Division{
		ID:             e.ID,
		OrganizationID: e.OrganizationID,
		Name:           e.Name,
		Description:    e.Description,
		CreatedAt:      e.CreatedAt,
		UpdatedAt:      e.UpdatedAt,
	}
}

// DivisionToEntity converts GORM model to domain entity
func DivisionToEntity(m *models.Division) *entity.Division {
	if m == nil {
		return nil
	}
	return &entity.Division{
		ID:             m.ID,
		OrganizationID: m.OrganizationID,
		Name:           m.Name,
		Description:    m.Description,
		CreatedAt:      m.CreatedAt,
		UpdatedAt:      m.UpdatedAt,
	}
}

// DivisionMemberToModel converts domain entity to GORM model
func DivisionMemberToModel(e *entity.DivisionMember) *models.DivisionMember {
	if e == nil {
		return nil
	}
	return &models.DivisionMember{
		DivisionID:   e.DivisionID,
		UserID:       e.UserID,
		DivisionRole: e.DivisionRole,
		JoinedAt:     e.JoinedAt,
	}
}

// DivisionMemberToEntity converts GORM model to domain entity
func DivisionMemberToEntity(m *models.DivisionMember) *entity.DivisionMember {
	if m == nil {
		return nil
	}
	return &entity.DivisionMember{
		DivisionID:   m.DivisionID,
		UserID:       m.UserID,
		DivisionRole: m.DivisionRole,
		JoinedAt:     m.JoinedAt,
	}
}

// InvitationToModel converts domain entity to GORM model
func InvitationToModel(e *entity.Invitation) *models.Invitation {
	if e == nil {
		return nil
	}
	return &models.Invitation{
		ID:             e.ID,
		OrganizationID: e.OrganizationID,
		Email:          e.Email,
		Token:          e.Token,
		Status:         e.Status,
		InvitedBy:      e.InvitedBy,
		ExpiresAt:      e.ExpiresAt,
		CreatedAt:      e.CreatedAt,
	}
}

// InvitationToEntity converts GORM model to domain entity
func InvitationToEntity(m *models.Invitation) *entity.Invitation {
	if m == nil {
		return nil
	}
	return &entity.Invitation{
		ID:             m.ID,
		OrganizationID: m.OrganizationID,
		Email:          m.Email,
		Token:          m.Token,
		Status:         m.Status,
		InvitedBy:      m.InvitedBy,
		ExpiresAt:      m.ExpiresAt,
		CreatedAt:      m.CreatedAt,
	}
}
