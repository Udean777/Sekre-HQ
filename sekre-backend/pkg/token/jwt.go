package token

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Claims struct {
	UserID         uuid.UUID `json:"user_id"`
	OrganizationID uuid.UUID `json:"organization_id"`
	Role           string    `json:"role"`
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

func NewManager(secret string, accessTokenTTL, refreshTokenTTL int) *Manager {
	return &Manager{
		secret:          secret,
		accessTokenTTL:  time.Duration(accessTokenTTL) * time.Hour,
		refreshTokenTTL: time.Duration(refreshTokenTTL) * time.Hour,
	}
}

// GenerateTokenPair generates both access and refresh tokens
func (m *Manager) GenerateTokenPair(userID, organizationID uuid.UUID, role string) (*TokenPair, error) {
	accessToken, err := m.generateToken(userID, organizationID, role, m.accessTokenTTL)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := m.generateToken(userID, organizationID, role, m.refreshTokenTTL)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (m *Manager) generateToken(userID, organizationID uuid.UUID, role string, ttl time.Duration) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID:         userID,
		OrganizationID: organizationID,
		Role:           role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(m.secret))
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
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}
