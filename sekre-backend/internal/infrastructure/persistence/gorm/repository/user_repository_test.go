//go:build integration

package repository_test

import (
	"context"
	"fmt"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
	gormrepo "github.com/username/sekre-backend/internal/infrastructure/persistence/gorm/repository"
	testdb "github.com/username/sekre-backend/internal/test/db"
	"github.com/username/sekre-backend/internal/test/fixtures"
	"gorm.io/gorm"
)

func TestUserRepository_Create(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewUserRepository(tx)
		ctx := context.Background()

		user := &entity.User{
			ID:           uuid.New(),
			Email:        "test@example.com",
			PasswordHash: "hashed_password",
			FullName:     "Test User",
		}

		err := repo.Create(ctx, user)
		require.NoError(t, err)

		// Verify created
		found, err := repo.GetByEmail(ctx, user.Email)
		require.NoError(t, err)
		assert.Equal(t, user.ID, found.ID)
		assert.Equal(t, user.Email, found.Email)
		assert.Equal(t, user.FullName, found.FullName)
	})
}

func TestUserRepository_GetByEmail_NotFound(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewUserRepository(tx)
		ctx := context.Background()

		_, err := repo.GetByEmail(ctx, "nonexistent@example.com")
		assert.Error(t, err)
	})
}

func TestUserRepository_GetByID(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewUserRepository(tx)
		ctx := context.Background()

		// Create org first
		orgModel := fixtures.NewOrganization().Build()
		require.NoError(t, tx.Create(&orgModel).Error)

		// Create user
		userModel := fixtures.NewUser().WithEmail("getbyid@test.com").Build()
		require.NoError(t, tx.Create(&userModel).Error)

		// Create user-org relationship
		userOrgModel := fixtures.NewUserOrganization().
			WithUserID(userModel.ID).
			WithOrganizationID(orgModel.ID).
			Build()
		require.NoError(t, tx.Create(&userOrgModel).Error)

		// Test GetByID
		found, err := repo.GetByID(ctx, orgModel.ID, userModel.ID)
		require.NoError(t, err)
		assert.Equal(t, userModel.ID, found.ID)
		assert.Equal(t, userModel.Email, found.Email)
	})
}

func TestUserRepository_UpdatePassword(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewUserRepository(tx)
		ctx := context.Background()

		// Create user
		userModel := fixtures.NewUser().Build()
		require.NoError(t, tx.Create(&userModel).Error)

		// Update password
		newHash := "new_hashed_password"
		err := repo.UpdatePassword(ctx, userModel.ID, newHash)
		require.NoError(t, err)

		// Verify updated
		found, err := repo.GetByEmail(ctx, userModel.Email)
		require.NoError(t, err)
		assert.Equal(t, newHash, found.PasswordHash)
	})
}

func TestUserRepository_List(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewUserRepository(tx)
		ctx := context.Background()

		// Create org
		orgModel := fixtures.NewOrganization().Build()
		require.NoError(t, tx.Create(&orgModel).Error)

		// Create 3 users
		for i := 0; i < 3; i++ {
			userModel := fixtures.NewUser().
				WithEmail(fmt.Sprintf("user%d@test.com", i)).
				Build()
			require.NoError(t, tx.Create(&userModel).Error)

			// Link to org
			userOrgModel := fixtures.NewUserOrganization().
				WithUserID(userModel.ID).
				WithOrganizationID(orgModel.ID).
				Build()
			require.NoError(t, tx.Create(&userOrgModel).Error)
		}

		// List users
		users, err := repo.List(ctx, orgModel.ID)
		require.NoError(t, err)
		assert.Len(t, users, 3)
	})
}

func TestUserOrganizationRepository_GetUserWithOrganization(t *testing.T) {
	testdb.RunInTx(t, func(tx *gorm.DB) {
		repo := gormrepo.NewUserOrganizationRepository(tx)
		ctx := context.Background()

		// Create org
		orgModel := fixtures.NewOrganization().WithName("Test Org").Build()
		require.NoError(t, tx.Create(&orgModel).Error)

		// Create user
		userModel := fixtures.NewUser().
			WithEmail("user@test.com").
			WithFullName("Test User").
			Build()
		require.NoError(t, tx.Create(&userModel).Error)

		// Create relationship
		userOrgModel := fixtures.NewUserOrganization().
			WithUserID(userModel.ID).
			WithOrganizationID(orgModel.ID).
			WithRole(types.RoleOwner).
			Build()
		require.NoError(t, tx.Create(&userOrgModel).Error)

		// Test GetUserWithOrganization
		result, err := repo.GetUserWithOrganization(ctx, userModel.ID)
		require.NoError(t, err)
		assert.Equal(t, userModel.ID, result.User.ID)
		assert.Equal(t, "Test User", result.User.FullName)
		assert.Equal(t, orgModel.ID, result.Organization.ID)
		assert.Equal(t, "Test Org", result.Organization.Name)
		assert.Equal(t, types.RoleOwner, result.Role)
	})
}
