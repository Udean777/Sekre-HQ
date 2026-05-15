package entity

import (
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
)

// User represents a user account - pure business entity
type User struct {
	ID                uuid.UUID `json:"id"`
	Email             string    `json:"email"`
	PasswordHash      string    `json:"-"` // Never expose password hash in JSON
	FullName          string    `json:"full_name"`
	MustResetPassword bool      `json:"must_reset_password"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// UserOrganization represents the many-to-many relationship between users and organizations
type UserOrganization struct {
	ID             uuid.UUID  `json:"id"`
	UserID         uuid.UUID  `json:"user_id"`
	OrganizationID uuid.UUID  `json:"organization_id"`
	Role           types.Role `json:"role"`
	CreatedAt      time.Time  `json:"created_at"`
}

// UserWithOrganization combines user and organization data
type UserWithOrganization struct {
	User         User         `json:"user"`
	Organization Organization `json:"organization"`
	Role         types.Role   `json:"role"`
}

// UserBasic represents basic user information for search/lookup
type UserBasic struct {
	ID       uuid.UUID `json:"id"`
	Email    string    `json:"email"`
	FullName string    `json:"full_name"`
}

// UserWithOrgRole represents a user with their organization role
type UserWithOrgRole struct {
	ID       uuid.UUID  `json:"id"`
	Email    string     `json:"email"`
	FullName string     `json:"full_name"`
	Role     types.Role `json:"role"`
}

// PasswordReset represents password reset token
type PasswordReset struct {
	ID        uuid.UUID  `json:"id"`
	UserID    uuid.UUID  `json:"user_id"`
	Token     string     `json:"token"`
	ExpiresAt time.Time  `json:"expires_at"`
	UsedAt    *time.Time `json:"used_at,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
}

type RefreshSession struct {
	ID             uuid.UUID  `json:"id"`
	UserID         uuid.UUID  `json:"user_id"`
	OrganizationID uuid.UUID  `json:"organization_id"`
	Role           types.Role `json:"role"`
	TokenHash      string     `json:"-"`
	JTI            string     `json:"jti"`
	ExpiresAt      time.Time  `json:"expires_at"`
	RevokedAt      *time.Time `json:"revoked_at,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}
