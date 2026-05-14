package commands

import (
	"context"
	"fmt"

	"github.com/spf13/cobra"
	"github.com/username/sekre-backend/cmd/dbctl/commands/factory"
)

// NewSeedCommand creates the seed command
func NewSeedCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "seed",
		Short: "Seed demo data to database",
		Long: `Seed demo data to the database including:
  - Organizations (HIMTI UNPAB, BEM Universitas)
  - Users (4 demo users)
  - Divisions (5 divisions)
  - Tasks (3 sample tasks)
  - Events (3 sample events)
  - Transactions (6 sample transactions)

All demo users have password: password123`,
		RunE: func(cmd *cobra.Command, args []string) error {
			ctx := context.Background()

			// Build dependencies using factory
			seedUseCase, cleanup, err := factory.BuildSeedUseCase()
			if err != nil {
				return fmt.Errorf("failed to build dependencies: %w", err)
			}
			defer cleanup()

			// Execute use case
			if err := seedUseCase.Execute(ctx); err != nil {
				return fmt.Errorf("seed failed: %w", err)
			}

			return nil
		},
	}
}
