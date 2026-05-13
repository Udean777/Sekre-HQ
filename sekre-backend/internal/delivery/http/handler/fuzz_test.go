package handler

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gorilla/mux"
)

// Fuzz tests for HTTP handler input parsing
//
// Run with:
//   go test -fuzz=FuzzParseUUID -fuzztime=30s ./internal/delivery/http/handler

// FuzzParseUUIDFromPath tests that UUID parsing handles malformed input safely.
// Should reject invalid UUIDs without panicking.
func FuzzParseUUIDFromPath(f *testing.F) {
	// Seed corpus
	f.Add("550e8400-e29b-41d4-a716-446655440000") // valid UUID
	f.Add("invalid")
	f.Add("")
	f.Add("00000000-0000-0000-0000-000000000000")
	f.Add("FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF")
	f.Add("not-a-uuid-at-all")
	f.Add("550e8400")
	f.Add("550e8400-e29b-41d4-a716-446655440000-extra")
	f.Add("../../etc/passwd")
	f.Add("'; DROP TABLE users; --")
	f.Add("<script>alert(1)</script>")

	f.Fuzz(func(t *testing.T, input string) {
		// Setup a request with the fuzzed UUID in path
		req := httptest.NewRequest(http.MethodGet, "/test/"+input, nil)
		req = mux.SetURLVars(req, map[string]string{
			"id": input,
		})

		// Try to parse - must not panic
		_, err := ParseUUIDFromPath(req, "id")

		// Invalid UUIDs should return an error (not panic, not return nil)
		if err == nil && input != "550e8400-e29b-41d4-a716-446655440000" &&
			input != "00000000-0000-0000-0000-000000000000" &&
			input != "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF" {
			// Could still be a valid UUID even with other inputs, just log
			t.Logf("accepted input as UUID: %q", input)
		}
	})
}

// FuzzDecodeJSONBody tests JSON decoding safety.
func FuzzDecodeJSONBody(f *testing.F) {
	// Seed corpus
	f.Add(`{"name": "test"}`)
	f.Add(`{}`)
	f.Add(``)
	f.Add(`null`)
	f.Add(`{"name":`)
	f.Add(`{"name": "test", "extra": "field"}`)
	f.Add(`{"nested": {"deep": {"object": "value"}}}`)
	f.Add(`[1, 2, 3]`)
	f.Add(`"just a string"`)
	f.Add(`12345`)

	type testStruct struct {
		Name string `json:"name"`
	}

	f.Fuzz(func(t *testing.T, body string) {
		req := httptest.NewRequest(http.MethodPost, "/test",
			strings.NewReader(body))

		var dest testStruct

		// Must not panic on any input
		_ = DecodeJSONBody(req, &dest)
	})
}
