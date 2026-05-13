package testhttp

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/username/sekre-backend/internal/domain/types"
)

func TestAuthedRequest(t *testing.T) {
	userID := uuid.New()
	orgID := uuid.New()

	req := AuthedRequest(t, "GET", "/test", nil, AuthOpts{
		UserID: userID,
		OrgID:  orgID,
		Role:   types.RoleOwner,
	})

	assert.NotEmpty(t, req.Header.Get("Authorization"))
	assert.Contains(t, req.Header.Get("Authorization"), "Bearer ")
}

func TestAuthedRequestWithToken(t *testing.T) {
	req := AuthedRequestWithToken("GET", "/test", nil, "fake-token")

	assert.Equal(t, "Bearer fake-token", req.Header.Get("Authorization"))
}
