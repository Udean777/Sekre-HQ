package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/infrastructure/persistence/gorm/mapper"
	"github.com/username/sekre-backend/internal/models"
	"gorm.io/gorm"
)

// memberRepository implements org-level member management plus transactional
// creation primitives. All writes go through dbFor so they participate in
// the caller's transaction when one is present.
type memberRepository struct {
	db *gorm.DB
}

func NewMemberRepository(db *gorm.DB) repository.MemberRepository {
	return &memberRepository{db: db}
}

func (r *memberRepository) GetOrganizationMembers(ctx context.Context, orgID uuid.UUID) ([]entity.UserWithOrgRole, error) {
	type row struct {
		ID       uuid.UUID
		Email    string
		FullName string
		Role     types.Role
	}

	var rows []row
	err := dbFor(ctx, r.db).
		Table("users AS u").
		Select("u.id, u.email, u.full_name, uo.role").
		Joins("INNER JOIN user_organizations AS uo ON u.id = uo.user_id").
		Where("uo.organization_id = ? AND u.deleted_at IS NULL", orgID).
		Order("u.full_name").
		Scan(&rows).Error
	if err != nil {
		return nil, domainerrors.Internal("get members", err)
	}

	members := make([]entity.UserWithOrgRole, 0, len(rows))
	for _, m := range rows {
		members = append(members, entity.UserWithOrgRole{
			ID:       m.ID,
			Email:    m.Email,
			FullName: m.FullName,
			Role:     m.Role,
		})
	}
	return members, nil
}

func (r *memberRepository) UpdateMemberRole(ctx context.Context, orgID, userID uuid.UUID, role types.Role) error {
	result := dbFor(ctx, r.db).
		Model(&models.UserOrganization{}).
		Where("organization_id = ? AND user_id = ?", orgID, userID).
		Update("role", role)
	if result.Error != nil {
		return domainerrors.Internal("update role", result.Error)
	}
	if result.RowsAffected == 0 {
		return domainerrors.ErrUserNotInOrg
	}
	return nil
}

func (r *memberRepository) RemoveMember(ctx context.Context, orgID, userID uuid.UUID) error {
	result := dbFor(ctx, r.db).
		Where("organization_id = ? AND user_id = ?", orgID, userID).
		Delete(&models.UserOrganization{})
	if result.Error != nil {
		return domainerrors.Internal("remove member", result.Error)
	}
	if result.RowsAffected == 0 {
		return domainerrors.ErrUserNotInOrg
	}
	return nil
}

func (r *memberRepository) IsMember(ctx context.Context, orgID, userID uuid.UUID) (bool, error) {
	var count int64
	err := dbFor(ctx, r.db).
		Model(&models.UserOrganization{}).
		Where("organization_id = ? AND user_id = ?", orgID, userID).
		Count(&count).Error
	if err != nil {
		return false, domainerrors.Internal("check membership", err)
	}
	return count > 0, nil
}

// CreateUser inserts a user. Tx-aware via dbFor.
func (r *memberRepository) CreateUser(ctx context.Context, user *entity.User) error {
	model := mapper.UserToModel(user)
	if err := dbFor(ctx, r.db).Create(model).Error; err != nil {
		return domainerrors.Internal("create user", err)
	}
	user.ID = model.ID
	user.CreatedAt = model.CreatedAt
	user.UpdatedAt = model.UpdatedAt
	return nil
}

// AddUserToOrganization links an existing user to an org with a role.
func (r *memberRepository) AddUserToOrganization(ctx context.Context, orgID, userID uuid.UUID, role types.Role) error {
	userOrg := &models.UserOrganization{
		UserID:         userID,
		OrganizationID: orgID,
		Role:           role,
	}
	if err := dbFor(ctx, r.db).Create(userOrg).Error; err != nil {
		return domainerrors.Internal("add user to organization", err)
	}
	return nil
}

// AddMemberToDivision assigns a user to a division with a division role.
func (r *memberRepository) AddMemberToDivision(ctx context.Context, divisionID, userID uuid.UUID, divisionRole types.DivisionRole) error {
	dm := &models.DivisionMember{
		DivisionID:   divisionID,
		UserID:       userID,
		DivisionRole: divisionRole,
	}
	if err := dbFor(ctx, r.db).Create(dm).Error; err != nil {
		return domainerrors.Internal("add member to division", err)
	}
	return nil
}

// GetDivisionByName fetches a division by name within a given organization.
func (r *memberRepository) GetDivisionByName(ctx context.Context, orgID uuid.UUID, name string) (*entity.Division, error) {
	var model models.Division
	err := dbFor(ctx, r.db).
		Where("organization_id = ? AND LOWER(name) = LOWER(?)", orgID, name).
		First(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domainerrors.ErrDivisionNotFound
		}
		return nil, domainerrors.Internal("get division", err)
	}
	return mapper.DivisionToEntity(&model), nil
}

// CreateAuditLog creates an audit log entry.
func (r *memberRepository) CreateAuditLog(ctx context.Context, log *entity.AuditLog) error {
	model := mapper.AuditLogToModel(log)
	if err := dbFor(ctx, r.db).Create(model).Error; err != nil {
		return domainerrors.Internal("create audit log", err)
	}
	log.ID = model.ID
	log.CreatedAt = model.CreatedAt
	return nil
}
