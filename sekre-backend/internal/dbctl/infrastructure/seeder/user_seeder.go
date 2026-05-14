package seeder

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/username/sekre-backend/internal/dbctl/domain/service"
	domainService "github.com/username/sekre-backend/internal/domain/service"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
)

// userSeeder implements service.Seeder
type userSeeder struct {
	db             *gorm.DB
	passwordHasher domainService.PasswordHasher
}

// NewUserSeeder creates new user seeder
func NewUserSeeder(db *gorm.DB, passwordHasher domainService.PasswordHasher) service.Seeder {
	return &userSeeder{
		db:             db,
		passwordHasher: passwordHasher,
	}
}

func (s *userSeeder) Name() string {
	return "Users"
}

func (s *userSeeder) Order() int {
	return 2 // After organizations
}

func (s *userSeeder) Seed(ctx context.Context) error {
	// Hash password once for all users
	hashedPassword, err := s.passwordHasher.Hash("password123")
	if err != nil {
		return err
	}

	users := []entity.User{
		{
			ID:           uuid.MustParse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
			Email:        "sajudin@himti.org",
			PasswordHash: hashedPassword,
			FullName:     "Sajudin Ma'ruf",
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			ID:           uuid.MustParse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
			Email:        "admin@bem.org",
			PasswordHash: hashedPassword,
			FullName:     "Admin BEM",
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			ID:           uuid.MustParse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
			Email:        "zulhamdani@himti.org",
			PasswordHash: hashedPassword,
			FullName:     "Zulhamdani",
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			ID:           uuid.MustParse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
			Email:        "gilang@himti.org",
			PasswordHash: hashedPassword,
			FullName:     "Gilang Gemilang",
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
	}

	for _, user := range users {
		if err := s.db.WithContext(ctx).Create(&user).Error; err != nil {
			return err
		}
	}

	// Seed organization members
	return s.seedOrganizationMembers(ctx)
}

func (s *userSeeder) seedOrganizationMembers(ctx context.Context) error {
	members := []entity.UserOrganization{
		{
			ID:             uuid.MustParse("10000000-0000-0000-0000-000000000001"),
			UserID:         uuid.MustParse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
			OrganizationID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			Role:           types.RoleOwner,
			CreatedAt:      time.Now(),
		},
		{
			ID:             uuid.MustParse("10000000-0000-0000-0000-000000000002"),
			UserID:         uuid.MustParse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
			OrganizationID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			Role:           types.RoleAdmin,
			CreatedAt:      time.Now(),
		},
		{
			ID:             uuid.MustParse("10000000-0000-0000-0000-000000000003"),
			UserID:         uuid.MustParse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
			OrganizationID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			Role:           types.RoleMember,
			CreatedAt:      time.Now(),
		},
		{
			ID:             uuid.MustParse("10000000-0000-0000-0000-000000000004"),
			UserID:         uuid.MustParse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
			OrganizationID: uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			Role:           types.RoleOwner,
			CreatedAt:      time.Now(),
		},
	}

	for _, member := range members {
		if err := s.db.WithContext(ctx).Create(&member).Error; err != nil {
			return err
		}
	}

	return nil
}
