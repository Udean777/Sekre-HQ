package commands

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/spf13/cobra"
	"github.com/username/sekre-backend/cmd/dbctl/commands/factory"
)

// NewResetCommand creates the reset command
func NewResetCommand() *cobra.Command {
	var withSeed bool

	cmd := &cobra.Command{
		Use:   "reset",
		Short: "Reset database (drop and recreate)",
		Long: `Reset the database by:
  1. Terminating all connections
  2. Dropping the database
  3. Creating a new database
  4. Initializing schema (extensions, enums)
  5. Running migrations
  6. Applying RLS policies
  7. Optionally seeding demo data (--seed flag)

⚠️  WARNING: This will delete ALL data in the database!`,
		RunE: func(cmd *cobra.Command, args []string) error {
			// Confirmation prompt
			if !confirmReset() {
				fmt.Println("❌ Operation cancelled.")
				return nil
			}

			ctx := context.Background()

			// Build dependencies for reset (connects to postgres db)
			resetUseCase, cleanup, err := factory.BuildResetUseCase()
			if err != nil {
				return fmt.Errorf("failed to build dependencies: %w", err)
			}
			defer cleanup()

			// Execute reset (drop, create, migrate) - WITHOUT seeding
			if err := resetUseCase.Execute(ctx, false); err != nil {
				return fmt.Errorf("reset failed: %w", err)
			}

			// If seeding is requested, build new connection to sekre_db and seed
			if withSeed {
				seedUseCase, seedCleanup, err := factory.BuildSeedUseCase()
				if err != nil {
					return fmt.Errorf("failed to build seed dependencies: %w", err)
				}
				defer seedCleanup()

				if err := seedUseCase.Execute(ctx); err != nil {
					return fmt.Errorf("seed failed: %w", err)
				}
			}

			return nil
		},
	}

	cmd.Flags().BoolVar(&withSeed, "seed", false, "Seed demo data after reset")

	return cmd
}

func confirmReset() bool {
	fmt.Println("⚠️  WARNING: This will delete ALL data in sekre_db database!")
	fmt.Print("Are you sure you want to continue? (yes/no): ")

	reader := bufio.NewReader(os.Stdin)
	response, _ := reader.ReadString('\n')
	response = strings.TrimSpace(strings.ToLower(response))

	return response == "yes"
}
