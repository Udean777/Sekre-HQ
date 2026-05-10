package usecase

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/auth/repository"
	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/pkg/token"
	"golang.org/x/crypto/bcrypt"
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
	User         domain.User         `json:"user"`
	Organization domain.Organization `json:"organization"`
	Role         string              `json:"role"`
	Tokens       token.TokenPair     `json:"tokens"`
}

type AuthUsecase interface {
	Register(ctx context.Context, req *RegisterRequest) (*AuthResponse, error)
	Login(ctx context.Context, req *LoginRequest) (*AuthResponse, error)
	GetMe(ctx context.Context, userID uuid.UUID) (*domain.UserWithOrganization, error)
}

type authUsecase struct {
	repo         repository.AuthRepository
	tokenManager *token.Manager
}

func NewAuthUsecase(repo repository.AuthRepository, tokenManager *token.Manager) AuthUsecase {
	return &authUsecase{
		repo:         repo,
		tokenManager: tokenManager,
	}
}

func (u *authUsecase) Register(ctx context.Context, req *RegisterRequest) (*AuthResponse, error) {
	// Validate input
	if err := u.validateRegisterRequest(req); err != nil {
		return nil, err
	}

	// Check if subdomain already exists
	exists, err := u.repo.CheckSubdomainExists(ctx, req.Subdomain)
	if err != nil {
		return nil, fmt.Errorf("failed to check subdomain: %w", err)
	}
	if exists {
		return nil, domain.ErrSubdomainTaken
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create organization
	org := &domain.Organization{
		ID:               uuid.New(),
		Name:             req.OrganizationName,
		Subdomain:        strings.ToLower(req.Subdomain),
		SubscriptionPlan: "FREE",
	}
	if err := u.repo.CreateOrganization(ctx, org); err != nil {
		return nil, fmt.Errorf("failed to create organization: %w", err)
	}

	// Create user
	user := &domain.User{
		ID:           uuid.New(),
		Email:        strings.ToLower(req.Email),
		PasswordHash: string(hashedPassword),
		FullName:     req.FullName,
	}
	if err := u.repo.CreateUser(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Create user-organization relationship (as OWNER)
	userOrg := &domain.UserOrganization{
		ID:             uuid.New(),
		UserID:         user.ID,
		OrganizationID: org.ID,
		Role:           "OWNER",
	}
	if err := u.repo.CreateUserOrganization(ctx, userOrg); err != nil {
		return nil, fmt.Errorf("failed to create user organization: %w", err)
	}

	// Generate tokens
	tokens, err := u.tokenManager.GenerateTokenPair(user.ID, org.ID, "OWNER")
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &AuthResponse{
		User:         *user,
		Organization: *org,
		Role:         "OWNER",
		Tokens:       *tokens,
	}, nil
}

func (u *authUsecase) Login(ctx context.Context, req *LoginRequest) (*AuthResponse, error) {
	// Validate input
	if req.Email == "" || req.Password == "" {
		return nil, domain.ErrInvalidInput
	}

	// Get user by email
	user, err := u.repo.GetUserByEmail(ctx, strings.ToLower(req.Email))
	if err != nil {
		return nil, err
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	// Get user's organization
	userWithOrg, err := u.repo.GetUserWithOrganization(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user organization: %w", err)
	}

	// Generate tokens
	tokens, err := u.tokenManager.GenerateTokenPair(user.ID, userWithOrg.Organization.ID, userWithOrg.Role)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &AuthResponse{
		User:         userWithOrg.User,
		Organization: userWithOrg.Organization,
		Role:         userWithOrg.Role,
		Tokens:       *tokens,
	}, nil
}

func (u *authUsecase) GetMe(ctx context.Context, userID uuid.UUID) (*domain.UserWithOrganization, error) {
	return u.repo.GetUserWithOrganization(ctx, userID)
}

func (u *authUsecase) validateRegisterRequest(req *RegisterRequest) error {
	if req.OrganizationName == "" {
		return fmt.Errorf("organization name is required")
	}
	if req.Subdomain == "" {
		return fmt.Errorf("subdomain is required")
	}
	if req.FullName == "" {
		return fmt.Errorf("full name is required")
	}
	if req.Email == "" {
		return fmt.Errorf("email is required")
	}
	if req.Password == "" {
		return fmt.Errorf("password is required")
	}

	// Validate subdomain format (alphanumeric and hyphens only)
	subdomainRegex := regexp.MustCompile(`^[a-z0-9-]+$`)
	if !subdomainRegex.MatchString(strings.ToLower(req.Subdomain)) {
		return fmt.Errorf("subdomain can only contain lowercase letters, numbers, and hyphens")
	}

	// Validate email format
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(req.Email) {
		return fmt.Errorf("invalid email format")
	}

	// Validate password length
	if len(req.Password) < 8 {
		return fmt.Errorf("password must be at least 8 characters")
	}

	return nil
}
