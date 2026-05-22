package errors

import (
	"errors"
	"testing"
)

func TestDomainError_Error(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		err  *DomainError
		want string
	}{
		{
			name: "error without cause",
			err: &DomainError{
				Code:    CodeNotFound,
				Message: "user not found",
			},
			want: "user not found",
		},
		{
			name: "error with cause",
			err: &DomainError{
				Code:    CodeInternal,
				Message: "database error",
				Cause:   errors.New("connection refused"),
			},
			want: "database error: connection refused",
		},
		{
			name: "nil error",
			err:  nil,
			want: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if got := tt.err.Error(); got != tt.want {
				t.Errorf("Error() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestDomainError_Unwrap(t *testing.T) {
	t.Parallel()

	cause := errors.New("underlying error")
	err := &DomainError{
		Code:    CodeInternal,
		Message: "wrapper",
		Cause:   cause,
	}

	if unwrapped := err.Unwrap(); unwrapped != cause {
		t.Errorf("Unwrap() = %v, want %v", unwrapped, cause)
	}

	// Test nil error
	var nilErr *DomainError
	if unwrapped := nilErr.Unwrap(); unwrapped != nil {
		t.Errorf("Unwrap() on nil = %v, want nil", unwrapped)
	}

	// Test error without cause
	errNoCause := &DomainError{
		Code:    CodeNotFound,
		Message: "not found",
	}
	if unwrapped := errNoCause.Unwrap(); unwrapped != nil {
		t.Errorf("Unwrap() on error without cause = %v, want nil", unwrapped)
	}
}

func TestDomainError_WithDetail(t *testing.T) {
	t.Parallel()

	t.Run("add single detail", func(t *testing.T) {
		t.Parallel()
		err := &DomainError{
			Code:    CodeNotFound,
			Message: "user not found",
		}

		result := err.WithDetail("user_id", "123")

		if result != err {
			t.Error("WithDetail() should return the same error instance")
		}
		if len(err.Details) != 1 {
			t.Errorf("Details length = %d, want 1", len(err.Details))
		}
		if err.Details["user_id"] != "123" {
			t.Errorf("Details[user_id] = %v, want 123", err.Details["user_id"])
		}
	})

	t.Run("chain multiple details", func(t *testing.T) {
		t.Parallel()
		err := &DomainError{
			Code:    CodeForbidden,
			Message: "access denied",
		}

		err.WithDetail("user_id", "123"). //nolint:errcheck
			WithDetail("resource", "task").
			WithDetail("action", "delete")

		if len(err.Details) != 3 {
			t.Errorf("Details length = %d, want 3", len(err.Details))
		}
		if err.Details["user_id"] != "123" {
			t.Errorf("Details[user_id] = %v, want 123", err.Details["user_id"])
		}
		if err.Details["resource"] != "task" {
			t.Errorf("Details[resource] = %v, want task", err.Details["resource"])
		}
		if err.Details["action"] != "delete" {
			t.Errorf("Details[action] = %v, want delete", err.Details["action"])
		}
	})

	t.Run("nil error", func(t *testing.T) {
		t.Parallel()
		var err *DomainError
		result := err.WithDetail("key", "value")
		if result != nil {
			t.Errorf("WithDetail() on nil = %v, want nil", result)
		}
	})

	t.Run("overwrite existing detail", func(t *testing.T) {
		t.Parallel()
		err := &DomainError{
			Code:    CodeConflict,
			Message: "duplicate",
			Details: map[string]interface{}{
				"field": "email",
			},
		}

		err.WithDetail("field", "username") //nolint:errcheck

		if err.Details["field"] != "username" {
			t.Errorf("Details[field] = %v, want username", err.Details["field"])
		}
	})
}

func TestDomainError_ErrorsIs(t *testing.T) {
	t.Parallel()

	// Test that errors.Is works with wrapped errors
	cause := ErrUserNotFound
	err := &DomainError{
		Code:    CodeNotFound,
		Message: "user not found",
		Cause:   cause,
	}

	if !errors.Is(err, ErrUserNotFound) {
		t.Error("errors.Is() should find wrapped sentinel error")
	}
}

func TestDomainError_ErrorsAs(t *testing.T) {
	t.Parallel()

	// Test that errors.As works with wrapped DomainError
	innerErr := &DomainError{
		Code:    CodeInvalidInput,
		Message: "validation failed",
	}
	outerErr := &DomainError{
		Code:    CodeInternal,
		Message: "processing failed",
		Cause:   innerErr,
	}

	var domainErr *DomainError
	if !errors.As(outerErr, &domainErr) {
		t.Error("errors.As() should find wrapped DomainError")
	}
	if domainErr.Code != CodeInternal {
		t.Errorf("errors.As() found wrong error, code = %v, want %v", domainErr.Code, CodeInternal)
	}
}

func TestErrorCode_Constants(t *testing.T) {
	t.Parallel()

	// Verify all error codes are defined and unique
	codes := map[ErrorCode]bool{
		CodeNotFound:     true,
		CodeUnauthorized: true,
		CodeForbidden:    true,
		CodeInvalidInput: true,
		CodeConflict:     true,
		CodePrecondition: true,
		CodeInternal:     true,
		CodeTimeout:      true,
	}

	if len(codes) != 8 {
		t.Errorf("Expected 8 unique error codes, got %d", len(codes))
	}

	// Verify codes have expected string values
	expectedValues := map[ErrorCode]string{
		CodeNotFound:     "NOT_FOUND",
		CodeUnauthorized: "UNAUTHORIZED",
		CodeForbidden:    "FORBIDDEN",
		CodeInvalidInput: "INVALID_INPUT",
		CodeConflict:     "CONFLICT",
		CodePrecondition: "PRECONDITION_FAILED",
		CodeInternal:     "INTERNAL",
		CodeTimeout:      "TIMEOUT",
	}

	for code, expected := range expectedValues {
		if string(code) != expected {
			t.Errorf("ErrorCode %v = %q, want %q", code, string(code), expected)
		}
	}
}
