# Configuration Guide

This document describes all available configuration options for the Sekre Backend API.

## Configuration Loading

Configuration is loaded from environment variables. You can use a `.env` file for local development (see `.env.example` for template).

## Environment Variables

### Server Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `SERVER_PORT` | string | `8080` | HTTP server port |
| `SERVER_ENV` | string | `development` | Environment: `development`, `staging`, `production` |
| `SERVER_READ_TIMEOUT` | int | `15` | HTTP read timeout in seconds |
| `SERVER_WRITE_TIMEOUT` | int | `15` | HTTP write timeout in seconds |
| `SERVER_SHUTDOWN_TIMEOUT` | int | `30` | Graceful shutdown timeout in seconds |

### Database Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DB_HOST` | string | `localhost` | PostgreSQL host |
| `DB_PORT` | string | `5432` | PostgreSQL port |
| `DB_USER` | string | `postgres` | Database user |
| `DB_PASSWORD` | string | **(required)** | Database password |
| `DB_NAME` | string | `sekre_db` | Database name |
| `DB_SSLMODE` | string | `disable` | SSL mode: `disable`, `require`, `verify-ca`, `verify-full` |
| `DB_MAX_OPEN_CONNS` | int | `25` | Maximum number of open connections |
| `DB_MAX_IDLE_CONNS` | int | `5` | Maximum number of idle connections |
| `DB_CONN_MAX_LIFETIME` | int | `3600` | Connection max lifetime in seconds (1 hour) |

### JWT Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `JWT_SECRET` | string | **(required)** | JWT signing secret (min 32 characters) |
| `JWT_ACCESS_EXPIRY` | int | `15` | Access token expiry in minutes |
| `JWT_REFRESH_EXPIRY` | int | `10080` | Refresh token expiry in minutes (7 days) |

### Logging Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `LOG_LEVEL` | string | `info` | Log level: `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `panic` |

## Configuration Validation

The application validates configuration at startup and will fail fast if:

- `JWT_SECRET` is missing or less than 32 characters
- `DB_PASSWORD` is missing
- `LOG_LEVEL` is not a valid level
- In production:
  - `DB_SSLMODE=disable` is not allowed
  - `LOG_LEVEL=trace` or `LOG_LEVEL=debug` is not recommended

## Environment-Specific Recommendations

### Development

```bash
SERVER_ENV=development
SERVER_PORT=8080
SERVER_READ_TIMEOUT=15
SERVER_WRITE_TIMEOUT=15
SERVER_SHUTDOWN_TIMEOUT=30

DB_HOST=localhost
DB_PORT=5432
DB_SSLMODE=disable
DB_MAX_OPEN_CONNS=10
DB_MAX_IDLE_CONNS=2
DB_CONN_MAX_LIFETIME=1800

JWT_ACCESS_EXPIRY=15
JWT_REFRESH_EXPIRY=10080

LOG_LEVEL=debug
```

### Staging

```bash
SERVER_ENV=staging
SERVER_PORT=8080
SERVER_READ_TIMEOUT=20
SERVER_WRITE_TIMEOUT=20
SERVER_SHUTDOWN_TIMEOUT=45

DB_SSLMODE=require
DB_MAX_OPEN_CONNS=25
DB_MAX_IDLE_CONNS=5
DB_CONN_MAX_LIFETIME=3600

JWT_ACCESS_EXPIRY=15
JWT_REFRESH_EXPIRY=10080

LOG_LEVEL=info
```

### Production

```bash
SERVER_ENV=production
SERVER_PORT=8080
SERVER_READ_TIMEOUT=30
SERVER_WRITE_TIMEOUT=30
SERVER_SHUTDOWN_TIMEOUT=60

DB_SSLMODE=verify-full
DB_MAX_OPEN_CONNS=50
DB_MAX_IDLE_CONNS=10
DB_CONN_MAX_LIFETIME=3600

JWT_ACCESS_EXPIRY=15
JWT_REFRESH_EXPIRY=10080

LOG_LEVEL=info
```

## Connection Pool Tuning

### Guidelines

- **MaxOpenConns**: Set based on expected concurrent requests
  - Development: 10-25
  - Staging: 25-50
  - Production: 50-100
  - Formula: `(number_of_app_instances * max_concurrent_requests) / 2`

- **MaxIdleConns**: Typically 10-20% of MaxOpenConns
  - Keeps connections warm for quick reuse
  - Too high: wastes resources
  - Too low: frequent reconnections

- **ConnMaxLifetime**: 1-2 hours recommended
  - Prevents stale connections
  - Allows load balancer rotation
  - Database maintenance windows

### Monitoring

Monitor these metrics to tune connection pool:

- Connection wait time
- Connection acquisition failures
- Idle connection count
- Active connection count
- Connection lifetime

## Timeout Configuration

### Request Timeout (Middleware)

Set via middleware in code (default: 30s). Returns HTTP 408 if exceeded.

### Server Timeouts

- **ReadTimeout**: Time to read request headers + body
  - Too low: Large uploads fail
  - Too high: Slow clients hold connections

- **WriteTimeout**: Time to write response
  - Too low: Large downloads fail
  - Too high: Slow clients hold connections

- **ShutdownTimeout**: Time to finish in-flight requests during shutdown
  - Too low: Requests aborted during deployment
  - Too high: Deployment takes longer

### JWT Expiry

- **AccessExpiry**: Short-lived (15 minutes recommended)
  - Limits exposure if token leaked
  - Requires refresh flow

- **RefreshExpiry**: Long-lived (7 days recommended)
  - User convenience
  - Can be revoked server-side

## Security Considerations

### Secrets Management

- Never commit `.env` to version control
- Use `.env.example` as template
- Rotate secrets if accidentally committed
- Use secret management service in production (AWS Secrets Manager, HashiCorp Vault, etc.)

### Production Checklist

- [ ] `DB_SSLMODE` is not `disable`
- [ ] `JWT_SECRET` is at least 32 characters
- [ ] `JWT_SECRET` is randomly generated (not default)
- [ ] `LOG_LEVEL` is `info` or `warn` (not `debug` or `trace`)
- [ ] Database credentials are rotated regularly
- [ ] Connection pool is tuned for expected load
- [ ] Timeouts are appropriate for use case

## Troubleshooting

### "JWT_SECRET is required"

Set `JWT_SECRET` environment variable with at least 32 characters.

### "DB_PASSWORD is required"

Set `DB_PASSWORD` environment variable.

### "DB_SSLMODE=disable not allowed in production"

Change `DB_SSLMODE` to `require`, `verify-ca`, or `verify-full` when `SERVER_ENV=production`.

### "LOG_LEVEL=debug not recommended in production"

Change `LOG_LEVEL` to `info` or `warn` when `SERVER_ENV=production`.

### Connection pool exhausted

Increase `DB_MAX_OPEN_CONNS` or reduce concurrent request load.

### Too many idle connections

Reduce `DB_MAX_IDLE_CONNS` or decrease `DB_CONN_MAX_LIFETIME`.

### Slow query warnings

Check database indexes and query performance. Slow query threshold is 200ms (hardcoded in gorm logger).
