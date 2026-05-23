// Package migrate provides database migration helpers used at application startup.
//
// This package wraps golang-migrate to enable auto-migration on server start,
// which is crucial for platforms like Render and Railway where there is no
// separate job runner — the only deploy primitive is "start the web service".
//
// Auto-migration is idempotent: subsequent starts with no pending migrations
// are a no-op.
package migrate

import (
	"errors"
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file" // register file:// source
	"gorm.io/gorm"
)

// Up runs all pending up migrations from the given source path against the
// provided GORM DB. It returns nil when migrations succeed or when there are
// no pending migrations (idempotent).
//
// sourcePath should be a path resolvable at runtime, e.g. "file://migrations".
//
// Behavior:
//   - Acquires the underlying *sql.DB from gorm to obtain a postgres driver.
//   - Calls migrate.Up(); ErrNoChange is treated as a successful no-op.
//   - All other errors are wrapped and returned to the caller.
func Up(db *gorm.DB, sourcePath string) error {
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("get sql.DB from gorm: %w", err)
	}

	driver, err := postgres.WithInstance(sqlDB, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("create postgres migrate driver: %w", err)
	}

	m, err := migrate.NewWithDatabaseInstance(sourcePath, "postgres", driver)
	if err != nil {
		return fmt.Errorf("create migrate instance: %w", err)
	}

	if err := m.Up(); err != nil {
		if errors.Is(err, migrate.ErrNoChange) {
			return nil
		}
		return fmt.Errorf("apply migrations: %w", err)
	}

	return nil
}
