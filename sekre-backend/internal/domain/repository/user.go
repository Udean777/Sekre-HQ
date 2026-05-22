package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
)

// UserRepository handles user identity persistence (used by auth flow)
type UserRepository interface {
	Create(ctx context.Context, user *entity.User) error
	GetByEmail(ctx context.Context, email string) (*entity.User, error)
	GetByID(ctx context.Context, orgID, userID uuid.UUID) (*entity.User, error)
	UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error
	SetMustResetPassword(ctx context.Context, userID uuid.UUID, mustReset bool) error
	List(ctx context.Context, orgID uuid.UUID) ([]entity.User, error)
	SearchByEmail(ctx context.Context, orgID uuid.UUID, email string) ([]entity.UserBasic, error)
}

// UserProfileRepository handles user profile management operations
// (separate from UserRepository to keep the auth flow interface narrow).
type UserProfileRepository interface {
	SearchUsers(ctx context.Context, orgID uuid.UUID, query string, limit int) ([]entity.UserBasic, error)
	GetUsersByOrganization(ctx context.Context, orgID uuid.UUID) ([]entity.UserWithOrgRole, error)
	GetUsersByOrganizationPaginated(ctx context.Context, orgID uuid.UUID, pagination types.PaginationParams) ([]entity.UserWithOrgRole, int, error)
	GetUserByID(ctx context.Context, userID uuid.UUID) (*entity.UserBasic, error)
	UpdateProfile(ctx context.Context, userID uuid.UUID, fullName, email string) (*entity.User, error)
	GetUserWithPasswordByID(ctx context.Context, userID uuid.UUID) (*entity.User, error)
	UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error
	CheckEmailExists(ctx context.Context, email string, excludeUserID uuid.UUID) (bool, error)
}

// OrganizationRepository handles organization persistence (auth flow)
type OrganizationRepository interface {
	Create(ctx context.Context, org *entity.Organization) error
	GetByID(ctx context.Context, orgID uuid.UUID) (*entity.Organization, error)
	CheckSubdomainExists(ctx context.Context, subdomain string) (bool, error)
	// Update/Delete/GetMemberRole are used by organization management flows.
	Update(ctx context.Context, orgID uuid.UUID, name string) (*entity.Organization, error)
	Delete(ctx context.Context, orgID uuid.UUID) error
	GetMemberRole(ctx context.Context, orgID, userID uuid.UUID) (types.Role, error)
}

// UserOrganizationRepository handles the many-to-many membership link
type UserOrganizationRepository interface {
	Create(ctx context.Context, userOrg *entity.UserOrganization) error
	GetByUserAndOrg(ctx context.Context, userID, orgID uuid.UUID) (*entity.UserOrganization, error)
	GetUserWithOrganization(ctx context.Context, userID uuid.UUID) (*entity.UserWithOrganization, error)
	GetUsersByOrganization(ctx context.Context, orgID uuid.UUID) ([]entity.UserWithOrgRole, error)
	UpdateRole(ctx context.Context, orgID, userID uuid.UUID, role string) error
	Delete(ctx context.Context, orgID, userID uuid.UUID) error
}

// MemberRepository handles org-level member management plus the
// transactional primitives used by bulk/single member creation.
type MemberRepository interface {
	GetOrganizationMembers(ctx context.Context, orgID uuid.UUID) ([]entity.UserWithOrgRole, error)
	GetOrganizationMembersPaginated(ctx context.Context, orgID uuid.UUID, pagination types.PaginationParams) ([]entity.UserWithOrgRole, int, error)
	GetOrganizationMembersPaginatedFiltered(ctx context.Context, orgID uuid.UUID, search *string, pagination types.PaginationParams) ([]entity.UserWithOrgRole, int, error)
	UpdateMemberRole(ctx context.Context, orgID, userID uuid.UUID, role types.Role) error
	RemoveMember(ctx context.Context, orgID, userID uuid.UUID) error
	IsMember(ctx context.Context, orgID, userID uuid.UUID) (bool, error)

	// Member creation primitives (tx-aware via DBFromContext)
	CreateUser(ctx context.Context, user *entity.User) error
	AddUserToOrganization(ctx context.Context, orgID, userID uuid.UUID, role types.Role) error
	AddMemberToDivision(ctx context.Context, divisionID, userID uuid.UUID, divisionRole types.DivisionRole) error
	GetDivisionByName(ctx context.Context, orgID uuid.UUID, name string) (*entity.Division, error)
	EmailExistsInOrganization(ctx context.Context, orgID uuid.UUID, email string) (bool, error)

	// Audit log
	CreateAuditLog(ctx context.Context, log *entity.AuditLog) error
}

// PasswordResetRepository handles password reset tokens
type PasswordResetRepository interface {
	Create(ctx context.Context, reset *entity.PasswordReset) error
	GetByToken(ctx context.Context, token string) (*entity.PasswordReset, error)
	MarkAsUsed(ctx context.Context, resetID uuid.UUID) error
}

type RefreshSessionRepository interface {
	Create(ctx context.Context, session *entity.RefreshSession) error
	GetByJTI(ctx context.Context, jti string) (*entity.RefreshSession, error)
	RevokeByJTI(ctx context.Context, jti string) error
	RevokeByUser(ctx context.Context, userID uuid.UUID) error
}

// AuditLogRepository handles audit trail persistence
type AuditLogRepository interface {
	Create(ctx context.Context, log *entity.AuditLog) error
	List(ctx context.Context, orgID uuid.UUID, limit, offset int) ([]entity.AuditLog, error)
}
