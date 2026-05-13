package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
	"gorm.io/gorm"
)

// Organization represents a tenant in the multi-tenant system
type Organization struct {
	ID               uuid.UUID              `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Name             string                 `gorm:"type:varchar(255);not null" json:"name"`
	Subdomain        string                 `gorm:"type:varchar(100);uniqueIndex;not null" json:"subdomain"`
	SubscriptionPlan types.SubscriptionPlan `gorm:"type:varchar(20);default:'FREE'" json:"subscription_plan"`
	CreatedAt        time.Time              `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time              `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt        gorm.DeletedAt         `gorm:"index" json:"-"`

	// Associations
	Users     []User     `gorm:"many2many:user_organizations;" json:"-"`
	Divisions []Division `gorm:"foreignKey:OrganizationID" json:"-"`
	Events    []Event    `gorm:"foreignKey:OrganizationID" json:"-"`
	Tasks     []Task     `gorm:"foreignKey:OrganizationID" json:"-"`
	AuditLogs []AuditLog `gorm:"foreignKey:OrganizationID" json:"-"`
}

// TableName specifies the table name for Organization
func (Organization) TableName() string {
	return "organizations"
}

// BeforeCreate hook to generate UUID if not set
func (o *Organization) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}
