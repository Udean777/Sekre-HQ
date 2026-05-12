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
	ErrUserNotFound         = errors.New("user not found")

	// Validation errors
	ErrInvalidInput = errors.New("invalid input")
	ErrRequired     = errors.New("required field missing")

	// Division errors
	ErrDivisionLimitReached       = errors.New("division limit reached for FREE plan")
	ErrMemberLimitReached         = errors.New("member limit reached for division")
	ErrDivisionMemberLimitReached = errors.New("division member limit reached")
	ErrDivisionNotFound           = errors.New("division not found")
	ErrAlreadyMember              = errors.New("user already member of division")
	ErrNotDivisionMember          = errors.New("user not member of division")
	ErrMustHaveHead               = errors.New("division must have at least one HEAD")
	ErrMaxHeadsReached            = errors.New("maximum number of HEADs reached for division")
	ErrCannotRemoveHead           = errors.New("cannot remove HEAD without assigning new HEAD first")
	ErrDivisionHasData            = errors.New("cannot delete division with active tasks/events/transactions")
	ErrDivisionHasTasks           = errors.New("cannot delete division with active tasks")
	ErrDivisionHasEvents          = errors.New("cannot delete division with upcoming events")
	ErrDivisionHasFinances        = errors.New("cannot delete division with recent transactions")

	// Task errors
	ErrTaskNotFound = errors.New("task not found")

	// Event errors
	ErrEventNotFound    = errors.New("event not found")
	ErrInvalidTimeRange = errors.New("end time must be after start time")

	// Finance errors
	ErrTransactionNotFound = errors.New("transaction not found")
	ErrInvalidAmount       = errors.New("amount must be greater than 0")
)
