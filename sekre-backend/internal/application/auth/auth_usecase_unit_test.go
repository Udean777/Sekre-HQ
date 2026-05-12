package auth

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/test/mocks"
	"github.com/username/sekre-backend/pkg/token"
)

func TestAuthUsecase_Register_Success(t *testing.T) {
	t.Parallel()

	// Setup mocks
	userRepo := mocks.NewUserRepository(t)
	orgRepo := mocks.NewOrganizationRepository(t)
	userOrgRepo := mocks.NewUserOrganizationRepository(t)
	txRunner := mocks.NewTxRunner(t)
	hasher := mocks.NewPasswordHasher(t)
	tokenGen := mocks.NewTokenGenerator(t)
	validator := mocks.NewRegistrationValidator(t)

	// Create usecase
	uc := NewAuthUsecase(userRepo, orgRepo, userOrgRepo, txRunner, hasher, tokenGen, validator)

	// Test data
	req := &RegisterRequest{
		OrganizationName: "Test Org",
		Subdomain:        "testorg",
		FullName:         "John Doe",
		Email:            "john@example.com",
		Password:         "SecurePass123!",
	}

	ctx := context.Background()
	hashedPassword := "hashed_password"
	orgID := uuid.New()
	userID := uuid.New()

	// Setup expectations
	validator.EXPECT().
		ValidateEmail(req.Email).
		Return(nil).
		Once()

	validator.EXPECT().
		ValidatePassword(req.Password).
		Return(nil).
		Once()

	validator.EXPECT().
		ValidateSubdomain(req.Subdomain).
		Return(nil).
		Once()

	orgRepo.EXPECT().
		CheckSubdomainExists(ctx, "testorg").
		Return(false, nil).
		Once()

	hasher.EXPECT().
		Hash(req.Password).
		Return(hashedPassword, nil).
		Once()

	txRunner.EXPECT().
		WithTransaction(ctx, mock.AnythingOfType("func(context.Context) error")).
		Run(func(ctx context.Context, fn func(context.Context) error) {
			// Execute the transaction function
			err := fn(ctx)
			assert.NoError(t, err)
		}).
		Return(nil).
		Once()

	// Inside transaction expectations
	orgRepo.EXPECT().
		Create(mock.Anything, mock.MatchedBy(func(org *entity.Organization) bool {
			return org.Name == req.OrganizationName &&
				org.Subdomain == "testorg" &&
				org.SubscriptionPlan == types.SubscriptionPlanFree
		})).
		Run(func(ctx context.Context, org *entity.Organization) {
			org.ID = orgID
		}).
		Return(nil).
		Once()

	userRepo.EXPECT().
		Create(mock.Anything, mock.MatchedBy(func(user *entity.User) bool {
			return user.Email == req.Email &&
				user.PasswordHash == hashedPassword
		})).
		Run(func(ctx context.Context, user *entity.User) {
			user.ID = userID
		}).
		Return(nil).
		Once()

	userOrgRepo.EXPECT().
		Create(mock.Anything, mock.MatchedBy(func(uo *entity.UserOrganization) bool {
			return uo.UserID == userID &&
				uo.OrganizationID == orgID &&
				uo.Role == types.RoleOwner
		})).
		Return(nil).
		Once()

	tokenGen.EXPECT().
		Generate(userID, orgID, types.RoleOwner).
		Return(&token.TokenPair{
			AccessToken:  "access_token",
			RefreshToken: "refresh_token",
		}, nil).
		Once()

	// Execute
	result, err := uc.Register(ctx, req)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, "access_token", result.Tokens.AccessToken)
	assert.Equal(t, "refresh_token", result.Tokens.RefreshToken)
	assert.Equal(t, types.RoleOwner, result.Role)
}

func TestAuthUsecase_Register_InvalidEmail(t *testing.T) {
	t.Parallel()

	// Setup mocks
	validator := mocks.NewRegistrationValidator(t)
	uc := NewAuthUsecase(nil, nil, nil, nil, nil, nil, validator)

	req := &RegisterRequest{
		Email:    "invalid-email",
		Password: "SecurePass123!",
		Subdomain: "testorg",
	}

	validator.EXPECT().
		ValidateEmail(req.Email).
		Return(domainerrors.InvalidInput("email", "invalid format")).
		Once()

	// Execute
	result, err := uc.Register(context.Background(), req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.True(t, domainerrors.Is(err, domainerrors.CodeInvalidInput))
}

func TestAuthUsecase_Register_InvalidPassword(t *testing.T) {
	t.Parallel()

	// Setup mocks
	validator := mocks.NewRegistrationValidator(t)
	uc := NewAuthUsecase(nil, nil, nil, nil, nil, nil, validator)

	req := &RegisterRequest{
		Email:    "john@example.com",
		Password: "weak",
		Subdomain: "testorg",
	}

	validator.EXPECT().
		ValidateEmail(req.Email).
		Return(nil).
		Once()

	validator.EXPECT().
		ValidatePassword(req.Password).
		Return(domainerrors.InvalidInput("password", "too short")).
		Once()

	// Execute
	result, err := uc.Register(context.Background(), req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.True(t, domainerrors.Is(err, domainerrors.CodeInvalidInput))
}

func TestAuthUsecase_Register_SubdomainTaken(t *testing.T) {
	t.Parallel()

	// Setup mocks
	orgRepo := mocks.NewOrganizationRepository(t)
	validator := mocks.NewRegistrationValidator(t)
	uc := NewAuthUsecase(nil, orgRepo, nil, nil, nil, nil, validator)

	req := &RegisterRequest{
		OrganizationName: "Test Org",
		Subdomain:        "taken",
		Email:            "john@example.com",
		Password:         "SecurePass123!",
	}

	ctx := context.Background()

	validator.EXPECT().ValidateEmail(req.Email).Return(nil).Once()
	validator.EXPECT().ValidatePassword(req.Password).Return(nil).Once()
	validator.EXPECT().ValidateSubdomain(req.Subdomain).Return(nil).Once()

	orgRepo.EXPECT().
		CheckSubdomainExists(ctx, "taken").
		Return(true, nil).
		Once()

	// Execute
	result, err := uc.Register(ctx, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.ErrorIs(t, err, domainerrors.ErrSubdomainTaken)
}

func TestAuthUsecase_Register_HashPasswordError(t *testing.T) {
	t.Parallel()

	// Setup mocks
	orgRepo := mocks.NewOrganizationRepository(t)
	hasher := mocks.NewPasswordHasher(t)
	validator := mocks.NewRegistrationValidator(t)
	uc := NewAuthUsecase(nil, orgRepo, nil, nil, hasher, nil, validator)

	req := &RegisterRequest{
		OrganizationName: "Test Org",
		Subdomain:        "testorg",
		Email:            "john@example.com",
		Password:         "SecurePass123!",
	}

	ctx := context.Background()

	validator.EXPECT().ValidateEmail(req.Email).Return(nil).Once()
	validator.EXPECT().ValidatePassword(req.Password).Return(nil).Once()
	validator.EXPECT().ValidateSubdomain(req.Subdomain).Return(nil).Once()

	orgRepo.EXPECT().
		CheckSubdomainExists(ctx, "testorg").
		Return(false, nil).
		Once()

	hasher.EXPECT().
		Hash(req.Password).
		Return("", errors.New("hash error")).
		Once()

	// Execute
	result, err := uc.Register(ctx, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.True(t, domainerrors.Is(err, domainerrors.CodeInternal))
}

func TestAuthUsecase_Login_Success(t *testing.T) {
	t.Parallel()

	// Setup mocks
	userRepo := mocks.NewUserRepository(t)
	orgRepo := mocks.NewOrganizationRepository(t)
	userOrgRepo := mocks.NewUserOrganizationRepository(t)
	hasher := mocks.NewPasswordHasher(t)
	tokenGen := mocks.NewTokenGenerator(t)

	uc := NewAuthUsecase(userRepo, orgRepo, userOrgRepo, nil, hasher, tokenGen, nil)

	// Test data
	req := &LoginRequest{
		Email:    "john@example.com",
		Password: "SecurePass123!",
	}

	ctx := context.Background()
	userID := uuid.New()
	orgID := uuid.New()

	user := &entity.User{
		ID:           userID,
		Email:        req.Email,
		PasswordHash: "hashed_password",
	}

	org := &entity.Organization{
		ID:   orgID,
		Name: "Test Org",
	}

	// Setup expectations
	userRepo.EXPECT().
		GetByEmail(ctx, req.Email).
		Return(user, nil).
		Once()

	hasher.EXPECT().
		Compare(user.PasswordHash, req.Password).
		Return(nil).
		Once()

	userOrgRepo.EXPECT().
		GetUserWithOrganization(ctx, userID).
		Return(&entity.UserWithOrganization{
			User:         *user,
			Organization: *org,
			Role:         types.RoleOwner,
		}, nil).
		Once()

	tokenGen.EXPECT().
		Generate(userID, orgID, types.RoleOwner).
		Return(&token.TokenPair{
			AccessToken:  "access_token",
			RefreshToken: "refresh_token",
		}, nil).
		Once()

	// Execute
	result, err := uc.Login(ctx, req)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, userID, result.User.ID)
	assert.Equal(t, orgID, result.Organization.ID)
	assert.Equal(t, types.RoleOwner, result.Role)
	assert.Equal(t, "access_token", result.Tokens.AccessToken)
}

func TestAuthUsecase_Login_UserNotFound(t *testing.T) {
	t.Parallel()

	// Setup mocks
	userRepo := mocks.NewUserRepository(t)
	uc := NewAuthUsecase(userRepo, nil, nil, nil, nil, nil, nil)

	req := &LoginRequest{
		Email:    "notfound@example.com",
		Password: "password",
	}

	ctx := context.Background()

	userRepo.EXPECT().
		GetByEmail(ctx, req.Email).
		Return(nil, domainerrors.ErrUserNotFound).
		Once()

	// Execute
	result, err := uc.Login(ctx, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.ErrorIs(t, err, domainerrors.ErrInvalidCredentials)
}

func TestAuthUsecase_Login_InvalidPassword(t *testing.T) {
	t.Parallel()

	// Setup mocks
	userRepo := mocks.NewUserRepository(t)
	hasher := mocks.NewPasswordHasher(t)
	uc := NewAuthUsecase(userRepo, nil, nil, nil, hasher, nil, nil)

	req := &LoginRequest{
		Email:    "john@example.com",
		Password: "wrongpassword",
	}

	ctx := context.Background()
	userID := uuid.New()

	user := &entity.User{
		ID:           userID,
		Email:        req.Email,
		PasswordHash: "hashed_password",
	}

	userRepo.EXPECT().
		GetByEmail(ctx, req.Email).
		Return(user, nil).
		Once()

	hasher.EXPECT().
		Compare(user.PasswordHash, req.Password).
		Return(errors.New("password mismatch")).
		Once()

	// Execute
	result, err := uc.Login(ctx, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.ErrorIs(t, err, domainerrors.ErrInvalidCredentials)
}

func TestAuthUsecase_GetMe_Success(t *testing.T) {
	t.Parallel()

	// Setup mocks
	userOrgRepo := mocks.NewUserOrganizationRepository(t)
	uc := NewAuthUsecase(nil, nil, userOrgRepo, nil, nil, nil, nil)

	ctx := context.Background()
	userID := uuid.New()

	expected := &entity.UserWithOrganization{
		User: entity.User{
			ID:    userID,
			Email: "john@example.com",
		},
		Organization: entity.Organization{
			ID:   uuid.New(),
			Name: "Test Org",
		},
		Role: types.RoleOwner,
	}

	userOrgRepo.EXPECT().
		GetUserWithOrganization(ctx, userID).
		Return(expected, nil).
		Once()

	// Execute
	result, err := uc.GetMe(ctx, userID)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, userID, result.User.ID)
	assert.Equal(t, types.RoleOwner, result.Role)
}

func TestAuthUsecase_GetMe_UserNotFound(t *testing.T) {
	t.Parallel()

	// Setup mocks
	userOrgRepo := mocks.NewUserOrganizationRepository(t)
	uc := NewAuthUsecase(nil, nil, userOrgRepo, nil, nil, nil, nil)

	ctx := context.Background()
	userID := uuid.New()

	userOrgRepo.EXPECT().
		GetUserWithOrganization(ctx, userID).
		Return(nil, domainerrors.ErrUserNotFound).
		Once()

	// Execute
	result, err := uc.GetMe(ctx, userID)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.ErrorIs(t, err, domainerrors.ErrUserNotFound)
}
