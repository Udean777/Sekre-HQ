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

	// Division errors
	ErrDivisionLimitReached = errors.New("division limit reached for FREE plan")
	ErrMemberLimitReached   = errors.New("member limit reached for division")
	ErrDivisionNotFound     = errors.New("division not found")
	ErrAlreadyMember        = errors.New("user already member of division")
	ErrNotDivisionMember    = errors.New("user not member of division")
	ErrMustHaveHead         = errors.New("division must have at least one HEAD")
	ErrCannotRemoveHead     = errors.New("cannot remove HEAD without assigning new HEAD first")
	ErrDivisionHasData      = errors.New("cannot delete division with active tasks/events/transactions")

	// Task errors
	ErrTaskNotFound = errors.New("task not found")

	// Event errors
	ErrEventNotFound    = errors.New("event not found")
	ErrInvalidTimeRange = errors.New("end time must be after start time")

	// Finance errors
	ErrTransactionNotFound = errors.New("transaction not found")
	ErrInvalidAmount       = errors.New("amount must be greater than 0")
)
