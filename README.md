# Organization ERP Lite & Finance Hub (SaaS)

Platform SaaS multi-tenant untuk organisasi, komunitas, dan himpunan mahasiswa dalam mengelola operasional harian dengan dukungan AI.

## 🏗️ Repository Structure (Monorepo)

```
sekre-project/
├── sekre-backend/          # Golang API (Modular Monolith)
├── sekre-frontend/         # SvelteKit Web Dashboard
├── sekre-mobile/           # Compose Multiplatform (Android/iOS)
├── docs/                   # Documentation
│   ├── api/                # API specifications (OpenAPI)
│   ├── architecture/       # Architecture decision records
│   └── deployment/         # Deployment guides
├── scripts/                # Utility scripts
└── .github/workflows/      # CI/CD pipelines
```

## 🚀 Tech Stack

- **Backend:** Golang + PostgreSQL + Redis
- **Web:** SvelteKit (SSR)
- **Mobile:** Compose Multiplatform
- **AI:** LLM Integration (OpenAI/Gemini/Local)

## 📋 Development Phases

- [x] Phase 0: Foundation Setup
- [ ] Phase 1: MVP Development
- [ ] Phase 2: Beta Testing
- [ ] Phase 3: Monetization Features
- [ ] Phase 4: Mobile App
- [ ] Phase 5: Scale & Pro Features

## 🛠️ Quick Start

### Prerequisites

- PostgreSQL 16+ (local installation)
- Redis (via Docker)
- Go 1.22+
- Node.js 20+ (or Bun)

### Local Development

```bash
# Clone repository
git clone <repo-url>
cd sekre-project

# Start infrastructure (Redis only, PostgreSQL uses local installation)
./scripts/setup-dev.sh

# Seed demo data (optional but recommended)
./scripts/seed.sh

# Backend (with live reload - recommended)
cd sekre-backend
go mod download
make dev              # or: air

# Backend (without live reload)
make run              # or: go run cmd/api/main.go

# Frontend
cd sekre-frontend
bun install
bun run dev

# Mobile
cd sekre-mobile
./gradlew :composeApp:run
```

### Demo Login

After seeding, you can login with:
- **Email:** sajudin@himti.org
- **Password:** password123

## 📚 Documentation

- [Developer Quick Start Guide](./docs/DEVELOPER-GUIDE.md) - **Start here!**
- [Phase 0 Summary](./docs/PHASE-0-SUMMARY.md) - Foundation setup completion
- [Project Summary](./Project-Summary.md) - Complete project overview
- [API Documentation](./docs/api/openapi.yaml) - OpenAPI specification
- [Architecture Decisions](./docs/architecture/) - ADRs
- [Deployment Guide](./docs/deployment/) - Production deployment

## 🤝 Contributing

1. Create feature branch from `dev`
2. Make changes with conventional commits
3. Submit PR to `dev` branch
4. Wait for CI checks to pass

## 📄 License

Proprietary - All rights reserved
