package auth

import (
	"errors"
	"strings"
	"testing"

	"github.com/username/sekre-backend/internal/domain/service"
)

func TestValidatePassword(t *testing.T) {
	v := NewRegistrationValidator()

	tests := []struct {
		name     string
		password string
		wantErr  error
	}{
		{
			name:     "valid password",
			password: "SecurePass1",
			wantErr:  nil,
		},
		{
			name:     "valid password with internal spaces",
			password: "my pass word",
			wantErr:  nil,
		},
		{
			name:     "valid password with special chars",
			password: "P@ssw0rd!",
			wantErr:  nil,
		},
		{
			name:     "valid password at min length",
			password: "abcdefgh",
			wantErr:  nil,
		},
		{
			name:     "empty password",
			password: "",
			wantErr:  service.ErrPasswordEmpty,
		},
		{
			name:     "leading space",
			password: " SecurePass1",
			wantErr:  service.ErrPasswordHasWhitespace,
		},
		{
			name:     "trailing space",
			password: "SecurePass1 ",
			wantErr:  service.ErrPasswordHasWhitespace,
		},
		{
			name:     "leading and trailing space",
			password: "  SecurePass1  ",
			wantErr:  service.ErrPasswordHasWhitespace,
		},
		{
			name:     "leading tab",
			password: "\tSecurePass1",
			wantErr:  service.ErrPasswordHasWhitespace,
		},
		{
			name:     "trailing newline",
			password: "SecurePass1\n",
			wantErr:  service.ErrPasswordHasWhitespace,
		},
		{
			name:     "only whitespace",
			password: "        ",
			wantErr:  service.ErrPasswordHasWhitespace,
		},
		{
			name:     "too short, no whitespace",
			password: "short",
			wantErr:  service.ErrPasswordTooShort,
		},
		{
			name:     "too short, exactly 7 chars",
			password: "1234567",
			wantErr:  service.ErrPasswordTooShort,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := v.ValidatePassword(tt.password)
			switch {
			case tt.wantErr == nil && err != nil:
				t.Errorf("expected nil error, got %v", err)
			case tt.wantErr != nil && err == nil:
				t.Errorf("expected error %v, got nil", tt.wantErr)
			case tt.wantErr != nil && !errors.Is(err, tt.wantErr):
				t.Errorf("expected error %v, got %v", tt.wantErr, err)
			}
		})
	}
}

// TestValidatePassword_WhitespacePrecedesLength verifies that whitespace
// rejection takes precedence over the length check, so users get a clear
// "remove the spaces" error rather than a misleading "too short" message
// when their input would be too short after trimming.
func TestValidatePassword_WhitespacePrecedesLength(t *testing.T) {
	v := NewRegistrationValidator()

	// "abc" alone is too short, but with leading/trailing spaces the
	// validator must surface the whitespace error first.
	err := v.ValidatePassword("  abc  ")
	if !errors.Is(err, service.ErrPasswordHasWhitespace) {
		t.Errorf("expected ErrPasswordHasWhitespace, got %v", err)
	}
}

func TestValidatePassword_LongPasswordOk(t *testing.T) {
	v := NewRegistrationValidator()

	// Long password with no leading/trailing whitespace should pass.
	pw := strings.Repeat("a", 128)
	if err := v.ValidatePassword(pw); err != nil {
		t.Errorf("expected nil error for 128-char password, got %v", err)
	}
}
