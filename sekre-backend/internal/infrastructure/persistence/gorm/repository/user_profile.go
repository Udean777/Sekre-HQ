package repository

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/infrastructure/persistence/gorm/mapper"
	"github.com/username/sekre-backend/internal/models"
	"gorm.io/gorm"
)

// userProfileRepository handles user profile management (search, update, password).
// Kept separate from UserRepository so the auth flow interface stays narrow.
type userProfileRepository struct {
	db *gorm.DB
}

func NewUserProfileRepository(db *gorm.DB) repository.UserProfileRepository {
	return &userProfileRepository{db: db}
}

func (r *userProfileRepository) SearchUsers(ctx context.Context, orgID uuid.UUID, query string, limit int) ([]entity.UserBasic, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	searchPattern := "%" + strings.TrimSpace(query) + "%"

	var results []struct {
		ID       uuid.UUID
		Email    string
		FullName string
	}
	err := dbFor(ctx, r.db).
		Table("users u").
		Select("DISTINCT u.id, u.email, u.full_name").
		Joins("INNER JOIN user_organizations uo ON u.id = uo.user_id").
		Where("uo.organization_id = ?", orgID).
		Where("LOWER(u.full_name) LIKE LOWER(?) OR LOWER(u.email) LIKE LOWER(?)", searchPattern, searchPattern).
		Order("u.full_name").
		Limit(limit).
		Find(&results).Error
	if err != nil {
		return nil, domainerrors.Internal("search users", err)
	}

	users := make([]entity.UserBasic, len(results))
	for i, row := range results {
		users[i] = entity.UserBasic{
			ID:       row.ID,
			Email:    row.Email,
			FullName: row.FullName,
		}
	}
	return users, nil
}

func (r *userProfileRepository) GetUsersByOrganization(ctx context.Context, orgID uuid.UUID) ([]entity.UserWithOrgRole, error) {
	var results []struct {
		ID       uuid.UUID
		Email    string
		FullName string
		Role     types.Role
	}
	err := dbFor(ctx, r.db).
		Table("users u").
		Select("u.id, u.email, u.full_name, uo.role").
		Joins("INNER JOIN user_organizations uo ON u.id = uo.user_id").
		Where("uo.organization_id = ?", orgID).
		Order("u.full_name").
		Find(&results).Error
	if err != nil {
		return nil, domainerrors.Internal("get users", err)
	}

	users := make([]entity.UserWithOrgRole, len(results))
	for i, row := range results {
		users[i] = entity.UserWithOrgRole{
			ID:       row.ID,
			Email:    row.Email,
			FullName: row.FullName,
			Role:     row.Role,
		}
	}
	return users, nil
}

func (r *userProfileRepository) GetUsersByOrganizationPaginated(ctx context.Context, orgID uuid.UUID, pagination types.PaginationParams) ([]entity.UserWithOrgRole, int, error) {
	// Get total count
	var totalCount int64
	err := dbFor(ctx, r.db).
		Table("users u").
		Joins("INNER JOIN user_organizations uo ON u.id = uo.user_id").
		Where("uo.organization_id = ?", orgID).
		Count(&totalCount).Error
	if err != nil {
		return nil, 0, domainerrors.Internal("count users", err)
	}

	// Get paginated results
	var results []struct {
		ID       uuid.UUID
		Email    string
		FullName string
		Role     types.Role
	}
	err = dbFor(ctx, r.db).
		Table("users u").
		Select("u.id, u.email, u.full_name, uo.role").
		Joins("INNER JOIN user_organizations uo ON u.id = uo.user_id").
		Where("uo.organization_id = ?", orgID).
		Order("u.full_name").
		Limit(pagination.Limit).
		Offset(pagination.Offset).
		Find(&results).Error
	if err != nil {
		return nil, 0, domainerrors.Internal("get users", err)
	}

	users := make([]entity.UserWithOrgRole, len(results))
	for i, row := range results {
		users[i] = entity.UserWithOrgRole{
			ID:       row.ID,
			Email:    row.Email,
			FullName: row.FullName,
			Role:     row.Role,
		}
	}
	return users, int(totalCount), nil
}

func (r *userProfileRepository) GetUserByID(ctx context.Context, userID uuid.UUID) (*entity.UserBasic, error) {
	var user models.User
	err := dbFor(ctx, r.db).
		Select("id, email, full_name").
		Where("id = ?", userID).
		First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domainerrors.ErrUserNotFound
		}
		return nil, domainerrors.Internal("get user", err)
	}
	return &entity.UserBasic{
		ID:       user.ID,
		Email:    user.Email,
		FullName: user.FullName,
	}, nil
}

func (r *userProfileRepository) UpdateProfile(ctx context.Context, userID uuid.UUID, fullName, email string) (*entity.User, error) {
	err := dbFor(ctx, r.db).
		Model(&models.User{}).
		Where("id = ?", userID).
		Updates(map[string]interface{}{
			"full_name": fullName,
			"email":     email,
		}).Error
	if err != nil {
		return nil, domainerrors.Internal("update profile", err)
	}

	var user models.User
	if err := dbFor(ctx, r.db).Where("id = ?", userID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domainerrors.ErrUserNotFound
		}
		return nil, domainerrors.Internal("get updated user", err)
	}
	return mapper.UserToEntity(&user), nil
}

func (r *userProfileRepository) GetUserWithPasswordByID(ctx context.Context, userID uuid.UUID) (*entity.User, error) {
	var user models.User
	err := dbFor(ctx, r.db).Where("id = ?", userID).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domainerrors.ErrUserNotFound
		}
		return nil, domainerrors.Internal("get user", err)
	}
	return mapper.UserToEntity(&user), nil
}

func (r *userProfileRepository) UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error {
	result := dbFor(ctx, r.db).
		Model(&models.User{}).
		Where("id = ?", userID).
		Updates(map[string]interface{}{
			"password_hash":       passwordHash,
			"must_reset_password": false,
		})
	if result.Error != nil {
		return domainerrors.Internal("update password", result.Error)
	}
	if result.RowsAffected == 0 {
		return domainerrors.ErrUserNotFound
	}
	return nil
}

func (r *userProfileRepository) CheckEmailExists(ctx context.Context, email string, excludeUserID uuid.UUID) (bool, error) {
	var count int64
	err := dbFor(ctx, r.db).
		Model(&models.User{}).
		Where("LOWER(email) = LOWER(?) AND id != ?", email, excludeUserID).
		Count(&count).Error
	if err != nil {
		return false, domainerrors.Internal("check email existence", err)
	}
	return count > 0, nil
}
