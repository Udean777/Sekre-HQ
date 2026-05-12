package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
)

type OrganizationRepository interface {
	UpdateOrganization(ctx context.Context, orgID uuid.UUID, name string) (*domain.Organization, error)
	DeleteOrganization(ctx context.Context, orgID uuid.UUID) error
	GetMemberRole(ctx context.Context, orgID, userID uuid.UUID) (string, error)
}

type organizationRepository struct {
	db *sql.DB
}

func NewOrganizationRepository(db *sql.DB) OrganizationRepository {
	return &organizationRepository{db: db}
}

// UpdateOrganization updates organization name
func (r *organizationRepository) UpdateOrganization(ctx context.Context, orgID uuid.UUID, name string) (*domain.Organization, error) {
	query := `
		UPDATE organizations
		SET name = $1, updated_at = NOW()
		WHERE id = $2
		RETURNING id, name, subdomain, subscription_plan, created_at, updated_at
	`

	org := &domain.Organization{}
	err := r.db.QueryRowContext(ctx, query, name, orgID).Scan(
		&org.ID, &org.Name, &org.Subdomain, &org.SubscriptionPlan, &org.CreatedAt, &org.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("organization not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to update organization: %w", err)
	}

	return org, nil
}

// DeleteOrganization deletes an organization and all related data
func (r *organizationRepository) DeleteOrganization(ctx context.Context, orgID uuid.UUID) error {
	// Start transaction
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Delete in order to respect foreign key constraints
	// 1. Delete division members
	if _, err := tx.ExecContext(ctx, "DELETE FROM division_members WHERE division_id IN (SELECT id FROM divisions WHERE organization_id = $1)", orgID); err != nil {
		return fmt.Errorf("failed to delete division members: %w", err)
	}

	// 2. Delete divisions
	if _, err := tx.ExecContext(ctx, "DELETE FROM divisions WHERE organization_id = $1", orgID); err != nil {
		return fmt.Errorf("failed to delete divisions: %w", err)
	}

	// 3. Delete tasks
	if _, err := tx.ExecContext(ctx, "DELETE FROM tasks WHERE organization_id = $1", orgID); err != nil {
		return fmt.Errorf("failed to delete tasks: %w", err)
	}

	// 4. Delete events
	if _, err := tx.ExecContext(ctx, "DELETE FROM events WHERE organization_id = $1", orgID); err != nil {
		return fmt.Errorf("failed to delete events: %w", err)
	}

	// 5. Delete finance records
	if _, err := tx.ExecContext(ctx, "DELETE FROM finance_records WHERE organization_id = $1", orgID); err != nil {
		return fmt.Errorf("failed to delete finance records: %w", err)
	}

	// 6. Delete audit logs
	if _, err := tx.ExecContext(ctx, "DELETE FROM audit_logs WHERE organization_id = $1", orgID); err != nil {
		return fmt.Errorf("failed to delete audit logs: %w", err)
	}

	// 7. Delete organization members
	if _, err := tx.ExecContext(ctx, "DELETE FROM organization_members WHERE organization_id = $1", orgID); err != nil {
		return fmt.Errorf("failed to delete organization members: %w", err)
	}

	// 8. Finally, delete the organization
	result, err := tx.ExecContext(ctx, "DELETE FROM organizations WHERE id = $1", orgID)
	if err != nil {
		return fmt.Errorf("failed to delete organization: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("organization not found")
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetMemberRole gets the role of a user in an organization
func (r *organizationRepository) GetMemberRole(ctx context.Context, orgID, userID uuid.UUID) (string, error) {
	query := `
		SELECT role
		FROM organization_members
		WHERE organization_id = $1 AND user_id = $2
	`

	var role string
	err := r.db.QueryRowContext(ctx, query, orgID, userID).Scan(&role)
	if err == sql.ErrNoRows {
		return "", fmt.Errorf("user is not a member of this organization")
	}
	if err != nil {
		return "", fmt.Errorf("failed to get member role: %w", err)
	}

	return role, nil
}
