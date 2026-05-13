# Sekre Backend

Multi-tenant SaaS backend for organization management, written in Go.
Provides authentication, task management, event scheduling, and finance
tracking with strong tenant isolation and production-grade security.

---

## Table of Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Operational Endpoints](#operational-endpoints)
- [Security](#security)
- [Conventions](#conventions)

---

## Architecture

The backend follows **Clean Architecture** principles with explicit
separation between layers. Dependencies point inward (delivery -> application
-> domain), never the reverse. Infrastructure (database, JWT, password
hashing) implements interfaces declared in the domain layer.

```
+------------------------------+
|       delivery (HTTP)        |   handlers, middleware, routing
|     [internal/delivery]      |
+--------------+---------------+
               |
               v
+------------------------------+
|   application (use cases)    |   business orchestration
|    [internal/application]    |
+--------------+---------------+
               |
               v
+------------------------------+
|         domain               |   entities, value objects, errors,
|     [internal/domain]        |   repository interfaces, services
+------------------------------+
               ^
               |  implements
               |
+------------------------------+
|       infrastructure         |   GORM, JWT, bcrypt
|   [internal/infrastructure]  |
+------------------------------+
```

### Layer Responsibilities

| Layer | Responsibility | Knows About |
|-------|----------------|-------------|
| **delivery** | HTTP routing, request decoding, response formatting | application |
| **application** | Use case orchestration, transaction boundaries | domain (only interfaces) |
| **domain** | Entities, value objects, business invariants, errors | nothing external |
| **infrastructure** | Concrete implementations (GORM, bcrypt, JWT) | domain (implements its interfaces) |

### Design Principles

- **SOLID**
  - **SRP** - one middleware per concern (CORS, auth, rate limit, etc.)
  - **OCP** - new features extend without modifying existing code
  - **LSP** - all repository implementations are substitutable via the interface
  - **ISP** - small, focused interfaces (`PasswordHasher`, `TokenGenerator`)
  - **DIP** - usecases depend on `repository.X` interfaces, not GORM types
- **Multi-tenancy** - every query scoped by `organization_id`. Cross-tenant
  access returns 404 (avoids leaking existence)
- **Errors as values** - `*domainerrors.DomainError` flows from domain
  to delivery, where it is mapped to HTTP status
- **Money as integer cents** - never use `float64` for monetary values
- **Context-first** - `ctx context.Context` is the first parameter of every
  function that touches I/O

---

## Project Structure

```
sekre-backend/
├── cmd/                          # Entry points (thin wrappers)
│   ├── api/                      # HTTP API server
│   └── migrate/                  # Database migration tool
│
├── internal/
│   ├── application/              # Use cases (business orchestration)
│   │   ├── auth/                 # Register, login, get-me
│   │   ├── organization/         # Org, division, member, user
│   │   ├── task/                 # Task management
│   │   ├── event/                # Event scheduling
│   │   └── finance/              # Transaction CRUD + summary
│   │
│   ├── config/                   # Env-based configuration loader
│   │
│   ├── delivery/http/            # HTTP delivery layer
│   │   ├── handler/              # Route handlers
│   │   └── middleware/           # CORS, auth, RBAC, rate limit, etc.
│   │
│   ├── domain/                   # Pure business core
│   │   ├── entity/               # User, Task, Transaction, ...
│   │   ├── valueobject/          # Money, etc.
│   │   ├── types/                # Role, TaskStatus, ... (typed enums)
│   │   ├── repository/           # Repository interfaces
│   │   ├── service/              # Service interfaces (PasswordHasher, ...)
│   │   └── errors/               # DomainError, sentinels, factories
│   │
│   ├── infrastructure/           # External integrations
│   │   ├── auth/                 # bcrypt, JWT generator, validator
│   │   └── persistence/gorm/     # GORM repositories + mappers
│   │
│   ├── middleware/               # (Legacy) auth middleware
│   ├── models/                   # GORM models (separate from entities)
│   ├── repository/               # TxRunner shared abstraction
│   │
│   └── test/                     # Test infrastructure (build-tagged)
│       ├── authz/                # Authorization matrix
│       ├── clock/                # Fake clock for time-dependent tests
│       ├── db/                   # Testcontainers Postgres setup
│       ├── fixtures/             # Builder-pattern test data
│       │   ├── entity/           #   for unit tests (entity-based)
│       │   └── scenario/         #   pre-built test scenarios
│       ├── http/                 # HTTP test helpers (auth headers, etc.)
│       ├── mocks/                # Generated mocks for repositories/services
│       └── usecasemocks/         # Generated mocks for usecases (handler tests)
│
├── pkg/                          # Reusable packages (no domain dependency)
│   ├── clock/                    # Clock interface (RealClock)
│   ├── database/                 # GORM connection setup + zerolog adapter
│   ├── logger/                   # Zerolog initialization
│   ├── observability/            # Prometheus metrics
│   ├── password/                 # (legacy) password helpers
│   ├── requestid/                # Request ID generation
│   ├── response/                 # Standard response writer + error mapper
│   ├── token/                    # JWT token manager
│   └── validator/                # go-playground/validator wrapper
│
├── tests/
│   └── e2e/                      # End-to-end HTTP tests (build tag: e2e)
│
├── migrations/                   # SQL migration files (golang-migrate)
├── docs/api/openapi.yaml         # OpenAPI 3.0 specification
│
├── .env.example                  # Configuration template
├── .githooks/pre-commit          # Pre-commit hook (vet/lint/test)
├── .golangci.yml                 # Linter configuration
├── .mockery.yaml                 # Mock generation config
├── .codecov.yml                  # Coverage thresholds
├── Makefile                      # Standard dev commands
├── go.mod / go.sum
└── README.md                     # This file
```

---

## Tech Stack

### Core

| Component | Choice | Why |
|-----------|--------|-----|
| Language | **Go 1.26** | Performance, simplicity, strong stdlib |
| HTTP Router | **gorilla/mux** | Subrouters, middleware composition, mature |
| ORM | **GORM v2** | Productive for CRUD, hooks, soft delete |
| Database | **PostgreSQL 16+** | JSON, RLS, mature ecosystem |
| Migrations | **golang-migrate** | SQL files, up/down semantics |
| Auth | **golang-jwt v5** | RFC 7519 compliant, well-maintained |
| Password Hashing | **bcrypt** (`golang.org/x/crypto`) | Adaptive cost, audited |
| Logging | **zerolog** | Structured, zero-allocation, fast |
| Validation | **go-playground/validator v10** | Struct-tag based, custom validators |
| Rate Limiting | **golang.org/x/time/rate** | Token-bucket, stdlib-quality |
| Metrics | **prometheus/client_golang** | Industry standard |
| Config | **godotenv + os.Getenv** | Simple, twelve-factor compliant |
| File Generation | **xuri/excelize** | XLSX read/write for member import |

### Testing

| Component | Choice |
|-----------|--------|
| Test Runner | `go test` + **gotestsum** (CI) |
| Assertions | **stretchr/testify** |
| Mocks | **vektra/mockery v2** (table-driven generation) |
| Integration DB | **testcontainers-go** (Postgres in Docker) |
| Fuzz Testing | Go 1.18+ built-in |
| Coverage | `go test -cover` + Codecov |

### Tooling

| Tool | Purpose |
|------|---------|
| `golangci-lint` | Aggregator linter (govet, staticcheck, revive, gocritic, gosec, etc.) |
| `mockery` | Generate testify mocks from interfaces |
| `gotestsum` | Better test output + JUnit XML for CI |
| `goimports` | Format + auto-import (optional) |

---

## Getting Started

### Prerequisites

- Go 1.26+
- Docker (for Postgres or testcontainers)
- `make`

### First-time Setup

```bash
# 1. Install development tools (mockery, golangci-lint, gotestsum)
make install-tools

# 2. Configure git pre-commit hooks
make setup-hooks

# 3. Copy env template and fill in secrets
cp .env.example .env
# Edit .env, especially JWT_SECRET (>= 32 chars) and DB_PASSWORD

# 4. Start Postgres (any way you prefer; example with Docker)
docker run --name sekre-pg -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=yourpass \
  -e POSTGRES_DB=sekre_db \
  -d postgres:16-alpine

# 5. Run migrations
make migrate

# 6. Start the API
make run
```

The server listens on `http://localhost:${SERVER_PORT}` (default `8080`).

### Quick Health Check

```bash
curl http://localhost:8080/health/live
curl http://localhost:8080/health/ready
open http://localhost:8080/docs   # Swagger UI
```

---

## Configuration

All configuration is loaded from environment variables. See
[`.env.example`](./.env.example) for the full list with defaults.

### Required Variables

| Variable | Constraint |
|----------|------------|
| `JWT_SECRET` | At least 32 characters |
| `DB_PASSWORD` | Non-empty |

### Important Variables

| Variable | Default | Notes |
|----------|---------|-------|
| `SERVER_ENV` | `development` | `production` enables HSTS and stricter validation |
| `SERVER_PORT` | `8080` | HTTP listen port |
| `SERVER_READ_TIMEOUT` | `15` | Seconds |
| `SERVER_WRITE_TIMEOUT` | `15` | Seconds |
| `SERVER_SHUTDOWN_TIMEOUT` | `30` | Graceful shutdown deadline |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | - | Postgres connection |
| `DB_SSLMODE` | `disable` | Must NOT be `disable` in production |
| `DB_MAX_OPEN_CONNS` | `25` | Connection pool ceiling |
| `DB_MAX_IDLE_CONNS` | `5` | Idle connections kept warm |
| `DB_CONN_MAX_LIFETIME` | `3600` | Seconds |
| `JWT_ACCESS_EXPIRY` | `15` | Minutes |
| `JWT_REFRESH_EXPIRY` | `10080` | Minutes (7 days) |
| `LOG_LEVEL` | `info` | One of trace/debug/info/warn/error/fatal/panic |
| `CORS_ALLOWED_ORIGINS` | `localhost:3000,localhost:5173` | Comma-separated; never `*` with credentials |
| `CORS_ALLOW_CREDENTIALS` | `true` | If true, origins must be explicit |

### Production Validation

The config loader **fails fast at startup** if:

- `JWT_SECRET` is missing or shorter than 32 chars
- `LOG_LEVEL` is invalid
- In production: `DB_SSLMODE=disable` is rejected
- In production: `LOG_LEVEL=trace`/`debug` is rejected
- `CORS_ALLOWED_ORIGINS` contains `*` while `CORS_ALLOW_CREDENTIALS=true`

---

## Development Workflow

The Makefile is the canonical entry point for all dev tasks.
Run `make help` for the full list.

```bash
# Build & run
make build          # Build api and migrate binaries -> ./bin
make run            # go run ./cmd/api
make migrate        # Apply database migrations

# Code quality
make fmt            # gofmt + goimports
make vet            # go vet
make lint           # golangci-lint (with project rules)
make pre-commit     # Fast checks (fmt + vet + lint + test-short)
make ci             # Full CI checks locally

# Mocks
make mocks          # Regenerate mocks via mockery (after interface changes)

# Cleanup
make clean          # Remove bin/ and coverage artifacts
```

### Adding a Feature

1. **Domain first** - if a new entity or value object is needed, add it to
   `internal/domain/entity/` or `internal/domain/valueobject/` with tests
2. **Repository interface** - declare in `internal/domain/repository/`
3. **Use case** - put orchestration in `internal/application/<area>/`
   - Inject dependencies as interfaces (testable with mocks)
   - Return `*domainerrors.DomainError` for business failures
4. **Infrastructure** - implement the repository in
   `internal/infrastructure/persistence/gorm/repository/`
5. **Handler** - HTTP binding in `internal/delivery/http/handler/`
   - Use `handler.DecodeAndValidate(r, &req)` for input
   - Call `response.HandleError(w, r, err)` for failures
6. **Wiring** - register the dependency chain and routes in
   `cmd/api/main.go`
7. **Tests** - unit tests next to source files, integration tests with
   build tag `integration`, E2E with `e2e`
8. **Mocks** - if new interface, add to `.mockery.yaml` and run `make mocks`

---

## Testing

The project has a multi-tier testing strategy. See `make help` for all
test targets.

### Test Categories

| Tag | Use Case | Speed |
|-----|----------|-------|
| (none) | Unit tests, no I/O | < 1 s |
| `integration` | Real Postgres via testcontainers | Several seconds |
| `e2e` | Full HTTP stack (server + db) | Slowest |

### Common Commands

```bash
# Unit tests (fast)
make test-unit

# Coverage report (HTML)
make test-cover

# Coverage with threshold enforcement (CI gate)
make test-cover-check    # Fails if total < 60%

# Integration tests (requires Docker)
make test-integration

# End-to-end tests
make test-e2e

# Fuzz tests (30s each)
make test-fuzz

# Benchmarks
make bench
make bench-save          # Saves baseline to docs/benchmarks/YYYY-MM.md
```

### Testing Patterns

- **Table-driven** for multiple scenarios
- **`t.Parallel()`** in unit tests
- **Builder pattern** for test data
  - `internal/test/fixtures/` - GORM model builders (integration tests)
  - `internal/test/fixtures/entity/` - domain entity builders (unit tests)
- **Scenario builders** in `internal/test/fixtures/entity/scenario/`
  for common setups (`SingleTenant`, `MultiTenant`, `TaskBoard`,
  `FinanceLedger`, `AuthScenario`)
- **Clock abstraction** - `pkg/clock` + `internal/test/clock` for
  deterministic time
- **Authorization matrix** - `internal/test/authz` declares per-resource
  role/tenant test cases

### Mock Generation

Mocks are generated with [mockery](https://github.com/vektra/mockery).
After changing any interface, run:

```bash
make mocks
```

Mocks live in:
- `internal/test/mocks/` - repository and service interfaces
- `internal/test/usecasemocks/` - usecase interfaces (separate package
  to avoid import cycles)

---

## Operational Endpoints

These endpoints are public (no auth, no rate limit) and intended for
observability and tooling.

| Endpoint | Purpose | Consumer |
|----------|---------|----------|
| `GET /health/live` | Liveness probe | k8s, load balancer |
| `GET /health/ready` | Readiness probe (pings DB) | k8s, load balancer |
| `GET /metrics` | Prometheus metrics | Monitoring |
| `GET /openapi.yaml` | OpenAPI 3.0 spec | Tooling, code generation |
| `GET /docs` | Swagger UI (HTML) | Developers |

### Metrics Exposed

- `http_requests_total{method,path,status}` - request counter
- `http_request_duration_seconds{method,path}` - latency histogram
- `http_requests_in_flight{method}` - in-flight gauge
- `http_request_size_bytes{method,path}` - request body size
- `http_response_size_bytes{method,path}` - response body size

Path labels use the **mux route template** (e.g., `/tasks/{id}`) to
prevent cardinality explosion.

---

## Security

The API has nine layers of security control:

1. **Transport** - HSTS in production (`Strict-Transport-Security`)
2. **CORS** - explicit origin whitelist; rejects wildcard with credentials
3. **Authentication** - JWT with short-lived access tokens
4. **Authorization** - role-based middleware (`RequireOwner`, `RequireAdmin`,
   `RequireMember`, generic `RequireRole`)
5. **Input validation** - struct-tag validation at handler boundary
6. **Rate limiting** - token bucket per-IP (10 rps default,
   stricter for auth)
7. **Security headers** - X-Content-Type-Options, X-Frame-Options,
   Referrer-Policy, CSP, Permissions-Policy
8. **Multi-tenancy** - cross-tenant access returns 404 (no existence leak)
9. **Observability** - metrics enable anomaly detection

### Middleware Pipeline

```
Request
  -> RequestID         correlation ID
  -> Timeout           30s
  -> Metrics           Prometheus
  -> SecurityHeaders   defense-in-depth
  -> CORS              origin whitelist
  -> Logging           structured access log
  -> /api/v1/*
       -> RateLimit
       -> [Protected]
            -> Auth (JWT)
            -> RequireRole
            -> Handler
```

### Production Checklist

Before deploying:

- [ ] `SERVER_ENV=production`
- [ ] `CORS_ALLOWED_ORIGINS` lists actual domains (no `localhost`)
- [ ] `JWT_SECRET` is a strong random string (>= 32 chars)
- [ ] `DB_SSLMODE` is `require` or stricter
- [ ] `LOG_LEVEL=info` or `warn`
- [ ] Reverse proxy correctly sets `X-Forwarded-For`
- [ ] Prometheus scraping `/metrics`
- [ ] Liveness probing `/health/live`
- [ ] Readiness probing `/health/ready`
- [ ] Pre-commit hooks active for the team

---

## Conventions

### Go style

- Standard `gofmt` + `goimports` - enforced by pre-commit and CI
- All linters in `.golangci.yml` must pass (`make lint`)
- Acronyms are uppercase: `ID`, `URL`, `HTTP` (not `Id`, `Url`, `Http`)
- Package names are lowercase, single-word

### Errors

- Domain errors are **always** `*domainerrors.DomainError`
- Use sentinels for context-free cases (`ErrUserNotFound`, `ErrInvalidCredentials`)
- Use factories for constructed cases (`NotFound("task", id)`,
  `Forbidden("delete", "task")`)
- Wrap infrastructure errors: `domainerrors.Internal("save user", err)`
- The delivery layer translates `DomainError.Code` to HTTP status

### HTTP responses

Standard shape (see `pkg/response`):

```json
// Success
{ "success": true, "message": "...", "data": { ... } }

// Error
{ "success": false, "error": "...", "code": "INVALID_INPUT", "details": { ... } }
```

`details` is for logging/debugging; the client message lives in `error`.

### Money

- Always use `valueobject.Money` (`AmountCents int64` + `Currency string`)
- Never use `float64` for monetary values
- Default currency: `IDR`

### Logging

- Use `pkg/logger` (zerolog wrapper) - structured fields, not strings
- Levels: `trace` < `debug` < `info` < `warn` < `error` < `fatal` < `panic`
- Production must use `info` or higher

### Context

- `ctx context.Context` is always the **first** parameter
- Pass through to repositories, never use `context.Background()` mid-request
- Cancellation is checked at I/O boundaries

### Multi-tenancy

- Every query MUST filter by `organization_id`
- Cross-tenant access returns `domainerrors.NotFound`, not `Forbidden`
  (avoids leaking existence)

---

## License

Internal project. See repository root for license details.
