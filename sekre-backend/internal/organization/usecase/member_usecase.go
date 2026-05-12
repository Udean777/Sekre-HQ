package usecase

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/internal/organization/repository"
)

type MemberUsecase interface {
	ListMembers(ctx context.Context, orgID uuid.UUID) ([]domain.UserWithOrgRole, error)
	UpdateMemberRole(ctx context.Context, orgID, userID uuid.UUID, role string) error
	RemoveMember(ctx context.Context, orgID, userID uuid.UUID) error
}

type memberUsecase struct {
	memberRepo repository.MemberRepository
}

func NewMemberUsecase(memberRepo repository.MemberRepository) MemberUsecase {
	return &memberUsecase{
		memberRepo: memberRepo,
	}
}

func (u *memberUsecase) ListMembers(ctx context.Context, orgID uuid.UUID) ([]domain.UserWithOrgRole, error) {
	members, err := u.memberRepo.GetOrganizationMembers(ctx, orgID)
	if err != nil {
		return nil, err
	}

	if members == nil {
		return []domain.UserWithOrgRole{}, nil
	}

	return members, nil
}

func (u *memberUsecase) UpdateMemberRole(ctx context.Context, orgID, userID uuid.UUID, role string) error {
	// Validate role
	validRoles := map[string]bool{
		"OWNER":  true,
		"ADMIN":  true,
		"MEMBER": true,
	}

	if !validRoles[role] {
		return errors.New("invalid role")
	}

	// Check if user is a member
	isMember, err := u.memberRepo.IsMember(ctx, orgID, userID)
	if err != nil {
		return err
	}
	if !isMember {
		return domain.ErrUserNotInOrg
	}

	return u.memberRepo.UpdateMemberRole(ctx, orgID, userID, role)
}

func (u *memberUsecase) RemoveMember(ctx context.Context, orgID, userID uuid.UUID) error {
	// Check if user is a member
	isMember, err := u.memberRepo.IsMember(ctx, orgID, userID)
	if err != nil {
		return err
	}
	if !isMember {
		return domain.ErrUserNotInOrg
	}

	// TODO: Add validation to prevent removing the last owner
	// TODO: Add validation to check if user has active tasks/events

	return u.memberRepo.RemoveMember(ctx, orgID, userID)
}
