# Developer Quick Start Guide

## Prerequisites

- Docker & Docker Compose
- Go 1.22+ (for backend)
- Node.js 20+ or Bun (for frontend)
- JDK 17+ (for mobile)

## Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd sekre-project

# Start infrastructure
./scripts/setup-dev.sh

# Verify services are running
docker ps
```

## Services

| Service | URL | Credentials |
|---------|-----|-------------|
| PostgreSQL | localhost:5432 | sekre_user / sekre_password |
| Redis | localhost:6379 | (no password) |
| Adminer | http://localhost:8081 | sekre_user / sekre_password |
| Redis Commander | http://localhost:8082 | (no auth) |

## Backend Development

```bash
cd sekre-backend

# Install dependencies
go mod download

# Run development server
go run cmd/api/main.go

# Run tests
go test ./...

# Run with hot reload (install air first)
air
```

## Frontend Development

```bash
cd sekre-frontend

# Install dependencies
bun install

# Run development server
bun run dev

# Run type check
bun run check

# Run linter
bun run lint

# Build for production
bun run build
```

## Mobile Development

```bash
cd sekre-mobile

# Run Android
./gradlew :composeApp:run

# Run iOS (macOS only)
./gradlew :composeApp:iosSimulatorArm64Run

# Run tests
./gradlew test

# Build APK
./gradlew assembleDebug
```

## Database Management

### Connect to PostgreSQL
```bash
docker exec -it sekre-postgres psql -U sekre_user -d sekre_db
```

### Common SQL Commands
```sql
-- List tables
\dt

-- Describe table
\d table_name

-- List RLS policies
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Set session context (for testing RLS)
SELECT set_session_context(
  'org_id_here'::uuid,
  'user_id_here'::uuid
);

-- View current context
SELECT current_setting('app.current_organization_id', true);
```

### Reset Database
```bash
# Stop containers
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker volume rm sekre-project_postgres_data sekre-project_redis_data

# Start fresh
./scripts/setup-dev.sh
```

## Testing

### Test Accounts
```
Email: sajudin@himti.org
Password: password123
Organization: HIMTI UNPAB (himti)
Role: OWNER

Email: admin@bem.org
Password: password123
Organization: BEM Universitas (bem)
Role: OWNER
```

### API Testing with curl
```bash
# Register new organization
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "organization_name": "Test Org",
    "subdomain": "testorg",
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sajudin@himti.org",
    "password": "password123",
    "subdomain": "himti"
  }'

# Get organization (with JWT token)
curl http://localhost:8080/api/v1/organizations/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Git Workflow

### Branch Strategy
- `main` - Production-ready code
- `dev` - Development branch (default)
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Commit Convention
```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
ci: update CI/CD
```

### Creating a PR
```bash
# Create feature branch from dev
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create PR on GitHub targeting dev branch
```

## Troubleshooting

### Docker Issues

**Containers not starting:**
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart

# Full reset
docker-compose down
docker-compose up -d
```

**Port already in use:**
```bash
# Find process using port
lsof -i :5432  # or :6379, :8080, etc.

# Kill process
kill -9 <PID>
```

### Database Issues

**Connection refused:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check PostgreSQL logs
docker logs sekre-postgres

# Wait for health check
docker inspect sekre-postgres | grep Health
```

**RLS policies not working:**
```bash
# Reapply RLS policies
./scripts/apply-rls.sh

# Verify policies
docker exec sekre-postgres psql -U sekre_user -d sekre_db \
  -c "SELECT tablename, policyname FROM pg_policies;"
```

### Backend Issues

**Module not found:**
```bash
cd sekre-backend
go mod tidy
go mod download
```

**Port 8080 in use:**
```bash
# Change port in .env
SERVER_PORT=8081
```

### Frontend Issues

**Dependencies error:**
```bash
cd sekre-frontend
rm -rf node_modules bun.lock
bun install
```

**Build fails:**
```bash
# Clear cache
rm -rf .svelte-kit
bun run build
```

## Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=sekre_user
DB_PASSWORD=sekre_password
DB_NAME=sekre_db
DB_SSLMODE=disable

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

SERVER_PORT=8080
SERVER_ENV=development
```

### Frontend (.env)
```env
PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Useful Commands

### Docker
```bash
# View logs
docker-compose logs -f [service_name]

# Execute command in container
docker exec -it [container_name] [command]

# Stop all services
docker-compose down

# Start specific service
docker-compose up -d postgres
```

### Database
```bash
# Backup database
docker exec sekre-postgres pg_dump -U sekre_user sekre_db > backup.sql

# Restore database
docker exec -i sekre-postgres psql -U sekre_user sekre_db < backup.sql

# Check database size
docker exec sekre-postgres psql -U sekre_user -d sekre_db \
  -c "SELECT pg_size_pretty(pg_database_size('sekre_db'));"
```

### Git
```bash
# Sync with remote
git fetch origin
git rebase origin/dev

# Squash commits
git rebase -i HEAD~3

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Stash changes
git stash
git stash pop
```

## Resources

- [API Documentation](./docs/api/openapi.yaml)
- [Architecture Decisions](./docs/architecture/)
- [Deployment Guide](./docs/deployment/)
- [Phase 0 Summary](./docs/PHASE-0-SUMMARY.md)

## Getting Help

1. Check this guide first
2. Review relevant documentation
3. Check GitHub Issues
4. Ask in team chat

## Next Steps

Once environment is set up:
1. Read [Phase 0 Summary](./docs/PHASE-0-SUMMARY.md)
2. Review [API Documentation](./docs/api/openapi.yaml)
3. Start with backend authentication module
4. Follow Clean Architecture principles
5. Write tests for all new code
