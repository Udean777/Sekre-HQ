package types

import (
	"database/sql/driver"
	"fmt"
)

// DivisionRole represents a user's role within a division.
type DivisionRole string

const (
	DivisionRoleHead  DivisionRole = "HEAD"
	DivisionRoleStaff DivisionRole = "STAFF"
)

// AllDivisionRoles returns every valid DivisionRole value.
func AllDivisionRoles() []DivisionRole {
	return []DivisionRole{DivisionRoleHead, DivisionRoleStaff}
}

// Validate reports whether r is a recognized DivisionRole.
func (r DivisionRole) Validate() error {
	switch r {
	case DivisionRoleHead, DivisionRoleStaff:
		return nil
	default:
		return fmt.Errorf("%w: division role %q", ErrInvalidEnumValue, string(r))
	}
}

// String returns the canonical string representation.
func (r DivisionRole) String() string { return string(r) }

// IsHead reports whether the role is HEAD.
func (r DivisionRole) IsHead() bool { return r == DivisionRoleHead }

// Value implements driver.Valuer.
func (r DivisionRole) Value() (driver.Value, error) {
	if err := r.Validate(); err != nil {
		return nil, err
	}
	return string(r), nil
}

// Scan implements sql.Scanner.
func (r *DivisionRole) Scan(value interface{}) error {
	s, err := scanString(value)
	if err != nil {
		return err
	}
	role := DivisionRole(s)
	if err := role.Validate(); err != nil {
		return err
	}
	*r = role
	return nil
}
