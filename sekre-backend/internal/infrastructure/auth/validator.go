package auth

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/username/sekre-backend/internal/domain/service"
)

var (
	emailRegex     = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	subdomainRegex = regexp.MustCompile(`^[a-z0-9-]+$`)
)

type defaultRegistrationValidator struct{}

// NewRegistrationValidator returns the default RegistrationValidator
// implementation.
func NewRegistrationValidator() service.RegistrationValidator {
	return &defaultRegistrationValidator{}
}

func (v *defaultRegistrationValidator) ValidateEmail(email string) error {
	email = strings.TrimSpace(email)
	if email == "" {
		return service.ErrEmailEmpty
	}
	if !emailRegex.MatchString(email) {
		return service.ErrEmailInvalid
	}
	return nil
}

func (v *defaultRegistrationValidator) ValidatePassword(password string) error {
	if password == "" {
		return service.ErrPasswordEmpty
	}
	if len(password) < service.MinPasswordLength {
		return fmt.Errorf("%w: got %d", service.ErrPasswordTooShort, len(password))
	}
	return nil
}

func (v *defaultRegistrationValidator) ValidateSubdomain(subdomain string) error {
	sub := strings.TrimSpace(strings.ToLower(subdomain))
	if sub == "" {
		return service.ErrSubdomainEmpty
	}
	if !subdomainRegex.MatchString(sub) {
		return service.ErrSubdomainInvalid
	}
	return nil
}
