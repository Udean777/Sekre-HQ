package database

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"github.com/username/sekre-backend/internal/dbctl/domain/service"
)

// databaseService implements service.DatabaseService
type databaseService struct {
	db *gorm.DB
}

// NewDatabaseService creates new database service
func NewDatabaseService(db *gorm.DB) service.DatabaseService {
	return &databaseService{db: db}
}

func (s *databaseService) GetDB() *gorm.DB {
	return s.db
}

func (s *databaseService) TerminateConnections(ctx context.Context, dbName string) error {
	sql := `SELECT pg_terminate_backend(pid) 
            FROM pg_stat_activity 
            WHERE datname = $1 
            AND pid <> pg_backend_pid()`

	return s.db.WithContext(ctx).Exec(sql, dbName).Error
}

func (s *databaseService) DropDatabase(ctx context.Context, dbName string) error {
	sql := fmt.Sprintf("DROP DATABASE IF EXISTS %s", dbName)
	return s.db.WithContext(ctx).Exec(sql).Error
}

func (s *databaseService) CreateDatabase(ctx context.Context, dbName string) error {
	sql := fmt.Sprintf("CREATE DATABASE %s", dbName)
	return s.db.WithContext(ctx).Exec(sql).Error
}

func (s *databaseService) InitializeSchema(ctx context.Context) error {
	// Enable extensions
	if err := s.enableExtensions(ctx); err != nil {
		return fmt.Errorf("failed to enable extensions: %w", err)
	}

	// Create enums
	if err := s.createEnums(ctx); err != nil {
		return fmt.Errorf("failed to create enums: %w", err)
	}

	return nil
}

func (s *databaseService) enableExtensions(ctx context.Context) error {
	extensions := []string{
		`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
		`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`,
	}

	for _, ext := range extensions {
		if err := s.db.WithContext(ctx).Exec(ext).Error; err != nil {
			return fmt.Errorf("failed to create extension: %w", err)
		}
	}

	return nil
}

func (s *databaseService) createEnums(ctx context.Context) error {
	enums := []string{
		`CREATE TYPE IF NOT EXISTS subscription_plan AS ENUM ('FREE', 'LITE', 'PRO')`,
		`CREATE TYPE IF NOT EXISTS organization_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER')`,
		`CREATE TYPE IF NOT EXISTS division_role AS ENUM ('HEAD', 'STAFF')`,
		`CREATE TYPE IF NOT EXISTS task_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE')`,
		`CREATE TYPE IF NOT EXISTS transaction_type AS ENUM ('INCOME', 'EXPENSE')`,
		`CREATE TYPE IF NOT EXISTS transaction_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED')`,
	}

	for _, enum := range enums {
		if err := s.db.WithContext(ctx).Exec(enum).Error; err != nil {
			return fmt.Errorf("failed to create enum: %w", err)
		}
	}

	return nil
}
