package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Event represents scheduled event/activity
type Event struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	OrganizationID uuid.UUID      `gorm:"type:uuid;not null;index" json:"organization_id"`
	DivisionID     uuid.UUID      `gorm:"type:uuid;not null;index" json:"division_id"`
	Title          string         `gorm:"type:varchar(255);not null" json:"title"`
	Description    string         `gorm:"type:text" json:"description"`
	StartTime      time.Time      `gorm:"not null;index" json:"start_time"`
	EndTime        time.Time      `gorm:"not null" json:"end_time"`
	Location       string         `gorm:"type:varchar(255)" json:"location"`
	CreatedAt      time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	// Associations
	Organization Organization  `gorm:"foreignKey:OrganizationID;constraint:OnDelete:CASCADE" json:"-"`
	Division     Division      `gorm:"foreignKey:DivisionID;constraint:OnDelete:CASCADE" json:"-"`
	Transactions []Transaction `gorm:"foreignKey:EventID" json:"-"`
}

// TableName specifies the table name for Event
func (Event) TableName() string {
	return "events"
}

// BeforeCreate hook to generate UUID if not set
func (e *Event) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	return nil
}
