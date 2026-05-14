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

// taskSeeder implements service.Seeder
type taskSeeder struct {
	db *gorm.DB
}

// NewTaskSeeder creates new task seeder
func NewTaskSeeder(db *gorm.DB) service.Seeder {
	return &taskSeeder{db: db}
}

func (s *taskSeeder) Name() string {
	return "Tasks"
}

func (s *taskSeeder) Order() int {
	return 4 // After divisions
}

func (s *taskSeeder) Seed(ctx context.Context) error {
	assigneeGilang := uuid.MustParse("dddddddd-dddd-dddd-dddd-dddddddddddd")
	assigneeSajudin := uuid.MustParse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
	dueDate := time.Now().AddDate(0, 0, 7) // 7 days from now

	tasks := []entity.Task{
		{
			ID:             uuid.MustParse("a1111111-1111-1111-1111-111111111111"),
			OrganizationID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			DivisionID:     uuid.MustParse("d1111111-1111-1111-1111-111111111111"),
			AssigneeID:     &assigneeGilang,
			Title:          "Setup Development Environment",
			Description:    "Install and configure all necessary development tools",
			Status:         types.TaskStatusInProgress,
			DueDate:        &dueDate,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
		{
			ID:             uuid.MustParse("a2222222-2222-2222-2222-222222222222"),
			OrganizationID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			DivisionID:     uuid.MustParse("d2222222-2222-2222-2222-222222222222"),
			AssigneeID:     nil, // Unassigned
			Title:          "Prepare Social Media Content",
			Description:    "Create content calendar for next month",
			Status:         types.TaskStatusTodo,
			DueDate:        &dueDate,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
		{
			ID:             uuid.MustParse("a3333333-3333-3333-3333-333333333333"),
			OrganizationID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			DivisionID:     uuid.MustParse("d1111111-1111-1111-1111-111111111111"),
			AssigneeID:     &assigneeSajudin,
			Title:          "Code Review Backend API",
			Description:    "Review and test new authentication endpoints",
			Status:         types.TaskStatusDone,
			DueDate:        nil,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
	}

	for _, task := range tasks {
		if err := s.db.WithContext(ctx).Create(&task).Error; err != nil {
			return err
		}
	}

	return nil
}
