package auth

import (
	"errors"

	"golang.org/x/crypto/bcrypt"

	"github.com/username/sekre-backend/internal/domain/service"
)

type bcryptHasher struct {
	cost int
}

// NewBcryptHasher returns a PasswordHasher backed by bcrypt. If cost is <= 0
// the bcrypt default cost is used.
func NewBcryptHasher(cost int) service.PasswordHasher {
	if cost <= 0 {
		cost = bcrypt.DefaultCost
	}
	return &bcryptHasher{cost: cost}
}

// Hash returns the bcrypt hash of plain.
func (h *bcryptHasher) Hash(plain string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(plain), h.cost)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

// Compare reports whether the supplied plaintext matches the stored hash.
// It returns ErrPasswordMismatch when they do not match so callers can
// distinguish verification failure from unexpected errors.
func (h *bcryptHasher) Compare(hash, plain string) error {
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain)); err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			return service.ErrPasswordMismatch
		}
		return err
	}
	return nil
}
