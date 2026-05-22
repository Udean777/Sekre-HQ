package auth

import (
	"strings"
	"testing"
)

// Fuzz tests for registration validator
//
// Run with:
//   go test -fuzz=FuzzValidateEmail -fuzztime=30s ./internal/infrastructure/auth

func FuzzValidateEmail(f *testing.F) {
	v := NewRegistrationValidator()

	// Seed corpus with common patterns
	f.Add("user@example.com")
	f.Add("invalid")
	f.Add("")
	f.Add("@")
	f.Add("a@b.c")
	f.Add("user@.com")
	f.Add("user@domain")
	f.Add("user.name+tag@example.co.uk")
	f.Add("user@domain..com")
	f.Add("   user@example.com   ")
	f.Add("USER@EXAMPLE.COM")
	f.Add(strings.Repeat("a", 1000) + "@example.com")

	f.Fuzz(func(t *testing.T, email string) {
		// Must not panic on any input
		err := v.ValidateEmail(email)

		// Empty email (after trim) should fail
		if strings.TrimSpace(email) == "" && err == nil {
			t.Errorf("empty email should fail validation")
		}

		// Email without @ should fail
		if !strings.Contains(email, "@") && strings.TrimSpace(email) != "" && err == nil {
			t.Errorf("email without @ should fail: %q", email)
		}
	})
}

func FuzzValidatePassword(f *testing.F) {
	v := NewRegistrationValidator()

	// Seed corpus
	f.Add("")
	f.Add("short")
	f.Add("a")
	f.Add("password123")
	f.Add(strings.Repeat("a", 1000))
	f.Add("with spaces")
	f.Add("with\nnewline")
	f.Add("with\ttab")
	f.Add("🔑unicode🔒")
	f.Add("!@#$%^&*()")

	f.Fuzz(func(t *testing.T, password string) {
		// Must not panic on any input
		err := v.ValidatePassword(password)

		// Empty password should fail
		if password == "" && err == nil {
			t.Errorf("empty password should fail validation")
		}
	})
}

func FuzzValidateSubdomain(f *testing.F) {
	v := NewRegistrationValidator()

	// Seed corpus
	f.Add("")
	f.Add("valid")
	f.Add("valid-subdomain")
	f.Add("UPPERCASE")
	f.Add("with spaces")
	f.Add("with.dot")
	f.Add("with_underscore")
	f.Add("-leading-dash")
	f.Add("trailing-dash-")
	f.Add("123numbers")
	f.Add("a")
	f.Add(strings.Repeat("a", 100))
	f.Add("日本語")

	f.Fuzz(func(t *testing.T, subdomain string) {
		// Must not panic on any input
		err := v.ValidateSubdomain(subdomain)

		// Empty subdomain (after trim) should fail
		if strings.TrimSpace(subdomain) == "" && err == nil {
			t.Errorf("empty subdomain should fail validation")
		}

		// Subdomain with uppercase should still pass (validator lowercases it)
		if err == nil {
			lowered := strings.ToLower(strings.TrimSpace(subdomain))
			// Should only contain a-z, 0-9, -
			for _, r := range lowered {
				if (r < 'a' || r > 'z') && (r < '0' || r > '9') && r != '-' {
					t.Errorf("valid subdomain contains invalid char %q in %q", r, subdomain)
				}
			}
		}
	})
}
