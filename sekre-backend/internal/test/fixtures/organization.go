package fixtures

import (
	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/models"
)

// OrganizationBuilder builds test Organization instances.
type OrganizationBuilder struct {
	org models.Organization
}

// NewOrganization creates a new OrganizationBuilder with sensible defaults.
func NewOrganization() *OrganizationBuilder {
	return &OrganizationBuilder{
		org: models.Organization{
			ID:               uuid.New(),
			Name:             "Test Organization",
			Subdomain:        "test-org",
			SubscriptionPlan: types.SubscriptionPlanFree,
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

// WithSubdomain sets the organization subdomain.
func (b *OrganizationBuilder) WithSubdomain(subdomain string) *OrganizationBuilder {
	b.org.Subdomain = subdomain
	return b
}

// WithPlan sets the subscription plan.
func (b *OrganizationBuilder) WithPlan(plan types.SubscriptionPlan) *OrganizationBuilder {
	b.org.SubscriptionPlan = plan
	return b
}

// Build returns the constructed Organization.
func (b *OrganizationBuilder) Build() models.Organization {
	return b.org
}
