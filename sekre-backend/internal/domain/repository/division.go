package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
)

// DivisionRepository handles division persistence
type DivisionRepository interface {
	Create(ctx context.Context, orgID uuid.UUID, division *entity.Division) error
	GetByID(ctx context.Context, orgID, divisionID uuid.UUID) (*entity.Division, error)
	GetByNames(ctx context.Context, orgID uuid.UUID, names []string) ([]entity.Division, error)
	List(ctx context.Context, orgID uuid.UUID) ([]entity.Division, error)
	ListPaginated(ctx context.Context, orgID uuid.UUID, pagination types.PaginationParams) ([]entity.Division, int, error)
	Update(ctx context.Context, orgID uuid.UUID, division *entity.Division) error
	Delete(ctx context.Context, orgID, divisionID uuid.UUID) error
	CountByOrganization(ctx context.Context, orgID uuid.UUID) (int, error)
	AddMember(ctx context.Context, divisionID, userID uuid.UUID, role types.DivisionRole) error
	RemoveMember(ctx context.Context, orgID, divisionID, userID uuid.UUID) error
	GetMembers(ctx context.Context, orgID, divisionID uuid.UUID) ([]entity.UserWithRole, error)
	GetMembersPaginated(ctx context.Context, orgID, divisionID uuid.UUID, pagination types.PaginationParams) ([]entity.UserWithRole, int, error)
	UpdateMemberRole(ctx context.Context, orgID, divisionID, userID uuid.UUID, role string) error
	CountHeads(ctx context.Context, divisionID uuid.UUID) (int, error)
	CountMembers(ctx context.Context, divisionID uuid.UUID) (int, error)
	IsUserMemberOfDivision(ctx context.Context, orgID, divisionID, userID uuid.UUID) (bool, error)
}

// DivisionMemberRepository handles division membership
type DivisionMemberRepository interface {
	AddMember(ctx context.Context, orgID uuid.UUID, member *entity.DivisionMember) error
	RemoveMember(ctx context.Context, orgID, divisionID, userID uuid.UUID) error
	GetMembers(ctx context.Context, orgID, divisionID uuid.UUID) ([]entity.UserWithRole, error)
	UpdateRole(ctx context.Context, orgID, divisionID, userID uuid.UUID, role string) error
}

// InvitationRepository handles member invitations
type InvitationRepository interface {
	Create(ctx context.Context, invitation *entity.Invitation) error
	GetByToken(ctx context.Context, token string) (*entity.Invitation, error)
	UpdateStatus(ctx context.Context, invitationID uuid.UUID, status string) error
}
