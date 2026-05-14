package usecase

import (
	"context"

	"github.com/rs/zerolog"
	"github.com/username/sekre-backend/internal/dbctl/domain/service"
)

// ResetUseCase handles database reset operations
type ResetUseCase struct {
	dbService     service.DatabaseService
	rlsService    service.RLSService
	seedUseCase   *SeedUseCase
	migrateRunner MigrateRunner
	logger        zerolog.Logger
	dbName        string
}

// MigrateRunner runs database migrations
type MigrateRunner interface {
	RunMigrations(ctx context.Context) error
}

// NewResetUseCase creates new reset use case
func NewResetUseCase(
	dbService service.DatabaseService,
	rlsService service.RLSService,
	seedUseCase *SeedUseCase,
	migrateRunner MigrateRunner,
	logger zerolog.Logger,
	dbName string,
) *ResetUseCase {
	return &ResetUseCase{
		dbService:     dbService,
		rlsService:    rlsService,
		seedUseCase:   seedUseCase,
		migrateRunner: migrateRunner,
		logger:        logger,
		dbName:        dbName,
	}
}

// Execute executes database reset
func (uc *ResetUseCase) Execute(ctx context.Context, withSeed bool) error {
	// Step 1: Terminate connections
	uc.logger.Info().Msg("🔌 Terminating database connections...")
	if err := uc.dbService.TerminateConnections(ctx, uc.dbName); err != nil {
		uc.logger.Warn().Err(err).Msg("Failed to terminate connections (may be expected)")
	}

	// Step 2: Drop database
	uc.logger.Info().Msg("🗑️  Dropping database...")
	if err := uc.dbService.DropDatabase(ctx, uc.dbName); err != nil {
		return err
	}

	// Step 3: Create database
	uc.logger.Info().Msg("📝 Creating database...")
	if err := uc.dbService.CreateDatabase(ctx, uc.dbName); err != nil {
		return err
	}

	// Note: After creating database, we need to reconnect to the new database
	// for schema initialization. This is handled by the factory which should
	// provide a new connection to sekre_db after creation.
	// For now, we'll skip InitializeSchema and let migrations handle it.

	// Step 4: Run migrations (migrations will create extensions and enums)
	uc.logger.Info().Msg("🔄 Running migrations...")
	if err := uc.migrateRunner.RunMigrations(ctx); err != nil {
		return err
	}

	// Note: RLS policies are already created by migrations
	// No need to apply them separately

	// Step 5: Seed (if requested)
	if withSeed {
		uc.logger.Info().Msg("🌱 Seeding demo data...")
		if err := uc.seedUseCase.Execute(ctx); err != nil {
			return err
		}
	}

	uc.logger.Info().Msg("\n✅ Database reset complete!")
	return nil
}
