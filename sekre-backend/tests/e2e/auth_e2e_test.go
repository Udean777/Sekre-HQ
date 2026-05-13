//go:build e2e

package e2e_test

import (
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	authApp "github.com/username/sekre-backend/internal/application/auth"
	"github.com/username/sekre-backend/tests/e2e"
)

// TestE2E_RegisterAndLogin tests the full register -> login flow.
func TestE2E_RegisterAndLogin(t *testing.T) {
	srv := e2e.SetupTestServer(t)

	// Step 1: Register new organization
	registerReq := authApp.RegisterRequest{
		OrganizationName: "E2E Test Org",
		Subdomain:        fmt.Sprintf("e2e-%d", time.Now().UnixNano()),
		FullName:         "E2E Test User",
		Email:            fmt.Sprintf("e2e-%d@test.com", time.Now().UnixNano()),
		Password:         "SecurePass123!",
	}

	resp := srv.POST("/auth/register", registerReq, nil)
	require.Equal(t, http.StatusCreated, resp.StatusCode, "register should succeed")

	var registerResp e2e.APIResponse
	e2e.DecodeResponse(t, resp, &registerResp)
	assert.True(t, registerResp.Success)
	assert.Contains(t, registerResp.Message, "registered successfully")

	// Step 2: Login with registered credentials
	loginReq := authApp.LoginRequest{
		Email:    registerReq.Email,
		Password: registerReq.Password,
	}

	resp = srv.POST("/auth/login", loginReq, nil)
	require.Equal(t, http.StatusOK, resp.StatusCode, "login should succeed")

	var loginResp e2e.APIResponse
	e2e.DecodeResponse(t, resp, &loginResp)
	assert.True(t, loginResp.Success)
	assert.NotNil(t, loginResp.Data)

	// Extract token from response
	tokens, ok := loginResp.Data["tokens"].(map[string]interface{})
	require.True(t, ok, "response should have tokens")

	accessToken, ok := tokens["access_token"].(string)
	require.True(t, ok, "tokens should have access_token")
	require.NotEmpty(t, accessToken)

	// Step 3: Get authenticated user profile
	resp = srv.GET("/auth/me", e2e.AuthHeader(accessToken))
	require.Equal(t, http.StatusOK, resp.StatusCode, "get me should succeed")

	var meResp e2e.APIResponse
	e2e.DecodeResponse(t, resp, &meResp)
	assert.True(t, meResp.Success)
	assert.NotNil(t, meResp.Data)
}

// TestE2E_Login_InvalidCredentials tests login with wrong password.
func TestE2E_Login_InvalidCredentials(t *testing.T) {
	srv := e2e.SetupTestServer(t)

	// Register first
	uniqueID := time.Now().UnixNano()
	registerReq := authApp.RegisterRequest{
		OrganizationName: "Test Org",
		Subdomain:        fmt.Sprintf("e2e-inv-%d", uniqueID),
		FullName:         "Test User",
		Email:            fmt.Sprintf("e2e-inv-%d@test.com", uniqueID),
		Password:         "CorrectPass123!",
	}
	resp := srv.POST("/auth/register", registerReq, nil)
	require.Equal(t, http.StatusCreated, resp.StatusCode)

	// Attempt login with wrong password
	loginReq := authApp.LoginRequest{
		Email:    registerReq.Email,
		Password: "WrongPassword123!",
	}

	resp = srv.POST("/auth/login", loginReq, nil)

	// Assert
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

// TestE2E_Register_DuplicateSubdomain tests that duplicate subdomains are rejected.
func TestE2E_Register_DuplicateSubdomain(t *testing.T) {
	srv := e2e.SetupTestServer(t)

	subdomain := fmt.Sprintf("e2e-dup-%d", time.Now().UnixNano())

	// First registration - should succeed
	firstReq := authApp.RegisterRequest{
		OrganizationName: "First Org",
		Subdomain:        subdomain,
		FullName:         "User One",
		Email:            fmt.Sprintf("first-%d@test.com", time.Now().UnixNano()),
		Password:         "Password123!",
	}
	resp := srv.POST("/auth/register", firstReq, nil)
	require.Equal(t, http.StatusCreated, resp.StatusCode)

	// Second registration with same subdomain - should fail
	secondReq := authApp.RegisterRequest{
		OrganizationName: "Second Org",
		Subdomain:        subdomain, // Same subdomain
		FullName:         "User Two",
		Email:            fmt.Sprintf("second-%d@test.com", time.Now().UnixNano()+1),
		Password:         "Password123!",
	}
	resp = srv.POST("/auth/register", secondReq, nil)

	// Assert - should return 409 Conflict
	assert.Equal(t, http.StatusConflict, resp.StatusCode)
}

// TestE2E_UnauthorizedAccess tests that protected routes require authentication.
func TestE2E_UnauthorizedAccess(t *testing.T) {
	srv := e2e.SetupTestServer(t)

	// Access /me without token
	resp := srv.GET("/auth/me", nil)

	// Assert
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

// TestE2E_InvalidToken tests that invalid tokens are rejected.
func TestE2E_InvalidToken(t *testing.T) {
	srv := e2e.SetupTestServer(t)

	// Access with invalid token
	resp := srv.GET("/auth/me", e2e.AuthHeader("invalid.token.here"))

	// Assert
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}
