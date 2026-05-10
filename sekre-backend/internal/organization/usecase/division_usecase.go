package usecase

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/internal/organization/repository"
)

const (
	MaxDivisionsFree = 7
	MaxMembersPerDiv = 15
)

type CreateDivisionRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type UpdateDivisionRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type AddMemberRequest struct {
	UserID uuid.UUID `json:"user_id"`
	Role   string    `json:"role"` // HEAD or STAFF
}

type DivisionUsecase interface {
	Create(ctx context.Context, orgID uuid.UUID, req *CreateDivisionRequest) (*domain.Division, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.DivisionWithMembers, error)
	List(ctx context.Context, orgID uuid.UUID) ([]domain.Division, error)
	Update(ctx context.Context, id uuid.UUID, req *UpdateDivisionRequest) (*domain.Division, error)
	Delete(ctx context.Context, id uuid.UUID) error
	
	AddMember(ctx context.Context, divisionID uuid.UUID, req *AddMemberRequest) error
	RemoveMember(ctx context.Context, divisionID, userID uuid.UUID) error
	UpdateMemberRole(ctx context.Context, divisionID, userID uuid.UUID, role string) error
	GetMembers(ctx context.Context, divisionID uuid.UUID) ([]domain.UserWithRole, error)
}

type divisionUsecase struct {
	repo repository.DivisionRepository
}

func NewDivisionUsecase(repo repository.DivisionRepository) DivisionUsecase {
	return &divisionUsecase{repo: repo}
}

func (u *divisionUsecase) Create(ctx context.Context, orgID uuid.UUID, req *CreateDivisionRequest) (*domain.Division, error) {
	// Validate
	if err := u.validateCreateRequest(req); err != nil {
		return nil, err
	}

	// Check division limit (7 for FREE plan)
	count, err := u.repo.CountByOrganization(ctx, orgID)
	if err != nil {
		return nil, fmt.Errorf("failed to count divisions: %w", err)
	}
	if count >= MaxDivisionsFree {
		return nil, domain.ErrDivisionLimitReached
	}

	// Create division
	div := &domain.Division{
		ID:             uuid.New(),
		OrganizationID: orgID,
		Name:           strings.TrimSpace(req.Name),
		Description:    strings.TrimSpace(req.Description),
	}

	if err := u.repo.Create(ctx, div); err != nil {
		return nil, fmt.Errorf("failed to create division: %w", err)
	}

	return div, nil
}

func (u *divisionUsecase) GetByID(ctx context.Context, id uuid.UUID) (*domain.DivisionWithMembers, error) {
	div, err := u.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	members, err := u.repo.GetMembers(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get members: %w", err)
	}

	return &domain.DivisionWithMembers{
		Division: *div,
		Members:  members,
	}, nil
}

func (u *divisionUsecase) List(ctx context.Context, orgID uuid.UUID) ([]domain.Division, error) {
	return u.repo.GetByOrganization(ctx, orgID)
}

func (u *divisionUsecase) Update(ctx context.Context, id uuid.UUID, req *UpdateDivisionRequest) (*domain.Division, error) {
	// Validate
	if err := u.validateUpdateRequest(req); err != nil {
		return nil, err
	}

	// Get existing
	div, err := u.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Update fields
	div.Name = strings.TrimSpace(req.Name)
	div.Description = strings.TrimSpace(req.Description)

	if err := u.repo.Update(ctx, div); err != nil {
		return nil, fmt.Errorf("failed to update division: %w", err)
	}

	return div, nil
}

func (u *divisionUsecase) Delete(ctx context.Context, id uuid.UUID) error {
	// Check if division exists
	_, err := u.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// Check for active data
	hasTasks, err := u.repo.HasActiveTasks(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check tasks: %w", err)
	}
	if hasTasks {
		return domain.ErrDivisionHasData
	}

	hasEvents, err := u.repo.HasUpcomingEvents(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check events: %w", err)
	}
	if hasEvents {
		return domain.ErrDivisionHasData
	}

	hasTrans, err := u.repo.HasRecentTransactions(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check transactions: %w", err)
	}
	if hasTrans {
		return domain.ErrDivisionHasData
	}

	return u.repo.Delete(ctx, id)
}

func (u *divisionUsecase) AddMember(ctx context.Context, divisionID uuid.UUID, req *AddMemberRequest) error {
	// Validate role
	if req.Role != "HEAD" && req.Role != "STAFF" {
		return fmt.Errorf("invalid role: must be HEAD or STAFF")
	}

	// Check member limit (15 for FREE plan)
	count, err := u.repo.CountMembers(ctx, divisionID)
	if err != nil {
		return fmt.Errorf("failed to count members: %w", err)
	}
	if count >= MaxMembersPerDiv {
		return domain.ErrMemberLimitReached
	}

	// Check if already member
	isMember, err := u.repo.IsMember(ctx, divisionID, req.UserID)
	if err != nil {
		return fmt.Errorf("failed to check membership: %w", err)
	}
	if isMember {
		return domain.ErrAlreadyMember
	}

	return u.repo.AddMember(ctx, divisionID, req.UserID, req.Role)
}

func (u *divisionUsecase) RemoveMember(ctx context.Context, divisionID, userID uuid.UUID) error {
	// Check if member is HEAD
	members, err := u.repo.GetMembers(ctx, divisionID)
	if err != nil {
		return fmt.Errorf("failed to get members: %w", err)
	}

	var isHead bool
	for _, m := range members {
		if m.User.ID == userID && m.DivisionRole == "HEAD" {
			isHead = true
			break
		}
	}

	// If removing HEAD, check if there's another HEAD
	if isHead {
		headCount, err := u.repo.CountHeads(ctx, divisionID)
		if err != nil {
			return fmt.Errorf("failed to count heads: %w", err)
		}
		if headCount <= 1 {
			return domain.ErrCannotRemoveHead
		}
	}

	return u.repo.RemoveMember(ctx, divisionID, userID)
}

func (u *divisionUsecase) UpdateMemberRole(ctx context.Context, divisionID, userID uuid.UUID, role string) error {
	// Validate role
	if role != "HEAD" && role != "STAFF" {
		return fmt.Errorf("invalid role: must be HEAD or STAFF")
	}

	// Get current role
	members, err := u.repo.GetMembers(ctx, divisionID)
	if err != nil {
		return fmt.Errorf("failed to get members: %w", err)
	}

	var currentRole string
	var found bool
	for _, m := range members {
		if m.User.ID == userID {
			currentRole = m.DivisionRole
			found = true
			break
		}
	}

	if !found {
		return domain.ErrNotDivisionMember
	}

	// If changing HEAD to STAFF, check if there's another HEAD
	if currentRole == "HEAD" && role == "STAFF" {
		headCount, err := u.repo.CountHeads(ctx, divisionID)
		if err != nil {
			return fmt.Errorf("failed to count heads: %w", err)
		}
		if headCount <= 1 {
			return domain.ErrMustHaveHead
		}
	}

	return u.repo.UpdateMemberRole(ctx, divisionID, userID, role)
}

func (u *divisionUsecase) GetMembers(ctx context.Context, divisionID uuid.UUID) ([]domain.UserWithRole, error) {
	return u.repo.GetMembers(ctx, divisionID)
}

func (u *divisionUsecase) validateCreateRequest(req *CreateDivisionRequest) error {
	if strings.TrimSpace(req.Name) == "" {
		return fmt.Errorf("division name is required")
	}
	if len(req.Name) > 255 {
		return fmt.Errorf("division name too long (max 255 characters)")
	}
	return nil
}

func (u *divisionUsecase) validateUpdateRequest(req *UpdateDivisionRequest) error {
	if strings.TrimSpace(req.Name) == "" {
		return fmt.Errorf("division name is required")
	}
	if len(req.Name) > 255 {
		return fmt.Errorf("division name too long (max 255 characters)")
	}
	return nil
}
