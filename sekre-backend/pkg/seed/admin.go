// Package seed provides startup-time bootstrap helpers, like creating a
// default admin user when one does not exist yet.
//
// This is intentionally separate from the dbctl seeder package: the dbctl
// seeders are heavy demo data fixtures meant to be invoked manually. The
// helpers here are minimal, idempotent, and safe to run on every server
// boot — useful for platforms like Render where there is no separate job
// runner to invoke a "create first admin" script.
package seed

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/service"
	"github.com/username/sekre-backend/internal/domain/types"
	sharedrepo "github.com/username/sekre-backend/internal/repository"
)

// AdminConfig captures the bootstrap admin credentials and organization
// identity. All fields are required; callers should source them from
// environment variables or hardcoded defaults.
type AdminConfig struct {
	Email            string
	Password         string
	FullName         string
	OrganizationName string
	Subdomain        string
}

// EnsureAdmin creates a default admin user + organization if and only if
// the email does not already exist. Returns nil when:
//   - The admin user already exists (idempotent no-op).
//   - The admin user was successfully created.
//
// Any other error (DB failure, hashing failure) is returned wrapped.
//
// Behavior:
//   - Email is lowercased.
//   - Password is hashed with the provided hasher (same one used by the
//     auth flow, so login will work without further wiring).
//   - The admin is granted the OWNER role on the new organization.
//   - All persistence happens inside a single transaction; partial state
//     is impossible.
func EnsureAdmin(
	ctx context.Context,
	cfg AdminConfig,
	users repository.UserRepository,
	orgs repository.OrganizationRepository,
	userOrgs repository.UserOrganizationRepository,
	tx sharedrepo.TxRunner,
	hasher service.PasswordHasher,
) error {
	if err := cfg.validate(); err != nil {
		return err
	}

	email := strings.ToLower(strings.TrimSpace(cfg.Email))

	// Fast path: user already exists. Treat any not-found shape as a signal
	// to proceed; everything else is a real error.
	if _, err := users.GetByEmail(ctx, email); err == nil {
		return nil
	} else if !isNotFound(err) {
		return fmt.Errorf("check admin existence: %w", err)
	}

	hashed, err := hasher.Hash(cfg.Password)
	if err != nil {
		return fmt.Errorf("hash admin password: %w", err)
	}

	subdomain := strings.ToLower(strings.TrimSpace(cfg.Subdomain))

	return tx.WithTransaction(ctx, func(txCtx context.Context) error {
		now := time.Now()

		org := &entity.Organization{
			ID:               uuid.New(),
			Name:             cfg.OrganizationName,
			Subdomain:        subdomain,
			SubscriptionPlan: types.SubscriptionPlanFree,
			CreatedAt:        now,
			UpdatedAt:        now,
		}
		if err := orgs.Create(txCtx, org); err != nil {
			return fmt.Errorf("create admin organization: %w", err)
		}

		user := &entity.User{
			ID:           uuid.New(),
			Email:        email,
			PasswordHash: hashed,
			FullName:     cfg.FullName,
			CreatedAt:    now,
			UpdatedAt:    now,
		}
		if err := users.Create(txCtx, user); err != nil {
			return fmt.Errorf("create admin user: %w", err)
		}

		userOrg := &entity.UserOrganization{
			ID:             uuid.New(),
			UserID:         user.ID,
			OrganizationID: org.ID,
			Role:           types.RoleOwner,
			CreatedAt:      now,
		}
		if err := userOrgs.Create(txCtx, userOrg); err != nil {
			return fmt.Errorf("link admin to organization: %w", err)
		}

		return nil
	})
}

func (c AdminConfig) validate() error {
	if strings.TrimSpace(c.Email) == "" {
		return errors.New("admin email is required")
	}
	if c.Password == "" {
		return errors.New("admin password is required")
	}
	if strings.TrimSpace(c.FullName) == "" {
		return errors.New("admin full name is required")
	}
	if strings.TrimSpace(c.OrganizationName) == "" {
		return errors.New("admin organization name is required")
	}
	if strings.TrimSpace(c.Subdomain) == "" {
		return errors.New("admin subdomain is required")
	}
	return nil
}

// isNotFound mirrors the auth usecase's credential-miss detection: any
// "user not found" shape (sentinel or NotFound DomainError) means the
// admin doesn't exist yet, so we should proceed with creation.
func isNotFound(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, domainerrors.ErrUserNotFound) {
		return true
	}
	if de, ok := domainerrors.As(err); ok && de.Code == domainerrors.CodeNotFound {
		return true
	}
	return false
}
