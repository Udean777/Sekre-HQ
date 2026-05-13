package validator_test

import (
	"errors"
	"testing"

	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/pkg/validator"
)

type testRequest struct {
	Email     string `json:"email" validate:"required,email"`
	Username  string `json:"username" validate:"required,min=3,max=20"`
	Subdomain string `json:"subdomain" validate:"required,subdomain"`
	Role      string `json:"role" validate:"required,role"`
	Age       int    `json:"age" validate:"gte=18,lte=120"`
	UserID    string `json:"user_id" validate:"required,uuid4"`
}

func TestValidate_AllValid(t *testing.T) {
	t.Parallel()

	req := testRequest{
		Email:     "user@example.com",
		Username:  "validuser",
		Subdomain: "my-org",
		Role:      "OWNER",
		Age:       25,
		UserID:    "550e8400-e29b-41d4-a716-446655440000",
	}

	if err := validator.Validate(&req); err != nil {
		t.Errorf("expected no error, got: %v", err)
	}
}

func TestValidate_RequiredField(t *testing.T) {
	t.Parallel()

	req := testRequest{
		// Email missing
		Username:  "validuser",
		Subdomain: "my-org",
		Role:      "OWNER",
		Age:       25,
		UserID:    "550e8400-e29b-41d4-a716-446655440000",
	}

	err := validator.Validate(&req)
	if err == nil {
		t.Fatal("expected error for missing email")
	}

	// Should be DomainError with INVALID_INPUT code
	var de *domainerrors.DomainError
	if !errors.As(err, &de) {
		t.Fatalf("expected DomainError, got %T", err)
	}
	if de.Code != domainerrors.CodeInvalidInput {
		t.Errorf("code = %v, want %v", de.Code, domainerrors.CodeInvalidInput)
	}
}

func TestValidate_InvalidEmail(t *testing.T) {
	t.Parallel()

	req := testRequest{
		Email:     "not-an-email",
		Username:  "validuser",
		Subdomain: "my-org",
		Role:      "OWNER",
		Age:       25,
		UserID:    "550e8400-e29b-41d4-a716-446655440000",
	}

	err := validator.Validate(&req)
	if err == nil {
		t.Fatal("expected error for invalid email")
	}

	var de *domainerrors.DomainError
	if !errors.As(err, &de) {
		t.Fatalf("expected DomainError, got %T", err)
	}

	// Field error map should contain "email"
	fields, ok := de.Details["fields"].(map[string]string)
	if !ok {
		t.Fatalf("expected fields map in details")
	}
	if _, ok := fields["email"]; !ok {
		t.Errorf("expected email field error, got: %v", fields)
	}
}

func TestValidate_InvalidSubdomain(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name      string
		subdomain string
		wantErr   bool
	}{
		{"valid lowercase", "my-org", false},
		{"valid with numbers", "org123", false},
		{"too short", "ab", true},
		{"too long", "this-is-way-too-long-for-a-subdomain-yeah", true},
		{"uppercase", "MyOrg", true},
		{"with underscore", "my_org", true},
		{"with dot", "my.org", true},
		{"with space", "my org", true},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			req := testRequest{
				Email:     "user@example.com",
				Username:  "validuser",
				Subdomain: tt.subdomain,
				Role:      "OWNER",
				Age:       25,
				UserID:    "550e8400-e29b-41d4-a716-446655440000",
			}

			err := validator.Validate(&req)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() err=%v wantErr=%v", err, tt.wantErr)
			}
		})
	}
}

func TestValidate_InvalidRole(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		role    string
		wantErr bool
	}{
		{"OWNER", "OWNER", false},
		{"ADMIN", "ADMIN", false},
		{"MEMBER", "MEMBER", false},
		{"lowercase", "owner", true},
		{"unknown", "GUEST", true},
		{"empty", "", true},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			req := testRequest{
				Email:     "user@example.com",
				Username:  "validuser",
				Subdomain: "my-org",
				Role:      tt.role,
				Age:       25,
				UserID:    "550e8400-e29b-41d4-a716-446655440000",
			}

			err := validator.Validate(&req)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() err=%v wantErr=%v", err, tt.wantErr)
			}
		})
	}
}

func TestValidate_AgeBounds(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		age     int
		wantErr bool
	}{
		{"valid 18", 18, false},
		{"valid 50", 50, false},
		{"valid 120", 120, false},
		{"too young 17", 17, true},
		{"too old 121", 121, true},
		{"negative", -5, true},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			req := testRequest{
				Email:     "user@example.com",
				Username:  "validuser",
				Subdomain: "my-org",
				Role:      "OWNER",
				Age:       tt.age,
				UserID:    "550e8400-e29b-41d4-a716-446655440000",
			}

			err := validator.Validate(&req)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() err=%v wantErr=%v", err, tt.wantErr)
			}
		})
	}
}

func TestValidate_MultipleErrors(t *testing.T) {
	t.Parallel()

	req := testRequest{
		Email:     "invalid-email", // Bad email
		Username:  "ab",            // Too short
		Subdomain: "BAD",           // Uppercase
		Role:      "INVALID",       // Bad role
		Age:       10,              // Too young
		UserID:    "not-a-uuid",    // Bad UUID
	}

	err := validator.Validate(&req)
	if err == nil {
		t.Fatal("expected validation errors")
	}

	var de *domainerrors.DomainError
	if !errors.As(err, &de) {
		t.Fatalf("expected DomainError")
	}

	fields, ok := de.Details["fields"].(map[string]string)
	if !ok {
		t.Fatalf("expected fields map in details")
	}

	// Should have multiple field errors
	if len(fields) < 2 {
		t.Errorf("expected multiple field errors, got %d: %v", len(fields), fields)
	}
}

type currencyTestRequest struct {
	Currency string `json:"currency" validate:"required,currency"`
}

func TestValidate_Currency(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		currency string
		wantErr  bool
	}{
		{"IDR", "IDR", false},
		{"USD", "USD", false},
		{"EUR", "EUR", false},
		{"lowercase", "idr", true},
		{"too short", "ID", true},
		{"too long", "USDT", true},
		{"with numbers", "US1", true},
		{"empty", "", true},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			req := currencyTestRequest{Currency: tt.currency}
			err := validator.Validate(&req)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() err=%v wantErr=%v", err, tt.wantErr)
			}
		})
	}
}

type taskStatusRequest struct {
	Status string `json:"status" validate:"required,task_status"`
}

func TestValidate_TaskStatus(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		status  string
		wantErr bool
	}{
		{"TODO", "TODO", false},
		{"IN_PROGRESS", "IN_PROGRESS", false},
		{"DONE", "DONE", false},
		{"lowercase", "todo", true},
		{"unknown", "PENDING", true},
		{"empty", "", true},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			req := taskStatusRequest{Status: tt.status}
			err := validator.Validate(&req)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() err=%v wantErr=%v", err, tt.wantErr)
			}
		})
	}
}
