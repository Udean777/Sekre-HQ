package organization

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/test/mocks"
)

func TestOrganizationUsecase_UpdateOrganization_Success(t *testing.T) {
	t.Parallel()

	// Setup
	orgRepo := mocks.NewOrganizationRepository(t)
	uc := NewOrganizationUsecase(orgRepo)

	ctx := context.Background()
	orgID := uuid.New()
	userID := uuid.New()
	newName := "Updated Org Name"

	// Expectations
	orgRepo.EXPECT().
		GetMemberRole(ctx, orgID, userID).
		Return(types.RoleOwner, nil).
		Once()

	orgRepo.EXPECT().
		Update(ctx, orgID, newName).
		Return(&entity.Organization{
			ID:   orgID,
			Name: newName,
		}, nil).
		Once()

	// Execute
	result, err := uc.UpdateOrganization(ctx, orgID, userID, newName)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, newName, result.Name)
}

func TestOrganizationUsecase_UpdateOrganization_NotAuthorized(t *testing.T) {
	t.Parallel()

	// Setup
	orgRepo := mocks.NewOrganizationRepository(t)
	uc := NewOrganizationUsecase(orgRepo)

	ctx := context.Background()
	orgID := uuid.New()
	userID := uuid.New()

	// Member role cannot manage organization
	orgRepo.EXPECT().
		GetMemberRole(ctx, orgID, userID).
		Return(types.RoleMember, nil).
		Once()

	// Execute
	result, err := uc.UpdateOrganization(ctx, orgID, userID, "New Name")

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
}

func TestOrganizationUsecase_UpdateOrganization_EmptyName(t *testing.T) {
	t.Parallel()

	// Setup
	orgRepo := mocks.NewOrganizationRepository(t)
	uc := NewOrganizationUsecase(orgRepo)

	ctx := context.Background()
	orgID := uuid.New()
	userID := uuid.New()

	orgRepo.EXPECT().
		GetMemberRole(ctx, orgID, userID).
		Return(types.RoleOwner, nil).
		Once()

	// Execute
	result, err := uc.UpdateOrganization(ctx, orgID, userID, "   ")

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.True(t, domainerrors.Is(err, domainerrors.CodeInvalidInput))
}

func TestOrganizationUsecase_UpdateOrganization_NameTooLong(t *testing.T) {
	t.Parallel()

	// Setup
	orgRepo := mocks.NewOrganizationRepository(t)
	uc := NewOrganizationUsecase(orgRepo)

	ctx := context.Background()
	orgID := uuid.New()
	userID := uuid.New()

	// Name with 101 characters
	longName := string(make([]byte, 101))
	for i := range longName {
		longName = longName[:i] + "a"
	}

	orgRepo.EXPECT().
		GetMemberRole(ctx, orgID, userID).
		Return(types.RoleOwner, nil).
		Once()

	// Execute
	result, err := uc.UpdateOrganization(ctx, orgID, userID, longName)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.True(t, domainerrors.Is(err, domainerrors.CodeInvalidInput))
}

func TestOrganizationUsecase_DeleteOrganization_Success(t *testing.T) {
	t.Parallel()

	// Setup
	orgRepo := mocks.NewOrganizationRepository(t)
	uc := NewOrganizationUsecase(orgRepo)

	ctx := context.Background()
	orgID := uuid.New()
	userID := uuid.New()

	// Expectations
	orgRepo.EXPECT().
		GetMemberRole(ctx, orgID, userID).
		Return(types.RoleOwner, nil).
		Once()

	orgRepo.EXPECT().
		Delete(ctx, orgID).
		Return(nil).
		Once()

	// Execute
	err := uc.DeleteOrganization(ctx, orgID, userID)

	// Assert
	assert.NoError(t, err)
}

func TestOrganizationUsecase_DeleteOrganization_NotOwner(t *testing.T) {
	t.Parallel()

	// Setup
	orgRepo := mocks.NewOrganizationRepository(t)
	uc := NewOrganizationUsecase(orgRepo)

	ctx := context.Background()
	orgID := uuid.New()
	userID := uuid.New()

	// Admin cannot delete organization
	orgRepo.EXPECT().
		GetMemberRole(ctx, orgID, userID).
		Return(types.RoleAdmin, nil).
		Once()

	// Execute
	err := uc.DeleteOrganization(ctx, orgID, userID)

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "only organization owner")
}
