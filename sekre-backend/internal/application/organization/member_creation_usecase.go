package organization

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/constants"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/service"
	"github.com/username/sekre-backend/internal/domain/types"
	sharedrepo "github.com/username/sekre-backend/internal/repository"
	"github.com/username/sekre-backend/pkg/logger"
	"github.com/username/sekre-backend/pkg/password"
)

type MemberCreationUsecase interface {
	CreateMember(ctx context.Context, req entity.CreateMemberRequest, orgID, actorID uuid.UUID) (*entity.CreatedMemberInfo, error)
	BulkImportMembers(ctx context.Context, members []entity.BulkImportMemberRequest, orgID, actorID uuid.UUID) (*entity.BulkImportResult, error)
}

type memberCreationUsecase struct {
	memberRepo   repository.MemberRepository
	divisionRepo repository.DivisionRepository
	tx           sharedrepo.TxRunner
	hasher       service.PasswordHasher
}

func NewMemberCreationUsecase(
	memberRepo repository.MemberRepository,
	divisionRepo repository.DivisionRepository,
	tx sharedrepo.TxRunner,
	hasher service.PasswordHasher,
) MemberCreationUsecase {
	return &memberCreationUsecase{
		memberRepo:   memberRepo,
		divisionRepo: divisionRepo,
		tx:           tx,
		hasher:       hasher,
	}
}

// CreateMember creates a single new member in a single transaction:
// user + user_organizations link + optional division assignment.
// If any step fails, the whole thing rolls back.
func (u *memberCreationUsecase) CreateMember(ctx context.Context, req entity.CreateMemberRequest, orgID, actorID uuid.UUID) (*entity.CreatedMemberInfo, error) {
	if err := u.validateMemberRequest(req); err != nil {
		return nil, err
	}

	tempPassword, err := password.GenerateTemporaryPassword()
	if err != nil {
		return nil, domainerrors.Internal("generate password", err)
	}

	hashedPassword, err := u.hasher.Hash(tempPassword)
	if err != nil {
		return nil, domainerrors.Internal("hash password", err)
	}

	role := types.Role(req.Role)
	if err := role.Validate(); err != nil {
		return nil, err
	}

	user := &entity.User{
		ID:                uuid.New(),
		Email:             strings.ToLower(strings.TrimSpace(req.Email)),
		PasswordHash:      hashedPassword,
		FullName:          strings.TrimSpace(req.FullName),
		MustResetPassword: true,
	}

	exists, err := u.memberRepo.EmailExistsInOrganization(ctx, orgID, user.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, domainerrors.Conflict("email", "already_exists_in_organization")
	}

	var (
		divisionUUID uuid.UUID
		divRole      = types.DivisionRoleStaff
		assignToDiv  bool
	)
	if req.DivisionID != nil && *req.DivisionID != "" {
		parsed, err := uuid.Parse(*req.DivisionID)
		if err != nil {
			return nil, errors.New("invalid division ID")
		}
		divisionUUID = parsed
		assignToDiv = true

		if req.DivisionRole != nil && *req.DivisionRole != "" {
			divRole = types.DivisionRole(*req.DivisionRole)
			if err := divRole.Validate(); err != nil {
				return nil, err
			}
		}

		memberCount, err := u.divisionRepo.CountMembers(ctx, divisionUUID)
		if err != nil {
			return nil, domainerrors.Internal("check division members", err)
		}
		if memberCount >= constants.MaxMembersPerDivision {
			return nil, fmt.Errorf("division has reached maximum member limit (%d)", constants.MaxMembersPerDivision)
		}

		if divRole == types.DivisionRoleHead {
			headCount, err := u.divisionRepo.CountHeads(ctx, divisionUUID)
			if err != nil {
				return nil, domainerrors.Internal("check division heads", err)
			}
			if headCount >= 3 {
				return nil, domainerrors.ErrMaxHeadsReached
			}
		}
	}

	var createdUser *entity.User
	err = u.tx.WithTransaction(ctx, func(txCtx context.Context) error {
		if err := u.memberRepo.CreateUser(txCtx, user); err != nil {
			return domainerrors.Internal("create user", err)
		}

		if err := u.memberRepo.AddUserToOrganization(txCtx, user.ID, orgID, role); err != nil {
			return domainerrors.Internal("add user to organization", err)
		}

		if assignToDiv {
			if err := u.divisionRepo.AddMember(txCtx, divisionUUID, user.ID, divRole); err != nil {
				return domainerrors.Internal("add user to division", err)
			}
		}

		createdUser = user
		return nil
	})

	if err != nil {
		return nil, err
	}

	return &entity.CreatedMemberInfo{
		Email:             createdUser.Email,
		FullName:          createdUser.FullName,
		TemporaryPassword: tempPassword,
	}, nil
}

// BulkImportMembers imports multiple members in a single transaction.
// If any member fails, the entire import is rolled back.
func (u *memberCreationUsecase) BulkImportMembers(ctx context.Context, members []entity.BulkImportMemberRequest, orgID, actorID uuid.UUID) (*entity.BulkImportResult, error) {
	if len(members) == 0 {
		return nil, errors.New("no members to import")
	}

	if len(members) > 100 {
		return nil, errors.New("cannot import more than 100 members at once")
	}

	for i, member := range members {
		if err := u.validateBulkMemberRequest(member); err != nil {
			return nil, fmt.Errorf("validation failed for member %d: %w", i+1, err)
		}
	}

	emailSet := make(map[string]bool)
	for _, member := range members {
		email := strings.ToLower(strings.TrimSpace(member.Email))
		if emailSet[email] {
			return nil, fmt.Errorf("duplicate email in import: %s", email)
		}
		emailSet[email] = true
	}

	divisionNames := make([]string, 0, len(members))
	for _, member := range members {
		divisionNames = append(divisionNames, member.Division)
	}

	divisions, err := u.divisionRepo.GetByNames(ctx, orgID, divisionNames)
	if err != nil {
		return nil, domainerrors.Internal("fetch divisions", err)
	}

	divisionMap := make(map[string]*entity.Division)
	for i := range divisions {
		divisionMap[divisions[i].Name] = &divisions[i]
	}

	for _, member := range members {
		if _, exists := divisionMap[member.Division]; !exists {
			return nil, fmt.Errorf("division not found: %s", member.Division)
		}
	}

	usersToCreate := make([]*entity.User, 0, len(members))
	tempPasswords := make([]string, 0, len(members))
	divisionAssignments := make([]struct {
		userID     uuid.UUID
		divisionID uuid.UUID
		role       types.DivisionRole
	}, 0, len(members))

	for _, member := range members {
		tempPassword, err := password.GenerateTemporaryPassword()
		if err != nil {
			return nil, domainerrors.Internal("generate password", err)
		}

		hashedPassword, err := u.hasher.Hash(tempPassword)
		if err != nil {
			return nil, domainerrors.Internal("hash password", err)
		}

		role := types.Role(member.Role)
		if err := role.Validate(); err != nil {
			return nil, err
		}

		user := &entity.User{
			ID:                uuid.New(),
			Email:             strings.ToLower(strings.TrimSpace(member.Email)),
			PasswordHash:      hashedPassword,
			FullName:          strings.TrimSpace(member.FullName),
			MustResetPassword: true,
		}

		exists, err := u.memberRepo.EmailExistsInOrganization(ctx, orgID, user.Email)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, domainerrors.Conflict("email", "already_exists_in_organization")
		}

		usersToCreate = append(usersToCreate, user)
		tempPasswords = append(tempPasswords, tempPassword)

		division := divisionMap[member.Division]
		divRole := types.DivisionRole(member.DivisionRole)
		if err := divRole.Validate(); err != nil {
			return nil, err
		}

		divisionAssignments = append(divisionAssignments, struct {
			userID     uuid.UUID
			divisionID uuid.UUID
			role       types.DivisionRole
		}{
			userID:     user.ID,
			divisionID: division.ID,
			role:       divRole,
		})
	}

	var createdMembers []entity.CreatedMemberInfo
	err = u.tx.WithTransaction(ctx, func(txCtx context.Context) error {
		for i, user := range usersToCreate {
			if err := u.memberRepo.CreateUser(txCtx, user); err != nil {
				return fmt.Errorf("failed to create user %d: %w", i+1, err)
			}

			role := types.Role(members[i].Role)
			if err := u.memberRepo.AddUserToOrganization(txCtx, user.ID, orgID, role); err != nil {
				return fmt.Errorf("failed to add user %d to organization: %w", i+1, err)
			}
		}

		for i, assignment := range divisionAssignments {
			if err := u.divisionRepo.AddMember(txCtx, assignment.divisionID, assignment.userID, assignment.role); err != nil {
				return fmt.Errorf("failed to add user %d to division: %w", i+1, err)
			}
		}

		for i, user := range usersToCreate {
			divName := ""
			for _, assignment := range divisionAssignments {
				if assignment.userID == user.ID {
					divName = members[i].Division
					break
				}
			}
			createdMembers = append(createdMembers, entity.CreatedMemberInfo{
				Email:             user.Email,
				FullName:          user.FullName,
				TemporaryPassword: tempPasswords[i],
				Division:          divName,
			})
		}

		return nil
	})

	if err != nil {
		logger.Logger.Error().
			Err(err).
			Str("orgID", orgID.String()).
			Str("actorID", actorID.String()).
			Msg("Bulk import failed")
		return nil, err
	}

	logger.Logger.Info().
		Int("count", len(createdMembers)).
		Str("orgID", orgID.String()).
		Str("actorID", actorID.String()).
		Msg("Bulk import successful")

	return &entity.BulkImportResult{
		TotalRows:      len(members),
		SuccessCount:   len(createdMembers),
		FailureCount:   0,
		Errors:         nil,
		CreatedMembers: createdMembers,
	}, nil
}

// validateMemberRequest validates a single member creation request
func (u *memberCreationUsecase) validateMemberRequest(req entity.CreateMemberRequest) error {
	if req.Email == "" {
		return errors.New("email is required")
	}
	if req.FullName == "" {
		return errors.New("full name is required")
	}
	if req.Role == "" {
		return errors.New("role is required")
	}

	if err := types.Role(req.Role).Validate(); err != nil {
		return err
	}

	if req.DivisionRole != nil && *req.DivisionRole != "" {
		if err := types.DivisionRole(*req.DivisionRole).Validate(); err != nil {
			return err
		}
	}

	if !strings.Contains(req.Email, "@") {
		return errors.New("invalid email format")
	}

	return nil
}

// validateBulkMemberRequest validates a bulk import member request
func (u *memberCreationUsecase) validateBulkMemberRequest(req entity.BulkImportMemberRequest) error {
	if req.Email == "" {
		return errors.New("email is required")
	}
	if req.FullName == "" {
		return errors.New("full name is required")
	}
	if req.Role == "" {
		return errors.New("role is required")
	}
	if req.Division == "" {
		return errors.New("division is required")
	}
	if req.DivisionRole == "" {
		return errors.New("division role is required")
	}

	if err := types.Role(req.Role).Validate(); err != nil {
		return err
	}

	if err := types.DivisionRole(req.DivisionRole).Validate(); err != nil {
		return err
	}

	if !strings.Contains(req.Email, "@") {
		return errors.New("invalid email format")
	}

	return nil
}
