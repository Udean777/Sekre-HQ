package types

import (
	"database/sql/driver"
	"fmt"
)

// TransactionType classifies a finance transaction as incoming or outgoing.
type TransactionType string

const (
	TransactionTypeIncome  TransactionType = "INCOME"
	TransactionTypeExpense TransactionType = "EXPENSE"
)

// AllTransactionTypes returns every valid TransactionType value.
func AllTransactionTypes() []TransactionType {
	return []TransactionType{TransactionTypeIncome, TransactionTypeExpense}
}

// Validate reports whether t is a recognized TransactionType.
func (t TransactionType) Validate() error {
	switch t {
	case TransactionTypeIncome, TransactionTypeExpense:
		return nil
	default:
		return fmt.Errorf("%w: transaction type %q", ErrInvalidEnumValue, string(t))
	}
}

// String returns the canonical string representation.
func (t TransactionType) String() string { return string(t) }

// Value implements driver.Valuer.
func (t TransactionType) Value() (driver.Value, error) {
	if err := t.Validate(); err != nil {
		return nil, err
	}
	return string(t), nil
}

// Scan implements sql.Scanner.
func (t *TransactionType) Scan(value interface{}) error {
	s, err := scanString(value)
	if err != nil {
		return err
	}
	tt := TransactionType(s)
	if err := tt.Validate(); err != nil {
		return err
	}
	*t = tt
	return nil
}

// TransactionStatus represents the approval state of a finance transaction.
type TransactionStatus string

const (
	TransactionStatusPending  TransactionStatus = "PENDING"
	TransactionStatusApproved TransactionStatus = "APPROVED"
	TransactionStatusRejected TransactionStatus = "REJECTED"
)

// AllTransactionStatuses returns every valid TransactionStatus value.
func AllTransactionStatuses() []TransactionStatus {
	return []TransactionStatus{
		TransactionStatusPending,
		TransactionStatusApproved,
		TransactionStatusRejected,
	}
}

// Validate reports whether s is a recognized TransactionStatus.
func (s TransactionStatus) Validate() error {
	switch s {
	case TransactionStatusPending, TransactionStatusApproved, TransactionStatusRejected:
		return nil
	default:
		return fmt.Errorf("%w: transaction status %q", ErrInvalidEnumValue, string(s))
	}
}

// String returns the canonical string representation.
func (s TransactionStatus) String() string { return string(s) }

// Value implements driver.Valuer.
func (s TransactionStatus) Value() (driver.Value, error) {
	if err := s.Validate(); err != nil {
		return nil, err
	}
	return string(s), nil
}

// Scan implements sql.Scanner.
func (s *TransactionStatus) Scan(value interface{}) error {
	raw, err := scanString(value)
	if err != nil {
		return err
	}
	ts := TransactionStatus(raw)
	if err := ts.Validate(); err != nil {
		return err
	}
	*s = ts
	return nil
}
