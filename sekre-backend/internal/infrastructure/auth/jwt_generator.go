package auth

import (
	"github.com/google/uuid"

	"github.com/username/sekre-backend/internal/domain/service"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/pkg/token"
)

// jwtTokenGenerator adapts pkg/token.Manager to the TokenGenerator interface.
type jwtTokenGenerator struct {
	manager *token.Manager
}

// NewJWTTokenGenerator returns a TokenGenerator backed by the given JWT
// token manager.
func NewJWTTokenGenerator(manager *token.Manager) service.TokenGenerator {
	return &jwtTokenGenerator{manager: manager}
}

func (g *jwtTokenGenerator) Generate(userID, organizationID uuid.UUID, role types.Role) (*token.TokenPair, error) {
	return g.manager.GenerateTokenPair(userID, organizationID, role)
}

func (g *jwtTokenGenerator) Verify(tokenString string) (*token.Claims, error) {
	return g.manager.ValidateToken(tokenString)
}
