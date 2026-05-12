package organization

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/service"
)

type UserUsecase interface {
	SearchUsers(ctx context.Context, orgID uuid.UUID, query string) ([]entity.UserBasic, error)
	GetOrganizationUsers(ctx context.Context, orgID uuid.UUID) ([]entity.UserWithOrgRole, error)
	UpdateProfile(ctx context.Context, userID uuid.UUID, fullName, email string) (*entity.User, error)
	ChangePassword(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error
}

type userUsecase struct {
	userRepo repository.UserProfileRepository
	hasher   service.PasswordHasher
}

func NewUserUsecase(userRepo repository.UserProfileRepository, hasher service.PasswordHasher) UserUsecase {
	return &userUsecase{
		userRepo: userRepo,
		hasher:   hasher,
	}
}

func (u *userUsecase) SearchUsers(ctx context.Context, orgID uuid.UUID, query string) ([]entity.UserBasic, error) {
	if query == "" {
		return []entity.UserBasic{}, nil
	}

	users, err := u.userRepo.SearchUsers(ctx, orgID, query, 20)
	if err != nil {
		return nil, err
	}

	if users == nil {
		return []entity.UserBasic{}, nil
	}

	return users, nil
}

func (u *userUsecase) GetOrganizationUsers(ctx context.Context, orgID uuid.UUID) ([]entity.UserWithOrgRole, error) {
	users, err := u.userRepo.GetUsersByOrganization(ctx, orgID)
	if err != nil {
		return nil, err
	}

	if users == nil {
		return []entity.UserWithOrgRole{}, nil
	}

	return users, nil
}

// UpdateProfile updates user's profile information
func (u *userUsecase) UpdateProfile(ctx context.Context, userID uuid.UUID, fullName, email string) (*entity.User, error) {
	fullName = strings.TrimSpace(fullName)
	email = strings.TrimSpace(email)

	if fullName == "" {
		return nil, fmt.Errorf("full name cannot be empty")
	}
	if len(fullName) > 100 {
		return nil, fmt.Errorf("full name cannot exceed 100 characters")
	}
	if email == "" {
		return nil, fmt.Errorf("email cannot be empty")
	}
	if !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		return nil, fmt.Errorf("invalid email format")
	}

	exists, err := u.userRepo.CheckEmailExists(ctx, email, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to check email availability: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("email is already in use")
	}

	user, err := u.userRepo.UpdateProfile(ctx, userID, fullName, email)
	if err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}
	return user, nil
}

// ChangePassword changes user's password.
func (u *userUsecase) ChangePassword(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error {
	if len(newPassword) < 8 {
		return fmt.Errorf("new password must be at least 8 characters")
	}

	user, err := u.userRepo.GetUserWithPasswordByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	if err := u.hasher.Compare(user.PasswordHash, currentPassword); err != nil {
		if errors.Is(err, service.ErrPasswordMismatch) {
			return fmt.Errorf("current password is incorrect")
		}
		return fmt.Errorf("failed to verify current password: %w", err)
	}

	if err := u.hasher.Compare(user.PasswordHash, newPassword); err == nil {
		return fmt.Errorf("new password must be different from current password")
	}

	hashedPassword, err := u.hasher.Hash(newPassword)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	if err := u.userRepo.UpdatePassword(ctx, userID, hashedPassword); err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}
	return nil
}
