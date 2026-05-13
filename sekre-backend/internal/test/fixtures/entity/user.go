// Package entityfixtures provides builder-pattern test data creation for domain entities.
// Use this package for unit tests that work with entity.X types.
// For integration tests using GORM models, use the parent fixtures package.
package entityfixtures

import (
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
)

// UserBuilder builds test entity.User instances.
type UserBuilder struct {
	user entity.User
}

// NewUser creates a new UserBuilder with sensible defaults.
func NewUser() *UserBuilder {
	return &UserBuilder{
		user: entity.User{
			ID:           uuid.New(),
			Email:        "user@example.com",
			PasswordHash: "$2a$10$test.hash.for.testing.purposes.only",
			FullName:     "Test User",
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
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

// WithPasswordHash sets the password hash.
func (b *UserBuilder) WithPasswordHash(hash string) *UserBuilder {
	b.user.PasswordHash = hash
	return b
}

// WithFullName sets the user's full name.
func (b *UserBuilder) WithFullName(name string) *UserBuilder {
	b.user.FullName = name
	return b
}

// WithMustResetPassword sets the must reset password flag.
func (b *UserBuilder) WithMustResetPassword(v bool) *UserBuilder {
	b.user.MustResetPassword = v
	return b
}

// WithTimestamps sets both created and updated timestamps.
func (b *UserBuilder) WithTimestamps(t time.Time) *UserBuilder {
	b.user.CreatedAt = t
	b.user.UpdatedAt = t
	return b
}

// Build returns the constructed entity.User.
func (b *UserBuilder) Build() entity.User {
	return b.user
}

// BuildPtr returns a pointer to the constructed entity.User.
func (b *UserBuilder) BuildPtr() *entity.User {
	u := b.user
	return &u
}

// OrganizationBuilder builds test entity.Organization instances.
type OrganizationBuilder struct {
	org entity.Organization
}

// NewOrganization creates a new OrganizationBuilder with sensible defaults.
func NewOrganization() *OrganizationBuilder {
	return &OrganizationBuilder{
		org: entity.Organization{
			ID:               uuid.New(),
			Name:             "Test Organization",
			Subdomain:        "test-org",
			SubscriptionPlan: types.SubscriptionPlanFree,
			CreatedAt:        time.Now(),
			UpdatedAt:        time.Now(),
		},
	}
}

// WithID sets the organization ID.
func (b *OrganizationBuilder) WithID(id uuid.UUID) *OrganizationBuilder {
	b.org.ID = id
	return b
}

// WithName sets the organization name.
func (b *OrganizationBuilder) WithName(name string) *OrganizationBuilder {
	b.org.Name = name
	return b
}

// WithSubdomain sets the subdomain.
func (b *OrganizationBuilder) WithSubdomain(subdomain string) *OrganizationBuilder {
	b.org.Subdomain = subdomain
	return b
}

// WithSubscriptionPlan sets the subscription plan.
func (b *OrganizationBuilder) WithSubscriptionPlan(plan types.SubscriptionPlan) *OrganizationBuilder {
	b.org.SubscriptionPlan = plan
	return b
}

// Build returns the constructed entity.Organization.
func (b *OrganizationBuilder) Build() entity.Organization {
	return b.org
}

// BuildPtr returns a pointer to the constructed entity.Organization.
func (b *OrganizationBuilder) BuildPtr() *entity.Organization {
	o := b.org
	return &o
}

// UserOrganizationBuilder builds test entity.UserOrganization instances.
type UserOrganizationBuilder struct {
	uo entity.UserOrganization
}

// NewUserOrganization creates a new UserOrganizationBuilder with sensible defaults.
func NewUserOrganization() *UserOrganizationBuilder {
	return &UserOrganizationBuilder{
		uo: entity.UserOrganization{
			ID:             uuid.New(),
			UserID:         uuid.New(),
			OrganizationID: uuid.New(),
			Role:           types.RoleMember,
			CreatedAt:      time.Now(),
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

// AsOwner is a convenience method to set role to Owner.
func (b *UserOrganizationBuilder) AsOwner() *UserOrganizationBuilder {
	return b.WithRole(types.RoleOwner)
}

// AsAdmin is a convenience method to set role to Admin.
func (b *UserOrganizationBuilder) AsAdmin() *UserOrganizationBuilder {
	return b.WithRole(types.RoleAdmin)
}

// AsMember is a convenience method to set role to Member.
func (b *UserOrganizationBuilder) AsMember() *UserOrganizationBuilder {
	return b.WithRole(types.RoleMember)
}

// Build returns the constructed entity.UserOrganization.
func (b *UserOrganizationBuilder) Build() entity.UserOrganization {
	return b.uo
}

// BuildPtr returns a pointer to the constructed entity.UserOrganization.
func (b *UserOrganizationBuilder) BuildPtr() *entity.UserOrganization {
	uo := b.uo
	return &uo
}

// UserWithOrganizationBuilder builds test entity.UserWithOrganization instances.
type UserWithOrganizationBuilder struct {
	uwo entity.UserWithOrganization
}

// NewUserWithOrganization creates a builder with sensible defaults.
func NewUserWithOrganization() *UserWithOrganizationBuilder {
	return &UserWithOrganizationBuilder{
		uwo: entity.UserWithOrganization{
			User:         NewUser().Build(),
			Organization: NewOrganization().Build(),
			Role:         types.RoleOwner,
		},
	}
}

// WithUser sets the user.
func (b *UserWithOrganizationBuilder) WithUser(u entity.User) *UserWithOrganizationBuilder {
	b.uwo.User = u
	return b
}

// WithOrganization sets the organization.
func (b *UserWithOrganizationBuilder) WithOrganization(o entity.Organization) *UserWithOrganizationBuilder {
	b.uwo.Organization = o
	return b
}

// WithRole sets the role.
func (b *UserWithOrganizationBuilder) WithRole(role types.Role) *UserWithOrganizationBuilder {
	b.uwo.Role = role
	return b
}

// Build returns the constructed entity.UserWithOrganization.
func (b *UserWithOrganizationBuilder) Build() entity.UserWithOrganization {
	return b.uwo
}

// BuildPtr returns a pointer to the constructed entity.UserWithOrganization.
func (b *UserWithOrganizationBuilder) BuildPtr() *entity.UserWithOrganization {
	uwo := b.uwo
	return &uwo
}
