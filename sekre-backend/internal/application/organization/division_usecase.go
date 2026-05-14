package organization

import (
	"context"
	"strings"

	"github.com/google/uuid"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/types"
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
	Create(ctx context.Context, orgID uuid.UUID, req *CreateDivisionRequest) (*entity.Division, error)
	GetByID(ctx context.Context, orgID, id uuid.UUID) (*entity.DivisionWithMembers, error)
	List(ctx context.Context, orgID uuid.UUID) ([]entity.Division, error)
	ListPaginated(ctx context.Context, orgID uuid.UUID, pagination types.PaginationParams) ([]entity.Division, int, error)
	Update(ctx context.Context, orgID, id uuid.UUID, req *UpdateDivisionRequest) (*entity.Division, error)
	Delete(ctx context.Context, orgID, id uuid.UUID) error

	AddMember(ctx context.Context, orgID, divisionID uuid.UUID, req *AddMemberRequest) error
	RemoveMember(ctx context.Context, orgID, divisionID, userID uuid.UUID) error
	UpdateMemberRole(ctx context.Context, orgID, divisionID, userID uuid.UUID, role string) error
	GetMembers(ctx context.Context, orgID, divisionID uuid.UUID) ([]entity.UserWithRole, error)
	GetMembersPaginated(ctx context.Context, orgID, divisionID uuid.UUID, pagination types.PaginationParams) ([]entity.UserWithRole, int, error)
}

type divisionUsecase struct {
	repo     repository.DivisionRepository
	tasks    repository.TaskRepository
	events   repository.EventRepository
	finances repository.TransactionRepository
}

// NewDivisionUsecase constructs a division usecase. Task/event/finance repositories
// are injected so deletion pre-checks live in the business layer rather than the
// persistence layer.
func NewDivisionUsecase(
	repo repository.DivisionRepository,
	tasks repository.TaskRepository,
	events repository.EventRepository,
	finances repository.TransactionRepository,
) DivisionUsecase {
	return &divisionUsecase{
		repo:     repo,
		tasks:    tasks,
		events:   events,
		finances: finances,
	}
}

// ensureDivisionInOrg verifies the division belongs to the caller's org.
// Returns ErrDivisionNotFound (not ErrForbidden) to avoid leaking existence
// of divisions in other tenants.
func (u *divisionUsecase) ensureDivisionInOrg(ctx context.Context, orgID, divID uuid.UUID) error {
	_, err := u.repo.GetByID(ctx, orgID, divID)
	return err
}

func (u *divisionUsecase) Create(ctx context.Context, orgID uuid.UUID, req *CreateDivisionRequest) (*entity.Division, error) {
	if err := u.validateCreateRequest(req); err != nil {
		return nil, err
	}

	count, err := u.repo.CountByOrganization(ctx, orgID)
	if err != nil {
		return nil, domainerrors.Internal("count divisions", err)
	}
	if count >= MaxDivisionsFree {
		return nil, domainerrors.ErrDivisionLimitReached
	}

	div := &entity.Division{
		ID:             uuid.New(),
		OrganizationID: orgID,
		Name:           strings.TrimSpace(req.Name),
	}
	if desc := strings.TrimSpace(req.Description); desc != "" {
		div.Description = &desc
	}

	if err := u.repo.Create(ctx, orgID, div); err != nil {
		return nil, domainerrors.Internal("create division", err)
	}
	return div, nil
}

func (u *divisionUsecase) GetByID(ctx context.Context, orgID, id uuid.UUID) (*entity.DivisionWithMembers, error) {
	div, err := u.repo.GetByID(ctx, orgID, id)
	if err != nil {
		return nil, err
	}

	members, err := u.repo.GetMembers(ctx, orgID, id)
	if err != nil {
		return nil, domainerrors.Internal("get members", err)
	}

	return &entity.DivisionWithMembers{
		Division: *div,
		Members:  members,
	}, nil
}

func (u *divisionUsecase) List(ctx context.Context, orgID uuid.UUID) ([]entity.Division, error) {
	return u.repo.List(ctx, orgID)
}

func (u *divisionUsecase) ListPaginated(ctx context.Context, orgID uuid.UUID, pagination types.PaginationParams) ([]entity.Division, int, error) {
	return u.repo.ListPaginated(ctx, orgID, pagination)
}

func (u *divisionUsecase) Update(ctx context.Context, orgID, id uuid.UUID, req *UpdateDivisionRequest) (*entity.Division, error) {
	if err := u.validateUpdateRequest(req); err != nil {
		return nil, err
	}

	existing, err := u.repo.GetByID(ctx, orgID, id)
	if err != nil {
		return nil, err
	}

	existing.Name = strings.TrimSpace(req.Name)
	if desc := strings.TrimSpace(req.Description); desc != "" {
		existing.Description = &desc
	} else {
		existing.Description = nil
	}

	if err := u.repo.Update(ctx, orgID, existing); err != nil {
		return nil, domainerrors.Internal("update division", err)
	}
	return existing, nil
}

func (u *divisionUsecase) Delete(ctx context.Context, orgID, id uuid.UUID) error {
	if err := u.ensureDivisionInOrg(ctx, orgID, id); err != nil {
		return err
	}

	taskCount, err := u.tasks.CountActiveByDivision(ctx, orgID, id)
	if err != nil {
		return domainerrors.Internal("check tasks", err)
	}
	if taskCount > 0 {
		return domainerrors.ErrDivisionHasTasks
	}

	eventCount, err := u.events.CountUpcomingByDivision(ctx, orgID, id)
	if err != nil {
		return domainerrors.Internal("check events", err)
	}
	if eventCount > 0 {
		return domainerrors.ErrDivisionHasEvents
	}

	financeCount, err := u.finances.CountRecentByDivision(ctx, orgID, id)
	if err != nil {
		return domainerrors.Internal("check finances", err)
	}
	if financeCount > 0 {
		return domainerrors.ErrDivisionHasFinances
	}

	return u.repo.Delete(ctx, orgID, id)
}

func (u *divisionUsecase) AddMember(ctx context.Context, orgID, divisionID uuid.UUID, req *AddMemberRequest) error {
	if err := u.ensureDivisionInOrg(ctx, orgID, divisionID); err != nil {
		return err
	}

	role := types.DivisionRole(req.Role)
	if err := role.Validate(); err != nil {
		return err
	}

	memberCount, err := u.repo.CountMembers(ctx, divisionID)
	if err != nil {
		return domainerrors.Internal("count members", err)
	}
	if memberCount >= MaxMembersPerDiv {
		return domainerrors.ErrDivisionMemberLimitReached
	}

	return u.repo.AddMember(ctx, divisionID, req.UserID, role)
}

func (u *divisionUsecase) RemoveMember(ctx context.Context, orgID, divisionID, userID uuid.UUID) error {
	if err := u.ensureDivisionInOrg(ctx, orgID, divisionID); err != nil {
		return err
	}

	members, err := u.repo.GetMembers(ctx, orgID, divisionID)
	if err != nil {
		return domainerrors.Internal("get members", err)
	}

	var isHead bool
	for _, m := range members {
		if m.User.ID == userID && m.DivisionRole == types.DivisionRoleHead {
			isHead = true
			break
		}
	}

	if isHead {
		headCount, err := u.repo.CountHeads(ctx, divisionID)
		if err != nil {
			return domainerrors.Internal("count heads", err)
		}
		if headCount <= 1 {
			return domainerrors.ErrMustHaveHead
		}
	}

	return u.repo.RemoveMember(ctx, orgID, divisionID, userID)
}

func (u *divisionUsecase) UpdateMemberRole(ctx context.Context, orgID, divisionID, userID uuid.UUID, role string) error {
	if err := u.ensureDivisionInOrg(ctx, orgID, divisionID); err != nil {
		return err
	}

	nextRole := types.DivisionRole(role)
	if err := nextRole.Validate(); err != nil {
		return err
	}

	if nextRole == types.DivisionRoleHead {
		headCount, err := u.repo.CountHeads(ctx, divisionID)
		if err != nil {
			return domainerrors.Internal("count heads", err)
		}
		if headCount >= 3 {
			return domainerrors.ErrMaxHeadsReached
		}
	}

	members, err := u.repo.GetMembers(ctx, orgID, divisionID)
	if err != nil {
		return domainerrors.Internal("get members", err)
	}

	var currentRole types.DivisionRole
	var found bool
	for _, m := range members {
		if m.User.ID == userID {
			currentRole = m.DivisionRole
			found = true
			break
		}
	}

	if !found {
		return domainerrors.ErrNotDivisionMember
	}

	if currentRole == types.DivisionRoleHead && nextRole == types.DivisionRoleStaff {
		headCount, err := u.repo.CountHeads(ctx, divisionID)
		if err != nil {
			return domainerrors.Internal("count heads", err)
		}
		if headCount <= 1 {
			return domainerrors.ErrMustHaveHead
		}
	}

	return u.repo.UpdateMemberRole(ctx, orgID, divisionID, userID, string(nextRole))
}

func (u *divisionUsecase) GetMembers(ctx context.Context, orgID, divisionID uuid.UUID) ([]entity.UserWithRole, error) {
	if err := u.ensureDivisionInOrg(ctx, orgID, divisionID); err != nil {
		return nil, err
	}
	return u.repo.GetMembers(ctx, orgID, divisionID)
}

func (u *divisionUsecase) GetMembersPaginated(ctx context.Context, orgID, divisionID uuid.UUID, pagination types.PaginationParams) ([]entity.UserWithRole, int, error) {
	if err := u.ensureDivisionInOrg(ctx, orgID, divisionID); err != nil {
		return nil, 0, err
	}
	return u.repo.GetMembersPaginated(ctx, orgID, divisionID, pagination)
}

func (u *divisionUsecase) validateCreateRequest(req *CreateDivisionRequest) error {
	if strings.TrimSpace(req.Name) == "" {
		return domainerrors.InvalidInput("division name", "is required")
	}
	if len(req.Name) > 255 {
		return domainerrors.InvalidInput("division name", "too long (max 255 characters)")
	}
	return nil
}

func (u *divisionUsecase) validateUpdateRequest(req *UpdateDivisionRequest) error {
	if strings.TrimSpace(req.Name) == "" {
		return domainerrors.InvalidInput("division name", "is required")
	}
	if len(req.Name) > 255 {
		return domainerrors.InvalidInput("division name", "too long (max 255 characters)")
	}
	return nil
}
