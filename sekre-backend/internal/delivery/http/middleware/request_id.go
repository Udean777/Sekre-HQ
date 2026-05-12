package middleware

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/pkg/requestid"
)

// RequestIDHeader is re-exported for backward-compatible call sites that
// already reference it via this package. New code should import the
// requestid package directly.
const RequestIDHeader = requestid.Header

// RequestID is HTTP middleware that assigns a unique ID to every request and
// makes it available to downstream handlers via the request context.
//
// If the incoming request already carries an X-Request-ID header (e.g. from
// an upstream load balancer), that value is reused so logs across services
// can be correlated. Otherwise a fresh UUIDv4 is generated.
//
// The resolved ID is echoed back on the response as X-Request-ID so clients
// can reference it when reporting issues.
func RequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := r.Header.Get(requestid.Header)
		if id == "" {
			id = uuid.NewString()
		}

		w.Header().Set(requestid.Header, id)

		ctx := requestid.WithID(r.Context(), id)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
