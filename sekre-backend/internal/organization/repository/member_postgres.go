package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
)

type MemberRepository interface {
	GetOrganizationMembers(ctx context.Context, orgID uuid.UUID) ([]domain.UserWithOrgRole, error)
	UpdateMemberRole(ctx context.Context, orgID, userID uuid.UUID, role string) error
	RemoveMember(ctx context.Context, orgID, userID uuid.UUID) error
	IsMember(ctx context.Context, orgID, userID uuid.UUID) (bool, error)
	
	// New methods for member creation
	CreateMember(ctx context.Context, user *domain.User, orgID uuid.UUID, role string) error
	AddMemberToDivision(ctx context.Context, divisionID, userID uuid.UUID, divisionRole string) error
	GetDivisionByName(ctx context.Context, orgID uuid.UUID, name string) (*domain.Division, error)
	
	// Audit log
	CreateAuditLog(ctx context.Context, log *domain.AuditLog) error
}

type memberRepository struct {
	db *sql.DB
}

func NewMemberRepository(db *sql.DB) MemberRepository {
	return &memberRepository{db: db}
}

func (r *memberRepository) GetOrganizationMembers(ctx context.Context, orgID uuid.UUID) ([]domain.UserWithOrgRole, error) {
	query := `
		SELECT u.id, u.email, u.full_name, om.role
		FROM users u
		INNER JOIN organization_members om ON u.id = om.user_id
		WHERE om.organization_id = $1
		ORDER BY u.full_name
	`

	rows, err := r.db.QueryContext(ctx, query, orgID)
	if err != nil {
		return nil, fmt.Errorf("failed to get members: %w", err)
	}
	defer rows.Close()

	var members []domain.UserWithOrgRole
	for rows.Next() {
		var member domain.UserWithOrgRole
		if err := rows.Scan(&member.ID, &member.Email, &member.FullName, &member.Role); err != nil {
			return nil, fmt.Errorf("failed to scan member: %w", err)
		}
		members = append(members, member)
	}

	return members, nil
}

func (r *memberRepository) UpdateMemberRole(ctx context.Context, orgID, userID uuid.UUID, role string) error {
	query := `
		UPDATE organization_members
		SET role = $1
		WHERE organization_id = $2 AND user_id = $3
	`

	result, err := r.db.ExecContext(ctx, query, role, orgID, userID)
	if err != nil {
		return fmt.Errorf("failed to update role: %w", err)
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return domain.ErrUserNotInOrg
	}

	return nil
}

func (r *memberRepository) RemoveMember(ctx context.Context, orgID, userID uuid.UUID) error {
	query := `
		DELETE FROM organization_members
		WHERE organization_id = $1 AND user_id = $2
	`

	result, err := r.db.ExecContext(ctx, query, orgID, userID)
	if err != nil {
		return fmt.Errorf("failed to remove member: %w", err)
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return domain.ErrUserNotInOrg
	}

	return nil
}

func (r *memberRepository) IsMember(ctx context.Context, orgID, userID uuid.UUID) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM organization_members WHERE organization_id = $1 AND user_id = $2)`
	var exists bool
	err := r.db.QueryRowContext(ctx, query, orgID, userID).Scan(&exists)
	return exists, err
}

// CreateMember creates a new user and adds them to the organization
func (r *memberRepository) CreateMember(ctx context.Context, user *domain.User, orgID uuid.UUID, role string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Create user
	userQuery := `
		INSERT INTO users (id, email, password_hash, full_name, must_reset_password)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING created_at, updated_at
	`
	err = tx.QueryRowContext(
		ctx, userQuery,
		user.ID, user.Email, user.PasswordHash, user.FullName, user.MustResetPassword,
	).Scan(&user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	// Add to organization
	orgMemberQuery := `
		INSERT INTO organization_members (organization_id, user_id, role)
		VALUES ($1, $2, $3)
	`
	_, err = tx.ExecContext(ctx, orgMemberQuery, orgID, user.ID, role)
	if err != nil {
		return fmt.Errorf("failed to add user to organization: %w", err)
	}

	return tx.Commit()
}

// AddMemberToDivision adds a member to a division
func (r *memberRepository) AddMemberToDivision(ctx context.Context, divisionID, userID uuid.UUID, divisionRole string) error {
	query := `
		INSERT INTO division_members (division_id, user_id, division_role)
		VALUES ($1, $2, $3)
	`
	_, err := r.db.ExecContext(ctx, query, divisionID, userID, divisionRole)
	if err != nil {
		return fmt.Errorf("failed to add member to division: %w", err)
	}
	return nil
}

// GetDivisionByName gets a division by name within an organization
func (r *memberRepository) GetDivisionByName(ctx context.Context, orgID uuid.UUID, name string) (*domain.Division, error) {
	query := `
		SELECT id, organization_id, name, created_at, updated_at
		FROM divisions
		WHERE organization_id = $1 AND LOWER(name) = LOWER($2)
	`
	
	div := &domain.Division{}
	err := r.db.QueryRowContext(ctx, query, orgID, name).Scan(
		&div.ID, &div.OrganizationID, &div.Name, &div.CreatedAt, &div.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, domain.ErrDivisionNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get division: %w", err)
	}
	
	return div, nil
}

// CreateAuditLog creates an audit log entry
func (r *memberRepository) CreateAuditLog(ctx context.Context, log *domain.AuditLog) error {
	var detailsJSON []byte
	var err error
	
	if log.Details != nil {
		detailsJSON, err = json.Marshal(log.Details)
		if err != nil {
			return fmt.Errorf("failed to marshal details: %w", err)
		}
	}

	query := `
		INSERT INTO audit_logs (id, organization_id, user_id, action, target_user_id, details)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING created_at
	`
	
	err = r.db.QueryRowContext(
		ctx, query,
		log.ID, log.OrganizationID, log.UserID, log.Action, log.TargetUserID, detailsJSON,
	).Scan(&log.CreatedAt)
	
	if err != nil {
		return fmt.Errorf("failed to create audit log: %w", err)
	}
	
	return nil
}
