package factory

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"

	"github.com/username/sekre-backend/internal/config"
	"github.com/username/sekre-backend/internal/dbctl/usecase"
)

// migrateRunner implements usecase.MigrateRunner
type migrateRunner struct {
	cfg *config.Config
}

// NewMigrateRunner creates new migrate runner
func NewMigrateRunner(cfg *config.Config) usecase.MigrateRunner {
	return &migrateRunner{cfg: cfg}
}

func (r *migrateRunner) RunMigrations(ctx context.Context) error {
	// Build DSN
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		r.cfg.Database.Host,
		r.cfg.Database.Port,
		r.cfg.Database.User,
		r.cfg.Database.Password,
		r.cfg.Database.DBName,
		r.cfg.Database.SSLMode,
	)

	// Connect to database
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	defer db.Close()

	// Create postgres driver instance
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("failed to create postgres driver: %w", err)
	}

	// Create migrate instance
	m, err := migrate.NewWithDatabaseInstance(
		"file://migrations",
		"postgres",
		driver,
	)
	if err != nil {
		return fmt.Errorf("failed to create migrate instance: %w", err)
	}

	// Run migrations
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("migration failed: %w", err)
	}

	return nil
}
