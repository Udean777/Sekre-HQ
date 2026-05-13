# 🏢 Sekre - Organization ERP Lite & Finance Hub

> A modern SaaS platform for organizations, communities, and student associations to manage daily operations, tasks, events, and finances with AI-powered automation.

[![Backend](https://img.shields.io/badge/Backend-Go-00ADD8?logo=go)](./sekre-backend)
[![Frontend](https://img.shields.io/badge/Frontend-SvelteKit-FF3E00?logo=svelte)](./sekre-frontend)
[![Mobile](https://img.shields.io/badge/Mobile-Compose_Multiplatform-4285F4?logo=jetpackcompose)](./sekre-mobile)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)](https://www.postgresql.org/)

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Features](#features)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Sekre is a comprehensive multi-tenant SaaS platform designed to streamline organizational operations. It integrates task management, event scheduling, and intelligent financial reporting with AI automation support.

### Key Highlights

- **Multi-tenant Architecture**: Secure data isolation with PostgreSQL Row-Level Security
- **Real-time Collaboration**: WebSocket support for live updates
- **Offline-First Mobile**: Compose Multiplatform with local-first sync
- **AI-Powered Reports**: Automated LPJ (Accountability Report) generation
- **Flexible Subscription**: Free, Lite, and Pro plans with feature gating

## 🛠️ Tech Stack

### Backend
- **Language**: Go 1.21+
- **Framework**: Gorilla Mux (REST API)
- **Database**: PostgreSQL 15+ with Row-Level Security
- **Cache/Queue**: Redis + Asynq
- **Architecture**: Clean Architecture (Modular Monolith)

### Frontend
- **Framework**: SvelteKit 2.0+ (SSR)
- **Language**: TypeScript 5+
- **Styling**: TailwindCSS 3+
- **State Management**: Svelte Stores
- **Build Tool**: Vite

### Mobile
- **Framework**: Compose Multiplatform
- **Language**: Kotlin
- **Architecture**: MVI/MVVM with Clean Architecture
- **Local Database**: SQLDelight
- **Networking**: Ktor Client

## 📁 Project Structure

```
sekre-project/
├── sekre-backend/          # Go backend API
│   ├── cmd/api/            # Application entry point
│   ├── internal/           # Internal packages
│   │   ├── auth/           # Authentication module
│   │   ├── organization/   # Organization & division management
│   │   ├── task/           # Task management
│   │   ├── event/          # Event scheduling
│   │   ├── finance/        # Finance tracking
│   │   ├── middleware/     # HTTP middlewares
│   │   └── domain/         # Domain entities
│   ├── pkg/                # Shared utilities
│   └── migrations/         # Database migrations
│
├── sekre-frontend/         # SvelteKit web app
│   ├── src/
│   │   ├── routes/         # File-based routing
│   │   │   ├── (public)/   # Public pages
│   │   │   └── app/        # Protected dashboard
│   │   ├── lib/            # Shared libraries
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── api/        # API client
│   │   │   └── server/     # Server-side utilities
│   │   └── app.html        # HTML template
│   └── static/             # Static assets
│
├── sekre-mobile/           # Compose Multiplatform app
│   └── composeApp/
│       └── src/
│           ├── commonMain/ # Shared code (95%)
│           │   ├── core/   # Infrastructure
│           │   └── features/ # Feature modules
│           ├── androidMain/ # Android-specific
│           └── iosMain/    # iOS-specific
│
├── docs/                   # Documentation
└── docker-compose.yml      # Local development setup
```

## 🚀 Getting Started

### Prerequisites

- **Go**: 1.21 or higher
- **Node.js**: 18 or higher
- **PostgreSQL**: 15 or higher
- **Redis**: 7 or higher
- **Docker & Docker Compose** (recommended for local development)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sekre-project.git
   cd sekre-project
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the applications**
   - Backend API: http://localhost:8080
   - Frontend Web: http://localhost:5173
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

### Manual Setup

#### Backend Setup

```bash
cd sekre-backend

# Install dependencies
go mod download

# Copy environment file
cp .env.example .env

# Run database migrations
go run cmd/migrate/main.go up

# Start the server
go run cmd/api/main.go
```

Backend will run on `http://localhost:8080`

#### Frontend Setup

```bash
cd sekre-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

#### Mobile Setup

```bash
cd sekre-mobile

# For Android
./gradlew :composeApp:assembleDebug

# For iOS (macOS only)
./gradlew :composeApp:iosSimulatorArm64Test
```

## 💻 Development

### Backend Development

```bash
cd sekre-backend

# Run tests
go test ./...

# Run with hot reload
air

# Build for production
go build -o bin/api cmd/api/main.go

# Run linter
golangci-lint run
```

### Frontend Development

```bash
cd sekre-frontend

# Run development server
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Mobile Development

```bash
cd sekre-mobile

# Run Android app
./gradlew :composeApp:installDebug

# Run iOS app (macOS only)
./gradlew :composeApp:iosDeployIPhone15Debug

# Run tests
./gradlew test
```

## ✨ Features

### Current Features (MVP)

- ✅ **Multi-tenant Authentication**: Secure JWT-based auth with organization isolation
- ✅ **Organization Management**: Create and manage organizations with divisions
- ✅ **Member Management**: Add members, assign roles, bulk import from CSV/Excel
- ✅ **Task Management**: Kanban board with drag-and-drop (To-Do, In Progress, Done)
- ✅ **Event Scheduling**: Calendar view for organizational events
- ✅ **Finance Tracking**: Income/expense recording with categorization
- ✅ **Dashboard**: Real-time statistics and activity overview
- ✅ **Settings & Profile**: User profile, password change, organization settings
- ✅ **Organization Deletion**: Safe deletion with confirmation

### Upcoming Features

#### Phase 2: Enhanced Features
- 🔄 **Smart Finance Hub**: Multi-level approval workflow
- 🔄 **AI-Generated LPJ**: Automated accountability reports
- 🔄 **Data Export**: CSV/Excel export for reports
- 🔄 **Email Notifications**: Task reminders and approval notifications

#### Phase 3: Premium Features
- 📅 **Custom Domain**: Branded public pages (Pro Plan)
- 📅 **Cloud Storage**: Document and photo archival
- 📅 **Advanced Analytics**: Cross-division performance comparison
- 📅 **Mobile App**: Offline-first iOS and Android apps

## 📚 Documentation

- [Project Summary](./Project-Summary.md) - Complete project overview and architecture
- [Backend Documentation](./sekre-backend/README.md) - Backend API documentation
- [Frontend Documentation](./sekre-frontend/README.md) - Frontend development guide
- [Mobile Documentation](./sekre-mobile/README.md) - Mobile app development guide
- [API Documentation](http://localhost:8080/swagger) - Interactive API docs (when running)

## 🗄️ Database Schema

The application uses PostgreSQL with Row-Level Security (RLS) for multi-tenant data isolation.

### Core Tables

- `organizations` - Tenant/organization data
- `users` - User accounts
- `organization_members` - User-organization relationships with roles
- `divisions` - Organizational divisions/departments
- `division_members` - Division membership
- `tasks` - Task management
- `events` - Event scheduling
- `finance_records` - Financial transactions
- `audit_logs` - Activity audit trail

For detailed schema, see [Project-Summary.md](./Project-Summary.md#database-schema)

## 🔐 Environment Variables

### Backend (.env)

```env
# Server
PORT=8080
ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=sekre_db

# JWT
JWT_SECRET=your-secret-key-here
JWT_ACCESS_TOKEN_TTL=24h
JWT_REFRESH_TOKEN_TTL=168h

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)

```env
# API
PUBLIC_API_URL=http://localhost:8080/api/v1

# App
PUBLIC_APP_NAME=Sekre
PUBLIC_APP_URL=http://localhost:5173
```

## 🧪 Testing

### Backend Tests

The backend has a comprehensive testing infrastructure. See [sekre-backend/docs/testing.md](./sekre-backend/docs/testing.md) for full details.

```bash
cd sekre-backend

# Quick start
make test-unit              # Unit tests only (fast)
make test-cover             # With HTML coverage report
make test-cover-check       # Enforce 60% threshold

# Test categories
make test-integration       # Integration tests (testcontainers + PostgreSQL)
make test-e2e               # End-to-end tests (full HTTP stack)
make test-fuzz              # Fuzz tests (30s each)

# Performance
make bench                  # Run benchmarks
make bench-save             # Save baseline to docs/benchmarks/

# Code quality
make lint                   # golangci-lint
make vet                    # go vet
make ci                     # Full CI checks locally

# Setup (run once)
make install-tools          # Install mockery, gotestsum, etc
make setup-hooks            # Configure git pre-commit hooks
```

#### Test Tags

| Tag | Use Case | When |
|-----|----------|------|
| (none) | Unit tests, < 1s | Every push, pre-commit |
| `integration` | DB tests with testcontainers | PR, nightly |
| `e2e` | Full stack HTTP tests | PR, nightly |

#### Test Statistics

- **Unit tests:** 100+ tests (domain + application layers, 75% coverage)
- **Integration tests:** 20+ tests (repository layer)
- **Handler tests:** 8+ tests (HTTP handlers)
- **E2E tests:** 5+ tests (full stack flows)
- **Benchmarks:** 12 benchmarks (Money, Bcrypt)
- **Fuzz tests:** 8 fuzz functions (validators, parsers)

### Frontend Tests

```bash
cd sekre-frontend

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

## 🚢 Deployment

### Backend Deployment

```bash
# Build Docker image
docker build -t sekre-backend:latest ./sekre-backend

# Run container
docker run -p 8080:8080 --env-file .env sekre-backend:latest
```

### Frontend Deployment

```bash
# Build for production
cd sekre-frontend
npm run build

# Deploy to Vercel
vercel deploy --prod

# Or deploy to Netlify
netlify deploy --prod
```

### Database Migration

```bash
# Run migrations
cd sekre-backend
go run cmd/migrate/main.go up

# Rollback migration
go run cmd/migrate/main.go down
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Go**: Follow [Effective Go](https://golang.org/doc/effective_go) guidelines
- **TypeScript**: Use ESLint and Prettier configurations
- **Kotlin**: Follow [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend**: Go + PostgreSQL + Redis
- **Frontend**: SvelteKit + TypeScript + TailwindCSS
- **Mobile**: Compose Multiplatform + Kotlin

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) - The fastest way to build Svelte apps
- [Gorilla Mux](https://github.com/gorilla/mux) - Powerful HTTP router for Go
- [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) - Declarative UI framework
- [PostgreSQL](https://www.postgresql.org/) - The world's most advanced open source database

## 📞 Support

For support, email support@sekre.app or join our Discord community.

---

**Built with ❤️ for organizations, communities, and student associations**
