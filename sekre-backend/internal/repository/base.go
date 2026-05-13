package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// BaseRepository provides common database operations
type BaseRepository struct {
	db *gorm.DB
}

// NewBaseRepository creates a new base repository
func NewBaseRepository(db *gorm.DB) *BaseRepository {
	return &BaseRepository{db: db}
}

// DB returns the underlying GORM DB instance
func (r *BaseRepository) DB() *gorm.DB {
	return r.db
}

// WithContext returns a new DB instance with context
func (r *BaseRepository) WithContext(ctx context.Context) *gorm.DB {
	return r.db.WithContext(ctx)
}

// Transaction executes a function within a database transaction
func (r *BaseRepository) Transaction(ctx context.Context, fn func(*gorm.DB) error) error {
	return r.db.WithContext(ctx).Transaction(fn)
}

// IsNotFoundError checks if the error is a record not found error
func IsNotFoundError(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}

// HandleError converts GORM errors to custom errors
func HandleError(err error, entityName string) error {
	if err == nil {
		return nil
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return fmt.Errorf("%s not found", entityName)
	}

	if errors.Is(err, gorm.ErrDuplicatedKey) {
		return fmt.Errorf("%s already exists", entityName)
	}

	return fmt.Errorf("database error: %w", err)
}

// Scopes

// WithOrganization filters by organization ID
func WithOrganization(orgID uuid.UUID) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("organization_id = ?", orgID)
	}
}

// WithDivision filters by division ID
func WithDivision(divisionID uuid.UUID) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("division_id = ?", divisionID)
	}
}

// WithUser filters by user ID
func WithUser(userID uuid.UUID) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("user_id = ?", userID)
	}
}

// WithStatus filters by status
func WithStatus(status string) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("status = ?", status)
	}
}

// Paginate applies pagination
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

// OrderByCreatedAt orders by created_at
func OrderByCreatedAt(desc bool) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if desc {
			return db.Order("created_at DESC")
		}
		return db.Order("created_at ASC")
	}
}

// OrderByUpdatedAt orders by updated_at
func OrderByUpdatedAt(desc bool) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if desc {
			return db.Order("updated_at DESC")
		}
		return db.Order("updated_at ASC")
	}
}

// WithPreload preloads associations
func WithPreload(associations ...string) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		for _, assoc := range associations {
			db = db.Preload(assoc)
		}
		return db
	}
}
