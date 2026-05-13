package entity

import (
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
)

// Division represents organizational division - pure business entity
type Division struct {
	ID             uuid.UUID `json:"id"`
	OrganizationID uuid.UUID `json:"organization_id"`
	Name           string    `json:"name"`
	Description    *string   `json:"description,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// DivisionMember represents member in division
type DivisionMember struct {
	DivisionID   uuid.UUID          `json:"division_id"`
	UserID       uuid.UUID          `json:"user_id"`
	DivisionRole types.DivisionRole `json:"division_role"`
	JoinedAt     time.Time          `json:"joined_at"`
}

// DivisionWithMembers combines division + members
type DivisionWithMembers struct {
	Division Division       `json:"division"`
	Members  []UserWithRole `json:"members"`
}

// UserWithRole combines user + division role
type UserWithRole struct {
	User         User               `json:"user"`
	DivisionRole types.DivisionRole `json:"division_role"`
	JoinedAt     time.Time          `json:"joined_at"`
}

// Invitation represents member invitation
type Invitation struct {
	ID             uuid.UUID              `json:"id"`
	OrganizationID uuid.UUID              `json:"organization_id"`
	Email          string                 `json:"email"`
	Token          string                 `json:"token"`
	Status         types.InvitationStatus `json:"status"`
	InvitedBy      uuid.UUID              `json:"invited_by"`
	ExpiresAt      time.Time              `json:"expires_at"`
	CreatedAt      time.Time              `json:"created_at"`
}
