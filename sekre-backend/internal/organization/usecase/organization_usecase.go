package usecase

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/internal/organization/repository"
)

type OrganizationUsecase interface {
	UpdateOrganization(ctx context.Context, orgID, userID uuid.UUID, name string) (*domain.Organization, error)
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
func (u *organizationUsecase) UpdateOrganization(ctx context.Context, orgID, userID uuid.UUID, name string) (*domain.Organization, error) {
	// Check if user has permission (OWNER or ADMIN)
	role, err := u.orgRepo.GetMemberRole(ctx, orgID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to check user role: %w", err)
	}

	if role != "OWNER" && role != "ADMIN" {
		return nil, fmt.Errorf("you do not have permission to modify organization settings")
	}

	// Validate name
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, fmt.Errorf("organization name cannot be empty")
	}

	if len(name) > 100 {
		return nil, fmt.Errorf("organization name cannot exceed 100 characters")
	}

	// Update organization
	org, err := u.orgRepo.UpdateOrganization(ctx, orgID, name)
	if err != nil {
		return nil, fmt.Errorf("failed to update organization: %w", err)
	}

	return org, nil
}

// DeleteOrganization deletes an organization (OWNER only)
func (u *organizationUsecase) DeleteOrganization(ctx context.Context, orgID, userID uuid.UUID) error {
	// Check if user is OWNER
	role, err := u.orgRepo.GetMemberRole(ctx, orgID, userID)
	if err != nil {
		return fmt.Errorf("failed to check user role: %w", err)
	}

	if role != "OWNER" {
		return fmt.Errorf("only organization owners can delete the organization")
	}

	// Delete organization
	if err := u.orgRepo.DeleteOrganization(ctx, orgID); err != nil {
		return fmt.Errorf("failed to delete organization: %w", err)
	}

	return nil
}
