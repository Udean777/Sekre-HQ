package errors

import (
	stderrors "errors"
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

// ValidationError is a DomainError that additionally exposes per-field error
// messages. Use it when the request payload has multiple field-level failures
// and clients would benefit from seeing them individually.
//
// ValidationError embeds *DomainError, so it satisfies the error interface
// and works transparently with errors.Is / errors.As against DomainError.
type ValidationError struct {
	*DomainError
	// Fields maps field name (lowercase) to a short human-readable reason.
	Fields map[string]string
}

// FromValidatorError converts a go-playground/validator error into a
// *ValidationError. If err is not a validator.ValidationErrors the function
// falls back to a generic InvalidInput DomainError so callers always get a
// domain-shaped error back.
//
// Field names are lowercased to produce stable, snake-case-friendly keys for
// clients.
func FromValidatorError(err error) error {
	if err == nil {
		return nil
	}

	var ve validator.ValidationErrors
	if !stderrors.As(err, &ve) {
		return InvalidInput("validation", err.Error())
	}

	fields := make(map[string]string, len(ve))
	messages := make([]string, 0, len(ve))

	for _, fe := range ve {
		field := strings.ToLower(fe.Field())
		reason := formatValidationError(fe)
		fields[field] = reason
		messages = append(messages, fmt.Sprintf("%s: %s", field, reason))
	}

	base := New(CodeInvalidInput, strings.Join(messages, "; ")).
		WithDetail("fields", fields)

	return &ValidationError{
		DomainError: base,
		Fields:      fields,
	}
}

// formatValidationError turns a validator.FieldError into a short, human
// friendly message. Extend the switch as new tags are used in the codebase.
func formatValidationError(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "is required"
	case "email":
		return "must be a valid email"
	case "min":
		return fmt.Sprintf("must be at least %s", fe.Param())
	case "max":
		return fmt.Sprintf("must be at most %s", fe.Param())
	case "len":
		return fmt.Sprintf("must be exactly %s characters", fe.Param())
	case "uuid", "uuid4":
		return "must be a valid UUID"
	case "oneof":
		return fmt.Sprintf("must be one of [%s]", fe.Param())
	case "url":
		return "must be a valid URL"
	case "gt":
		return fmt.Sprintf("must be greater than %s", fe.Param())
	case "gte":
		return fmt.Sprintf("must be greater than or equal to %s", fe.Param())
	case "lt":
		return fmt.Sprintf("must be less than %s", fe.Param())
	case "lte":
		return fmt.Sprintf("must be less than or equal to %s", fe.Param())
	default:
		return fmt.Sprintf("failed validation: %s", fe.Tag())
	}
}
