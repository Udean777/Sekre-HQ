package handler

import (
	"net/http"
	"net/http/httptest"
	"net/url"
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
		// URL-encode the input to avoid httptest panics on malformed URLs
		safePath := "/test/" + url.PathEscape(input)

		req := httptest.NewRequest(http.MethodGet, safePath, nil)
		// Pass the raw input (not URL-encoded) to mux.SetURLVars
		// because mux normally decodes path params before passing to handlers
		req = mux.SetURLVars(req, map[string]string{
			"id": input,
		})

		// Try to parse - must not panic
		_, err := ParseUUIDFromPath(req, "id")

		// Valid UUIDs should be accepted; invalid ones should return error
		_, parseErr := parseUUIDSafe(input)
		wantErr := parseErr != nil

		if (err != nil) != wantErr {
			t.Errorf("ParseUUIDFromPath(%q): err=%v, wantErr=%v", input, err, wantErr)
		}
	})
}

// parseUUIDSafe is a helper that reports whether input is a syntactically valid UUID.
// It mirrors the behavior of uuid.Parse without the handler response wrapping.
func parseUUIDSafe(s string) (string, error) {
	// Minimal UUID validation: length 36, hex with dashes at correct positions
	if len(s) != 36 {
		return "", errInvalidUUID
	}
	if s[8] != '-' || s[13] != '-' || s[18] != '-' || s[23] != '-' {
		return "", errInvalidUUID
	}
	for i, c := range s {
		if i == 8 || i == 13 || i == 18 || i == 23 {
			continue
		}
		if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')) {
			return "", errInvalidUUID
		}
	}
	return s, nil
}

var errInvalidUUID = &uuidError{msg: "invalid UUID"}

type uuidError struct{ msg string }

func (e *uuidError) Error() string { return e.msg }

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
