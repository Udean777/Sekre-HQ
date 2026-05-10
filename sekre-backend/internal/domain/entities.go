package domain

import (
	"time"

	"github.com/google/uuid"
)

// Organization represents a tenant in the multi-tenant system
type Organization struct {
	ID               uuid.UUID `json:"id"`
	Name             string    `json:"name"`
	Subdomain        string    `json:"subdomain"`
	SubscriptionPlan string    `json:"subscription_plan"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// User represents a user account
type User struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"` // Never expose password hash in JSON
	FullName     string    `json:"full_name"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// UserOrganization represents the many-to-many relationship
type UserOrganization struct {
	ID             uuid.UUID `json:"id"`
	UserID         uuid.UUID `json:"user_id"`
	OrganizationID uuid.UUID `json:"organization_id"`
	Role           string    `json:"role"`
	CreatedAt      time.Time `json:"created_at"`
}

// UserWithOrganization combines user and organization data
type UserWithOrganization struct {
	User         User         `json:"user"`
	Organization Organization `json:"organization"`
	Role         string       `json:"role"`
}
