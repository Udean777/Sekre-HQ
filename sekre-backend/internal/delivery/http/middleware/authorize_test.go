package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/username/sekre-backend/internal/domain/types"
)

func TestRequireRole_Allowed(t *testing.T) {
	t.Parallel()

	nextCalled := false
	handler := RequireRole(types.RoleOwner, types.RoleAdmin)(
		http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			nextCalled = true
			w.WriteHeader(http.StatusOK)
		}),
	)

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	ctx := context.WithValue(req.Context(), RoleKey, types.RoleAdmin)
	req = req.WithContext(ctx)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if !nextCalled {
		t.Error("next handler should be called for allowed role")
	}
	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}
}

func TestRequireRole_Denied(t *testing.T) {
	t.Parallel()

	nextCalled := false
	handler := RequireRole(types.RoleOwner, types.RoleAdmin)(
		http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			nextCalled = true
			w.WriteHeader(http.StatusOK)
		}),
	)

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	ctx := context.WithValue(req.Context(), RoleKey, types.RoleMember)
	req = req.WithContext(ctx)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if nextCalled {
		t.Error("next handler should NOT be called for denied role")
	}
	if w.Code != http.StatusForbidden {
		t.Errorf("status = %d, want %d", w.Code, http.StatusForbidden)
	}
}

func TestRequireRole_NoRoleInContext(t *testing.T) {
	t.Parallel()

	nextCalled := false
	handler := RequireRole(types.RoleOwner)(
		http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			nextCalled = true
			w.WriteHeader(http.StatusOK)
		}),
	)

	// No role in context
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if nextCalled {
		t.Error("next handler should NOT be called without role")
	}
	if w.Code != http.StatusUnauthorized {
		t.Errorf("status = %d, want %d", w.Code, http.StatusUnauthorized)
	}
}

func TestRequireOwner(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		role     types.Role
		wantCode int
	}{
		{"owner allowed", types.RoleOwner, http.StatusOK},
		{"admin denied", types.RoleAdmin, http.StatusForbidden},
		{"member denied", types.RoleMember, http.StatusForbidden},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			handler := RequireOwner()(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				w.WriteHeader(http.StatusOK)
			}))

			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			ctx := context.WithValue(req.Context(), RoleKey, tt.role)
			req = req.WithContext(ctx)
			w := httptest.NewRecorder()

			handler.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("status = %d, want %d", w.Code, tt.wantCode)
			}
		})
	}
}

func TestRequireAdmin(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		role     types.Role
		wantCode int
	}{
		{"owner allowed", types.RoleOwner, http.StatusOK},
		{"admin allowed", types.RoleAdmin, http.StatusOK},
		{"member denied", types.RoleMember, http.StatusForbidden},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			handler := RequireAdmin()(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				w.WriteHeader(http.StatusOK)
			}))

			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			ctx := context.WithValue(req.Context(), RoleKey, tt.role)
			req = req.WithContext(ctx)
			w := httptest.NewRecorder()

			handler.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("status = %d, want %d", w.Code, tt.wantCode)
			}
		})
	}
}

func TestRequireMember(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		role     types.Role
		wantCode int
	}{
		{"owner allowed", types.RoleOwner, http.StatusOK},
		{"admin allowed", types.RoleAdmin, http.StatusOK},
		{"member allowed", types.RoleMember, http.StatusOK},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			handler := RequireMember()(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				w.WriteHeader(http.StatusOK)
			}))

			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			ctx := context.WithValue(req.Context(), RoleKey, tt.role)
			req = req.WithContext(ctx)
			w := httptest.NewRecorder()

			handler.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("status = %d, want %d", w.Code, tt.wantCode)
			}
		})
	}
}
