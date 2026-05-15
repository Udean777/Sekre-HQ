package repository

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/models"
	"gorm.io/gorm"
)

type refreshSessionRepository struct {
	db *gorm.DB
}

func NewRefreshSessionRepository(db *gorm.DB) repository.RefreshSessionRepository {
	return &refreshSessionRepository{db: db}
}

func (r *refreshSessionRepository) Create(ctx context.Context, session *entity.RefreshSession) error {
	model := models.RefreshSession{
		ID:             session.ID,
		UserID:         session.UserID,
		OrganizationID: session.OrganizationID,
		Role:           session.Role,
		TokenHash:      session.TokenHash,
		JTI:            session.JTI,
		ExpiresAt:      session.ExpiresAt,
	}
	if err := dbFor(ctx, r.db).Create(&model).Error; err != nil {
		return domainerrors.Internal("create refresh session", err)
	}
	return nil
}

func (r *refreshSessionRepository) GetByJTI(ctx context.Context, jti string) (*entity.RefreshSession, error) {
	var model models.RefreshSession
	err := dbFor(ctx, r.db).Where("jti = ?", jti).First(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domainerrors.ErrInvalidToken
		}
		return nil, domainerrors.Internal("get refresh session", err)
	}
	return &entity.RefreshSession{ID: model.ID, UserID: model.UserID, OrganizationID: model.OrganizationID, Role: model.Role, TokenHash: model.TokenHash, JTI: model.JTI, ExpiresAt: model.ExpiresAt, RevokedAt: model.RevokedAt, CreatedAt: model.CreatedAt, UpdatedAt: model.UpdatedAt}, nil
}

func (r *refreshSessionRepository) RevokeByJTI(ctx context.Context, jti string) error {
	now := time.Now()
	if err := dbFor(ctx, r.db).Model(&models.RefreshSession{}).Where("jti = ? AND revoked_at IS NULL", jti).Update("revoked_at", now).Error; err != nil {
		return domainerrors.Internal("revoke refresh session", err)
	}
	return nil
}

func (r *refreshSessionRepository) RevokeByUser(ctx context.Context, userID uuid.UUID) error {
	now := time.Now()
	if err := dbFor(ctx, r.db).Model(&models.RefreshSession{}).Where("user_id = ? AND revoked_at IS NULL", userID).Update("revoked_at", now).Error; err != nil {
		return domainerrors.Internal("revoke user refresh sessions", err)
	}
	return nil
}
