// Package e2e provides end-to-end tests for the API.
//
//go:build e2e

package e2e

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gorilla/mux"
	"github.com/stretchr/testify/require"
	authApp "github.com/username/sekre-backend/internal/application/auth"
	"github.com/username/sekre-backend/internal/delivery/http/handler"
	"github.com/username/sekre-backend/internal/delivery/http/middleware"
	"github.com/username/sekre-backend/internal/infrastructure/auth"
	gormRepo "github.com/username/sekre-backend/internal/infrastructure/persistence/gorm/repository"
	sharedRepo "github.com/username/sekre-backend/internal/repository"
	testdb "github.com/username/sekre-backend/internal/test/db"
	"github.com/username/sekre-backend/pkg/token"
	"gorm.io/gorm"
)

// TestServer wraps a test HTTP server with database and auth setup.
type TestServer struct {
	*httptest.Server
	DB           *gorm.DB
	TokenManager *token.Manager
	t            *testing.T
}

// SetupTestServer creates a fully wired test server with database and routes.
func SetupTestServer(t *testing.T) *TestServer {
	t.Helper()

	// Setup database
	db := testdb.Shared(t)

	// Setup token manager (1h access, 24h refresh)
	tokenManager := token.NewManager(
		"test-secret-key-for-e2e-testing-purposes-only",
		3600000000000,    // 1h
		86400000000000,   // 24h
	)

	// Setup repositories
	userRepo := gormRepo.NewUserRepository(db)
	orgRepo := gormRepo.NewOrganizationRepository(db)
	userOrgRepo := gormRepo.NewUserOrganizationRepository(db)
	txRunner := sharedRepo.NewTxRunner(db)

	// Setup auth services
	hasher := auth.NewBcryptHasher(4) // Lower cost for tests
	tokenGen := auth.NewJWTTokenGenerator(tokenManager)
	validator := auth.NewRegistrationValidator()

	// Setup usecase
	authUsecase := authApp.NewAuthUsecase(
		userRepo, orgRepo, userOrgRepo, txRunner,
		hasher, tokenGen, validator,
	)

	// Setup router
	router := mux.NewRouter()
	router.Use(middleware.RequestID)
	router.Use(middleware.Timeout(30 * time.Second))

	// Setup handlers
	authHandler := handler.NewAuthHandler(authUsecase, tokenManager)
	authHandler.RegisterRoutes(router)

	// Create test server
	server := httptest.NewServer(router)

	t.Cleanup(func() {
		server.Close()
	})

	return &TestServer{
		Server:       server,
		DB:           db,
		TokenManager: tokenManager,
		t:            t,
	}
}

// POST sends a POST request to the test server.
func (s *TestServer) POST(path string, body interface{}, headers map[string]string) *http.Response {
	s.t.Helper()
	return s.request(http.MethodPost, path, body, headers)
}

// GET sends a GET request to the test server.
func (s *TestServer) GET(path string, headers map[string]string) *http.Response {
	s.t.Helper()
	return s.request(http.MethodGet, path, nil, headers)
}

// PUT sends a PUT request to the test server.
func (s *TestServer) PUT(path string, body interface{}, headers map[string]string) *http.Response {
	s.t.Helper()
	return s.request(http.MethodPut, path, body, headers)
}

// DELETE sends a DELETE request to the test server.
func (s *TestServer) DELETE(path string, headers map[string]string) *http.Response {
	s.t.Helper()
	return s.request(http.MethodDelete, path, nil, headers)
}

func (s *TestServer) request(method, path string, body interface{}, headers map[string]string) *http.Response {
	s.t.Helper()

	var reqBody io.Reader
	if body != nil {
		bodyBytes, err := json.Marshal(body)
		require.NoError(s.t, err)
		reqBody = bytes.NewReader(bodyBytes)
	}

	url := s.URL + path
	req, err := http.NewRequestWithContext(context.Background(), method, url, reqBody)
	require.NoError(s.t, err)

	req.Header.Set("Content-Type", "application/json")
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	resp, err := http.DefaultClient.Do(req)
	require.NoError(s.t, err)

	return resp
}

// AuthHeader creates an Authorization header for the given token.
func AuthHeader(accessToken string) map[string]string {
	return map[string]string{
		"Authorization": fmt.Sprintf("Bearer %s", accessToken),
	}
}

// DecodeResponse decodes the response body into the given target.
func DecodeResponse(t *testing.T, resp *http.Response, target interface{}) {
	t.Helper()
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	require.NoError(t, err)

	if len(body) > 0 {
		err = json.Unmarshal(body, target)
		require.NoError(t, err, "failed to decode response: %s", string(body))
	}
}

// APIResponse represents the standard API response format.
type APIResponse struct {
	Success bool                   `json:"success"`
	Message string                 `json:"message"`
	Data    map[string]interface{} `json:"data,omitempty"`
	Error   string                 `json:"error,omitempty"`
	Code    string                 `json:"code,omitempty"`
}
