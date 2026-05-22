package main

import (
	"database/sql"
	"flag"
	"fmt"
	"os"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	"github.com/username/sekre-backend/internal/config"
	"github.com/username/sekre-backend/pkg/logger"
)

func main() {
	// Initialize logger
	logger.Init()

	var command string
	var steps int
	var version uint
	var name string

	flag.StringVar(&command, "command", "", "Migration command: up, down, force, version, create")
	flag.IntVar(&steps, "steps", 0, "Number of migration steps (for up/down)")
	flag.UintVar(&version, "version", 0, "Force migration to specific version")
	flag.StringVar(&name, "name", "", "Migration name (for create command)")
	flag.Parse()

	if command == "" {
		printUsage()
		os.Exit(1)
	}

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		logger.Fatalf("Failed to load config: %v", err)
	}

	// Handle create command separately (doesn't need DB connection)
	if command == "create" {
		if name == "" {
			logger.Fatal("Migration name is required for create command")
		}
		if err := createMigration(name); err != nil {
			logger.Fatalf("Failed to create migration: %v", err)
		}
		return
	}

	// Connect to database
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.DBName,
		cfg.Database.SSLMode,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		logger.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close() //nolint:errcheck

	// Create postgres driver instance
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		logger.Fatalf("Failed to create postgres driver: %v", err)
	}

	// Create migrate instance
	m, err := migrate.NewWithDatabaseInstance(
		"file://migrations",
		"postgres",
		driver,
	)
	if err != nil {
		logger.Fatalf("Failed to create migrate instance: %v", err)
	}

	// Execute command
	switch command {
	case "up":
		if err := runUp(m, steps); err != nil {
			logger.Fatalf("Migration up failed: %v", err)
		}
	case "down":
		if err := runDown(m, steps); err != nil {
			logger.Fatalf("Migration down failed: %v", err)
		}
	case "force":
		if version == 0 {
			logger.Fatal("Version is required for force command")
		}
		if err := m.Force(int(version)); err != nil {
			logger.Fatalf("Migration force failed: %v", err)
		}
		logger.Infof("Forced migration to version %d", version)
	case "version":
		v, dirty, err := m.Version()
		if err != nil {
			logger.Fatalf("Failed to get version: %v", err)
		}
		logger.Infof("Current version: %d (dirty: %v)", v, dirty)
	default:
		logger.Fatalf("Unknown command: %s", command)
	}
}

func runUp(m *migrate.Migrate, steps int) error {
	if steps > 0 {
		if err := m.Steps(steps); err != nil {
			return err
		}
		logger.Infof("Successfully migrated up %d steps", steps)
	} else {
		if err := m.Up(); err != nil {
			if err == migrate.ErrNoChange {
				logger.Info("No migrations to apply")
				return nil
			}
			return err
		}
		logger.Info("Successfully migrated up to latest version")
	}
	return nil
}

func runDown(m *migrate.Migrate, steps int) error {
	if steps > 0 {
		if err := m.Steps(-steps); err != nil {
			return err
		}
		logger.Infof("Successfully migrated down %d steps", steps)
	} else {
		if err := m.Down(); err != nil {
			if err == migrate.ErrNoChange {
				logger.Info("No migrations to rollback")
				return nil
			}
			return err
		}
		logger.Info("Successfully migrated down all migrations")
	}
	return nil
}

func createMigration(name string) error {
	timestamp := time.Now().Unix()
	upFile := fmt.Sprintf("migrations/%d_%s.up.sql", timestamp, name)
	downFile := fmt.Sprintf("migrations/%d_%s.down.sql", timestamp, name)

	// Create up migration file
	if err := os.WriteFile(upFile, []byte("-- Write your up migration here\n"), 0644); err != nil {
		return fmt.Errorf("failed to create up migration file: %w", err)
	}

	// Create down migration file
	if err := os.WriteFile(downFile, []byte("-- Write your down migration here\n"), 0644); err != nil {
		return fmt.Errorf("failed to create down migration file: %w", err)
	}

	logger.Infof("Created migration files:\n  %s\n  %s", upFile, downFile)
	return nil
}

func printUsage() {
	fmt.Println("Migration Tool Usage:")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  -command=up              Run all pending migrations")
	fmt.Println("  -command=up -steps=N     Run N pending migrations")
	fmt.Println("  -command=down            Rollback all migrations")
	fmt.Println("  -command=down -steps=N   Rollback N migrations")
	fmt.Println("  -command=force -version=N Force migration to version N")
	fmt.Println("  -command=version         Show current migration version")
	fmt.Println("  -command=create -name=X  Create new migration files")
	fmt.Println()
	fmt.Println("Examples:")
	fmt.Println("  go run cmd/migrate/main.go -command=up")
	fmt.Println("  go run cmd/migrate/main.go -command=down -steps=1")
	fmt.Println("  go run cmd/migrate/main.go -command=create -name=add_users_table")
}
