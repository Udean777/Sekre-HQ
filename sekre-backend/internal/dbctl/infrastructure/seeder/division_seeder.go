package seeder

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/username/sekre-backend/internal/dbctl/domain/service"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
)

// divisionSeeder implements service.Seeder
type divisionSeeder struct {
	db *gorm.DB
}

// NewDivisionSeeder creates new division seeder
func NewDivisionSeeder(db *gorm.DB) service.Seeder {
	return &divisionSeeder{db: db}
}

func (s *divisionSeeder) Name() string {
	return "Divisions"
}

func (s *divisionSeeder) Order() int {
	return 3 // After users
}

func (s *divisionSeeder) Seed(ctx context.Context) error {
	divisions := []entity.Division{
		// HIMTI divisions
		{
			ID:             uuid.MustParse("d1111111-1111-1111-1111-111111111111"),
			OrganizationID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			Name:           "Divisi IPTEK",
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
		{
			ID:             uuid.MustParse("d2222222-2222-2222-2222-222222222222"),
			OrganizationID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			Name:           "Divisi Humas",
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
		{
			ID:             uuid.MustParse("d3333333-3333-3333-3333-333333333333"),
			OrganizationID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			Name:           "Divisi Kewirausahaan",
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
		// BEM divisions
		{
			ID:             uuid.MustParse("d4444444-4444-4444-4444-444444444444"),
			OrganizationID: uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			Name:           "Departemen Sosmas",
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
		{
			ID:             uuid.MustParse("d5555555-5555-5555-5555-555555555555"),
			OrganizationID: uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			Name:           "Departemen Akademik",
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
	}

	for _, division := range divisions {
		if err := s.db.WithContext(ctx).Create(&division).Error; err != nil {
			return err
		}
	}

	// Seed division members
	return s.seedDivisionMembers(ctx)
}

func (s *divisionSeeder) seedDivisionMembers(ctx context.Context) error {
	members := []entity.DivisionMember{
		// Sajudin as HEAD of Divisi IPTEK
		{
			DivisionID:   uuid.MustParse("d1111111-1111-1111-1111-111111111111"),
			UserID:       uuid.MustParse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
			DivisionRole: types.DivisionRoleHead,
			JoinedAt:     time.Now(),
		},
		// Zulhamdani as HEAD of Divisi Humas
		{
			DivisionID:   uuid.MustParse("d2222222-2222-2222-2222-222222222222"),
			UserID:       uuid.MustParse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
			DivisionRole: types.DivisionRoleHead,
			JoinedAt:     time.Now(),
		},
		// Gilang as STAFF of Divisi IPTEK
		{
			DivisionID:   uuid.MustParse("d1111111-1111-1111-1111-111111111111"),
			UserID:       uuid.MustParse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
			DivisionRole: types.DivisionRoleStaff,
			JoinedAt:     time.Now(),
		},
		// Admin BEM as HEAD of Departemen Sosmas
		{
			DivisionID:   uuid.MustParse("d4444444-4444-4444-4444-444444444444"),
			UserID:       uuid.MustParse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
			DivisionRole: types.DivisionRoleHead,
			JoinedAt:     time.Now(),
		},
	}

	for _, member := range members {
		if err := s.db.WithContext(ctx).Create(&member).Error; err != nil {
			return err
		}
	}

	return nil
}
