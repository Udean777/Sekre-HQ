package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CustomError represents custom error types for better error handling
type CustomError struct {
	Code    string
	Message string
	Err     error
}

func (e *CustomError) Error() string {
	if e.Err != nil {
		return e.Message + ": " + e.Err.Error()
	}
	return e.Message
}

func (e *CustomError) Unwrap() error {
	return e.Err
}

// Common error codes
const (
	ErrCodeNotFound          = "NOT_FOUND"
	ErrCodeAlreadyExists     = "ALREADY_EXISTS"
	ErrCodeInvalidInput      = "INVALID_INPUT"
	ErrCodeUnauthorized      = "UNAUTHORIZED"
	ErrCodeForbidden         = "FORBIDDEN"
	ErrCodeInternalError     = "INTERNAL_ERROR"
	ErrCodeDatabaseError     = "DATABASE_ERROR"
	ErrCodeValidationError   = "VALIDATION_ERROR"
)

// Error constructors
func NewNotFoundError(message string, err error) *CustomError {
	return &CustomError{Code: ErrCodeNotFound, Message: message, Err: err}
}

func NewAlreadyExistsError(message string, err error) *CustomError {
	return &CustomError{Code: ErrCodeAlreadyExists, Message: message, Err: err}
}

func NewInvalidInputError(message string, err error) *CustomError {
	return &CustomError{Code: ErrCodeInvalidInput, Message: message, Err: err}
}

func NewUnauthorizedError(message string, err error) *CustomError {
	return &CustomError{Code: ErrCodeUnauthorized, Message: message, Err: err}
}

func NewForbiddenError(message string, err error) *CustomError {
	return &CustomError{Code: ErrCodeForbidden, Message: message, Err: err}
}

func NewInternalError(message string, err error) *CustomError {
	return &CustomError{Code: ErrCodeInternalError, Message: message, Err: err}
}

func NewDatabaseError(message string, err error) *CustomError {
	return &CustomError{Code: ErrCodeDatabaseError, Message: message, Err: err}
}

func NewValidationError(message string, err error) *CustomError {
	return &CustomError{Code: ErrCodeValidationError, Message: message, Err: err}
}

// IsNotFoundError checks if error is a not found error
func IsNotFoundError(err error) bool {
	if err == nil {
		return false
	}
	if customErr, ok := err.(*CustomError); ok {
		return customErr.Code == ErrCodeNotFound
	}
	return err == gorm.ErrRecordNotFound
}

// IsAlreadyExistsError checks if error is an already exists error
func IsAlreadyExistsError(err error) bool {
	if err == nil {
		return false
	}
	if customErr, ok := err.(*CustomError); ok {
		return customErr.Code == ErrCodeAlreadyExists
	}
	return false
}

// WithOrganization is a GORM scope for filtering by organization
func WithOrganization(orgID uuid.UUID) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("organization_id = ?", orgID)
	}
}

// WithDivision is a GORM scope for filtering by division
func WithDivision(divisionID uuid.UUID) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("division_id = ?", divisionID)
	}
}

// WithUser is a GORM scope for filtering by user
func WithUser(userID uuid.UUID) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("user_id = ?", userID)
	}
}

// Paginate is a GORM scope for pagination
func Paginate(page, pageSize int) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if page <= 0 {
			page = 1
		}
		if pageSize <= 0 {
			pageSize = 10
		}
		offset := (page - 1) * pageSize
		return db.Offset(offset).Limit(pageSize)
	}
}

// OrderByCreatedAt is a GORM scope for ordering by created_at
func OrderByCreatedAt(desc bool) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if desc {
			return db.Order("created_at DESC")
		}
		return db.Order("created_at ASC")
	}
}
