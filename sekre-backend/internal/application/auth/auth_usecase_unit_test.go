package auth

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/service"
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
		OrganizationName: "Test Org",
		FullName:         "John Doe",
		Email:            "invalid-email",
		Password:         "SecurePass123!",
		Subdomain:        "testorg",
	}

	// Validation order: subdomain -> email -> password
	validator.EXPECT().
		ValidateSubdomain(req.Subdomain).
		Return(nil).
		Once()

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
		OrganizationName: "Test Org",
		FullName:         "John Doe",
		Email:            "john@example.com",
		Password:         "weak",
		Subdomain:        "testorg",
	}

	// Validation order: subdomain -> email -> password
	validator.EXPECT().
		ValidateSubdomain(req.Subdomain).
		Return(nil).
		Once()

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
		FullName:         "John Doe",
		Subdomain:        "taken",
		Email:            "john@example.com",
		Password:         "SecurePass123!",
	}

	ctx := context.Background()

	validator.EXPECT().ValidateSubdomain(req.Subdomain).Return(nil).Once()
	validator.EXPECT().ValidateEmail(req.Email).Return(nil).Once()
	validator.EXPECT().ValidatePassword(req.Password).Return(nil).Once()

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
		FullName:         "John Doe",
		Subdomain:        "testorg",
		Email:            "john@example.com",
		Password:         "SecurePass123!",
	}

	ctx := context.Background()

	validator.EXPECT().ValidateSubdomain(req.Subdomain).Return(nil).Once()
	validator.EXPECT().ValidateEmail(req.Email).Return(nil).Once()
	validator.EXPECT().ValidatePassword(req.Password).Return(nil).Once()

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

	uc := NewAuthUsecase(userRepo, orgRepo, userOrgRepo, nil, hasher, tokenGen, nil, nil)

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

	// Setup mocks. The hasher is required because Login now burns a dummy
	// bcrypt comparison on the user-not-found path to equalize timing with
	// the password-mismatch path.
	userRepo := mocks.NewUserRepository(t)
	hasher := mocks.NewPasswordHasher(t)
	uc := NewAuthUsecase(userRepo, nil, nil, nil, hasher, nil, nil, nil)

	req := &LoginRequest{
		Email:    "notfound@example.com",
		Password: "password",
	}

	ctx := context.Background()

	userRepo.EXPECT().
		GetByEmail(ctx, req.Email).
		Return(nil, domainerrors.ErrUserNotFound).
		Once()

	// The dummy comparison runs against a fixed hash; we don't constrain
	// the hash value here because it is an internal implementation detail.
	hasher.EXPECT().
		Compare(mock.AnythingOfType("string"), req.Password).
		Return(service.ErrPasswordMismatch).
		Once()

	// Execute
	result, err := uc.Login(ctx, req)

	// Assert: the user-not-found case must be flattened into a generic
	// invalid-credentials error to prevent email enumeration.
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.ErrorIs(t, err, domainerrors.ErrInvalidCredentials)
	assert.NotErrorIs(t, err, domainerrors.ErrUserNotFound)
}

// TestAuthUsecase_Login_RepoNotFoundDomainError verifies that a generic
// CodeNotFound DomainError from the repository (e.g. NotFound("user", id))
// is also flattened into the credential error and triggers the dummy
// comparison, not just the ErrUserNotFound sentinel.
func TestAuthUsecase_Login_RepoNotFoundDomainError(t *testing.T) {
	t.Parallel()

	userRepo := mocks.NewUserRepository(t)
	hasher := mocks.NewPasswordHasher(t)
	uc := NewAuthUsecase(userRepo, nil, nil, nil, hasher, nil, nil, nil)

	req := &LoginRequest{
		Email:    "missing@example.com",
		Password: "anything",
	}

	ctx := context.Background()

	userRepo.EXPECT().
		GetByEmail(ctx, req.Email).
		Return(nil, domainerrors.NotFound("user", req.Email)).
		Once()

	hasher.EXPECT().
		Compare(mock.AnythingOfType("string"), req.Password).
		Return(service.ErrPasswordMismatch).
		Once()

	result, err := uc.Login(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.ErrorIs(t, err, domainerrors.ErrInvalidCredentials)
}

// TestAuthUsecase_Login_InvalidCredentialsFromRepo covers the current
// repository contract where GetByEmail already returns
// ErrInvalidCredentials when the row is missing. The use case must still
// invoke the dummy comparison so user-not-found and password-mismatch
// take roughly the same wall time.
func TestAuthUsecase_Login_InvalidCredentialsFromRepo(t *testing.T) {
	t.Parallel()

	userRepo := mocks.NewUserRepository(t)
	hasher := mocks.NewPasswordHasher(t)
	uc := NewAuthUsecase(userRepo, nil, nil, nil, hasher, nil, nil, nil)

	req := &LoginRequest{
		Email:    "missing@example.com",
		Password: "anything",
	}

	ctx := context.Background()

	userRepo.EXPECT().
		GetByEmail(ctx, req.Email).
		Return(nil, domainerrors.ErrInvalidCredentials).
		Once()

	hasher.EXPECT().
		Compare(mock.AnythingOfType("string"), req.Password).
		Return(service.ErrPasswordMismatch).
		Once()

	result, err := uc.Login(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.ErrorIs(t, err, domainerrors.ErrInvalidCredentials)
}

// TestAuthUsecase_Login_RepoInternalErrorPropagates ensures non-credential
// failures (DB outage, etc.) are NOT masked as ErrInvalidCredentials.
// Operators must still see real backend errors.
func TestAuthUsecase_Login_RepoInternalErrorPropagates(t *testing.T) {
	t.Parallel()

	userRepo := mocks.NewUserRepository(t)
	uc := NewAuthUsecase(userRepo, nil, nil, nil, nil, nil, nil, nil)

	req := &LoginRequest{
		Email:    "user@example.com",
		Password: "anything",
	}

	ctx := context.Background()

	internalErr := domainerrors.Internal("get user by email", errors.New("connection refused"))

	userRepo.EXPECT().
		GetByEmail(ctx, req.Email).
		Return(nil, internalErr).
		Once()

	result, err := uc.Login(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.NotErrorIs(t, err, domainerrors.ErrInvalidCredentials)
	assert.True(t, domainerrors.Is(err, domainerrors.CodeInternal))
}

func TestAuthUsecase_Login_InvalidPassword(t *testing.T) {
	t.Parallel()

	// Setup mocks
	userRepo := mocks.NewUserRepository(t)
	hasher := mocks.NewPasswordHasher(t)
	uc := NewAuthUsecase(userRepo, nil, nil, nil, hasher, nil, nil, nil)

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
		Return(service.ErrPasswordMismatch).
		Once()

	// Execute
	result, err := uc.Login(ctx, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.ErrorIs(t, err, domainerrors.ErrInvalidCredentials)
}

// TestAuthUsecase_Login_NormalizesEmail verifies that Login canonicalizes the
// email by trimming surrounding whitespace and lowercasing it before any
// downstream lookup. This keeps audit logs, repository queries, and password
// comparison anchored to the same value regardless of how the client typed it.
func TestAuthUsecase_Login_NormalizesEmail(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		rawEmail string
	}{
		{name: "uppercase", rawEmail: "JOHN@EXAMPLE.COM"},
		{name: "mixed case", rawEmail: "John@Example.Com"},
		{name: "leading whitespace", rawEmail: "  john@example.com"},
		{name: "trailing whitespace", rawEmail: "john@example.com  "},
		{name: "leading and trailing whitespace", rawEmail: "  john@example.com  "},
		{name: "uppercase with whitespace", rawEmail: "  JOHN@EXAMPLE.COM  "},
	}

	const canonicalEmail = "john@example.com"

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			userRepo := mocks.NewUserRepository(t)
			userOrgRepo := mocks.NewUserOrganizationRepository(t)
			hasher := mocks.NewPasswordHasher(t)
			tokenGen := mocks.NewTokenGenerator(t)

			uc := NewAuthUsecase(userRepo, nil, userOrgRepo, nil, hasher, tokenGen, nil, nil)

			req := &LoginRequest{
				Email:    tt.rawEmail,
				Password: "SecurePass123!",
			}

			ctx := context.Background()
			userID := uuid.New()
			orgID := uuid.New()

			user := &entity.User{
				ID:           userID,
				Email:        canonicalEmail,
				PasswordHash: "hashed_password",
			}

			org := &entity.Organization{
				ID:   orgID,
				Name: "Test Org",
			}

			// Repository must be queried with the canonical email, never the
			// raw input.
			userRepo.EXPECT().
				GetByEmail(ctx, canonicalEmail).
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

			result, err := uc.Login(ctx, req)

			assert.NoError(t, err)
			assert.NotNil(t, result)
			// req.Email must be the canonical form after Login returns.
			assert.Equal(t, canonicalEmail, req.Email)
		})
	}
}

// TestAuthUsecase_Login_RejectsWhitespaceOnlyEmail ensures that an email
// containing only whitespace collapses to empty after normalization and
// surfaces an invalid-input error without ever hitting the repository.
func TestAuthUsecase_Login_RejectsWhitespaceOnlyEmail(t *testing.T) {
	t.Parallel()

	uc := NewAuthUsecase(nil, nil, nil, nil, nil, nil, nil, nil)

	req := &LoginRequest{
		Email:    "   ",
		Password: "SecurePass123!",
	}

	result, err := uc.Login(context.Background(), req)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.ErrorIs(t, err, domainerrors.ErrInvalidInput)
}

func TestAuthUsecase_GetMe_Success(t *testing.T) {
	t.Parallel()

	// Setup mocks
	userOrgRepo := mocks.NewUserOrganizationRepository(t)
	uc := NewAuthUsecase(nil, nil, userOrgRepo, nil, nil, nil, nil, nil)

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
	uc := NewAuthUsecase(nil, nil, userOrgRepo, nil, nil, nil, nil, nil)

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
