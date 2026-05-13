// Package validator provides centralized request validation using
// go-playground/validator with translation to domain errors.
//
// Usage:
//
//	type CreateTaskRequest struct {
//	    Title    string `json:"title" validate:"required,min=3,max=200"`
//	    DueDate  string `json:"due_date" validate:"required,datetime=2006-01-02"`
//	}
//
//	if err := validator.Validate(&req); err != nil {
//	    return err // returns *domainerrors.DomainError with code INVALID_INPUT
//	}
package validator

import (
	"fmt"
	"reflect"
	"regexp"
	"strings"
	"sync"

	"github.com/go-playground/validator/v10"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
)

var (
	// defaultValidator is the package-level validator instance.
	// Initialized once via sync.Once for thread safety.
	defaultValidator *validator.Validate
	initOnce         sync.Once

	subdomainPattern = regexp.MustCompile(`^[a-z0-9-]{3,32}$`)
)

// Validate checks the given struct against its `validate:` tags
// and returns a *domainerrors.DomainError on failure.
//
// This is the main entry point for request validation. Use this in handlers
// after decoding the request body.
func Validate(v interface{}) error {
	if err := defaultInstance().Struct(v); err != nil {
		return translateError(err)
	}
	return nil
}

// defaultInstance returns the shared validator, initializing it if needed.
func defaultInstance() *validator.Validate {
	initOnce.Do(func() {
		defaultValidator = validator.New(validator.WithRequiredStructEnabled())

		// Use json tag for field names (better error messages)
		defaultValidator.RegisterTagNameFunc(jsonTagName)

		// Register custom validators
		_ = defaultValidator.RegisterValidation("subdomain", subdomainValidator)
		_ = defaultValidator.RegisterValidation("role", roleValidator)
		_ = defaultValidator.RegisterValidation("task_status", taskStatusValidator)
		_ = defaultValidator.RegisterValidation("currency", currencyValidator)
	})
	return defaultValidator
}

// jsonTagName extracts the JSON field name from struct tags.
// Returns "" if the tag is "-" (excluded field).
func jsonTagName(fld reflect.StructField) string {
	tag := fld.Tag.Get("json")
	if tag == "" || tag == "-" {
		return ""
	}
	// Handle "fieldname,omitempty"
	if idx := strings.Index(tag, ","); idx != -1 {
		return tag[:idx]
	}
	return tag
}

// translateError converts validator.ValidationErrors to *domainerrors.DomainError.
func translateError(err error) error {
	ve, ok := err.(validator.ValidationErrors)
	if !ok {
		// Non-validation error (e.g., invalid struct type)
		return domainerrors.InvalidInput("request", "validation failed").
			WithDetail("cause", err.Error())
	}

	// Build a single error with multiple field details
	de := domainerrors.New(domainerrors.CodeInvalidInput, "validation failed")

	fieldErrors := make(map[string]string, len(ve))
	for _, fieldErr := range ve {
		field := fieldErr.Field()
		if field == "" {
			field = fieldErr.StructField()
		}
		fieldErrors[field] = fieldErrorMessage(fieldErr)
	}

	de.WithDetail("fields", fieldErrors)

	// Use first field for main message
	if len(ve) > 0 {
		first := ve[0]
		field := first.Field()
		if field == "" {
			field = first.StructField()
		}
		de.Message = fmt.Sprintf("%s: %s", field, fieldErrorMessage(first))
	}

	return de
}

// fieldErrorMessage creates a human-readable error message for a field error.
func fieldErrorMessage(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "is required"
	case "min":
		if fe.Kind() == reflect.String {
			return fmt.Sprintf("must be at least %s characters", fe.Param())
		}
		return fmt.Sprintf("must be at least %s", fe.Param())
	case "max":
		if fe.Kind() == reflect.String {
			return fmt.Sprintf("must be at most %s characters", fe.Param())
		}
		return fmt.Sprintf("must be at most %s", fe.Param())
	case "email":
		return "must be a valid email address"
	case "uuid", "uuid4":
		return "must be a valid UUID"
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
	case "oneof":
		return fmt.Sprintf("must be one of [%s]", fe.Param())
	case "subdomain":
		return "must be 3-32 characters, lowercase letters, numbers, and hyphens only"
	case "role":
		return "must be one of: OWNER, ADMIN, MEMBER"
	case "task_status":
		return "must be one of: TODO, IN_PROGRESS, DONE"
	case "currency":
		return "must be a 3-letter currency code (e.g., IDR, USD)"
	case "datetime":
		return fmt.Sprintf("must be in format %s", fe.Param())
	default:
		return fmt.Sprintf("failed validation: %s", fe.Tag())
	}
}

// ------------ Custom Validators --------------

// subdomainValidator validates that a field is a valid subdomain.
// Rules: 3-32 chars, lowercase letters, numbers, hyphens only.
func subdomainValidator(fl validator.FieldLevel) bool {
	return subdomainPattern.MatchString(fl.Field().String())
}

// roleValidator validates that a field is a valid user role.
func roleValidator(fl validator.FieldLevel) bool {
	val := fl.Field().String()
	switch val {
	case "OWNER", "ADMIN", "MEMBER":
		return true
	}
	return false
}

// taskStatusValidator validates that a field is a valid task status.
func taskStatusValidator(fl validator.FieldLevel) bool {
	val := fl.Field().String()
	switch val {
	case "TODO", "IN_PROGRESS", "DONE":
		return true
	}
	return false
}

// currencyValidator validates that a field is a 3-letter uppercase currency code.
func currencyValidator(fl validator.FieldLevel) bool {
	val := fl.Field().String()
	if len(val) != 3 {
		return false
	}
	for _, c := range val {
		if c < 'A' || c > 'Z' {
			return false
		}
	}
	return true
}
