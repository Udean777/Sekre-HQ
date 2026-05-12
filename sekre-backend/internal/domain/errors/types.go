// Package errors provides a unified error hierarchy for the domain layer.
//
// All errors produced by business logic (usecases, repositories, domain services)
// should be a *DomainError. This gives the delivery layer a single, consistent
// shape to map onto transport-specific responses (HTTP status codes, gRPC codes,
// etc.) without sprinkling errors.Is switches across every handler.
//
// Contract:
//   - Code    : machine-readable category used to drive transport mapping.
//   - Message : human-readable short message, safe to return to clients.
//   - Details : optional structured context for logging/auditing. MUST NEVER
//     be sent to clients by the delivery layer.
//   - Cause   : wrapped underlying error, exposed via Unwrap() so that
//     errors.Is / errors.As keep working with sentinel and wrapped
//     errors alike.
package errors

// ErrorCode categorizes domain errors by business meaning. Transport layers
// map these codes to their own status taxonomy (HTTP status, gRPC code, etc.).
type ErrorCode string

const (
	// CodeNotFound indicates a requested resource does not exist or is not
	// visible to the caller (e.g. cross-tenant access).
	CodeNotFound ErrorCode = "NOT_FOUND"

	// CodeUnauthorized indicates the caller has no valid identity.
	CodeUnauthorized ErrorCode = "UNAUTHORIZED"

	// CodeForbidden indicates the caller is authenticated but lacks the
	// required permission for the action.
	CodeForbidden ErrorCode = "FORBIDDEN"

	// CodeInvalidInput indicates the request payload is malformed or violates
	// field-level validation rules.
	CodeInvalidInput ErrorCode = "INVALID_INPUT"

	// CodeConflict indicates a uniqueness / state conflict with existing data
	// (e.g. duplicate subdomain).
	CodeConflict ErrorCode = "CONFLICT"

	// CodePrecondition indicates a business rule blocks the operation
	// (e.g. "division has active tasks, cannot delete").
	CodePrecondition ErrorCode = "PRECONDITION_FAILED"

	// CodeInternal indicates an unexpected failure that is not the caller's
	// fault (database down, serializer bug, etc.).
	CodeInternal ErrorCode = "INTERNAL"
)

// DomainError is the single error type used across domain, usecase, and
// repository layers. The delivery layer is responsible for translating it
// into a transport-specific response.
type DomainError struct {
	// Code categorizes the error for transport mapping.
	Code ErrorCode

	// Message is a short, client-safe description.
	Message string

	// Details holds structured context useful for logs and audit trails.
	// It is intentionally not part of the client response payload.
	Details map[string]interface{}

	// Cause is the wrapped underlying error, if any. Exposed via Unwrap().
	Cause error
}

// Error returns the human-readable message, including the cause when present.
func (e *DomainError) Error() string {
	if e == nil {
		return ""
	}
	if e.Cause != nil {
		return e.Message + ": " + e.Cause.Error()
	}
	return e.Message
}

// Unwrap returns the wrapped cause so errors.Is / errors.As traverse the chain.
func (e *DomainError) Unwrap() error {
	if e == nil {
		return nil
	}
	return e.Cause
}

// WithDetail attaches a structured context field to the error. Details are
// meant for logging and debugging only and must not be echoed in client
// responses. WithDetail is chainable and safe to call on freshly constructed
// errors.
func (e *DomainError) WithDetail(key string, value interface{}) *DomainError {
	if e == nil {
		return nil
	}
	if e.Details == nil {
		e.Details = make(map[string]interface{}, 2)
	}
	e.Details[key] = value
	return e
}
