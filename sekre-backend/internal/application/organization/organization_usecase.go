package organization

import (
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/types"
)

type OrganizationUsecase interface {
	UpdateOrganization(ctx context.Context, orgID, userID uuid.UUID, name string) (*entity.Organization, error)
	DeleteOrganization(ctx context.Context, orgID, userID uuid.UUID) error
}

type organizationUsecase struct {
	orgRepo repository.OrganizationRepository
}

func NewOrganizationUsecase(orgRepo repository.OrganizationRepository) OrganizationUsecase {
	return &organizationUsecase{
		orgRepo: orgRepo,
	}
}

// UpdateOrganization updates organization information
func (u *organizationUsecase) UpdateOrganization(ctx context.Context, orgID, userID uuid.UUID, name string) (*entity.Organization, error) {
	role, err := u.orgRepo.GetMemberRole(ctx, orgID, userID)
	if err != nil {
		return nil, domainerrors.Internal("check user role", err)
	}

	if !role.CanManageOrganization() {
		return nil, fmt.Errorf("you do not have permission to modify organization settings")
	}

	name = strings.TrimSpace(name)
	if name == "" {
		return nil, domainerrors.InvalidInput("organization name", "cannot be empty")
	}
	if len(name) > 100 {
		return nil, domainerrors.InvalidInput("organization name", "cannot exceed 100 characters")
	}

	org, err := u.orgRepo.Update(ctx, orgID, name)
	if err != nil {
		return nil, domainerrors.Internal("update organization", err)
	}
	return org, nil
}

// DeleteOrganization deletes an organization (OWNER only)
func (u *organizationUsecase) DeleteOrganization(ctx context.Context, orgID, userID uuid.UUID) error {
	role, err := u.orgRepo.GetMemberRole(ctx, orgID, userID)
	if err != nil {
		return domainerrors.Internal("check user role", err)
	}

	if role != types.RoleOwner {
		return fmt.Errorf("only organization owners can delete the organization")
	}

	if err := u.orgRepo.Delete(ctx, orgID); err != nil {
		return domainerrors.Internal("delete organization", err)
	}
	return nil
}
