package auth

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/service"
	"github.com/username/sekre-backend/internal/domain/types"
	sharedrepo "github.com/username/sekre-backend/internal/repository"
	"github.com/username/sekre-backend/pkg/token"
)

type RegisterRequest struct {
	OrganizationName string `json:"organization_name"`
	Subdomain        string `json:"subdomain"`
	FullName         string `json:"full_name"`
	Email            string `json:"email"`
	Password         string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	User         entity.User         `json:"user"`
	Organization entity.Organization `json:"organization"`
	Role         types.Role          `json:"role"`
	Tokens       token.TokenPair     `json:"tokens"`
}

type AuthUsecase interface {
	Register(ctx context.Context, req *RegisterRequest) (*AuthResponse, error)
	Login(ctx context.Context, req *LoginRequest) (*AuthResponse, error)
	GetMe(ctx context.Context, userID uuid.UUID) (*entity.UserWithOrganization, error)
}

// authUsecase orchestrates the registration / login flow. All infrastructure
// concerns (password hashing, token generation, regex validation) are
// delegated to service interfaces so the usecase stays focused and
// testable with mocks.
type authUsecase struct {
	users     repository.UserRepository
	orgs      repository.OrganizationRepository
	userOrgs  repository.UserOrganizationRepository
	tx        sharedrepo.TxRunner
	hasher    service.PasswordHasher
	tokens    service.TokenGenerator
	validator service.RegistrationValidator
}

// NewAuthUsecase wires the dependencies required by the auth flows.
func NewAuthUsecase(
	users repository.UserRepository,
	orgs repository.OrganizationRepository,
	userOrgs repository.UserOrganizationRepository,
	tx sharedrepo.TxRunner,
	hasher service.PasswordHasher,
	tokens service.TokenGenerator,
	validator service.RegistrationValidator,
) AuthUsecase {
	return &authUsecase{
		users:     users,
		orgs:      orgs,
		userOrgs:  userOrgs,
		tx:        tx,
		hasher:    hasher,
		tokens:    tokens,
		validator: validator,
	}
}

func (u *authUsecase) Register(ctx context.Context, req *RegisterRequest) (*AuthResponse, error) {
	if err := u.validateRegisterRequest(req); err != nil {
		return nil, err
	}

	// Check subdomain uniqueness outside tx (the tx unique-constraint is
	// still the source of truth on race).
	exists, err := u.orgs.CheckSubdomainExists(ctx, strings.ToLower(req.Subdomain))
	if err != nil {
		return nil, domainerrors.Internal("check subdomain", err)
	}
	if exists {
		return nil, domainerrors.ErrSubdomainTaken
	}

	hashedPassword, err := u.hasher.Hash(req.Password)
	if err != nil {
		return nil, domainerrors.Internal("hash password", err)
	}

	var (
		org  *entity.Organization
		user *entity.User
	)

	// All persistence in a single transaction: create org + user + user-org.
	// If any step fails, the whole thing rolls back.
	txErr := u.tx.WithTransaction(ctx, func(txCtx context.Context) error {
		org = &entity.Organization{
			ID:               uuid.New(),
			Name:             req.OrganizationName,
			Subdomain:        strings.ToLower(req.Subdomain),
			SubscriptionPlan: types.SubscriptionPlanFree,
		}
		if err := u.orgs.Create(txCtx, org); err != nil {
			return domainerrors.Internal("create organization", err)
		}

		user = &entity.User{
			ID:           uuid.New(),
			Email:        strings.ToLower(req.Email),
			PasswordHash: hashedPassword,
			FullName:     req.FullName,
		}
		if err := u.users.Create(txCtx, user); err != nil {
			return domainerrors.Internal("create user", err)
		}

		userOrg := &entity.UserOrganization{
			ID:             uuid.New(),
			UserID:         user.ID,
			OrganizationID: org.ID,
			Role:           types.RoleOwner,
		}
		if err := u.userOrgs.Create(txCtx, userOrg); err != nil {
			return domainerrors.Internal("create user organization", err)
		}

		return nil
	})
	if txErr != nil {
		return nil, txErr
	}

	// Tokens are only generated after the transaction commits successfully.
	tokens, err := u.tokens.Generate(user.ID, org.ID, types.RoleOwner)
	if err != nil {
		return nil, domainerrors.Internal("generate tokens", err)
	}

	return &AuthResponse{
		User:         *user,
		Organization: *org,
		Role:         types.RoleOwner,
		Tokens:       *tokens,
	}, nil
}

func (u *authUsecase) Login(ctx context.Context, req *LoginRequest) (*AuthResponse, error) {
	if req.Email == "" || req.Password == "" {
		return nil, domainerrors.ErrInvalidInput
	}

	user, err := u.users.GetByEmail(ctx, strings.ToLower(req.Email))
	if err != nil {
		return nil, err
	}

	if err := u.hasher.Compare(user.PasswordHash, req.Password); err != nil {
		if errors.Is(err, service.ErrPasswordMismatch) {
			return nil, domainerrors.ErrInvalidCredentials
		}
		return nil, err
	}

	userWithOrg, err := u.userOrgs.GetUserWithOrganization(ctx, user.ID)
	if err != nil {
		return nil, domainerrors.Internal("get user organization", err)
	}

	tokens, err := u.tokens.Generate(user.ID, userWithOrg.Organization.ID, userWithOrg.Role)
	if err != nil {
		return nil, domainerrors.Internal("generate tokens", err)
	}

	return &AuthResponse{
		User:         userWithOrg.User,
		Organization: userWithOrg.Organization,
		Role:         userWithOrg.Role,
		Tokens:       *tokens,
	}, nil
}

func (u *authUsecase) GetMe(ctx context.Context, userID uuid.UUID) (*entity.UserWithOrganization, error) {
	return u.userOrgs.GetUserWithOrganization(ctx, userID)
}

// validateRegisterRequest validates presence of required fields and delegates
// format checks to the registration validator service.
func (u *authUsecase) validateRegisterRequest(req *RegisterRequest) error {
	if req.OrganizationName == "" {
		return domainerrors.InvalidInput("organization name", "is required")
	}
	if req.FullName == "" {
		return domainerrors.InvalidInput("full name", "is required")
	}
	if err := u.validator.ValidateSubdomain(req.Subdomain); err != nil {
		return err
	}
	if err := u.validator.ValidateEmail(req.Email); err != nil {
		return err
	}
	if err := u.validator.ValidatePassword(req.Password); err != nil {
		return err
	}
	return nil
}
