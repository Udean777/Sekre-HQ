package auth

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/service"
	"github.com/username/sekre-backend/internal/domain/types"
	sharedrepo "github.com/username/sekre-backend/internal/repository"
	"github.com/username/sekre-backend/pkg/token"
)

type RegisterRequest struct {
	OrganizationName string `json:"organization_name" validate:"required,min=2,max=100"`
	Subdomain        string `json:"subdomain" validate:"required,subdomain"`
	FullName         string `json:"full_name" validate:"required,min=2,max=100"`
	Email            string `json:"email" validate:"required,email,max=255"`
	Password         string `json:"password" validate:"required,min=8,max=128"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
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
	Refresh(ctx context.Context, refreshToken string) (*token.TokenPair, error)
	Logout(ctx context.Context, userID uuid.UUID) error
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
	refresh   repository.RefreshSessionRepository
}

// NewAuthUsecase wires the dependencies required by all auth flows.
func NewAuthUsecase(
	users repository.UserRepository,
	orgs repository.OrganizationRepository,
	userOrgs repository.UserOrganizationRepository,
	tx sharedrepo.TxRunner,
	hasher service.PasswordHasher,
	tokens service.TokenGenerator,
	validator service.RegistrationValidator,
	refresh ...repository.RefreshSessionRepository,
) AuthUsecase {
	var refreshRepo repository.RefreshSessionRepository
	if len(refresh) > 0 {
		refreshRepo = refresh[0]
	}
	return &authUsecase{
		users:     users,
		orgs:      orgs,
		userOrgs:  userOrgs,
		tx:        tx,
		hasher:    hasher,
		tokens:    tokens,
		validator: validator,
		refresh:   refreshRepo,
	}
}

func (u *authUsecase) Register(ctx context.Context, req *RegisterRequest) (*AuthResponse, error) {
	if err := u.validateRegisterRequest(req); err != nil {
		return nil, err
	}

	// Check subdomain uniqueness outside the tx (the unique-constraint is
	// the source of truth for the race).
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
	if err := u.persistRefreshSession(ctx, tokens.RefreshToken); err != nil {
		return nil, err
	}

	return &AuthResponse{
		User:         *user,
		Organization: *org,
		Role:         types.RoleOwner,
		Tokens:       *tokens,
	}, nil
}

func (u *authUsecase) Login(ctx context.Context, req *LoginRequest) (*AuthResponse, error) {
	// Normalize email up-front so every downstream lookup, log line, and
	// audit record sees the same canonical value. Password is intentionally
	// left untouched so we never mutate user-provided credentials.
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	if req.Email == "" || req.Password == "" {
		return nil, domainerrors.ErrInvalidInput
	}

	user, err := u.users.GetByEmail(ctx, req.Email)
	if err != nil {
		// Collapse "user not found" and any other lookup-time miss into the
		// same generic credential error so an attacker cannot enumerate
		// registered emails. We also burn a bcrypt comparison against a
		// dummy hash so the response time roughly matches the
		// password-mismatch path and avoids a timing oracle.
		if isCredentialMissError(err) {
			_ = u.hasher.Compare(dummyPasswordHash, req.Password)
			return nil, domainerrors.ErrInvalidCredentials
		}
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
	if err := u.persistRefreshSession(ctx, tokens.RefreshToken); err != nil {
		return nil, err
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

func (u *authUsecase) Refresh(ctx context.Context, refreshToken string) (*token.TokenPair, error) {
	claims, err := u.tokens.Verify(refreshToken)
	if err != nil {
		return nil, domainerrors.ErrInvalidToken
	}
	if claims.TokenType != "refresh" {
		return nil, domainerrors.ErrInvalidToken
	}

	session, err := u.refresh.GetByJTI(ctx, claims.ID)
	if err != nil {
		return nil, err
	}
	if session.RevokedAt != nil || time.Now().After(session.ExpiresAt) {
		return nil, domainerrors.ErrInvalidToken
	}
	if hashToken(refreshToken) != session.TokenHash {
		return nil, domainerrors.ErrInvalidToken
	}

	newTokens, err := u.tokens.Generate(claims.UserID, claims.OrganizationID, claims.Role)
	if err != nil {
		return nil, domainerrors.Internal("generate tokens", err)
	}

	if err := u.refresh.RevokeByJTI(ctx, claims.ID); err != nil {
		return nil, err
	}
	if err := u.persistRefreshSession(ctx, newTokens.RefreshToken); err != nil {
		return nil, err
	}

	return newTokens, nil
}

func (u *authUsecase) Logout(ctx context.Context, userID uuid.UUID) error {
	if u.refresh == nil {
		return nil
	}
	return u.refresh.RevokeByUser(ctx, userID)
}

func (u *authUsecase) persistRefreshSession(ctx context.Context, refreshToken string) error {
	if u.refresh == nil {
		return nil
	}
	claims, err := u.tokens.Verify(refreshToken)
	if err != nil {
		return domainerrors.Internal("verify refresh token", err)
	}
	session := &entity.RefreshSession{
		ID:             uuid.New(),
		UserID:         claims.UserID,
		OrganizationID: claims.OrganizationID,
		Role:           claims.Role,
		TokenHash:      hashToken(refreshToken),
		JTI:            claims.ID,
		ExpiresAt:      claims.ExpiresAt.Time,
	}
	if err := u.refresh.Create(ctx, session); err != nil {
		return err
	}
	return nil
}

func hashToken(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}

// dummyPasswordHash is a precomputed bcrypt hash used to make failed lookups
// take roughly the same wall-clock time as a real password mismatch. It is
// never compared against a real user; the value of the plaintext does not
// matter, only that bcrypt.CompareHashAndPassword runs through its work
// factor. The cost matches the default used by NewBcryptHasher so the timing
// envelope stays comparable as cost is tuned.
//
// Generated once at package init from the constant string "timing-equalizer"
// at bcrypt.DefaultCost. Regenerated lazily if for some reason it is empty.
const dummyPasswordHash = "$2a$10$N9qo8uLOickgx2ZMRZoMye7p.LP1g1q0QMRq4Q/p6EwoTM6E7Yx7e"

// isCredentialMissError reports whether an error from the user lookup path
// should be flattened into ErrInvalidCredentials. Any "user not found" shape
// (sentinel, NotFound DomainError, or already-normalized credential error)
// must be hidden from the client to prevent email enumeration; everything
// else is a real backend failure and must surface unchanged.
func isCredentialMissError(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, domainerrors.ErrUserNotFound) ||
		errors.Is(err, domainerrors.ErrInvalidCredentials) {
		return true
	}
	if de, ok := domainerrors.As(err); ok && de.Code == domainerrors.CodeNotFound {
		return true
	}
	return false
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
