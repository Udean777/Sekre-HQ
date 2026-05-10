package domain

import "errors"

var (
	// Auth errors
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrSubdomainTaken     = errors.New("subdomain already taken")
	ErrUnauthorized       = errors.New("unauthorized")
	ErrInvalidToken       = errors.New("invalid token")

	// Organization errors
	ErrOrganizationNotFound = errors.New("organization not found")
	ErrUserNotInOrg         = errors.New("user not in organization")

	// Validation errors
	ErrInvalidInput = errors.New("invalid input")
	ErrRequired     = errors.New("required field missing")
)
