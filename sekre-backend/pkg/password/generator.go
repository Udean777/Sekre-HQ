package password

import (
	"crypto/rand"
	"math/big"
)

const (
	// DefaultPasswordLength is the default length for generated passwords
	DefaultPasswordLength = 12
	
	// Character sets for password generation
	lowercaseChars = "abcdefghijklmnopqrstuvwxyz"
	uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	digitChars     = "0123456789"
	specialChars   = "!@#$%^&*"
)

// GenerateTemporaryPassword generates a random temporary password
func GenerateTemporaryPassword() (string, error) {
	return GeneratePassword(DefaultPasswordLength)
}

// GeneratePassword generates a random password of specified length
// Password will contain at least one lowercase, uppercase, digit, and special character
func GeneratePassword(length int) (string, error) {
	if length < 8 {
		length = 8
	}

	allChars := lowercaseChars + uppercaseChars + digitChars + specialChars
	password := make([]byte, length)

	// Ensure at least one character from each set
	charSets := []string{lowercaseChars, uppercaseChars, digitChars, specialChars}
	for i, charset := range charSets {
		char, err := randomChar(charset)
		if err != nil {
			return "", err
		}
		password[i] = char
	}

	// Fill the rest with random characters from all sets
	for i := len(charSets); i < length; i++ {
		char, err := randomChar(allChars)
		if err != nil {
			return "", err
		}
		password[i] = char
	}

	// Shuffle the password to avoid predictable patterns
	for i := range password {
		j, err := rand.Int(rand.Reader, big.NewInt(int64(length)))
		if err != nil {
			return "", err
		}
		password[i], password[j.Int64()] = password[j.Int64()], password[i]
	}

	return string(password), nil
}

// randomChar returns a random character from the given charset
func randomChar(charset string) (byte, error) {
	max := big.NewInt(int64(len(charset)))
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return 0, err
	}
	return charset[n.Int64()], nil
}
