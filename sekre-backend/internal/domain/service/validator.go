package service

import "errors"

// RegistrationValidator validates the building blocks of an organization
// registration request. Each check is exposed separately so callers can
// report the first offending field.
type RegistrationValidator interface {
	ValidateEmail(email string) error
	ValidatePassword(password string) error
	ValidateSubdomain(subdomain string) error
}

// Validation errors returned by the default validator.
var (
	ErrEmailEmpty        = errors.New("email is required")
	ErrEmailInvalid      = errors.New("invalid email format")
	ErrPasswordEmpty     = errors.New("password is required")
	ErrPasswordTooShort  = errors.New("password must be at least 8 characters")
	ErrSubdomainEmpty    = errors.New("subdomain is required")
	ErrSubdomainInvalid  = errors.New("subdomain can only contain lowercase letters, numbers, and hyphens")
)

// MinPasswordLength is the minimum accepted password length.
const MinPasswordLength = 8
