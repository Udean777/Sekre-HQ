package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/infrastructure/persistence/gorm/mapper"
	"github.com/username/sekre-backend/internal/models"
	sharedrepo "github.com/username/sekre-backend/internal/repository"
	"gorm.io/gorm"
)

// dbFor returns the tx-aware db if caller is inside a transaction,
// otherwise returns the default db bound to ctx.
func dbFor(ctx context.Context, db *gorm.DB) *gorm.DB {
	return sharedrepo.DBFromContext(ctx, db)
}

// ============================================================================
// UserRepository implementation
// ============================================================================

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) repository.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *entity.User) error {
	model := mapper.UserToModel(user)
	if err := dbFor(ctx, r.db).Create(model).Error; err != nil {
		return domainerrors.Internal("create user", err)
	}
	user.CreatedAt = model.CreatedAt
	user.UpdatedAt = model.UpdatedAt
	return nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*entity.User, error) {
	var model models.User
	err := dbFor(ctx, r.db).Where("email = ?", email).First(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domainerrors.ErrInvalidCredentials
		}
		return nil, domainerrors.Internal("get user by email", err)
	}
	return mapper.UserToEntity(&model), nil
}

func (r *userRepository) GetByID(ctx context.Context, orgID, userID uuid.UUID) (*entity.User, error) {
	var model models.User
	err := dbFor(ctx, r.db).
		Joins("JOIN user_organizations ON users.id = user_organizations.user_id").
		Where("users.id = ? AND user_organizations.organization_id = ?", userID, orgID).
		First(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domainerrors.NotFound("user", userID).WithDetail("orgID", orgID)
		}
		return nil, domainerrors.Internal("get user by ID", err)
	}
	return mapper.UserToEntity(&model), nil
}

func (r *userRepository) UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error {
	if err := dbFor(ctx, r.db).
		Model(&models.User{}).
		Where("id = ?", userID).
		Update("password_hash", passwordHash).Error; err != nil {
		return domainerrors.Internal("update user password", err)
	}
	return nil
}

func (r *userRepository) SetMustResetPassword(ctx context.Context, userID uuid.UUID, mustReset bool) error {
	if err := dbFor(ctx, r.db).
		Model(&models.User{}).
		Where("id = ?", userID).
		Update("must_reset_password", mustReset).Error; err != nil {
		return domainerrors.Internal("set must reset password", err)
	}
	return nil
}

func (r *userRepository) List(ctx context.Context, orgID uuid.UUID) ([]entity.User, error) {
	var models []models.User
	err := dbFor(ctx, r.db).
		Joins("JOIN user_organizations ON users.id = user_organizations.user_id").
		Where("user_organizations.organization_id = ?", orgID).
		Find(&models).Error
	if err != nil {
		return nil, domainerrors.Internal("list users", err)
	}
	
	users := make([]entity.User, len(models))
	for i, m := range models {
		users[i] = *mapper.UserToEntity(&m)
	}
	return users, nil
}

func (r *userRepository) SearchByEmail(ctx context.Context, orgID uuid.UUID, email string) ([]entity.UserBasic, error) {
	var models []models.User
	err := dbFor(ctx, r.db).
		Select("users.id, users.email, users.full_name").
		Joins("JOIN user_organizations ON users.id = user_organizations.user_id").
		Where("user_organizations.organization_id = ? AND users.email ILIKE ?", orgID, "%"+email+"%").
		Limit(10).
		Find(&models).Error
	if err != nil {
		return nil, domainerrors.Internal("search users by email", err)
	}
	
	users := make([]entity.UserBasic, len(models))
	for i, m := range models {
		users[i] = entity.UserBasic{
			ID:       m.ID,
			Email:    m.Email,
			FullName: m.FullName,
		}
	}
	return users, nil
}

// ============================================================================
// OrganizationRepository implementation
// ============================================================================

type organizationRepository struct {
	db *gorm.DB
}

func NewOrganizationRepository(db *gorm.DB) repository.OrganizationRepository {
	return &organizationRepository{db: db}
}

func (r *organizationRepository) Create(ctx context.Context, org *entity.Organization) error {
	model := mapper.OrganizationToModel(org)
	if err := dbFor(ctx, r.db).Create(model).Error; err != nil {
		return domainerrors.Internal("create organization", err)
	}
	org.CreatedAt = model.CreatedAt
	org.UpdatedAt = model.UpdatedAt
	return nil
}

func (r *organizationRepository) GetByID(ctx context.Context, orgID uuid.UUID) (*entity.Organization, error) {
	var model models.Organization
	err := dbFor(ctx, r.db).Where("id = ?", orgID).First(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domainerrors.NotFound("organization", orgID)
		}
		return nil, domainerrors.Internal("get organization", err)
	}
	return mapper.OrganizationToEntity(&model), nil
}

func (r *organizationRepository) CheckSubdomainExists(ctx context.Context, subdomain string) (bool, error) {
	var count int64
	err := dbFor(ctx, r.db).
		Model(&models.Organization{}).
		Where("subdomain = ?", subdomain).
		Count(&count).Error
	if err != nil {
		return false, domainerrors.Internal("check subdomain", err)
	}
	return count > 0, nil
}

func (r *organizationRepository) Update(ctx context.Context, orgID uuid.UUID, name string) (*entity.Organization, error) {
	var model models.Organization
	err := dbFor(ctx, r.db).
		Model(&model).
		Where("id = ?", orgID).
		Updates(map[string]interface{}{
			"name": name,
		}).Error
	if err != nil {
		return nil, domainerrors.Internal("update organization", err)
	}

	if err := dbFor(ctx, r.db).Where("id = ?", orgID).First(&model).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domainerrors.ErrOrganizationNotFound
		}
		return nil, domainerrors.Internal("get updated organization", err)
	}
	return mapper.OrganizationToEntity(&model), nil
}

func (r *organizationRepository) Delete(ctx context.Context, orgID uuid.UUID) error {
	result := dbFor(ctx, r.db).Delete(&models.Organization{}, orgID)
	if result.Error != nil {
		return domainerrors.Internal("delete organization", result.Error)
	}
	if result.RowsAffected == 0 {
		return domainerrors.ErrOrganizationNotFound
	}
	return nil
}

func (r *organizationRepository) GetMemberRole(ctx context.Context, orgID, userID uuid.UUID) (types.Role, error) {
	var userOrg models.UserOrganization
	err := dbFor(ctx, r.db).
		Where("organization_id = ? AND user_id = ?", orgID, userID).
		First(&userOrg).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", domainerrors.ErrUserNotInOrg
		}
		return "", domainerrors.Internal("get member role", err)
	}
	return userOrg.Role, nil
}

// ============================================================================
// UserOrganizationRepository implementation
// ============================================================================

type userOrganizationRepository struct {
	db *gorm.DB
}

func NewUserOrganizationRepository(db *gorm.DB) repository.UserOrganizationRepository {
	return &userOrganizationRepository{db: db}
}

func (r *userOrganizationRepository) Create(ctx context.Context, userOrg *entity.UserOrganization) error {
	model := mapper.UserOrganizationToModel(userOrg)
	if err := dbFor(ctx, r.db).Create(model).Error; err != nil {
		return domainerrors.Internal("create user organization", err)
	}
	userOrg.CreatedAt = model.CreatedAt
	return nil
}

func (r *userOrganizationRepository) GetByUserAndOrg(ctx context.Context, userID, orgID uuid.UUID) (*entity.UserOrganization, error) {
	var model models.UserOrganization
	err := dbFor(ctx, r.db).
		Where("user_id = ? AND organization_id = ?", userID, orgID).
		First(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domainerrors.NotFound("user_organization", nil)
		}
		return nil, domainerrors.Internal("get user organization", err)
	}
	return mapper.UserOrganizationToEntity(&model), nil
}

func (r *userOrganizationRepository) GetUserWithOrganization(ctx context.Context, userID uuid.UUID) (*entity.UserWithOrganization, error) {
	var userOrg models.UserOrganization
	err := dbFor(ctx, r.db).
		Preload("User").
		Preload("Organization").
		Where("user_id = ?", userID).
		First(&userOrg).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domainerrors.NotFound("user_organization", nil)
		}
		return nil, domainerrors.Internal("get user with organization", err)
	}

	return &entity.UserWithOrganization{
		User:         *mapper.UserToEntity(&userOrg.User),
		Organization: *mapper.OrganizationToEntity(&userOrg.Organization),
		Role:         userOrg.Role,
	}, nil
}

func (r *userOrganizationRepository) GetUsersByOrganization(ctx context.Context, orgID uuid.UUID) ([]entity.UserWithOrgRole, error) {
	var userOrgs []models.UserOrganization
	err := dbFor(ctx, r.db).
		Preload("User").
		Where("organization_id = ?", orgID).
		Find(&userOrgs).Error
	if err != nil {
		return nil, domainerrors.Internal("get users by organization", err)
	}

	users := make([]entity.UserWithOrgRole, len(userOrgs))
	for i, uo := range userOrgs {
		users[i] = entity.UserWithOrgRole{
			ID:       uo.User.ID,
			Email:    uo.User.Email,
			FullName: uo.User.FullName,
			Role:     uo.Role,
		}
	}
	return users, nil
}

func (r *userOrganizationRepository) UpdateRole(ctx context.Context, orgID, userID uuid.UUID, role string) error {
	if err := dbFor(ctx, r.db).
		Model(&models.UserOrganization{}).
		Where("organization_id = ? AND user_id = ?", orgID, userID).
		Update("role", role).Error; err != nil {
		return domainerrors.Internal("update role", err)
	}
	return nil
}

func (r *userOrganizationRepository) Delete(ctx context.Context, orgID, userID uuid.UUID) error {
	if err := dbFor(ctx, r.db).
		Where("organization_id = ? AND user_id = ?", orgID, userID).
		Delete(&models.UserOrganization{}).Error; err != nil {
		return domainerrors.Internal("delete user organization", err)
	}
	return nil
}

// ============================================================================
// PasswordResetRepository implementation
// ============================================================================

type passwordResetRepository struct {
	db *gorm.DB
}

func NewPasswordResetRepository(db *gorm.DB) repository.PasswordResetRepository {
	return &passwordResetRepository{db: db}
}

func (r *passwordResetRepository) Create(ctx context.Context, reset *entity.PasswordReset) error {
	model := mapper.PasswordResetToModel(reset)
	if err := dbFor(ctx, r.db).Create(model).Error; err != nil {
		return domainerrors.Internal("create password reset", err)
	}
	reset.CreatedAt = model.CreatedAt
	return nil
}

func (r *passwordResetRepository) GetByToken(ctx context.Context, token string) (*entity.PasswordReset, error) {
	var model models.PasswordReset
	err := dbFor(ctx, r.db).
		Where("token = ? AND used_at IS NULL", token).
		First(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("password reset token not found or already used")
		}
		return nil, domainerrors.Internal("get password reset", err)
	}
	return mapper.PasswordResetToEntity(&model), nil
}

func (r *passwordResetRepository) MarkAsUsed(ctx context.Context, resetID uuid.UUID) error {
	db := dbFor(ctx, r.db)
	err := db.
		Model(&models.PasswordReset{}).
		Where("id = ?", resetID).
		Update("used_at", db.NowFunc()).Error
	if err != nil {
		return domainerrors.Internal("mark password reset as used", err)
	}
	return nil
}

// ============================================================================
// AuditLogRepository implementation
// ============================================================================

type auditLogRepository struct {
	db *gorm.DB
}

func NewAuditLogRepository(db *gorm.DB) repository.AuditLogRepository {
	return &auditLogRepository{db: db}
}

func (r *auditLogRepository) Create(ctx context.Context, log *entity.AuditLog) error {
	model := mapper.AuditLogToModel(log)
	if err := dbFor(ctx, r.db).Create(model).Error; err != nil {
		return domainerrors.Internal("create audit log", err)
	}
	log.CreatedAt = model.CreatedAt
	return nil
}

func (r *auditLogRepository) List(ctx context.Context, orgID uuid.UUID, limit, offset int) ([]entity.AuditLog, error) {
	var models []models.AuditLog
	err := dbFor(ctx, r.db).
		Where("organization_id = ?", orgID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&models).Error
	if err != nil {
		return nil, domainerrors.Internal("list audit logs", err)
	}

	logs := make([]entity.AuditLog, len(models))
	for i, m := range models {
		logs[i] = *mapper.AuditLogToEntity(&m)
	}
	return logs, nil
}
