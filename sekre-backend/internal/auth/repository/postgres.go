package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
)

type AuthRepository interface {
	CreateOrganization(ctx context.Context, org *domain.Organization) error
	CreateUser(ctx context.Context, user *domain.User) error
	CreateUserOrganization(ctx context.Context, userOrg *domain.UserOrganization) error
	GetUserByEmail(ctx context.Context, email string) (*domain.User, error)
	GetUserOrganization(ctx context.Context, userID, orgID uuid.UUID) (*domain.UserOrganization, error)
	GetUserWithOrganization(ctx context.Context, userID uuid.UUID) (*domain.UserWithOrganization, error)
	CheckSubdomainExists(ctx context.Context, subdomain string) (bool, error)
}

type authRepository struct {
	db *sql.DB
}

func NewAuthRepository(db *sql.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) CreateOrganization(ctx context.Context, org *domain.Organization) error {
	query := `
		INSERT INTO organizations (id, name, subdomain, subscription_plan)
		VALUES ($1, $2, $3, $4)
		RETURNING created_at, updated_at
	`
	return r.db.QueryRowContext(
		ctx, query,
		org.ID, org.Name, org.Subdomain, org.SubscriptionPlan,
	).Scan(&org.CreatedAt, &org.UpdatedAt)
}

func (r *authRepository) CreateUser(ctx context.Context, user *domain.User) error {
	query := `
		INSERT INTO users (id, email, password_hash, full_name)
		VALUES ($1, $2, $3, $4)
		RETURNING created_at, updated_at
	`
	return r.db.QueryRowContext(
		ctx, query,
		user.ID, user.Email, user.PasswordHash, user.FullName,
	).Scan(&user.CreatedAt, &user.UpdatedAt)
}

func (r *authRepository) CreateUserOrganization(ctx context.Context, userOrg *domain.UserOrganization) error {
	query := `
		INSERT INTO organization_members (organization_id, user_id, role)
		VALUES ($1, $2, $3)
		RETURNING joined_at
	`
	return r.db.QueryRowContext(
		ctx, query,
		userOrg.OrganizationID, userOrg.UserID, userOrg.Role,
	).Scan(&userOrg.CreatedAt)
}

func (r *authRepository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `
		SELECT id, email, password_hash, full_name, created_at, updated_at
		FROM users
		WHERE email = $1
	`
	user := &domain.User{}
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.FullName,
		&user.CreatedAt, &user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, domain.ErrInvalidCredentials
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return user, nil
}

func (r *authRepository) GetUserOrganization(ctx context.Context, userID, orgID uuid.UUID) (*domain.UserOrganization, error) {
	query := `
		SELECT organization_id, user_id, role, joined_at
		FROM organization_members
		WHERE user_id = $1 AND organization_id = $2
	`
	userOrg := &domain.UserOrganization{}
	err := r.db.QueryRowContext(ctx, query, userID, orgID).Scan(
		&userOrg.OrganizationID, &userOrg.UserID,
		&userOrg.Role, &userOrg.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, domain.ErrUserNotInOrg
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user organization: %w", err)
	}
	return userOrg, nil
}

func (r *authRepository) GetUserWithOrganization(ctx context.Context, userID uuid.UUID) (*domain.UserWithOrganization, error) {
	query := `
		SELECT 
			u.id, u.email, u.full_name, u.created_at, u.updated_at,
			o.id, o.name, o.subdomain, o.subscription_plan, o.created_at, o.updated_at,
			om.role
		FROM users u
		JOIN organization_members om ON u.id = om.user_id
		JOIN organizations o ON om.organization_id = o.id
		WHERE u.id = $1
		LIMIT 1
	`
	result := &domain.UserWithOrganization{}
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&result.User.ID, &result.User.Email, &result.User.FullName,
		&result.User.CreatedAt, &result.User.UpdatedAt,
		&result.Organization.ID, &result.Organization.Name,
		&result.Organization.Subdomain, &result.Organization.SubscriptionPlan,
		&result.Organization.CreatedAt, &result.Organization.UpdatedAt,
		&result.Role,
	)
	if err == sql.ErrNoRows {
		return nil, domain.ErrUserNotInOrg
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user with organization: %w", err)
	}
	return result, nil
}

func (r *authRepository) CheckSubdomainExists(ctx context.Context, subdomain string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM organizations WHERE subdomain = $1)`
	var exists bool
	err := r.db.QueryRowContext(ctx, query, subdomain).Scan(&exists)
	return exists, err
}
