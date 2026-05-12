package organization

import (
	"context"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/types"
)

type MemberUsecase interface {
	ListMembers(ctx context.Context, orgID uuid.UUID) ([]entity.UserWithOrgRole, error)
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

func (u *memberUsecase) ListMembers(ctx context.Context, orgID uuid.UUID) ([]entity.UserWithOrgRole, error) {
	members, err := u.memberRepo.GetOrganizationMembers(ctx, orgID)
	if err != nil {
		return nil, err
	}

	if members == nil {
		return []entity.UserWithOrgRole{}, nil
	}
	return members, nil
}

func (u *memberUsecase) UpdateMemberRole(ctx context.Context, orgID, userID uuid.UUID, role string) error {
	typed := types.Role(role)
	if err := typed.Validate(); err != nil {
		return err
	}

	isMember, err := u.memberRepo.IsMember(ctx, orgID, userID)
	if err != nil {
		return err
	}
	if !isMember {
		return domain.ErrUserNotInOrg
	}

	return u.memberRepo.UpdateMemberRole(ctx, orgID, userID, typed)
}

func (u *memberUsecase) RemoveMember(ctx context.Context, orgID, userID uuid.UUID) error {
	isMember, err := u.memberRepo.IsMember(ctx, orgID, userID)
	if err != nil {
		return err
	}
	if !isMember {
		return domain.ErrUserNotInOrg
	}

	return u.memberRepo.RemoveMember(ctx, orgID, userID)
}
