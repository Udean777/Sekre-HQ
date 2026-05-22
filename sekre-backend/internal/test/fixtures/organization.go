package fixtures

import (
	"fmt"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/models"
)

// OrganizationBuilder builds test Organization instances.
type OrganizationBuilder struct {
	org models.Organization
}

// NewOrganization creates a new OrganizationBuilder with sensible defaults.
// Subdomain is randomized per-call to avoid unique constraint violations when
// multiple organizations are created within the same test transaction.
func NewOrganization() *OrganizationBuilder {
	id := uuid.New()
	return &OrganizationBuilder{
		org: models.Organization{
			ID:               id,
			Name:             "Test Organization",
			Subdomain:        fmt.Sprintf("test-org-%s", id.String()[:8]),
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
