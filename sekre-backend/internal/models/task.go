package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
	"gorm.io/gorm"
)

// Task represents work item
type Task struct {
	ID             uuid.UUID        `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	OrganizationID uuid.UUID        `gorm:"type:uuid;not null;index" json:"organization_id"`
	DivisionID     uuid.UUID        `gorm:"type:uuid;not null;index" json:"division_id"`
	AssigneeID     *uuid.UUID       `gorm:"type:uuid;index" json:"assignee_id,omitempty"`
	Title          string           `gorm:"type:varchar(255);not null" json:"title"`
	Description    string           `gorm:"type:text" json:"description"`
	Status         types.TaskStatus `gorm:"type:varchar(20);default:'TODO'" json:"status"`
	DueDate        *time.Time       `gorm:"index" json:"due_date,omitempty"`
	CreatedAt      time.Time        `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time        `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt      gorm.DeletedAt   `gorm:"index" json:"-"`

	// Associations
	Organization Organization `gorm:"foreignKey:OrganizationID;constraint:OnDelete:CASCADE" json:"-"`
	Division     Division     `gorm:"foreignKey:DivisionID;constraint:OnDelete:CASCADE" json:"-"`
	Assignee     *User        `gorm:"foreignKey:AssigneeID" json:"-"`
}

// TableName specifies the table name for Task
func (Task) TableName() string {
	return "tasks"
}

// BeforeCreate hook to generate UUID if not set
func (t *Task) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}
