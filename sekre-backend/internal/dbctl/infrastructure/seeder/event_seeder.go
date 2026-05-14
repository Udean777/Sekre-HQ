package seeder

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/username/sekre-backend/internal/dbctl/domain/service"
	"github.com/username/sekre-backend/internal/domain/entity"
)

// eventSeeder implements service.Seeder
type eventSeeder struct {
	db *gorm.DB
}

// NewEventSeeder creates new event seeder
func NewEventSeeder(db *gorm.DB) service.Seeder {
	return &eventSeeder{db: db}
}

func (s *eventSeeder) Name() string {
	return "Events"
}

func (s *eventSeeder) Order() int {
	return 5 // After tasks
}

func (s *eventSeeder) Seed(ctx context.Context) error {
	now := time.Now()
	
	events := []entity.Event{
		{
			ID:             uuid.MustParse("e1111111-1111-1111-1111-111111111111"),
			OrganizationID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			DivisionID:     uuid.MustParse("d1111111-1111-1111-1111-111111111111"),
			Title:          "Workshop: Introduction to Go Programming",
			Description:    "Learn the basics of Go programming language with hands-on exercises",
			StartTime:      now.AddDate(0, 0, 14), // 2 weeks from now
			EndTime:        now.AddDate(0, 0, 14).Add(3 * time.Hour),
			Location:       "Lab Komputer 1, Gedung A",
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
		{
			ID:             uuid.MustParse("e2222222-2222-2222-2222-222222222222"),
			OrganizationID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			DivisionID:     uuid.MustParse("d2222222-2222-2222-2222-222222222222"),
			Title:          "Rapat Koordinasi Bulanan",
			Description:    "Evaluasi program kerja bulan ini dan perencanaan bulan depan",
			StartTime:      now.AddDate(0, 0, 7), // 1 week from now
			EndTime:        now.AddDate(0, 0, 7).Add(2 * time.Hour),
			Location:       "Ruang Rapat HIMTI",
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
		{
			ID:             uuid.MustParse("e3333333-3333-3333-3333-333333333333"),
			OrganizationID: uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			DivisionID:     uuid.MustParse("d4444444-4444-4444-4444-444444444444"),
			Title:          "Bakti Sosial: Berbagi untuk Sesama",
			Description:    "Kegiatan bakti sosial ke panti asuhan dan panti jompo",
			StartTime:      now.AddDate(0, 0, 21), // 3 weeks from now
			EndTime:        now.AddDate(0, 0, 21).Add(5 * time.Hour),
			Location:       "Panti Asuhan Harapan Bangsa",
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
	}

	for _, event := range events {
		if err := s.db.WithContext(ctx).Create(&event).Error; err != nil {
			return err
		}
	}

	return nil
}
