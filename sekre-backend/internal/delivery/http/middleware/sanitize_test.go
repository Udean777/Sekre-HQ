package middleware

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSanitizeInput(t *testing.T) {
	tests := []struct {
		name           string
		method         string
		contentType    string
		input          interface{}
		expectedOutput interface{}
	}{
		{
			name:        "sanitize simple string with HTML",
			method:      http.MethodPost,
			contentType: "application/json",
			input: map[string]interface{}{
				"name": "<script>alert('xss')</script>John Doe",
			},
			expectedOutput: map[string]interface{}{
				"name": "John Doe",
			},
		},
		{
			name:        "sanitize nested object",
			method:      http.MethodPost,
			contentType: "application/json",
			input: map[string]interface{}{
				"user": map[string]interface{}{
					"name":  "<b>Bold Name</b>",
					"email": "test@example.com",
				},
			},
			expectedOutput: map[string]interface{}{
				"user": map[string]interface{}{
					"name":  "Bold Name",
					"email": "test@example.com",
				},
			},
		},
		{
			name:        "sanitize array of strings",
			method:      http.MethodPost,
			contentType: "application/json",
			input: map[string]interface{}{
				"tags": []interface{}{
					"<script>evil</script>tag1",
					"tag2",
					"<img src=x onerror=alert(1)>tag3",
				},
			},
			expectedOutput: map[string]interface{}{
				"tags": []interface{}{
					"tag1",
					"tag2",
					"tag3",
				},
			},
		},
		{
			name:        "preserve numbers and booleans",
			method:      http.MethodPost,
			contentType: "application/json",
			input: map[string]interface{}{
				"name":   "<b>Test</b>",
				"age":    25,
				"active": true,
				"score":  98.5,
			},
			expectedOutput: map[string]interface{}{
				"name":   "Test",
				"age":    float64(25), // JSON unmarshals numbers as float64
				"active": true,
				"score":  98.5,
			},
		},
		{
			name:        "trim whitespace",
			method:      http.MethodPost,
			contentType: "application/json",
			input: map[string]interface{}{
				"name": "  John Doe  ",
			},
			expectedOutput: map[string]interface{}{
				"name": "John Doe",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create request body
			body, err := json.Marshal(tt.input)
			if err != nil {
				t.Fatalf("failed to marshal input: %v", err)
			}

			// Create request
			req := httptest.NewRequest(tt.method, "/test", bytes.NewReader(body))
			req.Header.Set("Content-Type", tt.contentType)

			// Create response recorder
			rr := httptest.NewRecorder()

			// Create test handler that reads the sanitized body
			var receivedData interface{}
			testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if err := json.NewDecoder(r.Body).Decode(&receivedData); err != nil {
					t.Errorf("failed to decode sanitized body: %v", err)
				}
				w.WriteHeader(http.StatusOK)
			})

			// Apply middleware
			middleware := SanitizeInput()
			handler := middleware(testHandler)

			// Execute request
			handler.ServeHTTP(rr, req)

			// Compare received data with expected output
			expectedJSON, _ := json.Marshal(tt.expectedOutput)
			receivedJSON, _ := json.Marshal(receivedData)

			if string(expectedJSON) != string(receivedJSON) {
				t.Errorf("expected %s, got %s", string(expectedJSON), string(receivedJSON))
			}
		})
	}
}

func TestSanitizeInput_SkipNonJSON(t *testing.T) {
	tests := []struct {
		name        string
		method      string
		contentType string
	}{
		{
			name:        "skip GET request",
			method:      http.MethodGet,
			contentType: "application/json",
		},
		{
			name:        "skip DELETE request",
			method:      http.MethodDelete,
			contentType: "application/json",
		},
		{
			name:        "skip non-JSON content type",
			method:      http.MethodPost,
			contentType: "text/plain",
		},
		{
			name:        "skip multipart form",
			method:      http.MethodPost,
			contentType: "multipart/form-data",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body := []byte("test body")
			req := httptest.NewRequest(tt.method, "/test", bytes.NewReader(body))
			req.Header.Set("Content-Type", tt.contentType)

			rr := httptest.NewRecorder()

			handlerCalled := false
			testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				handlerCalled = true
				w.WriteHeader(http.StatusOK)
			})

			middleware := SanitizeInput()
			handler := middleware(testHandler)

			handler.ServeHTTP(rr, req)

			if !handlerCalled {
				t.Error("handler was not called")
			}
		})
	}
}

func TestSanitizeString(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "remove script tags",
			input:    "<script>alert('xss')</script>Hello",
			expected: "Hello",
		},
		{
			name:     "remove HTML tags",
			input:    "<b>Bold</b> <i>Italic</i>",
			expected: "Bold Italic",
		},
		{
			name:     "trim whitespace",
			input:    "  Hello World  ",
			expected: "Hello World",
		},
		{
			name:     "preserve plain text",
			input:    "Hello World",
			expected: "Hello World",
		},
		{
			name:     "remove dangerous attributes",
			input:    "<img src=x onerror=alert(1)>",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := SanitizeString(tt.input)
			if result != tt.expected {
				t.Errorf("expected %q, got %q", tt.expected, result)
			}
		})
	}
}

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		name  string
		email string
		valid bool
	}{
		{
			name:  "valid email",
			email: "test@example.com",
			valid: true,
		},
		{
			name:  "valid email with subdomain",
			email: "user@mail.example.com",
			valid: true,
		},
		{
			name:  "invalid - no @",
			email: "testexample.com",
			valid: false,
		},
		{
			name:  "invalid - no domain",
			email: "test@",
			valid: false,
		},
		{
			name:  "invalid - no local part",
			email: "@example.com",
			valid: false,
		},
		{
			name:  "invalid - no TLD",
			email: "test@example",
			valid: false,
		},
		{
			name:  "invalid - too short",
			email: "a@b",
			valid: false,
		},
		{
			name:  "valid with whitespace (trimmed)",
			email: "  test@example.com  ",
			valid: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ValidateEmail(tt.email)
			if result != tt.valid {
				t.Errorf("expected %v, got %v", tt.valid, result)
			}
		})
	}
}

func TestValidateStringLength(t *testing.T) {
	tests := []struct {
		name  string
		input string
		min   int
		max   int
		valid bool
	}{
		{
			name:  "valid length",
			input: "Hello",
			min:   1,
			max:   10,
			valid: true,
		},
		{
			name:  "too short",
			input: "Hi",
			min:   3,
			max:   10,
			valid: false,
		},
		{
			name:  "too long",
			input: "Hello World!",
			min:   1,
			max:   10,
			valid: false,
		},
		{
			name:  "exact min length",
			input: "Hi",
			min:   2,
			max:   10,
			valid: true,
		},
		{
			name:  "exact max length",
			input: "HelloWorld",
			min:   1,
			max:   10,
			valid: true,
		},
		{
			name:  "whitespace trimmed",
			input: "  Hello  ",
			min:   1,
			max:   10,
			valid: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ValidateStringLength(tt.input, tt.min, tt.max)
			if result != tt.valid {
				t.Errorf("expected %v, got %v", tt.valid, result)
			}
		})
	}
}

func TestStringValidator(t *testing.T) {
	tests := []struct {
		name      string
		validator StringValidator
		input     string
		valid     bool
		expected  string
	}{
		{
			name:      "valid required field",
			validator: StringValidator{MinLength: 1, MaxLength: 10, Required: true},
			input:     "Hello",
			valid:     true,
			expected:  "Hello",
		},
		{
			name:      "invalid - required but empty",
			validator: StringValidator{MinLength: 1, MaxLength: 10, Required: true},
			input:     "",
			valid:     false,
			expected:  "",
		},
		{
			name:      "valid - optional and empty",
			validator: StringValidator{MinLength: 0, MaxLength: 10, Required: false},
			input:     "",
			valid:     true,
			expected:  "",
		},
		{
			name:      "sanitize HTML",
			validator: StringValidator{MinLength: 1, MaxLength: 20, Required: true},
			input:     "<b>Hello</b>",
			valid:     true,
			expected:  "Hello",
		},
		{
			name:      "invalid - too long after sanitization",
			validator: StringValidator{MinLength: 1, MaxLength: 5, Required: true},
			input:     "Hello World",
			valid:     false,
			expected:  "Hello World",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, valid := tt.validator.Validate(tt.input)
			if valid != tt.valid {
				t.Errorf("expected valid=%v, got %v", tt.valid, valid)
			}
			if result != tt.expected {
				t.Errorf("expected %q, got %q", tt.expected, result)
			}
		})
	}
}

// TestSanitizeInput_PreservesSensitiveFields verifies that the SanitizeInput
// middleware leaves credential/token fields untouched, even when they contain
// leading/trailing whitespace or characters that would otherwise be stripped.
// This is critical: trimming a password silently changes the value used for
// hashing/comparison and breaks authentication.
func TestSanitizeInput_PreservesSensitiveFields(t *testing.T) {
	tests := []struct {
		name           string
		input          map[string]interface{}
		expectedOutput map[string]interface{}
	}{
		{
			name: "preserve password leading and trailing spaces",
			input: map[string]interface{}{
				"email":    "  user@example.com  ",
				"password": "  my pass word  ",
			},
			expectedOutput: map[string]interface{}{
				"email":    "user@example.com",
				"password": "  my pass word  ",
			},
		},
		{
			name: "preserve password with HTML-like characters",
			input: map[string]interface{}{
				"email":    "user@example.com",
				"password": "<b>p4ss</b>!",
			},
			expectedOutput: map[string]interface{}{
				"email":    "user@example.com",
				"password": "<b>p4ss</b>!",
			},
		},
		{
			name: "preserve refresh_token verbatim",
			input: map[string]interface{}{
				"refresh_token": "  eyJhbGciOiJIUzI1NiJ9.payload.sig  ",
			},
			expectedOutput: map[string]interface{}{
				"refresh_token": "  eyJhbGciOiJIUzI1NiJ9.payload.sig  ",
			},
		},
		{
			name: "preserve current/new/confirm password fields",
			input: map[string]interface{}{
				"current_password": "  old pwd  ",
				"new_password":     "  new pwd  ",
				"confirm_password": "  new pwd  ",
				"full_name":        "  John  ",
			},
			expectedOutput: map[string]interface{}{
				"current_password": "  old pwd  ",
				"new_password":     "  new pwd  ",
				"confirm_password": "  new pwd  ",
				"full_name":        "John",
			},
		},
		{
			name: "case-insensitive sensitive field matching",
			input: map[string]interface{}{
				"Password":      "  Secret 1  ",
				"REFRESH_TOKEN": "  abc.def.ghi  ",
				"name":          "  Jane  ",
			},
			expectedOutput: map[string]interface{}{
				"Password":      "  Secret 1  ",
				"REFRESH_TOKEN": "  abc.def.ghi  ",
				"name":          "Jane",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, err := json.Marshal(tt.input)
			if err != nil {
				t.Fatalf("failed to marshal input: %v", err)
			}

			req := httptest.NewRequest(http.MethodPost, "/test", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")

			rr := httptest.NewRecorder()

			var receivedData map[string]interface{}
			testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if err := json.NewDecoder(r.Body).Decode(&receivedData); err != nil {
					t.Errorf("failed to decode sanitized body: %v", err)
				}
				w.WriteHeader(http.StatusOK)
			})

			handler := SanitizeInput()(testHandler)
			handler.ServeHTTP(rr, req)

			expectedJSON, _ := json.Marshal(tt.expectedOutput)
			receivedJSON, _ := json.Marshal(receivedData)

			if string(expectedJSON) != string(receivedJSON) {
				t.Errorf("expected %s, got %s", string(expectedJSON), string(receivedJSON))
			}
		})
	}
}

// TestIsSensitiveField verifies the case-insensitive lookup of credential keys.
func TestIsSensitiveField(t *testing.T) {
	sensitive := []string{
		"password", "Password", "PASSWORD",
		"current_password", "new_password", "old_password", "confirm_password",
		"password_hash",
		"refresh_token", "Refresh_Token",
		"access_token", "token",
	}
	for _, k := range sensitive {
		if !isSensitiveField(k) {
			t.Errorf("expected %q to be sensitive", k)
		}
	}

	notSensitive := []string{
		"email", "name", "full_name", "subdomain",
		"organization_name", "title", "description",
		"", "passphrase", "tokens",
	}
	for _, k := range notSensitive {
		if isSensitiveField(k) {
			t.Errorf("expected %q NOT to be sensitive", k)
		}
	}
}
