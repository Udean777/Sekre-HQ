package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
)

type UserRepository interface {
	// User search and lookup
	SearchUsers(ctx context.Context, orgID uuid.UUID, query string, limit int) ([]domain.UserBasic, error)
	GetUsersByOrganization(ctx context.Context, orgID uuid.UUID) ([]domain.UserWithOrgRole, error)
	GetUserByID(ctx context.Context, userID uuid.UUID) (*domain.UserBasic, error)
	
	// User profile management
	UpdateProfile(ctx context.Context, userID uuid.UUID, fullName, email string) (*domain.User, error)
	GetUserWithPasswordByID(ctx context.Context, userID uuid.UUID) (*domain.User, error)
	UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error
	CheckEmailExists(ctx context.Context, email string, excludeUserID uuid.UUID) (bool, error)
}

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepository{db: db}
}

// SearchUsers searches for users within an organization by name or email
func (r *userRepository) SearchUsers(ctx context.Context, orgID uuid.UUID, query string, limit int) ([]domain.UserBasic, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	searchQuery := `
		SELECT DISTINCT u.id, u.email, u.full_name
		FROM users u
		INNER JOIN organization_members om ON u.id = om.user_id
		WHERE om.organization_id = $1
		AND (
			LOWER(u.full_name) LIKE LOWER($2)
			OR LOWER(u.email) LIKE LOWER($2)
		)
		ORDER BY u.full_name
		LIMIT $3
	`

	searchPattern := "%" + strings.TrimSpace(query) + "%"
	rows, err := r.db.QueryContext(ctx, searchQuery, orgID, searchPattern, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to search users: %w", err)
	}
	defer rows.Close()

	var users []domain.UserBasic
	for rows.Next() {
		var user domain.UserBasic
		if err := rows.Scan(&user.ID, &user.Email, &user.FullName); err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}

	return users, nil
}

// GetUsersByOrganization gets all users in an organization with their roles
func (r *userRepository) GetUsersByOrganization(ctx context.Context, orgID uuid.UUID) ([]domain.UserWithOrgRole, error) {
	query := `
		SELECT u.id, u.email, u.full_name, om.role
		FROM users u
		INNER JOIN organization_members om ON u.id = om.user_id
		WHERE om.organization_id = $1
		ORDER BY u.full_name
	`

	rows, err := r.db.QueryContext(ctx, query, orgID)
	if err != nil {
		return nil, fmt.Errorf("failed to get users: %w", err)
	}
	defer rows.Close()

	var users []domain.UserWithOrgRole
	for rows.Next() {
		var user domain.UserWithOrgRole
		if err := rows.Scan(&user.ID, &user.Email, &user.FullName, &user.Role); err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}

	return users, nil
}

// GetUserByID gets a user by their ID
func (r *userRepository) GetUserByID(ctx context.Context, userID uuid.UUID) (*domain.UserBasic, error) {
	query := `
		SELECT id, email, full_name
		FROM users
		WHERE id = $1
	`

	user := &domain.UserBasic{}
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&user.ID, &user.Email, &user.FullName)
	if err == sql.ErrNoRows {
		return nil, domain.ErrUserNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// UpdateProfile updates user's full name and email
func (r *userRepository) UpdateProfile(ctx context.Context, userID uuid.UUID, fullName, email string) (*domain.User, error) {
	query := `
		UPDATE users
		SET full_name = $1, email = $2, updated_at = NOW()
		WHERE id = $3
		RETURNING id, email, full_name, must_reset_password, created_at, updated_at
	`

	user := &domain.User{}
	err := r.db.QueryRowContext(ctx, query, fullName, email, userID).Scan(
		&user.ID, &user.Email, &user.FullName, &user.MustResetPassword, &user.CreatedAt, &user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, domain.ErrUserNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	return user, nil
}

// GetUserWithPasswordByID gets a user with password hash by their ID
func (r *userRepository) GetUserWithPasswordByID(ctx context.Context, userID uuid.UUID) (*domain.User, error) {
	query := `
		SELECT id, email, password_hash, full_name, must_reset_password, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	user := &domain.User{}
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.FullName, &user.MustResetPassword, &user.CreatedAt, &user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, domain.ErrUserNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// UpdatePassword updates user's password hash
func (r *userRepository) UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error {
	query := `
		UPDATE users
		SET password_hash = $1, must_reset_password = false, updated_at = NOW()
		WHERE id = $2
	`

	result, err := r.db.ExecContext(ctx, query, passwordHash, userID)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return domain.ErrUserNotFound
	}

	return nil
}

// CheckEmailExists checks if an email is already in use by another user
func (r *userRepository) CheckEmailExists(ctx context.Context, email string, excludeUserID uuid.UUID) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM users
			WHERE LOWER(email) = LOWER($1) AND id != $2
		)
	`

	var exists bool
	err := r.db.QueryRowContext(ctx, query, email, excludeUserID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check email existence: %w", err)
	}

	return exists, nil
}
