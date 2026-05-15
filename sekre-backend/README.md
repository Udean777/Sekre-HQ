# Sekre Backend

Multi-tenant SaaS backend for organization management, written in Go. Provides authentication, task management, event scheduling, and finance tracking with strong tenant isolation and production-grade security.

---

## Tech Stack

### Core

| Component | Technology |
|-----------|-----------|
| Language | Go 1.26 |
| HTTP Router | gorilla/mux |
| ORM | GORM v2 |
| Database | PostgreSQL 16+ |
| Migrations | golang-migrate |
| Auth | golang-jwt v5 + bcrypt |
| Logging | zerolog |
| Validation | go-playground/validator v10 |
| Rate Limiting | golang.org/x/time/rate |
| Metrics | prometheus/client_golang |

### Testing

- Test Runner: `go test` + gotestsum
- Assertions: stretchr/testify
- Mocks: vektra/mockery v2
- Integration DB: testcontainers-go
- Coverage: 60%+ enforced

---

## Architecture

Clean Architecture with explicit layer separation:

```
delivery (HTTP)
    ↓
application (use cases)
    ↓
domain (entities, interfaces)
    ↑
infrastructure (GORM, JWT, bcrypt)
```

### Layer Responsibilities

| Layer | Responsibility |
|-------|----------------|
| **delivery** | HTTP routing, request/response handling |
| **application** | Business orchestration, transaction boundaries |
| **domain** | Entities, value objects, business rules, interfaces |
| **infrastructure** | Database, auth, external services |

### Key Principles

- **Multi-tenancy**: Every query scoped by `organization_id`
- **Errors as values**: `*domainerrors.DomainError` flows through layers
- **Money as integers**: Never use `float64` for monetary values
- **Context-first**: `ctx context.Context` is first parameter for I/O operations

---

## Project Structure

```
sekre-backend/
├── cmd/
│   ├── api/              # HTTP API server
│   ├── dbctl/            # Database seeding tool
│   └── migrate/          # Migration runner
│
├── internal/
│   ├── application/      # Use cases (auth, task, finance, etc.)
│   ├── config/           # Environment configuration
│   ├── delivery/http/    # HTTP handlers & middleware
│   ├── domain/           # Entities, value objects, interfaces
│   └── infrastructure/   # GORM repos, JWT, bcrypt
│
├── pkg/                  # Reusable packages
│   ├── database/         # GORM connection
│   ├── logger/           # Zerolog wrapper
│   ├── response/         # HTTP response helpers
│   ├── token/            # JWT manager
│   └── validator/        # Input validation
│
├── migrations/           # SQL migration files
├── tests/e2e/            # End-to-end tests
├── docs/api/             # OpenAPI spec
│
├── .env.example          # Configuration template
├── Makefile              # Development commands
└── README.md
```

---

## Getting Started

### Prerequisites

- Go 1.26+
- PostgreSQL 16+
- Docker (optional, for local Postgres)
- `make`

### Setup

```bash
# 1. Install development tools
make install-tools

# 2. Configure environment
cp .env.example .env
# Edit .env: set JWT_SECRET (>= 32 chars) and DB credentials

# 3. Start PostgreSQL
docker run --name sekre-pg -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=yourpass \
  -e POSTGRES_DB=sekre_db \
  -d postgres:16-alpine

# 4. Run migrations
make migrate

# 5. Seed demo data (optional)
make db-seed

# 6. Start server
make run
```

Server runs on `http://localhost:8080`

### Quick Health Check

```bash
curl http://localhost:8080/health/live
curl http://localhost:8080/health/ready
open http://localhost:8080/docs   # Swagger UI
```

---

## Configuration

All configuration via environment variables. See `.env.example` for full list.

### Required Variables

| Variable | Constraint |
|----------|------------|
| `JWT_SECRET` | At least 32 characters |
| `DB_PASSWORD` | Non-empty |

### Important Variables

| Variable | Default | Notes |
|----------|---------|-------|
| `SERVER_ENV` | `development` | Set to `production` for strict validation |
| `SERVER_PORT` | `8080` | HTTP listen port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `sekre_db` | Database name |
| `DB_SSLMODE` | `disable` | Must be `require` in production |
| `JWT_ACCESS_EXPIRY` | `15` | Access token lifetime (minutes) |
| `JWT_REFRESH_EXPIRY` | `10080` | Refresh token lifetime (minutes, 7 days) |
| `LOG_LEVEL` | `info` | trace/debug/info/warn/error |
| `CORS_ALLOWED_ORIGINS` | `localhost:3000` | Comma-separated origins |

---

## Development

### Common Commands

```bash
# Build & run
make build          # Build binaries to ./bin
make run            # Start API server
make migrate        # Run database migrations

# Database
make db-seed        # Seed demo data
make db-reset       # Reset DB + seed

# Code quality
make fmt            # Format code
make vet            # Run go vet
make lint           # Run golangci-lint
make pre-commit     # Fast checks (fmt + vet + lint + test-short)

# Testing
make test           # Run all tests
make test-unit      # Unit tests only (fast)
make test-integration  # Integration tests (requires Docker)
make test-cover     # Generate coverage report
make test-cover-check  # Enforce 60% coverage threshold

# Mocks
make mocks          # Regenerate mocks after interface changes

# Cleanup
make clean          # Remove build artifacts
```

### Testing Strategy

| Type | Tag | Speed | Purpose |
|------|-----|-------|---------|
| Unit | (none) | < 1s | Business logic, no I/O |
| Integration | `integration` | ~5s | Real Postgres via testcontainers |
| E2E | `e2e` | ~10s | Full HTTP stack |

Run specific test types:
```bash
go test -v -short ./...                    # Unit tests
go test -v -tags=integration ./...         # Integration tests
go test -v -tags=e2e ./tests/e2e/...       # E2E tests
```

---

## Security

### Multi-layer Security

1. **Transport**: HSTS in production
2. **CORS**: Explicit origin whitelist
3. **Authentication**: JWT with short-lived tokens (15 min)
4. **Authorization**: Role-based access control (OWNER, ADMIN, MEMBER)
5. **Input Validation**: Struct-tag validation + XSS sanitization
6. **Rate Limiting**: Token bucket per-IP (10 rps default)
7. **Security Headers**: CSP, X-Frame-Options, etc.
8. **Multi-tenancy**: Cross-tenant access returns 404
9. **Database**: Row-level security (RLS) policies

### Production Checklist

- [ ] `SERVER_ENV=production`
- [ ] `JWT_SECRET` is strong random string (>= 32 chars)
- [ ] `DB_SSLMODE=require`
- [ ] `LOG_LEVEL=info` or `warn`
- [ ] `CORS_ALLOWED_ORIGINS` lists actual domains
- [ ] Reverse proxy sets `X-Forwarded-For`
- [ ] Monitoring scrapes `/metrics`
- [ ] Health checks on `/health/live` and `/health/ready`

---

## API Documentation

- **OpenAPI Spec**: `GET /openapi.yaml`
- **Swagger UI**: `GET /docs`
- **Health Check**: `GET /health/live`, `GET /health/ready`
- **Metrics**: `GET /metrics` (Prometheus format)

---

## Conventions

### Code Style

- Standard `gofmt` + `goimports`
- All linters in `.golangci.yml` must pass
- Acronyms uppercase: `ID`, `URL`, `HTTP`

### Error Handling

- Domain errors: `*domainerrors.DomainError`
- Use sentinels: `ErrUserNotFound`, `ErrInvalidCredentials`
- Use factories: `NotFound("task", id)`, `Forbidden("delete", "task")`
- Wrap infrastructure errors: `domainerrors.Internal("save user", err)`

### HTTP Responses

```json
// Success
{ "success": true, "message": "...", "data": {...} }

// Error
{ "success": false, "code": "INVALID_INPUT", "message": "...", "request_id": "..." }
```

### Money

- Always use `valueobject.Money` (integer cents + currency)
- Never use `float64` for monetary values
- Default currency: `IDR`

---

## Feature Explanations

### Authentication and Tokens

- `access_token`: short-lived JWT for API authorization (default `15` minutes via `JWT_ACCESS_EXPIRY`)
- `refresh_token`: longer-lived JWT for session renewal (default `10080` minutes / 7 days via `JWT_REFRESH_EXPIRY`)
- Why both: short access lifetime reduces blast radius, refresh token keeps user session practical

#### Token lifecycle flow

```text
[Login/Register]
    -> validate credentials/registration payload
    -> issue access_token + refresh_token
    -> client stores both tokens

[Authenticated API Request]
    -> client sends Authorization: Bearer access_token
    -> middleware validates JWT
    -> valid: request continues
    -> invalid/expired: 401 Unauthorized

[Refresh]
    -> client sends refresh_token to refresh endpoint
    -> valid: issue new access_token (optionally rotate refresh token)
    -> invalid/expired: reject and require login
```

#### Login flow

```text
Client
  -> POST /auth/login (email, password)
  -> delivery validates request
  -> application verifies credentials
  -> infrastructure compares bcrypt hash
  -> infrastructure signs JWTs
  -> response returns authenticated user + tokens
```

#### Register flow

```text
Client
  -> POST /auth/register
  -> validate payload
  -> create organization + owner user (tenant bootstrap)
  -> issue tokens
  -> return authenticated session payload
```

#### Current user (`/auth/me`) flow

```text
Client (Bearer access_token)
  -> GET /auth/me
  -> auth middleware parses JWT
  -> context contains user_id + organization_id + role
  -> handler resolves current user profile
  -> return user + organization context
```

### Authorization (RBAC)

- Roles: `OWNER`, `ADMIN`, `MEMBER`
- Authorization happens after authentication, before protected action execution
- Unauthorized action returns forbidden/not-found based on security policy

```text
Request + JWT
  -> authenticate identity
  -> resolve role + tenant scope
  -> policy check for requested action
  -> allow or deny
```

### Multi-tenancy Isolation

- Every data access is scoped by `organization_id`
- Cross-tenant data must not be exposed

```text
Incoming request
  -> derive organization_id from auth context
  -> repository query constrained by organization_id
  -> no scoped match: return not found/forbidden
```

### Task Management

- Supports create, read, list, update, delete, and status update (`TODO`, `IN_PROGRESS`, `DONE`)
- Task records remain tenant-scoped

```text
Create/Update Task
  -> validate request
  -> map request to domain entity
  -> persist via repository
  -> return normalized response payload
```

```text
Update Task Status
  -> auth + tenant check
  -> validate status input
  -> patch task status
  -> return success
```

### Event Scheduling

- Supports create, read, list, update, delete for events
- Typical validation includes temporal consistency (start < end)

```text
Create Event
  -> validate title/time/division inputs
  -> persist event in tenant scope
  -> return event with related division data
```

### Finance Tracking

- Transaction endpoints support ledger operations and summary retrieval
- Monetary domain uses integer-safe representation (`valueobject.Money`), not `float64`

```text
Transaction Flow
  -> validate amount/type/context
  -> persist transaction
  -> compute/read summary
  -> return transaction/summary response
```

### Input Validation and Error Model

- Request payloads validated using struct tags (`validator v10`)
- Errors use standardized response shape with `request_id` for tracing

```text
Request
  -> bind JSON
  -> validate + sanitize
  -> fail: return 4xx with code/message/request_id
  -> pass: execute use case
```

### Rate Limiting

- Per-IP token bucket limits request rate (default 10 rps)

```text
Request
  -> limiter checks available tokens
  -> token available: continue
  -> token unavailable: 429 Too Many Requests
```

### Observability and Health

- Liveness/readiness endpoints for orchestration checks
- Prometheus metrics for monitoring
- Structured logs with request correlation

```text
Request lifecycle
  -> assign/request correlation ID
  -> execute handler + use case
  -> emit logs + metrics
  -> return response (errors include request_id)
```

---

## License

Internal project.
