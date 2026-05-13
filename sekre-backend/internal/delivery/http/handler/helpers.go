package handler

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"

	"github.com/username/sekre-backend/internal/delivery/http/middleware"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/pkg/response"
	"github.com/username/sekre-backend/pkg/validator"
)

// GetOrgIDFromContext extracts organization ID from request context.
func GetOrgIDFromContext(r *http.Request) (uuid.UUID, error) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		return uuid.Nil, domainerrors.Unauthorized("invalid organization context")
	}
	return orgID, nil
}

// ParseUUIDFromPath extracts and parses UUID from path variable.
func ParseUUIDFromPath(r *http.Request, paramName string) (uuid.UUID, error) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars[paramName])
	if err != nil {
		return uuid.Nil, domainerrors.InvalidInput(paramName, "invalid UUID")
	}
	return id, nil
}

// DecodeJSONBody decodes JSON request body into the provided struct.
func DecodeJSONBody(r *http.Request, v interface{}) error {
	if err := json.NewDecoder(r.Body).Decode(v); err != nil {
		return domainerrors.InvalidInput("body", "invalid request body")
	}
	return nil
}

// DecodeAndValidate decodes JSON body and validates struct tags.
// Returns a *DomainError on either decode or validation failure.
//
// Use this in handlers to ensure request body is well-formed before
// passing to usecases:
//
//	var req CreateTaskRequest
//	if err := handler.DecodeAndValidate(r, &req); err != nil {
//	    response.HandleError(w, r, err)
//	    return
//	}
func DecodeAndValidate(r *http.Request, v interface{}) error {
	if err := DecodeJSONBody(r, v); err != nil {
		return err
	}
	return validator.Validate(v)
}

// HandleUpdateRequest is a generic helper for update endpoints that:
// 1. Extract orgID from context
// 2. Parse ID from path
// 3. Decode JSON body
// 4. Call update function
// 5. Return success response
func HandleUpdateRequest(
	w http.ResponseWriter,
	r *http.Request,
	pathParam string,
	requestBody interface{},
	updateFunc func(orgID, id uuid.UUID) error,
	successMessage string,
) {
	// Extract organization ID
	orgID, err := GetOrgIDFromContext(r)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	// Parse ID from path
	id, err := ParseUUIDFromPath(r, pathParam)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	// Decode request body
	if err := DecodeJSONBody(r, requestBody); err != nil {
		response.HandleError(w, r, err)
		return
	}

	// Call update function
	if err := updateFunc(orgID, id); err != nil {
		response.HandleError(w, r, err)
		return
	}

	// Return success
	response.Success(w, http.StatusOK, successMessage, nil)
}
