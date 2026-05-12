package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
	"gorm.io/gorm"
)

// Division represents organizational division
type Division struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	OrganizationID uuid.UUID      `gorm:"type:uuid;not null;index" json:"organization_id"`
	Name           string         `gorm:"type:varchar(255);not null" json:"name"`
	Description    *string        `gorm:"type:text" json:"description,omitempty"`
	CreatedAt      time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	// Associations
	Organization    Organization    `gorm:"foreignKey:OrganizationID;constraint:OnDelete:CASCADE" json:"-"`
	DivisionMembers []DivisionMember `gorm:"foreignKey:DivisionID" json:"-"`
	Events          []Event         `gorm:"foreignKey:DivisionID" json:"-"`
	Tasks           []Task          `gorm:"foreignKey:DivisionID" json:"-"`
	Transactions    []Transaction   `gorm:"foreignKey:DivisionID" json:"-"`
}

// TableName specifies the table name for Division
func (Division) TableName() string {
	return "divisions"
}

// BeforeCreate hook to generate UUID if not set
func (d *Division) BeforeCreate(tx *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	return nil
}

// DivisionMember represents member in division
type DivisionMember struct {
	DivisionID   uuid.UUID          `gorm:"type:uuid;not null;primaryKey" json:"division_id"`
	UserID       uuid.UUID          `gorm:"type:uuid;not null;primaryKey" json:"user_id"`
	DivisionRole types.DivisionRole `gorm:"type:varchar(50);not null" json:"division_role"`
	JoinedAt     time.Time          `gorm:"autoCreateTime" json:"joined_at"`

	// Associations
	Division Division `gorm:"foreignKey:DivisionID;constraint:OnDelete:CASCADE" json:"-"`
	User     User     `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName specifies the table name for DivisionMember
func (DivisionMember) TableName() string {
	return "division_members"
}

// Invitation represents member invitation
type Invitation struct {
	ID             uuid.UUID              `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	OrganizationID uuid.UUID              `gorm:"type:uuid;not null;index" json:"organization_id"`
	Email          string                 `gorm:"type:varchar(255);not null" json:"email"`
	Token          string                 `gorm:"type:varchar(255);uniqueIndex;not null" json:"token"`
	Status         types.InvitationStatus `gorm:"type:varchar(20);default:'PENDING'" json:"status"`
	InvitedBy      uuid.UUID              `gorm:"type:uuid;not null" json:"invited_by"`
	ExpiresAt      time.Time              `gorm:"not null" json:"expires_at"`
	CreatedAt      time.Time              `gorm:"autoCreateTime" json:"created_at"`
	DeletedAt      gorm.DeletedAt         `gorm:"index" json:"-"`

	// Associations
	Organization Organization `gorm:"foreignKey:OrganizationID;constraint:OnDelete:CASCADE" json:"-"`
	Inviter      User         `gorm:"foreignKey:InvitedBy" json:"-"`
}

// TableName specifies the table name for Invitation
func (Invitation) TableName() string {
	return "invitations"
}

// BeforeCreate hook to generate UUID if not set
func (i *Invitation) BeforeCreate(tx *gorm.DB) error {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return nil
}
