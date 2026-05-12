// Package requestid provides helpers for propagating a per-request
// identifier through context.Context.
//
// It lives in its own package so that both the HTTP middleware that
// produces the ID and the response/logging layers that consume it can
// depend on it without creating an import cycle.
package requestid

import (
	"context"
)

// Header is the HTTP header used to propagate request IDs to and from
// upstream systems (load balancers, reverse proxies, clients).
const Header = "X-Request-ID"

// requestIDKey is an unexported context key type to avoid collisions with
// other packages that attach values to the same context.
type requestIDKey struct{}

// WithID returns a new context with id attached as the request ID.
func WithID(ctx context.Context, id string) context.Context {
	return context.WithValue(ctx, requestIDKey{}, id)
}

// FromContext returns the request ID attached to ctx, or an empty string
// if none is present.
func FromContext(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	if v, ok := ctx.Value(requestIDKey{}).(string); ok {
		return v
	}
	return ""
}
