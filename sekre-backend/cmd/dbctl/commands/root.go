package commands

import (
	"github.com/spf13/cobra"
)

// NewRootCommand creates the root command for dbctl
func NewRootCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "dbctl",
		Short: "Database control tool for Sekre backend",
		Long: `A CLI tool to manage database operations for Sekre backend.
		
Features:
  - Seed demo data to database
  - Reset database (drop, recreate, migrate, seed)
  - Apply RLS policies`,
	}

	// Add subcommands
	cmd.AddCommand(
		NewSeedCommand(),
		NewResetCommand(),
	)

	return cmd
}
