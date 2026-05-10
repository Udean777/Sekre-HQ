package domain

import (
	"time"

	"github.com/google/uuid"
)

// Division represents organizational division
type Division struct {
	ID             uuid.UUID `json:"id"`
	OrganizationID uuid.UUID `json:"organization_id"`
	Name           string    `json:"name"`
	Description    string    `json:"description"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// DivisionMember represents member in division
type DivisionMember struct {
	DivisionID   uuid.UUID `json:"division_id"`
	UserID       uuid.UUID `json:"user_id"`
	DivisionRole string    `json:"division_role"` // HEAD, STAFF
	JoinedAt     time.Time `json:"joined_at"`
}

// DivisionWithMembers combines division + members
type DivisionWithMembers struct {
	Division Division       `json:"division"`
	Members  []UserWithRole `json:"members"`
}

// UserWithRole combines user + division role
type UserWithRole struct {
	User         User   `json:"user"`
	DivisionRole string `json:"division_role"`
	JoinedAt     time.Time `json:"joined_at"`
}

// Invitation represents member invitation
type Invitation struct {
	ID             uuid.UUID `json:"id"`
	OrganizationID uuid.UUID `json:"organization_id"`
	Email          string    `json:"email"`
	Token          string    `json:"token"`
	Status         string    `json:"status"` // PENDING, ACCEPTED, EXPIRED
	InvitedBy      uuid.UUID `json:"invited_by"`
	ExpiresAt      time.Time `json:"expires_at"`
	CreatedAt      time.Time `json:"created_at"`
}
