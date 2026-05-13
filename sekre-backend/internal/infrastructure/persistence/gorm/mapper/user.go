package mapper

import (
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/models"
)

// UserToModel converts domain entity to GORM model
func UserToModel(e *entity.User) *models.User {
	if e == nil {
		return nil
	}
	return &models.User{
		ID:                e.ID,
		Email:             e.Email,
		PasswordHash:      e.PasswordHash,
		FullName:          e.FullName,
		MustResetPassword: e.MustResetPassword,
		CreatedAt:         e.CreatedAt,
		UpdatedAt:         e.UpdatedAt,
	}
}

// UserToEntity converts GORM model to domain entity
func UserToEntity(m *models.User) *entity.User {
	if m == nil {
		return nil
	}
	return &entity.User{
		ID:                m.ID,
		Email:             m.Email,
		PasswordHash:      m.PasswordHash,
		FullName:          m.FullName,
		MustResetPassword: m.MustResetPassword,
		CreatedAt:         m.CreatedAt,
		UpdatedAt:         m.UpdatedAt,
	}
}

// OrganizationToModel converts domain entity to GORM model
func OrganizationToModel(e *entity.Organization) *models.Organization {
	if e == nil {
		return nil
	}
	return &models.Organization{
		ID:               e.ID,
		Name:             e.Name,
		Subdomain:        e.Subdomain,
		SubscriptionPlan: e.SubscriptionPlan,
		CreatedAt:        e.CreatedAt,
		UpdatedAt:        e.UpdatedAt,
	}
}

// OrganizationToEntity converts GORM model to domain entity
func OrganizationToEntity(m *models.Organization) *entity.Organization {
	if m == nil {
		return nil
	}
	return &entity.Organization{
		ID:               m.ID,
		Name:             m.Name,
		Subdomain:        m.Subdomain,
		SubscriptionPlan: m.SubscriptionPlan,
		CreatedAt:        m.CreatedAt,
		UpdatedAt:        m.UpdatedAt,
	}
}

// UserOrganizationToModel converts domain entity to GORM model
func UserOrganizationToModel(e *entity.UserOrganization) *models.UserOrganization {
	if e == nil {
		return nil
	}
	return &models.UserOrganization{
		ID:             e.ID,
		UserID:         e.UserID,
		OrganizationID: e.OrganizationID,
		Role:           e.Role,
		CreatedAt:      e.CreatedAt,
	}
}

// UserOrganizationToEntity converts GORM model to domain entity
func UserOrganizationToEntity(m *models.UserOrganization) *entity.UserOrganization {
	if m == nil {
		return nil
	}
	return &entity.UserOrganization{
		ID:             m.ID,
		UserID:         m.UserID,
		OrganizationID: m.OrganizationID,
		Role:           m.Role,
		CreatedAt:      m.CreatedAt,
	}
}

// PasswordResetToModel converts domain entity to GORM model
func PasswordResetToModel(e *entity.PasswordReset) *models.PasswordReset {
	if e == nil {
		return nil
	}
	return &models.PasswordReset{
		ID:        e.ID,
		UserID:    e.UserID,
		Token:     e.Token,
		ExpiresAt: e.ExpiresAt,
		UsedAt:    e.UsedAt,
		CreatedAt: e.CreatedAt,
	}
}

// PasswordResetToEntity converts GORM model to domain entity
func PasswordResetToEntity(m *models.PasswordReset) *entity.PasswordReset {
	if m == nil {
		return nil
	}
	return &entity.PasswordReset{
		ID:        m.ID,
		UserID:    m.UserID,
		Token:     m.Token,
		ExpiresAt: m.ExpiresAt,
		UsedAt:    m.UsedAt,
		CreatedAt: m.CreatedAt,
	}
}
