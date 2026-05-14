// Package audit provides helper functions for extracting audit context from HTTP requests
package audit

import (
	"context"
	"net/http"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/delivery/http/middleware"
)

// ContextFromRequest extracts audit-relevant information from an HTTP request context
func ContextFromRequest(r *http.Request) (userID, orgID uuid.UUID, ok bool) {
	ctx := r.Context()
	
	// Extract user ID
	userIDVal := ctx.Value(middleware.UserIDKey)
	if userIDVal == nil {
		return uuid.Nil, uuid.Nil, false
	}
	userID, ok = userIDVal.(uuid.UUID)
	if !ok {
		return uuid.Nil, uuid.Nil, false
	}

	// Extract organization ID
	orgIDVal := ctx.Value(middleware.OrganizationIDKey)
	if orgIDVal == nil {
		return uuid.Nil, uuid.Nil, false
	}
	orgID, ok = orgIDVal.(uuid.UUID)
	if !ok {
		return uuid.Nil, uuid.Nil, false
	}

	return userID, orgID, true
}

// UserIDFromContext extracts just the user ID from context
func UserIDFromContext(ctx context.Context) (uuid.UUID, bool) {
	userIDVal := ctx.Value(middleware.UserIDKey)
	if userIDVal == nil {
		return uuid.Nil, false
	}
	userID, ok := userIDVal.(uuid.UUID)
	return userID, ok
}

// OrgIDFromContext extracts just the organization ID from context
func OrgIDFromContext(ctx context.Context) (uuid.UUID, bool) {
	orgIDVal := ctx.Value(middleware.OrganizationIDKey)
	if orgIDVal == nil {
		return uuid.Nil, false
	}
	orgID, ok := orgIDVal.(uuid.UUID)
	return orgID, ok
}
