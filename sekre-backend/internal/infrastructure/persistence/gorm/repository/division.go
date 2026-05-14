package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/infrastructure/persistence/gorm/mapper"
	"github.com/username/sekre-backend/internal/models"
	"gorm.io/gorm"
)

// ============================================================================
// DivisionRepository implementation
// ============================================================================

type divisionRepository struct {
	db *gorm.DB
}

func NewDivisionRepository(db *gorm.DB) repository.DivisionRepository {
	return &divisionRepository{db: db}
}

func (r *divisionRepository) Create(ctx context.Context, orgID uuid.UUID, division *entity.Division) error {
	division.OrganizationID = orgID
	model := mapper.DivisionToModel(division)
	if err := dbFor(ctx, r.db).Create(model).Error; err != nil {
		return domainerrors.Internal("create division", err)
	}
	division.CreatedAt = model.CreatedAt
	division.UpdatedAt = model.UpdatedAt
	return nil
}

func (r *divisionRepository) GetByID(ctx context.Context, orgID, divisionID uuid.UUID) (*entity.Division, error) {
	var model models.Division
	err := dbFor(ctx, r.db).
		Where("id = ? AND organization_id = ?", divisionID, orgID).
		First(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domainerrors.ErrDivisionNotFound
		}
		return nil, domainerrors.Internal("get division", err)
	}
	return mapper.DivisionToEntity(&model), nil
}

func (r *divisionRepository) List(ctx context.Context, orgID uuid.UUID) ([]entity.Division, error) {
	var models []models.Division
	err := dbFor(ctx, r.db).
		Where("organization_id = ?", orgID).
		Order("created_at DESC").
		Find(&models).Error
	if err != nil {
		return nil, domainerrors.Internal("list divisions", err)
	}

	divisions := make([]entity.Division, len(models))
	for i, m := range models {
		divisions[i] = *mapper.DivisionToEntity(&m)
	}
	return divisions, nil
}

func (r *divisionRepository) ListPaginated(ctx context.Context, orgID uuid.UUID, pagination types.PaginationParams) ([]entity.Division, int, error) {
	// Get total count
	var totalCount int64
	err := dbFor(ctx, r.db).
		Model(&models.Division{}).
		Where("organization_id = ?", orgID).
		Count(&totalCount).Error
	if err != nil {
		return nil, 0, domainerrors.Internal("count divisions", err)
	}

	// Get paginated results
	var models []models.Division
	err = dbFor(ctx, r.db).
		Where("organization_id = ?", orgID).
		Order("created_at DESC").
		Limit(pagination.Limit).
		Offset(pagination.Offset).
		Find(&models).Error
	if err != nil {
		return nil, 0, domainerrors.Internal("list divisions", err)
	}

	divisions := make([]entity.Division, len(models))
	for i, m := range models {
		divisions[i] = *mapper.DivisionToEntity(&m)
	}
	return divisions, int(totalCount), nil
}

func (r *divisionRepository) Update(ctx context.Context, orgID uuid.UUID, division *entity.Division) error {
	result := dbFor(ctx, r.db).
		Model(&models.Division{}).
		Where("id = ? AND organization_id = ?", division.ID, orgID).
		Updates(map[string]interface{}{
			"name":        division.Name,
			"description": division.Description,
		})
	if result.Error != nil {
		return domainerrors.Internal("update division", result.Error)
	}
	if result.RowsAffected == 0 {
		return domainerrors.ErrDivisionNotFound
	}
	return nil
}

func (r *divisionRepository) Delete(ctx context.Context, orgID, divisionID uuid.UUID) error {
	result := dbFor(ctx, r.db).
		Where("id = ? AND organization_id = ?", divisionID, orgID).
		Delete(&models.Division{})
	if result.Error != nil {
		return domainerrors.Internal("delete division", result.Error)
	}
	if result.RowsAffected == 0 {
		return domainerrors.ErrDivisionNotFound
	}
	return nil
}

func (r *divisionRepository) GetByNames(ctx context.Context, orgID uuid.UUID, names []string) ([]entity.Division, error) {
	var models []models.Division
	err := dbFor(ctx, r.db).
		Where("organization_id = ? AND name IN ?", orgID, names).
		Find(&models).Error
	if err != nil {
		return nil, domainerrors.Internal("get divisions by names", err)
	}

	divisions := make([]entity.Division, len(models))
	for i, m := range models {
		divisions[i] = *mapper.DivisionToEntity(&m)
	}
	return divisions, nil
}

func (r *divisionRepository) CountByOrganization(ctx context.Context, orgID uuid.UUID) (int, error) {
	var count int64
	err := dbFor(ctx, r.db).
		Model(&models.Division{}).
		Where("organization_id = ?", orgID).
		Count(&count).Error
	if err != nil {
		return 0, domainerrors.Internal("count divisions", err)
	}
	return int(count), nil
}

func (r *divisionRepository) AddMember(ctx context.Context, divisionID, userID uuid.UUID, role types.DivisionRole) error {
	member := &models.DivisionMember{
		DivisionID:   divisionID,
		UserID:       userID,
		DivisionRole: role,
	}
	if err := dbFor(ctx, r.db).Create(member).Error; err != nil {
		return domainerrors.Internal("add member to division", err)
	}
	return nil
}

func (r *divisionRepository) RemoveMember(ctx context.Context, orgID, divisionID, userID uuid.UUID) error {
	result := dbFor(ctx, r.db).
		Where("division_id = ? AND user_id = ?", divisionID, userID).
		Delete(&models.DivisionMember{})
	if result.Error != nil {
		return domainerrors.Internal("remove member from division", result.Error)
	}
	if result.RowsAffected == 0 {
		return domainerrors.ErrNotDivisionMember
	}
	return nil
}

func (r *divisionRepository) GetMembers(ctx context.Context, orgID, divisionID uuid.UUID) ([]entity.UserWithRole, error) {
	var members []models.DivisionMember
	err := dbFor(ctx, r.db).
		Preload("User").
		Where("division_id = ?", divisionID).
		Find(&members).Error
	if err != nil {
		return nil, domainerrors.Internal("get division members", err)
	}

	result := make([]entity.UserWithRole, len(members))
	for i, m := range members {
		result[i] = entity.UserWithRole{
			User: entity.User{
				ID:       m.User.ID,
				Email:    m.User.Email,
				FullName: m.User.FullName,
			},
			DivisionRole: m.DivisionRole,
			JoinedAt:     m.JoinedAt,
		}
	}
	return result, nil
}

func (r *divisionRepository) GetMembersPaginated(ctx context.Context, orgID, divisionID uuid.UUID, pagination types.PaginationParams) ([]entity.UserWithRole, int, error) {
	// Get total count
	var totalCount int64
	err := dbFor(ctx, r.db).
		Model(&models.DivisionMember{}).
		Where("division_id = ?", divisionID).
		Count(&totalCount).Error
	if err != nil {
		return nil, 0, domainerrors.Internal("count division members", err)
	}

	// Get paginated results
	var members []models.DivisionMember
	err = dbFor(ctx, r.db).
		Preload("User").
		Where("division_id = ?", divisionID).
		Limit(pagination.Limit).
		Offset(pagination.Offset).
		Find(&members).Error
	if err != nil {
		return nil, 0, domainerrors.Internal("get division members", err)
	}

	result := make([]entity.UserWithRole, len(members))
	for i, m := range members {
		result[i] = entity.UserWithRole{
			User: entity.User{
				ID:       m.User.ID,
				Email:    m.User.Email,
				FullName: m.User.FullName,
			},
			DivisionRole: m.DivisionRole,
			JoinedAt:     m.JoinedAt,
		}
	}
	return result, int(totalCount), nil
}

func (r *divisionRepository) UpdateMemberRole(ctx context.Context, orgID, divisionID, userID uuid.UUID, role string) error {
	result := dbFor(ctx, r.db).
		Model(&models.DivisionMember{}).
		Where("division_id = ? AND user_id = ?", divisionID, userID).
		Update("role", role)
	if result.Error != nil {
		return domainerrors.Internal("update member role", result.Error)
	}
	if result.RowsAffected == 0 {
		return domainerrors.ErrNotDivisionMember
	}
	return nil
}

func (r *divisionRepository) CountHeads(ctx context.Context, divisionID uuid.UUID) (int, error) {
	var count int64
	err := dbFor(ctx, r.db).
		Model(&models.DivisionMember{}).
		Where("division_id = ? AND role = ?", divisionID, "HEAD").
		Count(&count).Error
	if err != nil {
		return 0, domainerrors.Internal("count heads", err)
	}
	return int(count), nil
}

func (r *divisionRepository) CountMembers(ctx context.Context, divisionID uuid.UUID) (int, error) {
	var count int64
	err := dbFor(ctx, r.db).
		Model(&models.DivisionMember{}).
		Where("division_id = ?", divisionID).
		Count(&count).Error
	if err != nil {
		return 0, domainerrors.Internal("count members", err)
	}
	return int(count), nil
}

func (r *divisionRepository) IsUserMemberOfDivision(ctx context.Context, orgID, divisionID, userID uuid.UUID) (bool, error) {
	var count int64
	err := dbFor(ctx, r.db).
		Table("division_members dm").
		Joins("JOIN divisions d ON d.id = dm.division_id").
		Where("dm.division_id = ? AND dm.user_id = ? AND d.organization_id = ?", divisionID, userID, orgID).
		Count(&count).Error
	if err != nil {
		return false, domainerrors.Internal("check division membership", err)
	}
	return count > 0, nil
}

// ============================================================================
// DivisionMemberRepository implementation
// ============================================================================

type divisionMemberRepository struct {
	db *gorm.DB
}

func NewDivisionMemberRepository(db *gorm.DB) repository.DivisionMemberRepository {
	return &divisionMemberRepository{db: db}
}

func (r *divisionMemberRepository) AddMember(ctx context.Context, orgID uuid.UUID, member *entity.DivisionMember) error {
	// Verify division belongs to org
	var div models.Division
	err := dbFor(ctx, r.db).
		Where("id = ? AND organization_id = ?", member.DivisionID, orgID).
		First(&div).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domainerrors.ErrDivisionNotFound
		}
		return domainerrors.Internal("verify division", err)
	}

	model := mapper.DivisionMemberToModel(member)
	if err := dbFor(ctx, r.db).Create(model).Error; err != nil {
		return domainerrors.Internal("add division member", err)
	}
	member.JoinedAt = model.JoinedAt
	return nil
}

func (r *divisionMemberRepository) RemoveMember(ctx context.Context, orgID, divisionID, userID uuid.UUID) error {
	// Verify division belongs to org
	var div models.Division
	err := dbFor(ctx, r.db).
		Where("id = ? AND organization_id = ?", divisionID, orgID).
		First(&div).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domainerrors.ErrDivisionNotFound
		}
		return domainerrors.Internal("verify division", err)
	}

	result := dbFor(ctx, r.db).
		Where("division_id = ? AND user_id = ?", divisionID, userID).
		Delete(&models.DivisionMember{})
	if result.Error != nil {
		return domainerrors.Internal("remove division member", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("member not found in division")
	}
	return nil
}

func (r *divisionMemberRepository) GetMembers(ctx context.Context, orgID, divisionID uuid.UUID) ([]entity.UserWithRole, error) {
	// Verify division belongs to org
	var div models.Division
	err := dbFor(ctx, r.db).
		Where("id = ? AND organization_id = ?", divisionID, orgID).
		First(&div).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domainerrors.ErrDivisionNotFound
		}
		return nil, domainerrors.Internal("verify division", err)
	}

	var members []models.DivisionMember
	err = dbFor(ctx, r.db).
		Preload("User").
		Where("division_id = ?", divisionID).
		Find(&members).Error
	if err != nil {
		return nil, domainerrors.Internal("get division members", err)
	}

	users := make([]entity.UserWithRole, len(members))
	for i, m := range members {
		users[i] = entity.UserWithRole{
			User:         *mapper.UserToEntity(&m.User),
			DivisionRole: m.DivisionRole,
			JoinedAt:     m.JoinedAt,
		}
	}
	return users, nil
}

func (r *divisionMemberRepository) UpdateRole(ctx context.Context, orgID, divisionID, userID uuid.UUID, role string) error {
	// Verify division belongs to org
	var div models.Division
	err := dbFor(ctx, r.db).
		Where("id = ? AND organization_id = ?", divisionID, orgID).
		First(&div).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domainerrors.ErrDivisionNotFound
		}
		return domainerrors.Internal("verify division", err)
	}

	result := dbFor(ctx, r.db).
		Model(&models.DivisionMember{}).
		Where("division_id = ? AND user_id = ?", divisionID, userID).
		Update("division_role", role)
	if result.Error != nil {
		return domainerrors.Internal("update member role", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("member not found in division")
	}
	return nil
}

// ============================================================================
// InvitationRepository implementation
// ============================================================================

type invitationRepository struct {
	db *gorm.DB
}

func NewInvitationRepository(db *gorm.DB) repository.InvitationRepository {
	return &invitationRepository{db: db}
}

func (r *invitationRepository) Create(ctx context.Context, invitation *entity.Invitation) error {
	model := mapper.InvitationToModel(invitation)
	if err := dbFor(ctx, r.db).Create(model).Error; err != nil {
		return domainerrors.Internal("create invitation", err)
	}
	invitation.CreatedAt = model.CreatedAt
	return nil
}

func (r *invitationRepository) GetByToken(ctx context.Context, token string) (*entity.Invitation, error) {
	var model models.Invitation
	err := dbFor(ctx, r.db).
		Where("token = ?", token).
		First(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domainerrors.NotFound("invitation", nil)
		}
		return nil, domainerrors.Internal("get invitation", err)
	}
	return mapper.InvitationToEntity(&model), nil
}

func (r *invitationRepository) UpdateStatus(ctx context.Context, invitationID uuid.UUID, status string) error {
	result := dbFor(ctx, r.db).
		Model(&models.Invitation{}).
		Where("id = ?", invitationID).
		Update("status", status)
	if result.Error != nil {
		return domainerrors.Internal("update invitation status", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("invitation not found")
	}
	return nil
}
