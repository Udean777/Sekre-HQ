package testhttp

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/pkg/token"
)

// AuthOpts configures the authenticated request.
type AuthOpts struct {
	UserID    uuid.UUID
	OrgID     uuid.UUID
	Role      types.Role
	ExpiresIn time.Duration // default 1h
}

// AuthedRequest creates an HTTP request with a valid JWT token attached.
// This is useful for testing handlers that require authentication.
func AuthedRequest(t *testing.T, method, url string, body io.Reader, opts AuthOpts) *http.Request {
	t.Helper()

	if opts.ExpiresIn == 0 {
		opts.ExpiresIn = time.Hour
	}

	// Use a fixed test secret
	tokenManager := token.NewManager("test-secret-key-32-bytes-long!!", 1, 24)

	tokenPair, err := tokenManager.GenerateTokenPair(opts.UserID, opts.OrgID, opts.Role)
	require.NoError(t, err, "failed to generate test token")

	req := httptest.NewRequest(method, url, body)
	req.Header.Set("Authorization", "Bearer "+tokenPair.AccessToken)

	return req
}

// AuthedRequestWithToken creates an HTTP request with a custom token string.
// Useful for testing invalid token scenarios.
func AuthedRequestWithToken(method, url string, body io.Reader, tokenString string) *http.Request {
	req := httptest.NewRequest(method, url, body)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	return req
}
