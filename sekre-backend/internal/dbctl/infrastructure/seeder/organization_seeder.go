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

// organizationSeeder implements service.Seeder
type organizationSeeder struct {
	db *gorm.DB
}

// NewOrganizationSeeder creates new organization seeder
func NewOrganizationSeeder(db *gorm.DB) service.Seeder {
	return &organizationSeeder{db: db}
}

func (s *organizationSeeder) Name() string {
	return "Organizations"
}

func (s *organizationSeeder) Order() int {
	return 1 // First to seed (no dependencies)
}

func (s *organizationSeeder) Seed(ctx context.Context) error {
	orgs := []entity.Organization{
		{
			ID:               uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			Name:             "HIMTI UNPAB",
			Subdomain:        "himti",
			SubscriptionPlan: types.SubscriptionPlanFree,
			CreatedAt:        time.Now(),
			UpdatedAt:        time.Now(),
		},
		{
			ID:               uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			Name:             "BEM Universitas",
			Subdomain:        "bem",
			SubscriptionPlan: types.SubscriptionPlanLite,
			CreatedAt:        time.Now(),
			UpdatedAt:        time.Now(),
		},
	}

	for _, org := range orgs {
		if err := s.db.WithContext(ctx).Create(&org).Error; err != nil {
			return err
		}
	}

	return nil
}
