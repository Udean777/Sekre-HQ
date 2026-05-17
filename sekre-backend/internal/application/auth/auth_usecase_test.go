//go:build integration

package auth_test

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/username/sekre-backend/internal/application/auth"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/service"
	"github.com/username/sekre-backend/internal/domain/types"
	gormrepo "github.com/username/sekre-backend/internal/infrastructure/persistence/gorm/repository"
	sharedrepo "github.com/username/sekre-backend/internal/repository"
	testdb "github.com/username/sekre-backend/internal/test/db"
	"github.com/username/sekre-backend/pkg/token"
	"gorm.io/gorm"
)

// TestRegister_TransactionRollback verifies that Register flow properly rolls back
// all database changes when any step fails WITHIN the transaction (Phase 1.3 verification).
func TestRegister_TransactionRollback(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		// Setup repositories
		userRepo := gormrepo.NewUserRepository(tx)
		orgRepo := gormrepo.NewOrganizationRepository(tx)
		userOrgRepo := &failingUserOrgRepo{real: gormrepo.NewUserOrganizationRepository(tx)}
		txRunner := sharedrepo.NewTxRunner(tx)

		// Setup services
		hasher := &mockPasswordHasher{}
		tokenGen := &mockTokenGenerator{shouldFail: false}
		validator := &mockValidator{}

		// Create usecase
		uc := auth.NewAuthUsecase(
			userRepo,
			orgRepo,
			userOrgRepo, // This will fail during Create
			txRunner,
			hasher,
			tokenGen,
			validator)

		ctx := context.Background()

		// Attempt register - should fail at user-org creation
		_, err := uc.Register(ctx, &auth.RegisterRequest{
			OrganizationName: "Test Org",
			Subdomain:        "test-rollback",
			FullName:         "Test User",
			Email:            "test@rollback.com",
			Password:         "password123",
		})

		// Should get error from user-org creation
		require.Error(t, err)
		assert.Contains(t, err.Error(), "simulated failure")

		// Verify: No organization created (transaction rolled back)
		exists, err := orgRepo.CheckSubdomainExists(ctx, "test-rollback")
		require.NoError(t, err)
		assert.False(t, exists, "organization should not exist after rollback")

		// Verify: No user created (transaction rolled back)
		_, err = userRepo.GetByEmail(ctx, "test@rollback.com")
		require.Error(t, err, "user should not exist after rollback")
	})
}

// TestRegister_Success verifies happy path with transaction commit.
func TestRegister_Success(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		// Setup repositories
		userRepo := gormrepo.NewUserRepository(tx)
		orgRepo := gormrepo.NewOrganizationRepository(tx)
		userOrgRepo := gormrepo.NewUserOrganizationRepository(tx)
		txRunner := sharedrepo.NewTxRunner(tx)

		// Setup services
		hasher := &mockPasswordHasher{}
		tokenGen := &mockTokenGenerator{shouldFail: false}
		validator := &mockValidator{}

		// Create usecase
		uc := auth.NewAuthUsecase(
			userRepo,
			orgRepo,
			userOrgRepo,
			txRunner,
			hasher,
			tokenGen,
			validator)

		ctx := context.Background()

		// Register should succeed
		resp, err := uc.Register(ctx, &auth.RegisterRequest{
			OrganizationName: "Test Org Success",
			Subdomain:        "test-success",
			FullName:         "Test User",
			Email:            "test@success.com",
			Password:         "password123",
		})

		require.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, "Test Org Success", resp.Organization.Name)
		assert.Equal(t, "test@success.com", resp.User.Email)

		// Verify: Organization exists
		exists, err := orgRepo.CheckSubdomainExists(ctx, "test-success")
		require.NoError(t, err)
		assert.True(t, exists, "organization should exist after successful register")

		// Verify: User exists
		user, err := userRepo.GetByEmail(ctx, "test@success.com")
		require.NoError(t, err)
		assert.Equal(t, "Test User", user.FullName)

		// Verify: User-Organization link exists
		userOrg, err := userOrgRepo.GetByUserAndOrg(ctx, user.ID, resp.Organization.ID)
		require.NoError(t, err)
		assert.Equal(t, "OWNER", string(userOrg.Role))
	})
}

// Mock implementations for testing

type mockPasswordHasher struct{}

func (m *mockPasswordHasher) Hash(password string) (string, error) {
	return "$2a$10$mockedhash", nil
}

func (m *mockPasswordHasher) Compare(hashedPassword, plainPassword string) error {
	return nil
}

type mockTokenGenerator struct {
	shouldFail bool
}

func (m *mockTokenGenerator) Generate(userID, orgID uuid.UUID, role types.Role) (*token.TokenPair, error) {
	if m.shouldFail {
		return nil, domainerrors.Internal("mock token generation failure", nil)
	}
	return &token.TokenPair{
		AccessToken:  "mock-access-token",
		RefreshToken: "mock-refresh-token",
	}, nil
}

func (m *mockTokenGenerator) Verify(tokenString string) (*token.Claims, error) {
	return nil, nil
}

type mockValidator struct{}

func (m *mockValidator) ValidateEmail(email string) error {
	return nil
}

func (m *mockValidator) ValidatePassword(password string) error {
	return nil
}

func (m *mockValidator) ValidateSubdomain(subdomain string) error {
	return nil
}

// Ensure mocks implement interfaces
var _ service.PasswordHasher = (*mockPasswordHasher)(nil)
var _ service.TokenGenerator = (*mockTokenGenerator)(nil)
var _ service.RegistrationValidator = (*mockValidator)(nil)

// failingUserOrgRepo wraps real repository but fails on Create
type failingUserOrgRepo struct {
	real repository.UserOrganizationRepository
}

func (f *failingUserOrgRepo) Create(ctx context.Context, userOrg *entity.UserOrganization) error {
	return domainerrors.Internal("simulated failure in user-org creation", nil)
}

func (f *failingUserOrgRepo) GetByUserAndOrg(ctx context.Context, userID, orgID uuid.UUID) (*entity.UserOrganization, error) {
	return f.real.GetByUserAndOrg(ctx, userID, orgID)
}

func (f *failingUserOrgRepo) GetUserWithOrganization(ctx context.Context, userID uuid.UUID) (*entity.UserWithOrganization, error) {
	return f.real.GetUserWithOrganization(ctx, userID)
}

func (f *failingUserOrgRepo) GetUsersByOrganization(ctx context.Context, orgID uuid.UUID) ([]entity.UserWithOrgRole, error) {
	return f.real.GetUsersByOrganization(ctx, orgID)
}

func (f *failingUserOrgRepo) UpdateRole(ctx context.Context, orgID, userID uuid.UUID, role string) error {
	return f.real.UpdateRole(ctx, orgID, userID, role)
}

func (f *failingUserOrgRepo) Delete(ctx context.Context, orgID, userID uuid.UUID) error {
	return f.real.Delete(ctx, orgID, userID)
}
