package seeder

import (
	"context"
	"fmt"
	"sort"

	"github.com/rs/zerolog"
	"github.com/username/sekre-backend/internal/dbctl/domain/service"
)

// seederManager implements service.SeederManager
type seederManager struct {
	seeders []service.Seeder
	logger  zerolog.Logger
}

// NewSeederManager creates new seeder manager
func NewSeederManager(logger zerolog.Logger) service.SeederManager {
	return &seederManager{
		seeders: make([]service.Seeder, 0),
		logger:  logger,
	}
}

func (m *seederManager) RegisterSeeder(seeder service.Seeder) {
	m.seeders = append(m.seeders, seeder)
}

func (m *seederManager) SeedAll(ctx context.Context) error {
	// Sort seeders by order to respect foreign key relationships
	sort.Slice(m.seeders, func(i, j int) bool {
		return m.seeders[i].Order() < m.seeders[j].Order()
	})

	// Execute each seeder
	for _, seeder := range m.seeders {
		m.logger.Info().Msgf("Seeding %s...", seeder.Name())

		if err := seeder.Seed(ctx); err != nil {
			return fmt.Errorf("failed to seed %s: %w", seeder.Name(), err)
		}

		m.logger.Info().Msgf("✅ %s seeded", seeder.Name())
	}

	// Print summary
	m.printSummary()

	return nil
}

func (m *seederManager) printSummary() {
	m.logger.Info().Msg("\n====================================")
	m.logger.Info().Msg("📊 Demo Data Summary:")
	m.logger.Info().Msg("====================================")
	m.logger.Info().Msg("\n🏢 Organizations: 2")
	m.logger.Info().Msg("   - HIMTI UNPAB (FREE plan)")
	m.logger.Info().Msg("   - BEM Universitas (LITE plan)")
	m.logger.Info().Msg("\n👥 Users: 4")
	m.logger.Info().Msg("   - sajudin@himti.org (OWNER)")
	m.logger.Info().Msg("   - zulhamdani@himti.org (ADMIN)")
	m.logger.Info().Msg("   - gilang@himti.org (MEMBER)")
	m.logger.Info().Msg("   - admin@bem.org (OWNER)")
	m.logger.Info().Msg("\n📁 Divisions: 5")
	m.logger.Info().Msg("✅ Tasks: 3")
	m.logger.Info().Msg("📅 Events: 3")
	m.logger.Info().Msg("💰 Transactions: 6")
	m.logger.Info().Msg("\n====================================")
	m.logger.Info().Msg("🔐 Login Credentials:")
	m.logger.Info().Msg("====================================")
	m.logger.Info().Msg("\nAll passwords: password123")
	m.logger.Info().Msg("\nHIMTI UNPAB:")
	m.logger.Info().Msg("  - sajudin@himti.org")
	m.logger.Info().Msg("  - zulhamdani@himti.org")
	m.logger.Info().Msg("  - gilang@himti.org")
	m.logger.Info().Msg("\nBEM Universitas:")
	m.logger.Info().Msg("  - admin@bem.org")
	m.logger.Info().Msg("\n====================================")
}
