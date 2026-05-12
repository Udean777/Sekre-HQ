package middleware

import (
	"context"
	"net/http"
	"time"

	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/pkg/response"
)

// Timeout returns a middleware that enforces a request timeout.
// If the handler does not complete within the given duration, the middleware
// returns a 408 Request Timeout response.
func Timeout(duration time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Create a context with timeout
			ctx, cancel := context.WithTimeout(r.Context(), duration)
			defer cancel()

			// Channel to signal handler completion
			done := make(chan struct{})

			// Run the handler in a goroutine
			go func() {
				next.ServeHTTP(w, r.WithContext(ctx))
				close(done)
			}()

			// Wait for either completion or timeout
			select {
			case <-done:
				// Handler completed successfully
				return
			case <-ctx.Done():
				// Context cancelled (timeout or client disconnect)
				if ctx.Err() == context.DeadlineExceeded {
					// Request timeout
					response.HandleError(w, r, domainerrors.Timeout("request timeout"))
				}
				// If context.Canceled, client disconnected - no response needed
			}
		})
	}
}
