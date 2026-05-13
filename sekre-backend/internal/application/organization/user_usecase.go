package organization

import (
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"context"
	"errors"
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
		return nil, domainerrors.InvalidInput("full name", "cannot be empty")
	}
	if len(fullName) > 100 {
		return nil, domainerrors.InvalidInput("full name", "cannot exceed 100 characters")
	}
	if email == "" {
		return nil, domainerrors.InvalidInput("email", "cannot be empty")
	}
	if !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		return nil, domainerrors.InvalidInput("email format", "invalid format")
	}

	exists, err := u.userRepo.CheckEmailExists(ctx, email, userID)
	if err != nil {
		return nil, domainerrors.Internal("check email availability", err)
	}
	if exists {
		return nil, domainerrors.Conflict("email", "unique_email")
	}

	user, err := u.userRepo.UpdateProfile(ctx, userID, fullName, email)
	if err != nil {
		return nil, domainerrors.Internal("update profile", err)
	}
	return user, nil
}

// ChangePassword changes user's password.
func (u *userUsecase) ChangePassword(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error {
	if len(newPassword) < 8 {
		return domainerrors.InvalidInput("new password", "must be at least 8 characters")
	}

	user, err := u.userRepo.GetUserWithPasswordByID(ctx, userID)
	if err != nil {
		return domainerrors.Internal("get user", err)
	}

	if err := u.hasher.Compare(user.PasswordHash, currentPassword); err != nil {
		if errors.Is(err, service.ErrPasswordMismatch) {
			return domainerrors.Unauthorized("current password is incorrect")
		}
		return domainerrors.Internal("verify current password", err)
	}

	if err := u.hasher.Compare(user.PasswordHash, newPassword); err == nil {
		return domainerrors.InvalidInput("new password", "must be different from current password")
	}

	hashedPassword, err := u.hasher.Hash(newPassword)
	if err != nil {
		return domainerrors.Internal("hash password", err)
	}

	if err := u.userRepo.UpdatePassword(ctx, userID, hashedPassword); err != nil {
		return domainerrors.Internal("update password", err)
	}
	return nil
}
