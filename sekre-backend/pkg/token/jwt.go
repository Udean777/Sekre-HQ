package token

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/types"
)

type Claims struct {
	UserID         uuid.UUID  `json:"user_id"`
	OrganizationID uuid.UUID  `json:"organization_id"`
	Role           types.Role `json:"role"`
	TokenType      string     `json:"token_type"`
	jwt.RegisteredClaims
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type Manager struct {
	secret          string
	accessTokenTTL  time.Duration
	refreshTokenTTL time.Duration
}

func NewManager(secret string, accessExpiry, refreshExpiry time.Duration) *Manager {
	return &Manager{
		secret:          secret,
		accessTokenTTL:  accessExpiry,
		refreshTokenTTL: refreshExpiry,
	}
}

// GenerateTokenPair generates both access and refresh tokens
func (m *Manager) GenerateTokenPair(userID, organizationID uuid.UUID, role types.Role) (*TokenPair, error) {
	if err := role.Validate(); err != nil {
		return nil, fmt.Errorf("invalid role for token: %w", err)
	}

	accessToken, _, err := m.generateToken(userID, organizationID, role, m.accessTokenTTL, "access")
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, _, err := m.generateToken(userID, organizationID, role, m.refreshTokenTTL, "refresh")
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (m *Manager) generateToken(userID, organizationID uuid.UUID, role types.Role, ttl time.Duration, tokenType string) (string, string, error) {
	now := time.Now()
	jti := uuid.NewString()
	claims := Claims{
		UserID:         userID,
		OrganizationID: organizationID,
		Role:           role,
		TokenType:      tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        jti,
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(m.secret))
	if err != nil {
		return "", "", err
	}
	return signed, jti, nil
}

func (m *Manager) GenerateRefreshToken(userID, organizationID uuid.UUID, role types.Role) (string, string, error) {
	if err := role.Validate(); err != nil {
		return "", "", fmt.Errorf("invalid role for token: %w", err)
	}
	return m.generateToken(userID, organizationID, role, m.refreshTokenTTL, "refresh")
}

// ValidateToken validates and parses a JWT token
func (m *Manager) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(m.secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		if err := claims.Role.Validate(); err != nil {
			return nil, fmt.Errorf("token carries invalid role: %w", err)
		}
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}
