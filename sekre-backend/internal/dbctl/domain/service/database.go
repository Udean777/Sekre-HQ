package service

import (
	"context"

	"gorm.io/gorm"
)

// DatabaseService handles database operations
type DatabaseService interface {
	// GetDB returns database connection
	GetDB() *gorm.DB

	// DropDatabase drops the specified database
	DropDatabase(ctx context.Context, dbName string) error

	// CreateDatabase creates a new database
	CreateDatabase(ctx context.Context, dbName string) error

	// TerminateConnections terminates all connections to the specified database
	TerminateConnections(ctx context.Context, dbName string) error

	// InitializeSchema initializes database schema (extensions, enums)
	InitializeSchema(ctx context.Context) error
}

// RLSService handles Row-Level Security operations
type RLSService interface {
	// EnableRLS enables RLS on specified tables
	EnableRLS(ctx context.Context, tables []string) error

	// DisableRLS disables RLS on specified tables
	DisableRLS(ctx context.Context, tables []string) error

	// CreateRLSFunctions creates RLS helper functions
	CreateRLSFunctions(ctx context.Context) error

	// CreateRLSPolicies creates RLS policies for multi-tenant isolation
	CreateRLSPolicies(ctx context.Context) error
}
