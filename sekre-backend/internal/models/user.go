package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
	"gorm.io/gorm"
)

// User represents a user account
type User struct {
	ID                uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Email             string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash      string         `gorm:"type:varchar(255);not null" json:"-"`
	FullName          string         `gorm:"type:varchar(255);not null" json:"full_name"`
	MustResetPassword bool           `gorm:"default:false" json:"must_reset_password"`
	CreatedAt         time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`

	// Associations
	Organizations   []Organization   `gorm:"many2many:user_organizations;" json:"-"`
	UserOrganizations []UserOrganization `gorm:"foreignKey:UserID" json:"-"`
	DivisionMembers []DivisionMember `gorm:"foreignKey:UserID" json:"-"`
	AssignedTasks   []Task           `gorm:"foreignKey:AssigneeID" json:"-"`
	AuditLogs       []AuditLog       `gorm:"foreignKey:UserID" json:"-"`
}

// TableName specifies the table name for User
func (User) TableName() string {
	return "users"
}

// BeforeCreate hook to generate UUID if not set
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// UserOrganization represents the many-to-many relationship between users and organizations
type UserOrganization struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	UserID         uuid.UUID  `gorm:"type:uuid;not null;index:idx_user_org_unique,unique" json:"user_id"`
	OrganizationID uuid.UUID  `gorm:"type:uuid;not null;index:idx_user_org_unique,unique" json:"organization_id"`
	Role           types.Role `gorm:"type:varchar(50);default:'MEMBER'" json:"role"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`

	// Associations
	User         User         `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Organization Organization `gorm:"foreignKey:OrganizationID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName specifies the table name for UserOrganization
func (UserOrganization) TableName() string {
	return "user_organizations"
}

// BeforeCreate hook to generate UUID if not set
func (uo *UserOrganization) BeforeCreate(tx *gorm.DB) error {
	if uo.ID == uuid.Nil {
		uo.ID = uuid.New()
	}
	return nil
}

// PasswordReset represents password reset token
type PasswordReset struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Token     string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"token"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	UsedAt    *time.Time `gorm:"index" json:"used_at,omitempty"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	// Associations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

type RefreshSession struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	UserID         uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	OrganizationID uuid.UUID      `gorm:"type:uuid;not null" json:"organization_id"`
	Role           types.Role     `gorm:"type:varchar(50);not null" json:"role"`
	TokenHash      string         `gorm:"type:varchar(255);not null" json:"-"`
	JTI            string         `gorm:"type:varchar(64);uniqueIndex;not null" json:"jti"`
	ExpiresAt      time.Time      `gorm:"not null;index" json:"expires_at"`
	RevokedAt      *time.Time     `gorm:"index" json:"revoked_at,omitempty"`
	CreatedAt      time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

func (RefreshSession) TableName() string {
	return "refresh_sessions"
}

func (rs *RefreshSession) BeforeCreate(tx *gorm.DB) error {
	if rs.ID == uuid.Nil {
		rs.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name for PasswordReset
func (PasswordReset) TableName() string {
	return "password_resets"
}

// BeforeCreate hook to generate UUID if not set
func (pr *PasswordReset) BeforeCreate(tx *gorm.DB) error {
	if pr.ID == uuid.Nil {
		pr.ID = uuid.New()
	}
	return nil
}
