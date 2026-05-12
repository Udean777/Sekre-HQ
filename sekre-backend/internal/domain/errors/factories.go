package errors

import (
	stderrors "errors"
	"fmt"
)

// New constructs a DomainError with the given code and message and no cause.
// Prefer the category-specific factories (NotFound, Forbidden, ...) when they
// apply; reach for New only when none of those fit.
func New(code ErrorCode, message string) *DomainError {
	return &DomainError{
		Code:    code,
		Message: message,
	}
}

// Wrap constructs a DomainError that wraps cause. The resulting error returns
// cause via Unwrap(), so errors.Is / errors.As continue to work against the
// original error. Use Wrap to preserve infrastructure error chains (gorm,
// database/sql, etc.) while still presenting a clean domain category to the
// rest of the application.
func Wrap(code ErrorCode, message string, cause error) *DomainError {
	return &DomainError{
		Code:    code,
		Message: message,
		Cause:   cause,
	}
}

// Is reports whether err (or any error it wraps) is a DomainError with the
// given code. It is a convenience wrapper around errors.As that reads well
// at call sites, e.g. errors.Is(err, errors.CodeNotFound).
func Is(err error, code ErrorCode) bool {
	if err == nil {
		return false
	}
	var de *DomainError
	if stderrors.As(err, &de) {
		return de.Code == code
	}
	return false
}

// As is a thin wrapper around errors.As for *DomainError, avoiding the
// awkward double-pointer at call sites. Returns the extracted *DomainError
// and true on success.
func As(err error) (*DomainError, bool) {
	if err == nil {
		return nil, false
	}
	var de *DomainError
	if stderrors.As(err, &de) {
		return de, true
	}
	return nil, false
}

// --- Category factories -----------------------------------------------------
//
// These constructors encode conventions around Code/Message pairs so callers
// do not have to remember them. They also attach commonly useful Details
// (resource, field, action, ...) for logs.

// NotFound reports that resource identified by id does not exist (or is not
// visible to the caller). Pass nil for id when the resource is addressed by
// something other than a primary key (e.g. a query).
func NotFound(resource string, id interface{}) *DomainError {
	e := New(CodeNotFound, fmt.Sprintf("%s not found", resource)).
		WithDetail("resource", resource)
	if id != nil {
		e.WithDetail("id", id)
	}
	return e
}

// Unauthorized reports that the caller has no valid identity. Prefer
// Forbidden when the caller is authenticated but lacks a permission.
func Unauthorized(reason string) *DomainError {
	return New(CodeUnauthorized, reason)
}

// Forbidden reports that the authenticated caller is not allowed to perform
// action on resource.
func Forbidden(action, resource string) *DomainError {
	return New(CodeForbidden, fmt.Sprintf("cannot %s %s", action, resource)).
		WithDetail("action", action).
		WithDetail("resource", resource)
}

// InvalidInput reports a field-level validation failure. Use FromValidatorError
// when wrapping go-playground/validator errors.
func InvalidInput(field, reason string) *DomainError {
	return New(CodeInvalidInput, fmt.Sprintf("%s: %s", field, reason)).
		WithDetail("field", field)
}

// Conflict reports a uniqueness / state conflict. constraint identifies the
// violated rule (e.g. "unique_email", "unique_subdomain"); it is stored on
// Details for logging but not exposed verbatim in the message.
func Conflict(resource, constraint string) *DomainError {
	return New(CodeConflict, fmt.Sprintf("%s already exists", resource)).
		WithDetail("resource", resource).
		WithDetail("constraint", constraint)
}

// Precondition reports a business-rule violation that blocks the requested
// operation (e.g. "division has active tasks, cannot delete").
func Precondition(message string) *DomainError {
	return New(CodePrecondition, message)
}

// Internal wraps an unexpected failure (database, serializer, etc.) with a
// generic client-safe message. The original error is preserved as the cause.
func Internal(message string, cause error) *DomainError {
	return Wrap(CodeInternal, message, cause)
}
