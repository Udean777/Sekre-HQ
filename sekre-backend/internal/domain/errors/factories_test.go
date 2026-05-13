package errors

import (
	"errors"
	"testing"
)

func TestNew(t *testing.T) {
	t.Parallel()

	err := New(CodeNotFound, "resource not found")

	if err.Code != CodeNotFound {
		t.Errorf("Code = %v, want %v", err.Code, CodeNotFound)
	}
	if err.Message != "resource not found" {
		t.Errorf("Message = %v, want 'resource not found'", err.Message)
	}
	if err.Cause != nil {
		t.Errorf("Cause = %v, want nil", err.Cause)
	}
}

func TestWrap(t *testing.T) {
	t.Parallel()

	cause := errors.New("underlying error")
	err := Wrap(CodeInternal, "wrapper message", cause)

	if err.Code != CodeInternal {
		t.Errorf("Code = %v, want %v", err.Code, CodeInternal)
	}
	if err.Message != "wrapper message" {
		t.Errorf("Message = %v, want 'wrapper message'", err.Message)
	}
	if err.Cause != cause {
		t.Errorf("Cause = %v, want %v", err.Cause, cause)
	}
}

func TestIs(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		err  error
		code ErrorCode
		want bool
	}{
		{
			name: "matching code",
			err:  New(CodeNotFound, "not found"),
			code: CodeNotFound,
			want: true,
		},
		{
			name: "non-matching code",
			err:  New(CodeNotFound, "not found"),
			code: CodeForbidden,
			want: false,
		},
		{
			name: "wrapped domain error",
			err:  Wrap(CodeInternal, "wrapper", New(CodeNotFound, "not found")),
			code: CodeInternal,
			want: true,
		},
		{
			name: "non-domain error",
			err:  errors.New("standard error"),
			code: CodeInternal,
			want: false,
		},
		{
			name: "nil error",
			err:  nil,
			code: CodeNotFound,
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if got := Is(tt.err, tt.code); got != tt.want {
				t.Errorf("Is() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestAs(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		err     error
		wantErr bool
		wantCode ErrorCode
	}{
		{
			name:     "domain error",
			err:      New(CodeNotFound, "not found"),
			wantErr:  true,
			wantCode: CodeNotFound,
		},
		{
			name:     "wrapped domain error",
			err:      Wrap(CodeInternal, "wrapper", errors.New("cause")),
			wantErr:  true,
			wantCode: CodeInternal,
		},
		{
			name:    "non-domain error",
			err:     errors.New("standard error"),
			wantErr: false,
		},
		{
			name:    "nil error",
			err:     nil,
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			de, ok := As(tt.err)
			if ok != tt.wantErr {
				t.Errorf("As() ok = %v, want %v", ok, tt.wantErr)
			}
			if ok && de.Code != tt.wantCode {
				t.Errorf("As() code = %v, want %v", de.Code, tt.wantCode)
			}
		})
	}
}

func TestNotFound(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		resource string
		id       interface{}
		wantMsg  string
		wantDetails int
	}{
		{
			name:        "with id",
			resource:    "user",
			id:          "123",
			wantMsg:     "user not found",
			wantDetails: 2, // resource + id
		},
		{
			name:        "without id",
			resource:    "organization",
			id:          nil,
			wantMsg:     "organization not found",
			wantDetails: 1, // resource only
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := NotFound(tt.resource, tt.id)

			if err.Code != CodeNotFound {
				t.Errorf("Code = %v, want %v", err.Code, CodeNotFound)
			}
			if err.Message != tt.wantMsg {
				t.Errorf("Message = %v, want %v", err.Message, tt.wantMsg)
			}
			if len(err.Details) != tt.wantDetails {
				t.Errorf("Details length = %d, want %d", len(err.Details), tt.wantDetails)
			}
			if err.Details["resource"] != tt.resource {
				t.Errorf("Details[resource] = %v, want %v", err.Details["resource"], tt.resource)
			}
			if tt.id != nil && err.Details["id"] != tt.id {
				t.Errorf("Details[id] = %v, want %v", err.Details["id"], tt.id)
			}
		})
	}
}

func TestUnauthorized(t *testing.T) {
	t.Parallel()

	err := Unauthorized("invalid token")

	if err.Code != CodeUnauthorized {
		t.Errorf("Code = %v, want %v", err.Code, CodeUnauthorized)
	}
	if err.Message != "invalid token" {
		t.Errorf("Message = %v, want 'invalid token'", err.Message)
	}
}

func TestForbidden(t *testing.T) {
	t.Parallel()

	err := Forbidden("delete", "task")

	if err.Code != CodeForbidden {
		t.Errorf("Code = %v, want %v", err.Code, CodeForbidden)
	}
	if err.Message != "cannot delete task" {
		t.Errorf("Message = %v, want 'cannot delete task'", err.Message)
	}
	if err.Details["action"] != "delete" {
		t.Errorf("Details[action] = %v, want 'delete'", err.Details["action"])
	}
	if err.Details["resource"] != "task" {
		t.Errorf("Details[resource] = %v, want 'task'", err.Details["resource"])
	}
}

func TestInvalidInput(t *testing.T) {
	t.Parallel()

	err := InvalidInput("email", "invalid format")

	if err.Code != CodeInvalidInput {
		t.Errorf("Code = %v, want %v", err.Code, CodeInvalidInput)
	}
	if err.Message != "email: invalid format" {
		t.Errorf("Message = %v, want 'email: invalid format'", err.Message)
	}
	if err.Details["field"] != "email" {
		t.Errorf("Details[field] = %v, want 'email'", err.Details["field"])
	}
}

func TestConflict(t *testing.T) {
	t.Parallel()

	err := Conflict("email", "unique_email")

	if err.Code != CodeConflict {
		t.Errorf("Code = %v, want %v", err.Code, CodeConflict)
	}
	if err.Message != "email already exists" {
		t.Errorf("Message = %v, want 'email already exists'", err.Message)
	}
	if err.Details["resource"] != "email" {
		t.Errorf("Details[resource] = %v, want 'email'", err.Details["resource"])
	}
	if err.Details["constraint"] != "unique_email" {
		t.Errorf("Details[constraint] = %v, want 'unique_email'", err.Details["constraint"])
	}
}

func TestPrecondition(t *testing.T) {
	t.Parallel()

	err := Precondition("division has active tasks")

	if err.Code != CodePrecondition {
		t.Errorf("Code = %v, want %v", err.Code, CodePrecondition)
	}
	if err.Message != "division has active tasks" {
		t.Errorf("Message = %v, want 'division has active tasks'", err.Message)
	}
}

func TestInternal(t *testing.T) {
	t.Parallel()

	cause := errors.New("database connection failed")
	err := Internal("internal server error", cause)

	if err.Code != CodeInternal {
		t.Errorf("Code = %v, want %v", err.Code, CodeInternal)
	}
	if err.Message != "internal server error" {
		t.Errorf("Message = %v, want 'internal server error'", err.Message)
	}
	if err.Cause != cause {
		t.Errorf("Cause = %v, want %v", err.Cause, cause)
	}
}

func TestTimeout(t *testing.T) {
	t.Parallel()

	err := Timeout("request timeout")

	if err.Code != CodeTimeout {
		t.Errorf("Code = %v, want %v", err.Code, CodeTimeout)
	}
	if err.Message != "request timeout" {
		t.Errorf("Message = %v, want 'request timeout'", err.Message)
	}
}
