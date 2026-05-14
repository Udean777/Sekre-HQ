package service

import "context"

// Seeder defines contract for seeding operations
// Each seeder is responsible for seeding a specific entity type
type Seeder interface {
	// Seed seeds data for a specific entity
	Seed(ctx context.Context) error

	// Name returns the seeder name for logging purposes
	Name() string

	// Order returns execution order (lower number = earlier execution)
	// This ensures proper foreign key relationships
	Order() int
}

// SeederManager orchestrates multiple seeders
type SeederManager interface {
	// RegisterSeeder registers a seeder to be executed
	RegisterSeeder(seeder Seeder)

	// SeedAll executes all registered seeders in order
	SeedAll(ctx context.Context) error
}
