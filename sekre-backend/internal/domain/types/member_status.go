package types

import (
	"database/sql/driver"
	"fmt"
)

// MemberStatus represents a user's status within an organization.
type MemberStatus string

const (
	StatusActive    MemberStatus = "ACTIVE"
	StatusSuspended MemberStatus = "SUSPENDED"
)

// AllMemberStatuses returns every valid MemberStatus value.
func AllMemberStatuses() []MemberStatus {
	return []MemberStatus{StatusActive, StatusSuspended}
}

// Validate reports whether s is a recognized MemberStatus.
func (s MemberStatus) Validate() error {
	switch s {
	case StatusActive, StatusSuspended:
		return nil
	default:
		return fmt.Errorf("%w: status %q", ErrInvalidEnumValue, string(s))
	}
}

// String returns the canonical string representation.
func (s MemberStatus) String() string { return string(s) }

// Value implements driver.Valuer.
func (s MemberStatus) Value() (driver.Value, error) {
	if err := s.Validate(); err != nil {
		return nil, err
	}
	return string(s), nil
}

// Scan implements sql.Scanner.
func (s *MemberStatus) Scan(value interface{}) error {
	str, err := scanString(value)
	if err != nil {
		return err
	}
	status := MemberStatus(str)
	if err := status.Validate(); err != nil {
		return err
	}
	*s = status
	return nil
}
