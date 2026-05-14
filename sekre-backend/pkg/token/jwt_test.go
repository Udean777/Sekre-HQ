package token_test

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/pkg/token"
)

func TestNewManager(t *testing.T) {
	t.Parallel()

	secret := "test-secret-key-minimum-32-chars-long"
	accessTTL := 15 * time.Minute
	refreshTTL := 7 * 24 * time.Hour

	manager := token.NewManager(secret, accessTTL, refreshTTL)

	if manager == nil {
		t.Fatal("expected manager to be non-nil")
	}
}

func TestGenerateTokenPair_Success(t *testing.T) {
	t.Parallel()

	manager := token.NewManager("test-secret-key-minimum-32-chars-long", 15*time.Minute, 7*24*time.Hour)
	userID := uuid.New()
	orgID := uuid.New()
	role := types.RoleAdmin

	pair, err := manager.GenerateTokenPair(userID, orgID, role)

	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if pair == nil {
		t.Fatal("expected token pair to be non-nil")
	}

	if pair.AccessToken == "" {
		t.Error("expected access token to be non-empty")
	}

	if pair.RefreshToken == "" {
		t.Error("expected refresh token to be non-empty")
	}

	if pair.AccessToken == pair.RefreshToken {
		t.Error("expected access and refresh tokens to be different")
	}
}

func TestGenerateTokenPair_InvalidRole(t *testing.T) {
	t.Parallel()

	manager := token.NewManager("test-secret-key-minimum-32-chars-long", 15*time.Minute, 7*24*time.Hour)
	userID := uuid.New()
	orgID := uuid.New()
	invalidRole := types.Role("INVALID")

	pair, err := manager.GenerateTokenPair(userID, orgID, invalidRole)

	if err == nil {
		t.Fatal("expected error for invalid role, got nil")
	}

	if pair != nil {
		t.Error("expected token pair to be nil on error")
	}
}

func TestValidateToken_Success(t *testing.T) {
	t.Parallel()

	manager := token.NewManager("test-secret-key-minimum-32-chars-long", 15*time.Minute, 7*24*time.Hour)
	userID := uuid.New()
	orgID := uuid.New()
	role := types.RoleMember

	pair, err := manager.GenerateTokenPair(userID, orgID, role)
	if err != nil {
		t.Fatalf("failed to generate token pair: %v", err)
	}

	claims, err := manager.ValidateToken(pair.AccessToken)

	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if claims == nil {
		t.Fatal("expected claims to be non-nil")
	}

	if claims.UserID != userID {
		t.Errorf("expected user ID %v, got %v", userID, claims.UserID)
	}

	if claims.OrganizationID != orgID {
		t.Errorf("expected org ID %v, got %v", orgID, claims.OrganizationID)
	}

	if claims.Role != role {
		t.Errorf("expected role %v, got %v", role, claims.Role)
	}
}

func TestValidateToken_InvalidToken(t *testing.T) {
	t.Parallel()

	manager := token.NewManager("test-secret-key-minimum-32-chars-long", 15*time.Minute, 7*24*time.Hour)

	tests := []struct {
		name  string
		token string
	}{
		{
			name:  "empty token",
			token: "",
		},
		{
			name:  "malformed token",
			token: "not.a.valid.jwt",
		},
		{
			name:  "random string",
			token: "random-string-not-jwt",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			claims, err := manager.ValidateToken(tt.token)

			if err == nil {
				t.Error("expected error for invalid token, got nil")
			}

			if claims != nil {
				t.Error("expected claims to be nil on error")
			}
		})
	}
}

func TestValidateToken_WrongSecret(t *testing.T) {
	t.Parallel()

	manager1 := token.NewManager("secret-key-one-minimum-32-chars-long", 15*time.Minute, 7*24*time.Hour)
	manager2 := token.NewManager("secret-key-two-minimum-32-chars-long", 15*time.Minute, 7*24*time.Hour)

	userID := uuid.New()
	orgID := uuid.New()
	role := types.RoleOwner

	pair, err := manager1.GenerateTokenPair(userID, orgID, role)
	if err != nil {
		t.Fatalf("failed to generate token pair: %v", err)
	}

	claims, err := manager2.ValidateToken(pair.AccessToken)

	if err == nil {
		t.Error("expected error when validating with wrong secret, got nil")
	}

	if claims != nil {
		t.Error("expected claims to be nil when secret mismatch")
	}
}

func TestValidateToken_ExpiredToken(t *testing.T) {
	t.Parallel()

	// Create manager with very short TTL
	manager := token.NewManager("test-secret-key-minimum-32-chars-long", 1*time.Millisecond, 1*time.Millisecond)

	userID := uuid.New()
	orgID := uuid.New()
	role := types.RoleAdmin

	pair, err := manager.GenerateTokenPair(userID, orgID, role)
	if err != nil {
		t.Fatalf("failed to generate token pair: %v", err)
	}

	// Wait for token to expire
	time.Sleep(10 * time.Millisecond)

	claims, err := manager.ValidateToken(pair.AccessToken)

	if err == nil {
		t.Error("expected error for expired token, got nil")
	}

	if claims != nil {
		t.Error("expected claims to be nil for expired token")
	}
}

func TestTokenPair_DifferentExpirations(t *testing.T) {
	t.Parallel()

	accessTTL := 15 * time.Minute
	refreshTTL := 7 * 24 * time.Hour
	manager := token.NewManager("test-secret-key-minimum-32-chars-long", accessTTL, refreshTTL)

	userID := uuid.New()
	orgID := uuid.New()
	role := types.RoleAdmin

	pair, err := manager.GenerateTokenPair(userID, orgID, role)
	if err != nil {
		t.Fatalf("failed to generate token pair: %v", err)
	}

	accessClaims, err := manager.ValidateToken(pair.AccessToken)
	if err != nil {
		t.Fatalf("failed to validate access token: %v", err)
	}

	refreshClaims, err := manager.ValidateToken(pair.RefreshToken)
	if err != nil {
		t.Fatalf("failed to validate refresh token: %v", err)
	}

	// Refresh token should expire later than access token
	if !refreshClaims.ExpiresAt.After(accessClaims.ExpiresAt.Time) {
		t.Error("expected refresh token to expire after access token")
	}
}

func TestValidateToken_AllRoles(t *testing.T) {
	t.Parallel()

	manager := token.NewManager("test-secret-key-minimum-32-chars-long", 15*time.Minute, 7*24*time.Hour)
	userID := uuid.New()
	orgID := uuid.New()

	roles := []types.Role{types.RoleOwner, types.RoleAdmin, types.RoleMember}

	for _, role := range roles {
		t.Run(string(role), func(t *testing.T) {
			pair, err := manager.GenerateTokenPair(userID, orgID, role)
			if err != nil {
				t.Fatalf("failed to generate token for role %s: %v", role, err)
			}

			claims, err := manager.ValidateToken(pair.AccessToken)
			if err != nil {
				t.Fatalf("failed to validate token for role %s: %v", role, err)
			}

			if claims.Role != role {
				t.Errorf("expected role %s, got %s", role, claims.Role)
			}
		})
	}
}
