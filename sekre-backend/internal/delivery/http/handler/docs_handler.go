package handler

import (
	"net/http"
	"os"
	"path/filepath"
)

// DocsHandler serves the OpenAPI specification and Swagger UI.
type DocsHandler struct {
	specPath string // filesystem path to openapi.yaml
}

// NewDocsHandler creates a docs handler that serves the OpenAPI spec.
// specPath should point to docs/api/openapi.yaml.
func NewDocsHandler(specPath string) *DocsHandler {
	return &DocsHandler{specPath: specPath}
}

// OpenAPISpec serves the raw OpenAPI YAML file.
// Accessible at GET /openapi.yaml
func (h *DocsHandler) OpenAPISpec(w http.ResponseWriter, r *http.Request) {
	abs, err := filepath.Abs(h.specPath)
	if err != nil {
		http.Error(w, "failed to resolve spec path", http.StatusInternalServerError)
		return
	}

	data, err := os.ReadFile(abs)
	if err != nil {
		http.Error(w, "OpenAPI spec not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/yaml; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=300")
	_, _ = w.Write(data)
}

// SwaggerUI serves a minimal Swagger UI HTML page that loads the OpenAPI spec
// from /openapi.yaml. Uses CDN-hosted Swagger UI assets (no bundled files).
//
// Accessible at GET /docs
func (h *DocsHandler) SwaggerUI(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=3600")
	_, _ = w.Write([]byte(swaggerUIHTML))
}

// swaggerUIHTML is a minimal Swagger UI page that loads from /openapi.yaml.
// Uses Swagger UI from a pinned CDN version for security.
const swaggerUIHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sekre API Documentation</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui.css">
    <style>
        html, body { margin: 0; padding: 0; }
        body { font-family: sans-serif; }
        #swagger-ui { max-width: 1460px; margin: 0 auto; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
    <script>
        window.addEventListener('load', function() {
            window.ui = SwaggerUIBundle({
                url: '/openapi.yaml',
                dom_id: '#swagger-ui',
                deepLinking: true,
                displayOperationId: false,
                filter: true,
                tryItOutEnabled: true
            });
        });
    </script>
</body>
</html>
`
