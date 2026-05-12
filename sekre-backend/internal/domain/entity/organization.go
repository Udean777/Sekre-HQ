package entity

import (
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
)

// Organization represents a tenant in the multi-tenant system - pure business entity
type Organization struct {
	ID               uuid.UUID              `json:"id"`
	Name             string                 `json:"name"`
	Subdomain        string                 `json:"subdomain"`
	SubscriptionPlan types.SubscriptionPlan `json:"subscription_plan"`
	CreatedAt        time.Time              `json:"created_at"`
	UpdatedAt        time.Time              `json:"updated_at"`
}
