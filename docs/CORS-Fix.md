# CORS Fix - Completed ✅

## Issue

Frontend (http://localhost:5173) tidak bisa mengakses backend API (http://localhost:8080) karena CORS policy:

```
Access to fetch at 'http://localhost:8080/api/v1/auth/login' from origin 
'http://localhost:5173' has been blocked by CORS policy: Response to preflight 
request doesn't pass access control check: No 'Access-Control-Allow-Origin' 
header is present on the requested resource.
```

## Root Cause

1. CORS middleware tidak menambahkan header yang cukup lengkap
2. Gorilla Mux tidak otomatis handle OPTIONS request untuk preflight

## Solution

### 1. Enhanced CORS Middleware

**File:** `internal/middleware/auth.go`

**Changes:**
- ✅ Dynamic `Access-Control-Allow-Origin` based on request origin
- ✅ Added `Access-Control-Allow-Credentials: true`
- ✅ Added `Access-Control-Max-Age: 3600` (cache preflight for 1 hour)
- ✅ Added `Accept` to allowed headers
- ✅ Changed OPTIONS response to `204 No Content` (proper HTTP status)

```go
func CORS(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        origin := r.Header.Get("Origin")
        if origin == "" {
            origin = "*"
        }
        
        w.Header().Set("Access-Control-Allow-Origin", origin)
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")
        w.Header().Set("Access-Control-Allow-Credentials", "true")
        w.Header().Set("Access-Control-Max-Age", "3600")

        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusNoContent)
            return
        }

        next.ServeHTTP(w, r)
    })
}
```

### 2. Global OPTIONS Handler

**File:** `cmd/api/main.go`

**Added:**
```go
// Handle OPTIONS for all routes (CORS preflight)
router.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    if r.Method == "OPTIONS" {
        w.WriteHeader(http.StatusNoContent)
        return
    }
    w.WriteHeader(http.StatusNotFound)
}).Methods("OPTIONS")
```

This ensures all routes accept OPTIONS requests for CORS preflight.

## Verification

### Preflight Request (OPTIONS)
```bash
curl -i -X OPTIONS http://localhost:8080/api/v1/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization"
```

**Response:**
```
HTTP/1.1 204 No Content
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Content-Type, Authorization, Accept
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Max-Age: 3600
```

✅ **Status**: 204 No Content  
✅ **Headers**: All CORS headers present

### Actual Request (POST)
```bash
curl -i -X POST http://localhost:8080/api/v1/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Response:**
```
HTTP/1.1 200 OK
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Content-Type, Authorization, Accept
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json

{"success":true,"message":"login successful",...}
```

✅ **Status**: 200 OK  
✅ **Headers**: CORS headers present  
✅ **Body**: JSON response with tokens

## CORS Flow

```
Browser (localhost:5173)
    |
    | 1. Preflight: OPTIONS /api/v1/auth/login
    v
Backend (localhost:8080)
    |
    | 2. Response: 204 + CORS headers
    v
Browser
    |
    | 3. Actual: POST /api/v1/auth/login
    v
Backend
    |
    | 4. Response: 200 + CORS headers + data
    v
Browser ✅ Success!
```

## Testing from Browser

1. Start backend:
   ```bash
   cd sekre-backend
   make dev
   ```

2. Start frontend:
   ```bash
   cd sekre-frontend
   bun run dev
   ```

3. Open http://localhost:5173/login

4. Try to login - should work now! ✅

## Files Modified

```
sekre-backend/
├── internal/middleware/auth.go    # Enhanced CORS middleware
└── cmd/api/main.go                # Added OPTIONS handler
```

## Security Notes

### Development vs Production

**Current (Development):**
- Allows any origin dynamically
- Credentials allowed
- Suitable for local development

**Production (TODO):**
```go
// For production, use specific origins
allowedOrigins := []string{
    "https://yourdomain.com",
    "https://app.yourdomain.com",
}

origin := r.Header.Get("Origin")
if contains(allowedOrigins, origin) {
    w.Header().Set("Access-Control-Allow-Origin", origin)
} else {
    w.Header().Set("Access-Control-Allow-Origin", allowedOrigins[0])
}
```

### Environment-based CORS

**Future Enhancement:**
```go
// In config
type CORSConfig struct {
    AllowedOrigins []string
    AllowCredentials bool
    MaxAge int
}

// Load from env
CORS_ALLOWED_ORIGINS=https://app.example.com,https://example.com
CORS_ALLOW_CREDENTIALS=true
CORS_MAX_AGE=3600
```

## Troubleshooting

### Still getting CORS error?

1. **Clear browser cache**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

2. **Check backend is running**
   ```bash
   curl http://localhost:8080/health
   ```

3. **Check CORS headers**
   ```bash
   curl -i -X OPTIONS http://localhost:8080/api/v1/auth/login \
     -H "Origin: http://localhost:5173"
   ```

4. **Check browser console**
   - Look for actual error message
   - Check Network tab for request/response headers

### Preflight fails with 404?

Make sure OPTIONS handler is registered:
```go
router.PathPrefix("/").HandlerFunc(...).Methods("OPTIONS")
```

### Credentials not working?

Ensure both are set:
```go
w.Header().Set("Access-Control-Allow-Credentials", "true")
w.Header().Set("Access-Control-Allow-Origin", origin) // NOT "*"
```

Note: Cannot use `*` with credentials!

---

**Status**: ✅ FIXED  
**Tested**: ✅ Preflight + Actual requests working  
**Ready**: ✅ Frontend can now communicate with backend
