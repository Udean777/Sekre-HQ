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
	ID                uuid.UUID `json:"id"`
	Email             string    `json:"email"`
	PasswordHash      string    `json:"-"` // Never expose password hash in JSON
	FullName          string    `json:"full_name"`
	MustResetPassword bool      `json:"must_reset_password"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
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

// UserBasic represents basic user information for search/lookup
type UserBasic struct {
	ID       uuid.UUID `json:"id"`
	Email    string    `json:"email"`
	FullName string    `json:"full_name"`
}

// UserWithOrgRole represents a user with their organization role
type UserWithOrgRole struct {
	ID       uuid.UUID `json:"id"`
	Email    string    `json:"email"`
	FullName string    `json:"full_name"`
	Role     string    `json:"role"`
}

// AuditLog represents an audit trail entry
type AuditLog struct {
	ID             uuid.UUID              `json:"id"`
	OrganizationID uuid.UUID              `json:"organization_id"`
	UserID         uuid.UUID              `json:"user_id"`
	Action         string                 `json:"action"`
	TargetUserID   *uuid.UUID             `json:"target_user_id,omitempty"`
	Details        map[string]interface{} `json:"details,omitempty"`
	CreatedAt      time.Time              `json:"created_at"`
}

// CreateMemberRequest represents request to create a new member
type CreateMemberRequest struct {
	Email      string  `json:"email"`
	FullName   string  `json:"full_name"`
	Role       string  `json:"role"`
	DivisionID *string `json:"division_id,omitempty"`
	DivisionRole *string `json:"division_role,omitempty"`
}

// BulkImportMemberRequest represents a single member in bulk import
type BulkImportMemberRequest struct {
	Email        string `json:"email"`
	FullName     string `json:"full_name"`
	Role         string `json:"role"`
	Division     string `json:"division"`
	DivisionRole string `json:"division_role"`
}

// BulkImportResult represents the result of bulk import
type BulkImportResult struct {
	TotalRows      int                       `json:"total_rows"`
	SuccessCount   int                       `json:"success_count"`
	FailureCount   int                       `json:"failure_count"`
	Errors         []BulkImportError         `json:"errors,omitempty"`
	CreatedMembers []CreatedMemberInfo       `json:"created_members"`
}

// BulkImportError represents an error during bulk import
type BulkImportError struct {
	Row     int    `json:"row"`
	Email   string `json:"email"`
	Message string `json:"message"`
}

// CreatedMemberInfo represents info about a created member
type CreatedMemberInfo struct {
	Email             string `json:"email"`
	FullName          string `json:"full_name"`
	TemporaryPassword string `json:"temporary_password"`
	Division          string `json:"division,omitempty"`
}
