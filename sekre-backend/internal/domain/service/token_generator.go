package service

import (
	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/pkg/token"
)

// TokenGenerator issues and verifies authentication tokens. It wraps a JWT
// implementation behind an interface so the auth usecase does not depend
// directly on any specific token library.
type TokenGenerator interface {
	Generate(userID, organizationID uuid.UUID, role types.Role) (*token.TokenPair, error)
	Verify(tokenString string) (*token.Claims, error)
}
