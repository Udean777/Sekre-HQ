package factory

import (
	"fmt"

	"github.com/rs/zerolog"
	"gorm.io/gorm"

	"github.com/username/sekre-backend/internal/config"
	"github.com/username/sekre-backend/internal/dbctl/domain/service"
	"github.com/username/sekre-backend/internal/dbctl/infrastructure/database"
	"github.com/username/sekre-backend/internal/dbctl/infrastructure/seeder"
	"github.com/username/sekre-backend/internal/dbctl/usecase"
	"github.com/username/sekre-backend/internal/infrastructure/auth"
	"github.com/username/sekre-backend/pkg/logger"
	pkgdb "github.com/username/sekre-backend/pkg/database"
)

// BuildSeedUseCase builds seed use case with all dependencies
func BuildSeedUseCase() (*usecase.SeedUseCase, func(), error) {
	// Load config
	cfg, err := config.Load()
	if err != nil {
		return nil, nil, fmt.Errorf("failed to load config: %w", err)
	}

	// Initialize logger
	logger.Init()
	log := logger.Logger

	// Connect to database
	db, err := connectToDatabase(cfg)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Build infrastructure services
	rlsService := database.NewRLSService(db)

	// Build seeder manager
	seederManager := buildSeederManager(db, log)

	// Build use case
	seedUseCase := usecase.NewSeedUseCase(seederManager, rlsService, log)

	// Cleanup function
	cleanup := func() {
		if err := pkgdb.Close(db); err != nil {
			log.Error().Err(err).Msg("failed to close database connection")
		}
	}

	return seedUseCase, cleanup, nil
}

// BuildResetUseCase builds reset use case with all dependencies
func BuildResetUseCase() (*usecase.ResetUseCase, func(), error) {
	// Load config
	cfg, err := config.Load()
	if err != nil {
		return nil, nil, fmt.Errorf("failed to load config: %w", err)
	}

	// Initialize logger
	logger.Init()
	log := logger.Logger

	// Connect to postgres database (not sekre_db, for drop/create operations)
	db, err := connectToPostgres(cfg)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to connect to postgres: %w", err)
	}

	// Build infrastructure services
	dbService := database.NewDatabaseService(db)
	rlsService := database.NewRLSService(db)

	// Build seeder manager
	seederManager := buildSeederManager(db, log)

	// Build seed use case
	seedUseCase := usecase.NewSeedUseCase(seederManager, rlsService, log)

	// Build migrate runner
	migrateRunner := NewMigrateRunner(cfg)

	// Build reset use case
	resetUseCase := usecase.NewResetUseCase(
		dbService,
		rlsService,
		seedUseCase,
		migrateRunner,
		log,
		cfg.Database.DBName,
	)

	// Cleanup function
	cleanup := func() {
		if err := pkgdb.Close(db); err != nil {
			log.Error().Err(err).Msg("failed to close database connection")
		}
	}

	return resetUseCase, cleanup, nil
}

// buildSeederManager creates and registers all seeders
func buildSeederManager(db *gorm.DB, log zerolog.Logger) service.SeederManager {
	manager := seeder.NewSeederManager(log)

	// Create password hasher
	passwordHasher := auth.NewBcryptHasher(10)

	// Register seeders in order
	manager.RegisterSeeder(seeder.NewOrganizationSeeder(db))
	manager.RegisterSeeder(seeder.NewUserSeeder(db, passwordHasher))
	manager.RegisterSeeder(seeder.NewDivisionSeeder(db))
	manager.RegisterSeeder(seeder.NewTaskSeeder(db))
	manager.RegisterSeeder(seeder.NewEventSeeder(db))
	manager.RegisterSeeder(seeder.NewTransactionSeeder(db))

	return manager
}

// connectToDatabase connects to the configured database
func connectToDatabase(cfg *config.Config) (*gorm.DB, error) {
	dbConfig := pkgdb.Config{
		Host:            cfg.Database.Host,
		Port:            cfg.Database.Port,
		User:            cfg.Database.User,
		Password:        cfg.Database.Password,
		DBName:          cfg.Database.DBName,
		SSLMode:         cfg.Database.SSLMode,
		MaxOpenConns:    cfg.Database.MaxOpenConns,
		MaxIdleConns:    cfg.Database.MaxIdleConns,
		ConnMaxLifetime: cfg.Database.ConnMaxLifetime,
	}

	return pkgdb.NewGormDB(dbConfig)
}

// connectToPostgres connects to postgres database (for admin operations)
func connectToPostgres(cfg *config.Config) (*gorm.DB, error) {
	dbConfig := pkgdb.Config{
		Host:            cfg.Database.Host,
		Port:            cfg.Database.Port,
		User:            cfg.Database.User,
		Password:        cfg.Database.Password,
		DBName:          "postgres", // Connect to postgres database for admin operations
		SSLMode:         cfg.Database.SSLMode,
		MaxOpenConns:    cfg.Database.MaxOpenConns,
		MaxIdleConns:    cfg.Database.MaxIdleConns,
		ConnMaxLifetime: cfg.Database.ConnMaxLifetime,
	}

	return pkgdb.NewGormDB(dbConfig)
}
