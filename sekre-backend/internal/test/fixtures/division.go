package fixtures

import (
	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/models"
)

// DivisionBuilder builds test Division instances.
type DivisionBuilder struct {
	div models.Division
}

// NewDivision creates a new DivisionBuilder with sensible defaults.
func NewDivision() *DivisionBuilder {
	desc := "Test division description"
	return &DivisionBuilder{
		div: models.Division{
			ID:             uuid.New(),
			OrganizationID: uuid.New(),
			Name:           "Test Division",
			Description:    &desc,
		},
	}
}

// WithID sets the division ID.
func (b *DivisionBuilder) WithID(id uuid.UUID) *DivisionBuilder {
	b.div.ID = id
	return b
}

// WithOrganizationID sets the organization ID.
func (b *DivisionBuilder) WithOrganizationID(id uuid.UUID) *DivisionBuilder {
	b.div.OrganizationID = id
	return b
}

// WithName sets the division name.
func (b *DivisionBuilder) WithName(name string) *DivisionBuilder {
	b.div.Name = name
	return b
}

// WithDescription sets the division description.
func (b *DivisionBuilder) WithDescription(desc string) *DivisionBuilder {
	b.div.Description = &desc
	return b
}

// Build returns the constructed Division.
func (b *DivisionBuilder) Build() models.Division {
	return b.div
}
