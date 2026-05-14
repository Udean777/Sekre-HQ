package usecase

import (
	"context"
	"fmt"

	"github.com/rs/zerolog"
	"github.com/username/sekre-backend/internal/dbctl/domain/service"
)

// SeedUseCase handles seeding operations
type SeedUseCase struct {
	seederManager service.SeederManager
	rlsService    service.RLSService
	logger        zerolog.Logger
}

// NewSeedUseCase creates new seed use case
func NewSeedUseCase(
	seederManager service.SeederManager,
	rlsService service.RLSService,
	logger zerolog.Logger,
) *SeedUseCase {
	return &SeedUseCase{
		seederManager: seederManager,
		rlsService:    rlsService,
		logger:        logger,
	}
}

// Execute executes seeding process
func (uc *SeedUseCase) Execute(ctx context.Context) error {
	uc.logger.Info().Msg("🌱 Starting database seeding...")

	// Tables that need RLS disabled during seeding
	tables := []string{
		"organizations", "user_organizations", "divisions",
		"division_members", "tasks", "events", "transactions",
	}

	// Disable RLS temporarily (ignore errors if tables don't exist yet)
	_ = uc.rlsService.DisableRLS(ctx, tables)

	// Ensure RLS is re-enabled even if seeding fails
	defer func() {
		// Re-enable RLS (ignore errors if tables don't exist)
		_ = uc.rlsService.EnableRLS(ctx, tables)
	}()

	// Execute all seeders
	if err := uc.seederManager.SeedAll(ctx); err != nil {
		return fmt.Errorf("seeding failed: %w", err)
	}

	uc.logger.Info().Msg("✅ Database seeding completed!")
	return nil
}
