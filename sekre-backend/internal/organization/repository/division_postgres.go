package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
)

type DivisionRepository interface {
	// Division CRUD
	Create(ctx context.Context, div *domain.Division) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Division, error)
	GetByOrganization(ctx context.Context, orgID uuid.UUID) ([]domain.Division, error)
	Update(ctx context.Context, div *domain.Division) error
	Delete(ctx context.Context, id uuid.UUID) error
	CountByOrganization(ctx context.Context, orgID uuid.UUID) (int, error)
	
	// Member management
	AddMember(ctx context.Context, divisionID, userID uuid.UUID, role string) error
	RemoveMember(ctx context.Context, divisionID, userID uuid.UUID) error
	GetMembers(ctx context.Context, divisionID uuid.UUID) ([]domain.UserWithRole, error)
	CountMembers(ctx context.Context, divisionID uuid.UUID) (int, error)
	UpdateMemberRole(ctx context.Context, divisionID, userID uuid.UUID, role string) error
	IsMember(ctx context.Context, divisionID, userID uuid.UUID) (bool, error)
	CountHeads(ctx context.Context, divisionID uuid.UUID) (int, error)
	
	// Data checks
	HasActiveTasks(ctx context.Context, divisionID uuid.UUID) (bool, error)
	HasUpcomingEvents(ctx context.Context, divisionID uuid.UUID) (bool, error)
	HasRecentTransactions(ctx context.Context, divisionID uuid.UUID) (bool, error)
}

type divisionRepository struct {
	db *sql.DB
}

func NewDivisionRepository(db *sql.DB) DivisionRepository {
	return &divisionRepository{db: db}
}

func (r *divisionRepository) Create(ctx context.Context, div *domain.Division) error {
	query := `
		INSERT INTO divisions (id, organization_id, name, description)
		VALUES ($1, $2, $3, $4)
		RETURNING created_at, updated_at
	`
	return r.db.QueryRowContext(
		ctx, query,
		div.ID, div.OrganizationID, div.Name, div.Description,
	).Scan(&div.CreatedAt, &div.UpdatedAt)
}

func (r *divisionRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Division, error) {
	query := `
		SELECT id, organization_id, name, description, created_at, updated_at
		FROM divisions
		WHERE id = $1
	`
	div := &domain.Division{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&div.ID, &div.OrganizationID, &div.Name, &div.Description,
		&div.CreatedAt, &div.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, domain.ErrDivisionNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get division: %w", err)
	}
	return div, nil
}

func (r *divisionRepository) GetByOrganization(ctx context.Context, orgID uuid.UUID) ([]domain.Division, error) {
	query := `
		SELECT id, organization_id, name, description, created_at, updated_at
		FROM divisions
		WHERE organization_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, orgID)
	if err != nil {
		return nil, fmt.Errorf("failed to get divisions: %w", err)
	}
	defer rows.Close()

	var divisions []domain.Division
	for rows.Next() {
		var div domain.Division
		if err := rows.Scan(
			&div.ID, &div.OrganizationID, &div.Name, &div.Description,
			&div.CreatedAt, &div.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan division: %w", err)
		}
		divisions = append(divisions, div)
	}
	return divisions, nil
}

func (r *divisionRepository) Update(ctx context.Context, div *domain.Division) error {
	query := `
		UPDATE divisions
		SET name = $1, description = $2, updated_at = NOW()
		WHERE id = $3
		RETURNING updated_at
	`
	return r.db.QueryRowContext(
		ctx, query,
		div.Name, div.Description, div.ID,
	).Scan(&div.UpdatedAt)
}

func (r *divisionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM divisions WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete division: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return domain.ErrDivisionNotFound
	}
	return nil
}

func (r *divisionRepository) CountByOrganization(ctx context.Context, orgID uuid.UUID) (int, error) {
	query := `SELECT COUNT(*) FROM divisions WHERE organization_id = $1`
	var count int
	err := r.db.QueryRowContext(ctx, query, orgID).Scan(&count)
	return count, err
}

func (r *divisionRepository) AddMember(ctx context.Context, divisionID, userID uuid.UUID, role string) error {
	query := `
		INSERT INTO division_members (division_id, user_id, division_role)
		VALUES ($1, $2, $3)
	`
	_, err := r.db.ExecContext(ctx, query, divisionID, userID, role)
	if err != nil {
		return fmt.Errorf("failed to add member: %w", err)
	}
	return nil
}

func (r *divisionRepository) RemoveMember(ctx context.Context, divisionID, userID uuid.UUID) error {
	query := `DELETE FROM division_members WHERE division_id = $1 AND user_id = $2`
	result, err := r.db.ExecContext(ctx, query, divisionID, userID)
	if err != nil {
		return fmt.Errorf("failed to remove member: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return domain.ErrNotDivisionMember
	}
	return nil
}

func (r *divisionRepository) GetMembers(ctx context.Context, divisionID uuid.UUID) ([]domain.UserWithRole, error) {
	query := `
		SELECT u.id, u.email, u.full_name, u.created_at, u.updated_at,
		       dm.division_role, dm.joined_at
		FROM users u
		JOIN division_members dm ON u.id = dm.user_id
		WHERE dm.division_id = $1
		ORDER BY dm.joined_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query, divisionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get members: %w", err)
	}
	defer rows.Close()

	members := []domain.UserWithRole{}
	for rows.Next() {
		var m domain.UserWithRole
		if err := rows.Scan(
			&m.User.ID, &m.User.Email, &m.User.FullName,
			&m.User.CreatedAt, &m.User.UpdatedAt,
			&m.DivisionRole, &m.JoinedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan member: %w", err)
		}
		members = append(members, m)
	}
	return members, nil
}

func (r *divisionRepository) CountMembers(ctx context.Context, divisionID uuid.UUID) (int, error) {
	query := `SELECT COUNT(*) FROM division_members WHERE division_id = $1`
	var count int
	err := r.db.QueryRowContext(ctx, query, divisionID).Scan(&count)
	return count, err
}

func (r *divisionRepository) UpdateMemberRole(ctx context.Context, divisionID, userID uuid.UUID, role string) error {
	query := `
		UPDATE division_members
		SET division_role = $1
		WHERE division_id = $2 AND user_id = $3
	`
	result, err := r.db.ExecContext(ctx, query, role, divisionID, userID)
	if err != nil {
		return fmt.Errorf("failed to update role: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return domain.ErrNotDivisionMember
	}
	return nil
}

func (r *divisionRepository) IsMember(ctx context.Context, divisionID, userID uuid.UUID) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM division_members WHERE division_id = $1 AND user_id = $2)`
	var exists bool
	err := r.db.QueryRowContext(ctx, query, divisionID, userID).Scan(&exists)
	return exists, err
}

func (r *divisionRepository) CountHeads(ctx context.Context, divisionID uuid.UUID) (int, error) {
	query := `SELECT COUNT(*) FROM division_members WHERE division_id = $1 AND division_role = 'HEAD'`
	var count int
	err := r.db.QueryRowContext(ctx, query, divisionID).Scan(&count)
	return count, err
}

func (r *divisionRepository) HasActiveTasks(ctx context.Context, divisionID uuid.UUID) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM tasks WHERE division_id = $1 AND status != 'DONE')`
	var exists bool
	err := r.db.QueryRowContext(ctx, query, divisionID).Scan(&exists)
	return exists, err
}

func (r *divisionRepository) HasUpcomingEvents(ctx context.Context, divisionID uuid.UUID) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM events WHERE division_id = $1 AND start_date > NOW())`
	var exists bool
	err := r.db.QueryRowContext(ctx, query, divisionID).Scan(&exists)
	return exists, err
}

func (r *divisionRepository) HasRecentTransactions(ctx context.Context, divisionID uuid.UUID) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM transactions WHERE division_id = $1 AND transaction_date > NOW() - INTERVAL '30 days')`
	var exists bool
	err := r.db.QueryRowContext(ctx, query, divisionID).Scan(&exists)
	return exists, err
}
