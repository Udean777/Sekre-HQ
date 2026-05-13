package types

import (
	"database/sql/driver"
	"fmt"
)

// InvitationStatus represents the lifecycle state of an invitation.
type InvitationStatus string

const (
	InvitationStatusPending  InvitationStatus = "PENDING"
	InvitationStatusAccepted InvitationStatus = "ACCEPTED"
	InvitationStatusExpired  InvitationStatus = "EXPIRED"
)

// AllInvitationStatuses returns every valid InvitationStatus value.
func AllInvitationStatuses() []InvitationStatus {
	return []InvitationStatus{
		InvitationStatusPending,
		InvitationStatusAccepted,
		InvitationStatusExpired,
	}
}

// Validate reports whether s is a recognized InvitationStatus.
func (s InvitationStatus) Validate() error {
	switch s {
	case InvitationStatusPending, InvitationStatusAccepted, InvitationStatusExpired:
		return nil
	default:
		return fmt.Errorf("%w: invitation status %q", ErrInvalidEnumValue, string(s))
	}
}

// String returns the canonical string representation.
func (s InvitationStatus) String() string { return string(s) }

// Value implements driver.Valuer.
func (s InvitationStatus) Value() (driver.Value, error) {
	if err := s.Validate(); err != nil {
		return nil, err
	}
	return string(s), nil
}

// Scan implements sql.Scanner.
func (s *InvitationStatus) Scan(value interface{}) error {
	raw, err := scanString(value)
	if err != nil {
		return err
	}
	is := InvitationStatus(raw)
	if err := is.Validate(); err != nil {
		return err
	}
	*s = is
	return nil
}
