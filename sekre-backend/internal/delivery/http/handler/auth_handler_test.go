package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/username/sekre-backend/internal/application/auth"
	"github.com/username/sekre-backend/internal/delivery/http/handler"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/middleware"
	"github.com/username/sekre-backend/internal/test/usecasemocks"
	"github.com/username/sekre-backend/pkg/token"
)

// Helper to decode response body
func decodeResponse(t *testing.T, w *httptest.ResponseRecorder) map[string]interface{} {
	t.Helper()
	var body map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &body)
	require.NoError(t, err)
	return body
}

func TestAuthHandler_Register_Success(t *testing.T) {
	t.Parallel()

	// Setup
	mockUsecase := usecasemocks.NewAuthUsecase(t)
	tokenManager := token.NewManager("test-secret-key-for-testing-purposes-only", 3600000000000, 86400000000000)
	h := handler.NewAuthHandler(mockUsecase, tokenManager)

	// Prepare request
	reqBody := auth.RegisterRequest{
		OrganizationName: "Test Org",
		Subdomain:        "testorg",
		FullName:         "John Doe",
		Email:            "john@example.com",
		Password:         "SecurePass123!",
	}
	bodyBytes, _ := json.Marshal(reqBody)

	expectedResponse := &auth.AuthResponse{
		User: entity.User{
			ID:    uuid.New(),
			Email: reqBody.Email,
		},
		Organization: entity.Organization{
			ID:   uuid.New(),
			Name: reqBody.OrganizationName,
		},
		Role: types.RoleOwner,
		Tokens: token.TokenPair{
			AccessToken:  "access_token",
			RefreshToken: "refresh_token",
		},
	}

	mockUsecase.EXPECT().
		Register(mock.Anything, mock.MatchedBy(func(req *auth.RegisterRequest) bool {
			return req.Email == reqBody.Email &&
				req.OrganizationName == reqBody.OrganizationName
		})).
		Return(expectedResponse, nil).
		Once()

	// Execute
	req := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.Register(w, req)

	// Assert
	assert.Equal(t, http.StatusCreated, w.Code)
	body := decodeResponse(t, w)
	assert.Equal(t, true, body["success"])
	assert.Contains(t, body["message"], "organization registered successfully")
}

func TestAuthHandler_Register_InvalidBody(t *testing.T) {
	t.Parallel()

	// Setup
	mockUsecase := usecasemocks.NewAuthUsecase(t)
	tokenManager := token.NewManager("test-secret-key-for-testing-purposes-only", 3600000000000, 86400000000000)
	h := handler.NewAuthHandler(mockUsecase, tokenManager)

	// Invalid JSON
	req := httptest.NewRequest(http.MethodPost, "/auth/register", strings.NewReader("{invalid json"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	// Execute
	h.Register(w, req)

	// Assert
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAuthHandler_Register_UsecaseError(t *testing.T) {
	t.Parallel()

	// Setup
	mockUsecase := usecasemocks.NewAuthUsecase(t)
	tokenManager := token.NewManager("test-secret-key-for-testing-purposes-only", 3600000000000, 86400000000000)
	h := handler.NewAuthHandler(mockUsecase, tokenManager)

	// Valid request body that passes validation but usecase rejects (subdomain taken)
	reqBody := auth.RegisterRequest{
		OrganizationName: "Test Org",
		Subdomain:        "taken-subdomain",
		FullName:         "John Doe",
		Email:            "john@example.com",
		Password:         "SecurePass123!",
	}
	bodyBytes, _ := json.Marshal(reqBody)

	mockUsecase.EXPECT().
		Register(mock.Anything, mock.Anything).
		Return(nil, domainerrors.ErrSubdomainTaken).
		Once()

	req := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	// Execute
	h.Register(w, req)

	// Assert - should return 409 Conflict
	assert.Equal(t, http.StatusConflict, w.Code)
}

func TestAuthHandler_Login_Success(t *testing.T) {
	t.Parallel()

	// Setup
	mockUsecase := usecasemocks.NewAuthUsecase(t)
	tokenManager := token.NewManager("test-secret-key-for-testing-purposes-only", 3600000000000, 86400000000000)
	h := handler.NewAuthHandler(mockUsecase, tokenManager)

	reqBody := auth.LoginRequest{
		Email:    "john@example.com",
		Password: "password123",
	}
	bodyBytes, _ := json.Marshal(reqBody)

	expectedResponse := &auth.AuthResponse{
		User: entity.User{
			ID:    uuid.New(),
			Email: reqBody.Email,
		},
		Tokens: token.TokenPair{
			AccessToken:  "access_token",
			RefreshToken: "refresh_token",
		},
	}

	mockUsecase.EXPECT().
		Login(mock.Anything, mock.MatchedBy(func(req *auth.LoginRequest) bool {
			return req.Email == reqBody.Email
		})).
		Return(expectedResponse, nil).
		Once()

	req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	// Execute
	h.Login(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)
	body := decodeResponse(t, w)
	assert.Equal(t, true, body["success"])
}

func TestAuthHandler_Login_InvalidCredentials(t *testing.T) {
	t.Parallel()

	// Setup
	mockUsecase := usecasemocks.NewAuthUsecase(t)
	tokenManager := token.NewManager("test-secret-key-for-testing-purposes-only", 3600000000000, 86400000000000)
	h := handler.NewAuthHandler(mockUsecase, tokenManager)

	reqBody := auth.LoginRequest{
		Email:    "wrong@example.com",
		Password: "wrongpass",
	}
	bodyBytes, _ := json.Marshal(reqBody)

	mockUsecase.EXPECT().
		Login(mock.Anything, mock.Anything).
		Return(nil, domainerrors.ErrInvalidCredentials).
		Once()

	req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	// Execute
	h.Login(w, req)

	// Assert - should return 401 Unauthorized
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuthHandler_GetMe_Success(t *testing.T) {
	t.Parallel()

	// Setup
	mockUsecase := usecasemocks.NewAuthUsecase(t)
	tokenManager := token.NewManager("test-secret-key-for-testing-purposes-only", 3600000000000, 86400000000000)
	h := handler.NewAuthHandler(mockUsecase, tokenManager)

	userID := uuid.New()
	expectedResponse := &entity.UserWithOrganization{
		User: entity.User{
			ID:    userID,
			Email: "user@example.com",
		},
		Organization: entity.Organization{
			ID:   uuid.New(),
			Name: "Test Org",
		},
		Role: types.RoleOwner,
	}

	mockUsecase.EXPECT().
		GetMe(mock.Anything, userID).
		Return(expectedResponse, nil).
		Once()

	// Create request with user context
	req := httptest.NewRequest(http.MethodGet, "/auth/me", nil)
	ctx := context.WithValue(req.Context(), middleware.UserIDKey, userID)
	req = req.WithContext(ctx)
	w := httptest.NewRecorder()

	// Execute
	h.GetMe(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)
	body := decodeResponse(t, w)
	assert.Equal(t, true, body["success"])
}

func TestAuthHandler_GetMe_NoUserContext(t *testing.T) {
	t.Parallel()

	// Setup
	mockUsecase := usecasemocks.NewAuthUsecase(t)
	tokenManager := token.NewManager("test-secret-key-for-testing-purposes-only", 3600000000000, 86400000000000)
	h := handler.NewAuthHandler(mockUsecase, tokenManager)

	// Create request WITHOUT user context
	req := httptest.NewRequest(http.MethodGet, "/auth/me", nil)
	w := httptest.NewRecorder()

	// Execute
	h.GetMe(w, req)

	// Assert - should return 401
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuthHandler_GetMe_UsecaseError(t *testing.T) {
	t.Parallel()

	// Setup
	mockUsecase := usecasemocks.NewAuthUsecase(t)
	tokenManager := token.NewManager("test-secret-key-for-testing-purposes-only", 3600000000000, 86400000000000)
	h := handler.NewAuthHandler(mockUsecase, tokenManager)

	userID := uuid.New()

	mockUsecase.EXPECT().
		GetMe(mock.Anything, userID).
		Return(nil, errors.New("database error")).
		Once()

	req := httptest.NewRequest(http.MethodGet, "/auth/me", nil)
	ctx := context.WithValue(req.Context(), middleware.UserIDKey, userID)
	req = req.WithContext(ctx)
	w := httptest.NewRecorder()

	// Execute
	h.GetMe(w, req)

	// Assert
	assert.Equal(t, http.StatusInternalServerError, w.Code)
}
