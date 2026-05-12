package usecase

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/internal/organization/repository"
)

type UserUsecase interface {
	SearchUsers(ctx context.Context, orgID uuid.UUID, query string) ([]domain.UserBasic, error)
	GetOrganizationUsers(ctx context.Context, orgID uuid.UUID) ([]domain.UserWithOrgRole, error)
	UpdateProfile(ctx context.Context, userID uuid.UUID, fullName, email string) (*domain.User, error)
	ChangePassword(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error
}

type userUsecase struct {
	userRepo repository.UserRepository
}

func NewUserUsecase(userRepo repository.UserRepository) UserUsecase {
	return &userUsecase{
		userRepo: userRepo,
	}
}

func (u *userUsecase) SearchUsers(ctx context.Context, orgID uuid.UUID, query string) ([]domain.UserBasic, error) {
	if query == "" {
		// Return empty list if no query provided
		return []domain.UserBasic{}, nil
	}

	users, err := u.userRepo.SearchUsers(ctx, orgID, query, 20)
	if err != nil {
		return nil, err
	}

	if users == nil {
		return []domain.UserBasic{}, nil
	}

	return users, nil
}

func (u *userUsecase) GetOrganizationUsers(ctx context.Context, orgID uuid.UUID) ([]domain.UserWithOrgRole, error) {
	users, err := u.userRepo.GetUsersByOrganization(ctx, orgID)
	if err != nil {
		return nil, err
	}

	if users == nil {
		return []domain.UserWithOrgRole{}, nil
	}

	return users, nil
}

// UpdateProfile updates user's profile information
func (u *userUsecase) UpdateProfile(ctx context.Context, userID uuid.UUID, fullName, email string) (*domain.User, error) {
	// Validate inputs
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

	// Basic email validation
	if !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		return nil, fmt.Errorf("invalid email format")
	}

	// Check if email is already in use by another user
	exists, err := u.userRepo.CheckEmailExists(ctx, email, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to check email availability: %w", err)
	}

	if exists {
		return nil, fmt.Errorf("email is already in use")
	}

	// Update profile
	user, err := u.userRepo.UpdateProfile(ctx, userID, fullName, email)
	if err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	return user, nil
}

// ChangePassword changes user's password
func (u *userUsecase) ChangePassword(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error {
	// Validate new password
	if len(newPassword) < 8 {
		return fmt.Errorf("new password must be at least 8 characters")
	}

	// Get user with password hash
	user, err := u.userRepo.GetUserWithPasswordByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(currentPassword)); err != nil {
		return fmt.Errorf("current password is incorrect")
	}

	// Check if new password is same as current
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(newPassword)); err == nil {
		return fmt.Errorf("new password must be different from current password")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password
	if err := u.userRepo.UpdatePassword(ctx, userID, string(hashedPassword)); err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	return nil
}
