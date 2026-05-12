// Package testdb provides test database utilities using testcontainers.
//
//go:build integration

package testdb

import (
	"context"
	"fmt"
	"sync"
	"testing"
	"time"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
	"github.com/username/sekre-backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	sharedDB   *gorm.DB
	sharedOnce sync.Once
	sharedErr  error
)

// Shared returns a shared test database.
// The container is started once per test binary run and reused across tests.
// Use RunInTx for test isolation via transaction rollback.
func Shared(t *testing.T) *gorm.DB {
	t.Helper()

	sharedOnce.Do(func() {
		sharedDB, sharedErr = startPostgresOnce(t)
	})

	if sharedErr != nil {
		t.Fatalf("failed to start shared test database: %v", sharedErr)
	}

	return sharedDB
}

// RunInTx wraps the test body in a transaction that is rolled back at the end.
// This provides test isolation without recreating the database.
func RunInTx(t *testing.T, fn func(tx *gorm.DB)) {
	t.Helper()

	db := Shared(t)
	tx := db.Begin()

	if tx.Error != nil {
		t.Fatalf("failed to begin transaction: %v", tx.Error)
	}

	t.Cleanup(func() {
		tx.Rollback()
	})

	fn(tx)
}

func startPostgresOnce(t *testing.T) (*gorm.DB, error) {
	t.Helper()

	ctx := context.Background()

	req := testcontainers.ContainerRequest{
		Image:        "postgres:15-alpine",
		ExposedPorts: []string{"5432/tcp"},
		Env: map[string]string{
			"POSTGRES_USER":     "test",
			"POSTGRES_PASSWORD": "test",
			"POSTGRES_DB":       "testdb",
		},
		WaitingFor: wait.ForLog("database system is ready to accept connections").
			WithOccurrence(2).
			WithStartupTimeout(60 * time.Second),
	}

	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to start container: %w", err)
	}

	// Cleanup container when tests finish
	t.Cleanup(func() {
		if err := container.Terminate(ctx); err != nil {
			t.Logf("failed to terminate container: %v", err)
		}
	})

	host, err := container.Host(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get container host: %w", err)
	}

	port, err := container.MappedPort(ctx, "5432")
	if err != nil {
		return nil, fmt.Errorf("failed to get container port: %w", err)
	}

	dsn := fmt.Sprintf("host=%s port=%s user=test password=test dbname=testdb sslmode=disable",
		host, port.Port())

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent), // Quiet logs in tests
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Run migrations
	if err := runMigrations(db); err != nil {
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	return db, nil
}

func runMigrations(db *gorm.DB) error {
	// Enable UUID extension
	if err := db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"").Error; err != nil {
		return fmt.Errorf("failed to enable uuid extension: %w", err)
	}

	// For test environment, use GORM AutoMigrate instead of migration files
	// This is simpler and avoids issues with RLS policies and other production-specific features
	
	// Import all models
	err := db.AutoMigrate(
		&models.User{},
		&models.Organization{},
		&models.UserOrganization{},
		&models.Division{},
		&models.DivisionMember{},
		&models.Task{},
		&models.Event{},
		&models.Transaction{},
		&models.PasswordReset{},
		&models.AuditLog{},
	)
	if err != nil {
		return fmt.Errorf("failed to auto-migrate models: %w", err)
	}

	return nil
}
