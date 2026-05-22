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
| Scheduler | robfig/cron v3 |

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
│   ├── infrastructure/   # GORM repos, JWT, bcrypt
│   └── scheduler/        # Background cron jobs
│       └── jobs/         # cleanup.go, ping.go
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
├── Dockerfile            # Multi-stage Docker build
├── render.yaml           # Render deployment config
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

Server runs on `http://localhost:1000`

### Quick Health Check

```bash
curl http://localhost:1000/health/live
curl http://localhost:1000/health/ready
open http://localhost:1000/docs   # Swagger UI
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
| `SERVER_PORT` | `8080` | HTTP listen port (project default: `1000`) |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port (project default: `2000`) |
| `DB_NAME` | `sekre_db` | Database name |
| `DB_SSLMODE` | `disable` | Must be `require` in production |
| `JWT_ACCESS_EXPIRY` | `15` | Access token lifetime (minutes) |
| `JWT_REFRESH_EXPIRY` | `10080` | Refresh token lifetime (minutes, 7 days) |
| `LOG_LEVEL` | `info` | trace/debug/info/warn/error |
| `CORS_ALLOWED_ORIGINS` | `localhost:3000` | Comma-separated origins |

### Scheduler Variables

| Variable | Default | Notes |
|----------|---------|-------|
| `CLEANUP_REFRESH_SESSION_RETENTION_DAYS` | `7` | Days to keep expired refresh sessions |
| `CLEANUP_AUDIT_LOG_RETENTION_DAYS` | `90` | Days to keep audit log entries |
| `SELF_PING_URL` | `` | Health URL to ping every 14 min (prevents Render spin-down) |

---

## Background Scheduler

The server runs a built-in cron scheduler with the following jobs:

| Job | Schedule | Description |
|-----|----------|-------------|
| `CleanupExpiredSessions` | Daily 02:00 | Deletes expired refresh sessions older than retention period |
| `CleanupAuditLogs` | Daily 02:30 | Deletes audit log entries older than retention period |
| `SelfPing` | Every 14 min | Pings `SELF_PING_URL` to prevent Render free tier spin-down |

> `SelfPing` is a no-op if `SELF_PING_URL` is not set.

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

## Deployment

### Render (Current)

Project uses [Render](https://render.com) for hosting with `render.yaml` Blueprint.

**Resources provisioned:**
- Web Service (Docker, free tier)
- PostgreSQL (free tier, 90-day expiry)

**Setup steps:**
1. New → Blueprint → connect repo → set YAML path: `sekre-backend/render.yaml`
2. Set secrets in Render dashboard: `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`
3. After first deploy, set `SELF_PING_URL` to `https://<service>.onrender.com/health`
4. Run migration via Render Shell: `make migrate`

**GitHub Secrets required for CI/CD:**

| Secret | Description |
|--------|-------------|
| `RENDER_DEPLOY_HOOK_URL` | From Render dashboard → Settings → Deploy Hook |
| `RENDER_SERVICE_URL` | e.g. `https://sekre-backend.onrender.com` |

### Docker (Local / VPS)

```bash
# Build image
docker build -t sekre-backend .

# Run with env file
docker run -d \
  --env-file .env \
  -p 1000:1000 \
  sekre-backend
```

### Migrating to VPS

The CD workflow in `.github/workflows/backend-cd.yml` has a commented-out VPS deploy job ready to use. Replace the Render deploy step with the SSH deploy step and add these secrets:

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | VPS IP or domain |
| `VPS_USER` | SSH username |
| `VPS_SSH_KEY` | SSH private key |

---

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `backend-ci.yml` | Push / PR to `main` (path: `sekre-backend/**`) | lint → test → build → docker push (GHCR) |
| `backend-cd.yml` | After CI passes on `main` | Deploy to Render via deploy hook |

Deploy status is visible in the GitHub commit/PR timeline.

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
- [ ] `SELF_PING_URL` set to health endpoint
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

## Alur Fitur (Versi Mudah Dipahami)

Bagian ini menjelaskan cara kerja sistem dengan bahasa sederhana, agar bisa dipahami juga oleh non-engineer.

### 1) Login, Sesi, dan Token

Saat user login atau daftar, backend memberikan 2 "kunci digital":

- `access_token` (umur pendek, default 15 menit): dipakai untuk akses API sehari-hari.
- `refresh_token` (umur lebih panjang, default 7 hari): dipakai untuk minta `access_token` baru tanpa login ulang.

Kenapa 2 token? Agar tetap nyaman dipakai user, tapi risiko keamanan tetap kecil jika token utama bocor.

```text
User login/daftar
  -> backend cek data user
  -> backend kirim access_token + refresh_token

User akses fitur
  -> kirim access_token
  -> kalau valid: proses lanjut
  -> kalau expired/tidak valid: diminta refresh atau login ulang

Saat access_token habis
  -> kirim refresh_token
  -> backend kirim access_token baru
```

### 2) Hak Akses Per Peran (RBAC)

Setiap user punya peran:

- `OWNER`: akses tertinggi di organisasi.
- `ADMIN`: mengelola sebagian besar operasional.
- `MEMBER`: akses sesuai kebutuhan kerja harian.

Alurnya sederhana: setelah user terbukti login, sistem cek apakah perannya boleh menjalankan aksi tersebut.

### 3) Isolasi Data Antar Organisasi (Multi-tenant)

Sistem ini dipakai banyak organisasi sekaligus, jadi data harus benar-benar terpisah.

- Setiap request selalu membawa konteks `organization_id`.
- Query database selalu difilter berdasarkan organisasi itu.
- Jika user mencoba akses data organisasi lain, data tidak akan ditampilkan.

### 4) Alur Fitur Operasional

#### Task Management

```text
User kirim data task
  -> backend validasi input
  -> backend simpan/ubah data task
  -> backend kirim hasil terbaru
```

Status task yang didukung: `TODO`, `IN_PROGRESS`, `DONE`.

#### Event Scheduling

Backend memastikan data waktu masuk akal (waktu mulai harus sebelum waktu selesai), lalu menyimpan data event.

#### Finance Tracking

- Data transaksi divalidasi dulu.
- Data disimpan ke ledger.
- Ringkasan keuangan dihitung/dibaca dari data tersimpan.

Catatan penting: nominal uang tidak pakai `float64`, tapi integer-safe (`valueobject.Money`) agar perhitungan presisi.

### 5) Validasi Input dan Format Error

Setiap request dari client selalu melewati validasi.

- Jika format/syarat data salah → backend balas error 4xx.
- Jika benar → proses bisnis dilanjutkan.
- Setiap error menyertakan `request_id` agar mudah ditelusuri di log.

### 6) Pembatasan Request (Rate Limiting)

Untuk mencegah spam/abuse, sistem membatasi jumlah request per IP (default 10 request/detik).

- Masih dalam batas → request diproses.
- Lewat batas → dapat `429 Too Many Requests`.

### 7) Monitoring dan Health Check

Backend menyediakan endpoint untuk memantau kondisi layanan:

- `GET /health/live`: cek apakah service hidup.
- `GET /health/ready`: cek apakah service siap melayani request.
- `GET /metrics`: data metrik untuk monitoring (Prometheus).

Selain itu, log dibuat terstruktur dan menyertakan `request_id` agar investigasi insiden lebih cepat.

---

## License

Internal project — Arah Baru Selayar.
