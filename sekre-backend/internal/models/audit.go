package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// JSONB is a custom type for PostgreSQL JSONB
type JSONB map[string]interface{}

// Value implements the driver.Valuer interface
func (j JSONB) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// Scan implements the sql.Scanner interface
func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("failed to unmarshal JSONB value")
	}

	return json.Unmarshal(bytes, j)
}

// AuditLog represents an audit trail entry
type AuditLog struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	OrganizationID uuid.UUID      `gorm:"type:uuid;not null;index" json:"organization_id"`
	UserID         uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	Action         string         `gorm:"type:varchar(100);not null;index" json:"action"`
	TargetUserID   *uuid.UUID     `gorm:"type:uuid;index" json:"target_user_id,omitempty"`
	Details        JSONB          `gorm:"type:jsonb" json:"details,omitempty"`
	CreatedAt      time.Time      `gorm:"autoCreateTime;index" json:"created_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	// Associations
	Organization Organization `gorm:"foreignKey:OrganizationID;constraint:OnDelete:CASCADE" json:"-"`
	User         User         `gorm:"foreignKey:UserID" json:"-"`
	TargetUser   *User        `gorm:"foreignKey:TargetUserID" json:"-"`
}

// TableName specifies the table name for AuditLog
func (AuditLog) TableName() string {
	return "audit_logs"
}

// BeforeCreate hook to generate UUID if not set
func (a *AuditLog) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}
