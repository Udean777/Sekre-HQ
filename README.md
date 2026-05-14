# Sekre

Aplikasi manajemen organisasi kampus yang menyediakan fitur task management, event scheduling, finance tracking, dan kolaborasi tim dengan keamanan multi-tenant yang kuat.

**Sekre** membantu organisasi kampus (BEM, UKM, Himpunan) mengelola kegiatan, anggota, keuangan, dan tugas dalam satu platform terintegrasi.

---

## Project Structure

```
sekre-project/
├── sekre-backend/      # Go API server
├── sekre-frontend/     # SvelteKit web app
├── sekre-mobile/       # Kotlin Multiplatform mobile app (Android/iOS)
└── Makefile            # Root-level commands
```

---

## Tech Stack

### Backend
- **Language**: Go 1.26
- **Framework**: gorilla/mux
- **Database**: PostgreSQL 16+
- **ORM**: GORM v2
- **Auth**: JWT + bcrypt
- **Architecture**: Clean Architecture

[→ Backend Documentation](./sekre-backend/README.md)

### Frontend
- **Framework**: SvelteKit 2
- **Language**: TypeScript 6
- **Styling**: Tailwind CSS 4
- **Build Tool**: Vite 8

### Mobile
- **Framework**: Kotlin Multiplatform
- **UI**: Compose Multiplatform
- **Platforms**: Android, iOS

---

## Quick Start

### Prerequisites

- **Backend**: Go 1.26+, PostgreSQL 16+, Docker (optional)
- **Frontend**: Node.js 18+, npm/bun
- **Mobile**: Android Studio, Xcode (for iOS)

### Development Setup

#### 1. Backend

```bash
cd sekre-backend

# Configure environment
cp .env.example .env
# Edit .env: set JWT_SECRET and DB credentials

# Start PostgreSQL (Docker)
docker run --name sekre-pg -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=yourpass \
  -e POSTGRES_DB=sekre_db \
  -d postgres:16-alpine

# Run migrations
make migrate

# Seed demo data (optional)
make db-seed

# Start server
make run
```

Backend runs on `http://localhost:8080`

#### 2. Frontend

```bash
cd sekre-frontend

# Install dependencies
npm install
# or
bun install

# Configure environment
cp .env.example .env
# Edit .env: set API_URL

# Start dev server
npm run dev
# or
bun run dev
```

Frontend runs on `http://localhost:5173`

#### 3. Mobile

```bash
cd sekre-mobile

# Android
./gradlew :composeApp:installDebug

# iOS (macOS only)
open iosApp/iosApp.xcworkspace
```

---

## Root-Level Commands

The root Makefile provides shortcuts for common operations:

```bash
# Database
make db-seed        # Seed demo data
make db-reset       # Reset database + seed

# Development
make dev-backend    # Start backend server
make dev-frontend   # Start frontend dev server

# Testing
make test-backend   # Run backend tests
make test-frontend  # Run frontend tests

# Type checking
make check-frontend # Check frontend types
```

---

## Architecture Overview

### System Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Mobile    │────▶│   Backend   │────▶│  PostgreSQL  │
│  (KMP App)  │     │  (Go API)   │     │   Database   │
└─────────────┘     └─────────────┘     └──────────────┘
                           ▲
                           │
                    ┌──────┴──────┐
                    │   Frontend  │
                    │ (SvelteKit) │
                    └─────────────┘
```

### Backend Architecture

Clean Architecture with layer separation:

```
HTTP Handlers (delivery)
        ↓
Use Cases (application)
        ↓
Business Logic (domain)
        ↑
Infrastructure (GORM, JWT)
```

### Key Features

- **Manajemen Organisasi**: Multi-tenant untuk berbagai organisasi kampus
- **Task Management**: Kelola tugas dan deadline dengan assignment ke anggota
- **Event Scheduling**: Jadwalkan dan kelola acara organisasi
- **Finance Tracking**: Catat pemasukan, pengeluaran, dan laporan keuangan
- **Role-based Access**: OWNER, ADMIN, MEMBER dengan permission berbeda
- **Multi-platform**: Web (SvelteKit) dan Mobile (Android/iOS)

---

## API Documentation

- **Swagger UI**: http://localhost:8080/docs
- **OpenAPI Spec**: http://localhost:8080/openapi.yaml
- **Health Check**: http://localhost:8080/health/live
- **Metrics**: http://localhost:8080/metrics

---

## Development Workflow

### Backend Development

```bash
cd sekre-backend

# Code quality
make fmt            # Format code
make lint           # Run linters
make test           # Run tests
make test-cover     # Generate coverage report

# Database
make migrate        # Run migrations
make db-seed        # Seed data
```

See [Backend README](./sekre-backend/README.md) for detailed documentation.

### Frontend Development

```bash
cd sekre-frontend

npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build
npm run check       # Type check
```

### Mobile Development

```bash
cd sekre-mobile

# Android
./gradlew :composeApp:assembleDebug

# iOS
xcodebuild -workspace iosApp/iosApp.xcworkspace \
  -scheme iosApp -configuration Debug
```

---

## Environment Variables

### Backend (.env)

Required:
- `JWT_SECRET` - At least 32 characters
- `DB_PASSWORD` - Database password

Important:
- `SERVER_PORT` - Default: 8080
- `DB_HOST` - Default: localhost
- `DB_PORT` - Default: 5432
- `DB_NAME` - Default: sekre_db
- `LOG_LEVEL` - Default: info

See [sekre-backend/.env.example](./sekre-backend/.env.example) for full list.

### Frontend (.env)

- `PUBLIC_API_URL` - Backend API URL (default: http://localhost:8080)

---

## Production Deployment

### Backend

1. Set `SERVER_ENV=production`
2. Use strong `JWT_SECRET` (>= 32 chars)
3. Enable SSL: `DB_SSLMODE=require`
4. Set `LOG_LEVEL=info` or `warn`
5. Configure `CORS_ALLOWED_ORIGINS` with actual domains
6. Set up reverse proxy (nginx/Caddy) with HTTPS
7. Monitor `/metrics` with Prometheus
8. Health checks on `/health/live` and `/health/ready`

### Frontend

```bash
npm run build
# Deploy ./build directory to static hosting
```

### Mobile

```bash
# Android
./gradlew :composeApp:assembleRelease

# iOS
xcodebuild -workspace iosApp/iosApp.xcworkspace \
  -scheme iosApp -configuration Release archive
```

---

## Security

- **Authentication**: JWT with 15-minute access tokens
- **Authorization**: Role-based (OWNER, ADMIN, MEMBER)
- **Multi-tenancy**: Organization-scoped data access
- **Rate Limiting**: 10 requests/second per IP
- **Input Validation**: Server-side validation + XSS sanitization
- **Database**: Row-level security policies
- **Transport**: HTTPS in production with HSTS

---

## Testing

### Backend

```bash
cd sekre-backend

make test           # All tests
make test-unit      # Unit tests only (fast)
make test-integration  # Integration tests (requires Docker)
make test-cover     # Coverage report (60%+ enforced)
```

### Frontend

```bash
cd sekre-frontend

npm run test        # Run tests
npm run check       # Type check
```

---

## License

Internal project.
