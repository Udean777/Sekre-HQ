package fixtures

import (
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/models"
)

// EventBuilder builds test Event instances.
type EventBuilder struct {
	event models.Event
}

// NewEvent creates a new EventBuilder with sensible defaults.
func NewEvent() *EventBuilder {
	now := time.Now()
	return &EventBuilder{
		event: models.Event{
			ID:             uuid.New(),
			OrganizationID: uuid.New(),
			DivisionID:     uuid.New(),
			Title:          "Test Event",
			Description:    "Test event description",
			StartTime:      now.Add(24 * time.Hour),
			EndTime:        now.Add(26 * time.Hour),
			Location:       "Test Location",
		},
	}
}

// WithID sets the event ID.
func (b *EventBuilder) WithID(id uuid.UUID) *EventBuilder {
	b.event.ID = id
	return b
}

// WithOrganizationID sets the organization ID.
func (b *EventBuilder) WithOrganizationID(id uuid.UUID) *EventBuilder {
	b.event.OrganizationID = id
	return b
}

// WithDivisionID sets the division ID.
func (b *EventBuilder) WithDivisionID(id uuid.UUID) *EventBuilder {
	b.event.DivisionID = id
	return b
}

// WithTitle sets the event title.
func (b *EventBuilder) WithTitle(title string) *EventBuilder {
	b.event.Title = title
	return b
}

// WithDescription sets the event description.
func (b *EventBuilder) WithDescription(desc string) *EventBuilder {
	b.event.Description = desc
	return b
}

// WithStartTime sets the event start time.
func (b *EventBuilder) WithStartTime(t time.Time) *EventBuilder {
	b.event.StartTime = t
	return b
}

// WithEndTime sets the event end time.
func (b *EventBuilder) WithEndTime(t time.Time) *EventBuilder {
	b.event.EndTime = t
	return b
}

// WithLocation sets the event location.
func (b *EventBuilder) WithLocation(location string) *EventBuilder {
	b.event.Location = location
	return b
}

// Build returns the constructed Event.
func (b *EventBuilder) Build() models.Event {
	return b.event
}
