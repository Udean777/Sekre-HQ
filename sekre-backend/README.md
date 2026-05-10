# Sekre Backend

Backend API untuk Sekre - Organization ERP Lite & Finance Hub.

## Tech Stack

- **Language**: Go 1.26.2+
- **Framework**: Gorilla Mux
- **Database**: PostgreSQL 16+
- **Authentication**: JWT
- **Architecture**: Clean Architecture (Modular Monolith)

## Prerequisites

- Go 1.26.2 or higher
- PostgreSQL 16 or higher
- Air (for live reload) - optional but recommended

## Installation

### 1. Install Dependencies

```bash
go mod download
```

### 2. Install Development Tools (Optional)

```bash
make install-tools
```

Or manually:

```bash
go install github.com/cosmtrek/air@latest
```

### 3. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials.

### 4. Run Migrations

```bash
make migrate
```

Or manually:

```bash
cd ..
./scripts/migrate.sh
```

## Development

### Run with Live Reload (Recommended)

```bash
make dev
```

This will start the server with live reload using Air. Any changes to `.go` files will automatically rebuild and restart the server.

### Run without Live Reload

```bash
make run
```

Or directly:

```bash
go run cmd/api/main.go
```

### Build Binary

```bash
make build
```

Binary will be created at `bin/sekre-api`.

## Testing

### Run All Tests

```bash
make test
```

### Run Tests with Coverage

```bash
make test-coverage
```

This will generate `coverage.html` that you can open in browser.

## Project Structure

```
sekre-backend/
├── cmd/
│   └── api/
│       └── main.go              # Application entry point
├── internal/
│   ├── auth/                    # Authentication module
│   │   ├── delivery/            # HTTP handlers
│   │   ├── repository/          # Database operations
│   │   └── usecase/             # Business logic
│   ├── config/                  # Configuration management
│   ├── domain/                  # Domain entities & errors
│   ├── middleware/              # HTTP middleware
│   ├── organization/            # Organization module (WIP)
│   ├── task/                    # Task module (WIP)
│   └── finance/                 # Finance module (WIP)
├── migrations/                  # Database migrations
├── pkg/
│   ├── logger/                  # Logging utility
│   ├── response/                # API response formatter
│   └── token/                   # JWT token manager
├── tmp/                         # Air temporary files (gitignored)
├── .air.toml                    # Air configuration
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Environment template
├── go.mod                       # Go dependencies
└── Makefile                     # Development commands
```

## API Endpoints

### Health Check

```
GET /health
```

### Authentication

```
POST /api/v1/auth/register    # Register organization
POST /api/v1/auth/login       # Login
GET  /api/v1/auth/me          # Get current user (protected)
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Server port | `8080` |
| `SERVER_ENV` | Environment (development/production) | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DB_NAME` | Database name | `sekre_db` |
| `DB_SSLMODE` | SSL mode | `disable` |
| `JWT_SECRET` | JWT secret key | (required in production) |
| `JWT_ACCESS_TOKEN_TTL` | Access token TTL (hours) | `24` |
| `JWT_REFRESH_TOKEN_TTL` | Refresh token TTL (hours) | `168` |

## Makefile Commands

```bash
make help              # Show all available commands
make dev               # Run with live reload (air)
make run               # Run without live reload
make build             # Build binary
make test              # Run tests
make test-coverage     # Run tests with coverage report
make clean             # Clean build artifacts
make migrate           # Run database migrations
make install-tools     # Install development tools
```

## Development Workflow

1. **Start development server:**
   ```bash
   make dev
   ```

2. **Make changes to code** - Server will automatically reload

3. **Run tests:**
   ```bash
   make test
   ```

4. **Build for production:**
   ```bash
   make build
   ```

## Clean Architecture Layers

### 1. Domain Layer (`internal/domain/`)
- Pure business entities
- No external dependencies
- Defines interfaces

### 2. Repository Layer (`internal/*/repository/`)
- Database operations
- Implements domain interfaces
- PostgreSQL specific code

### 3. Usecase Layer (`internal/*/usecase/`)
- Business logic
- Orchestrates repositories
- Validates business rules

### 4. Delivery Layer (`internal/*/delivery/`)
- HTTP handlers
- Request/response mapping
- Calls usecases

## Adding New Module

Example: Adding a new `division` module

1. Create directory structure:
   ```bash
   mkdir -p internal/division/{repository,usecase,delivery}
   ```

2. Create domain entities in `internal/domain/division.go`

3. Implement repository in `internal/division/repository/postgres.go`

4. Implement usecase in `internal/division/usecase/division_usecase.go`

5. Implement handlers in `internal/division/delivery/http_handler.go`

6. Register routes in `cmd/api/main.go`

## Troubleshooting

### Air not found

Install air:
```bash
go install github.com/cosmtrek/air@latest
```

Make sure `$GOPATH/bin` is in your `$PATH`.

### Database connection failed

1. Check PostgreSQL is running:
   ```bash
   pg_isready
   ```

2. Verify credentials in `.env`

3. Check database exists:
   ```bash
   psql -U postgres -l
   ```

### Port already in use

Change `SERVER_PORT` in `.env` or kill the process using port 8080:
```bash
lsof -ti:8080 | xargs kill -9
```

## Contributing

1. Follow Clean Architecture principles
2. Write tests for new features
3. Use conventional commit messages
4. Run `make test` before committing

## License

Private - All rights reserved
