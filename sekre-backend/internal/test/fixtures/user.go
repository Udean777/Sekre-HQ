package fixtures

import (
	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/models"
)

// UserBuilder builds test User instances.
type UserBuilder struct {
	user models.User
}

// NewUser creates a new UserBuilder with sensible defaults.
func NewUser() *UserBuilder {
	return &UserBuilder{
		user: models.User{
			ID:           uuid.New(),
			Email:        "user@example.com",
			PasswordHash: "$2a$10$test.hash.for.testing.purposes.only",
			FullName:     "Test User",
		},
	}
}

// WithID sets the user ID.
func (b *UserBuilder) WithID(id uuid.UUID) *UserBuilder {
	b.user.ID = id
	return b
}

// WithEmail sets the user email.
func (b *UserBuilder) WithEmail(email string) *UserBuilder {
	b.user.Email = email
	return b
}

// WithFullName sets the user full name.
func (b *UserBuilder) WithFullName(name string) *UserBuilder {
	b.user.FullName = name
	return b
}

// WithPasswordHash sets the password hash.
func (b *UserBuilder) WithPasswordHash(hash string) *UserBuilder {
	b.user.PasswordHash = hash
	return b
}

// Build returns the constructed User.
func (b *UserBuilder) Build() models.User {
	return b.user
}

// UserOrganizationBuilder builds test UserOrganization instances.
type UserOrganizationBuilder struct {
	uo models.UserOrganization
}

// NewUserOrganization creates a new UserOrganizationBuilder with sensible defaults.
func NewUserOrganization() *UserOrganizationBuilder {
	return &UserOrganizationBuilder{
		uo: models.UserOrganization{
			ID:             uuid.New(),
			UserID:         uuid.New(),
			OrganizationID: uuid.New(),
			Role:           types.RoleMember,
		},
	}
}

// WithUserID sets the user ID.
func (b *UserOrganizationBuilder) WithUserID(id uuid.UUID) *UserOrganizationBuilder {
	b.uo.UserID = id
	return b
}

// WithOrganizationID sets the organization ID.
func (b *UserOrganizationBuilder) WithOrganizationID(id uuid.UUID) *UserOrganizationBuilder {
	b.uo.OrganizationID = id
	return b
}

// WithRole sets the role.
func (b *UserOrganizationBuilder) WithRole(role types.Role) *UserOrganizationBuilder {
	b.uo.Role = role
	return b
}

// Build returns the constructed UserOrganization.
func (b *UserOrganizationBuilder) Build() models.UserOrganization {
	return b.uo
}
