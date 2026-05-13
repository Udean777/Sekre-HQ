// Package service defines domain service interfaces used by application layer.
// These interfaces abstract infrastructure concerns (hashing, token generation,
// validation) so the application layer remains testable and framework-independent.
//
// Implementations of these interfaces belong in internal/infrastructure.
package service

import "errors"

// PasswordHasher hashes and compares passwords. It abstracts the specific
// hashing algorithm (currently bcrypt) from the business layer.
type PasswordHasher interface {
	Hash(plain string) (string, error)
	Compare(hash, plain string) error
}

// ErrPasswordMismatch is returned by PasswordHasher.Compare when the supplied
// plaintext does not match the stored hash.
var ErrPasswordMismatch = errors.New("password mismatch")
