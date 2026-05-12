package valueobject

import (
	"fmt"
	"math"
)

// Money represents a monetary value with currency
// Uses integer cents to avoid floating-point precision issues
type Money struct {
	AmountCents int64  `json:"amount_cents"` // Amount in smallest currency unit (cents/sen)
	Currency    string `json:"currency"`     // ISO 4217 currency code (IDR, USD, etc)
}

// NewMoney creates a new Money instance
func NewMoney(amountCents int64, currency string) Money {
	return Money{
		AmountCents: amountCents,
		Currency:    currency,
	}
}

// NewMoneyFromFloat creates Money from float64 amount
// For IDR: 50000.00 -> 5000000 cents (50000 * 100)
// For USD: 100.50 -> 10050 cents (100.50 * 100)
func NewMoneyFromFloat(amount float64, currency string) Money {
	// Round to avoid floating point precision issues
	cents := int64(math.Round(amount * 100))
	return Money{
		AmountCents: cents,
		Currency:    currency,
	}
}

// Add adds two Money values
// Returns error if currencies don't match
func (m Money) Add(other Money) (Money, error) {
	if m.Currency != other.Currency {
		return Money{}, fmt.Errorf("currency mismatch: cannot add %s and %s", m.Currency, other.Currency)
	}
	return Money{
		AmountCents: m.AmountCents + other.AmountCents,
		Currency:    m.Currency,
	}, nil
}

// Subtract subtracts other Money from this Money
// Returns error if currencies don't match
func (m Money) Subtract(other Money) (Money, error) {
	if m.Currency != other.Currency {
		return Money{}, fmt.Errorf("currency mismatch: cannot subtract %s from %s", other.Currency, m.Currency)
	}
	return Money{
		AmountCents: m.AmountCents - other.AmountCents,
		Currency:    m.Currency,
	}, nil
}

// Multiply multiplies Money by a scalar
func (m Money) Multiply(multiplier float64) Money {
	newAmount := float64(m.AmountCents) * multiplier
	return Money{
		AmountCents: int64(math.Round(newAmount)),
		Currency:    m.Currency,
	}
}

// Divide divides Money by a scalar
// Returns error if divisor is zero
func (m Money) Divide(divisor float64) (Money, error) {
	if divisor == 0 {
		return Money{}, fmt.Errorf("cannot divide by zero")
	}
	newAmount := float64(m.AmountCents) / divisor
	return Money{
		AmountCents: int64(math.Round(newAmount)),
		Currency:    m.Currency,
	}, nil
}

// ToFloat converts Money to float64 representation
// For IDR: 5000000 cents -> 50000.00
// For USD: 10050 cents -> 100.50
func (m Money) ToFloat() float64 {
	return float64(m.AmountCents) / 100.0
}

// String returns formatted string representation
// For IDR: "IDR 50,000.00"
// For USD: "USD 100.50"
func (m Money) String() string {
	amount := m.ToFloat()
	return fmt.Sprintf("%s %.2f", m.Currency, amount)
}

// IsZero returns true if amount is zero
func (m Money) IsZero() bool {
	return m.AmountCents == 0
}

// IsPositive returns true if amount is positive
func (m Money) IsPositive() bool {
	return m.AmountCents > 0
}

// IsNegative returns true if amount is negative
func (m Money) IsNegative() bool {
	return m.AmountCents < 0
}

// Equals checks if two Money values are equal
func (m Money) Equals(other Money) bool {
	return m.AmountCents == other.AmountCents && m.Currency == other.Currency
}

// GreaterThan checks if this Money is greater than other
// Returns error if currencies don't match
func (m Money) GreaterThan(other Money) (bool, error) {
	if m.Currency != other.Currency {
		return false, fmt.Errorf("currency mismatch: cannot compare %s and %s", m.Currency, other.Currency)
	}
	return m.AmountCents > other.AmountCents, nil
}

// LessThan checks if this Money is less than other
// Returns error if currencies don't match
func (m Money) LessThan(other Money) (bool, error) {
	if m.Currency != other.Currency {
		return false, fmt.Errorf("currency mismatch: cannot compare %s and %s", m.Currency, other.Currency)
	}
	return m.AmountCents < other.AmountCents, nil
}

// Abs returns absolute value of Money
func (m Money) Abs() Money {
	if m.AmountCents < 0 {
		return Money{
			AmountCents: -m.AmountCents,
			Currency:    m.Currency,
		}
	}
	return m
}

// Negate returns negated Money value
func (m Money) Negate() Money {
	return Money{
		AmountCents: -m.AmountCents,
		Currency:    m.Currency,
	}
}

// Validate checks if Money is valid
func (m Money) Validate() error {
	if m.Currency == "" {
		return fmt.Errorf("currency is required")
	}
	// Basic ISO 4217 validation (3 uppercase letters)
	if len(m.Currency) != 3 {
		return fmt.Errorf("invalid currency code: must be 3 characters")
	}
	return nil
}
