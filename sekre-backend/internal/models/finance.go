package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
	"gorm.io/gorm"
)

// Transaction represents financial transaction
type Transaction struct {
	ID             uuid.UUID               `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	OrganizationID uuid.UUID               `gorm:"type:uuid;not null;index" json:"organization_id"`
	DivisionID     uuid.UUID               `gorm:"type:uuid;not null;index" json:"division_id"`
	EventID        *uuid.UUID              `gorm:"type:uuid;index" json:"event_id,omitempty"`
	Type           types.TransactionType   `gorm:"type:varchar(20);not null" json:"type"`
	Amount         float64                 `gorm:"type:decimal(15,2);not null" json:"amount"`
	Description    string                  `gorm:"type:text" json:"description"`
	Status         types.TransactionStatus `gorm:"type:varchar(20);default:'PENDING'" json:"status"`
	RequestedBy    uuid.UUID               `gorm:"type:uuid;not null" json:"requested_by"`
	ApprovedBy     *uuid.UUID              `gorm:"type:uuid" json:"approved_by,omitempty"`
	ReceiptURL     *string                 `gorm:"type:varchar(500)" json:"receipt_url,omitempty"`
	CreatedAt      time.Time               `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time               `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt      gorm.DeletedAt          `gorm:"index" json:"-"`

	// Associations
	Organization Organization `gorm:"foreignKey:OrganizationID;constraint:OnDelete:CASCADE" json:"-"`
	Division     Division     `gorm:"foreignKey:DivisionID;constraint:OnDelete:CASCADE" json:"-"`
	Event        *Event       `gorm:"foreignKey:EventID" json:"-"`
	Requester    User         `gorm:"foreignKey:RequestedBy" json:"-"`
	Approver     *User        `gorm:"foreignKey:ApprovedBy" json:"-"`
}

// TableName specifies the table name for Transaction
func (Transaction) TableName() string {
	return "transactions"
}

// BeforeCreate hook to generate UUID if not set
func (t *Transaction) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}
