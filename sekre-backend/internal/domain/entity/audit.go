package entity

import (
	"time"

	"github.com/google/uuid"
)

// AuditLog represents an audit trail entry - pure business entity
type AuditLog struct {
	ID             uuid.UUID              `json:"id"`
	OrganizationID uuid.UUID              `json:"organization_id"`
	UserID         uuid.UUID              `json:"user_id"`
	Action         string                 `json:"action"`
	TargetUserID   *uuid.UUID             `json:"target_user_id,omitempty"`
	Details        map[string]interface{} `json:"details,omitempty"`
	CreatedAt      time.Time              `json:"created_at"`
}
