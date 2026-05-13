package types

import (
	"database/sql/driver"
	"fmt"
)

// Role represents a user's role within an organization.
type Role string

const (
	RoleOwner  Role = "OWNER"
	RoleAdmin  Role = "ADMIN"
	RoleMember Role = "MEMBER"
)

// AllRoles returns every valid Role value.
func AllRoles() []Role {
	return []Role{RoleOwner, RoleAdmin, RoleMember}
}

// Validate reports whether r is a recognized Role.
func (r Role) Validate() error {
	switch r {
	case RoleOwner, RoleAdmin, RoleMember:
		return nil
	default:
		return fmt.Errorf("%w: role %q", ErrInvalidEnumValue, string(r))
	}
}

// String returns the canonical string representation.
func (r Role) String() string { return string(r) }

// CanManageOrganization reports whether the role is allowed to modify
// organization-wide settings (owner or admin).
func (r Role) CanManageOrganization() bool {
	return r == RoleOwner || r == RoleAdmin
}

// IsOwner reports whether the role is the organization owner.
func (r Role) IsOwner() bool { return r == RoleOwner }

// Value implements driver.Valuer.
func (r Role) Value() (driver.Value, error) {
	if err := r.Validate(); err != nil {
		return nil, err
	}
	return string(r), nil
}

// Scan implements sql.Scanner. It rejects values that do not correspond to
// a known Role constant.
func (r *Role) Scan(value interface{}) error {
	s, err := scanString(value)
	if err != nil {
		return err
	}
	role := Role(s)
	if err := role.Validate(); err != nil {
		return err
	}
	*r = role
	return nil
}
