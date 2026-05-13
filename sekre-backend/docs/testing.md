# Testing Guide

This document describes the testing infrastructure and practices for sekre-backend.

## Quick Start

```bash
# Run all tests
make test

# Run unit tests only (fast)
make test-unit

# Run with coverage report
make test-cover

# Check coverage threshold
make test-cover-check

# Run integration tests (requires database)
make test-integration

# Run full CI checks locally
make ci
```

## Test Structure

Tests follow Go conventions - co-located with source files using `_test.go` suffix.

```
internal/
├── domain/
│   ├── types/
│   │   ├── role.go
│   │   └── role_test.go          # Unit tests
│   └── valueobject/
│       ├── money.go
│       └── money_test.go
├── application/
│   └── auth/
│       ├── auth_usecase.go
│       ├── auth_usecase_unit_test.go      # Unit tests with mocks
│       └── auth_usecase_test.go            # Integration tests (//go:build integration)
├── infrastructure/
│   └── persistence/gorm/repository/
│       ├── task_repository.go
│       └── task_authz_test.go              # Integration tests
└── test/                          # Test infrastructure
    ├── fixtures/                  # Test data builders
    ├── mocks/                     # Generated mocks (via mockery)
    ├── authz/                     # Authorization test matrices
    ├── db/                        # Testcontainers setup
    ├── clock/                     # Fake clock for time-dependent tests
    └── http/                      # HTTP test helpers
```

## Test Categories

### Unit Tests

Fast tests that run in milliseconds, no external dependencies.

**Characteristics:**
- No database
- No network
- Use mocks for dependencies
- Run with `-short` flag
- Must use `t.Parallel()`

**Example:**
```go
func TestRole_Validate(t *testing.T) {
    t.Parallel()
    
    tests := []struct {
        name    string
        role    Role
        wantErr bool
    }{
        {"valid owner", RoleOwner, false},
        {"invalid", "UNKNOWN", true},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()
            err := tt.role.Validate()
            if (err != nil) != tt.wantErr {
                t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

### Integration Tests

Tests with real database, using testcontainers.

**Characteristics:**
- Build tag: `//go:build integration`
- Uses PostgreSQL via testcontainers or service containers
- Tests cross-layer interactions
- Slower but more realistic

**Example:**
```go
//go:build integration

package repository_test

func TestTaskRepository_Create(t *testing.T) {
    testdb.RunInTx(t, func(tx *gorm.DB) {
        repo := NewTaskRepository(tx)
        task := fixtures.NewTask().Build()
        
        err := repo.Create(context.Background(), task.OrganizationID, task)
        require.NoError(t, err)
    })
}
```

### E2E Tests

Full-stack tests with docker compose.

**Characteristics:**
- Build tag: `//go:build e2e`
- Tests entire request flow
- Slowest, run in CI only

## Mock Generation

Mocks are generated using [mockery](https://github.com/vektra/mockery).

### Regenerate Mocks

```bash
make mocks
```

### Configuration

See `.mockery.yaml`:
- All domain repositories
- All domain services
- Shared repositories (TxRunner)
- Clock abstraction

### Usage Example

```go
import "github.com/username/sekre-backend/internal/test/mocks"

func TestMyUsecase(t *testing.T) {
    mockRepo := mocks.NewUserRepository(t)
    mockRepo.EXPECT().
        GetByEmail(mock.Anything, "user@example.com").
        Return(user, nil).
        Once()
    
    uc := NewUsecase(mockRepo)
    result, err := uc.FindUser(ctx, "user@example.com")
    
    assert.NoError(t, err)
}
```

## Coverage

### Running Coverage

```bash
# Generate HTML report
make test-cover

# Check threshold (60%)
make test-cover-check
```

### Coverage Threshold

- **Target:** 60% minimum for domain + application layers
- **Enforcement:** CI will fail if coverage drops below threshold
- **Configuration:** `.codecov.yml`

### Coverage Exclusions

The following are excluded from coverage:

- `cmd/**` - Entry points
- `internal/test/**` - Test infrastructure
- `**/mocks/**` - Generated mocks
- `**/*_mock.go`, `**/*_gen.go` - Generated code
- `internal/domain/entity/**` - Pure data structures
- `internal/domain/repository/**` - Interfaces only
- `internal/domain/service/**` - Interfaces only
- `internal/models/**` - GORM models

## CI Integration

GitHub Actions workflow at `.github/workflows/backend-ci.yml`:

### Jobs

1. **lint** - golangci-lint + go vet
2. **unit-tests** - Unit tests with race detector + coverage check
3. **integration-tests** - Integration tests with PostgreSQL
4. **build** - Build binaries

### Triggers

- Push to `main` or `dev` branches
- Pull requests to `main` or `dev`
- Paths: `sekre-backend/**`

## Pre-commit Hooks

Setup once:
```bash
make setup-hooks
```

Pre-commit hook runs:
1. `gofmt` check
2. `go vet`
3. `golangci-lint --fast`
4. `go test -short`
5. `go build`

To skip hooks temporarily (not recommended):
```bash
git commit --no-verify
```

## Testing Best Practices

### DO

- Use `t.Parallel()` for unit tests
- Use table-driven tests for multiple cases
- Use meaningful test names: `TestSubject_Method_Scenario`
- Mock external dependencies
- Test both success and error paths
- Use fixtures for complex test data
- Keep tests fast (< 100ms for unit tests)
- Test public API, not implementation details

### DON'T

- Don't use `time.Sleep` - use fake clock instead
- Don't depend on test execution order
- Don't share state between tests
- Don't test generated code (mocks, models)
- Don't commit failing tests
- Don't skip tests without issue reference

## Test Helpers

### Clock Abstraction

For time-dependent code:

```go
import (
    "github.com/username/sekre-backend/pkg/clock"
    testclock "github.com/username/sekre-backend/internal/test/clock"
)

// Production
uc := NewUsecase(clock.NewRealClock())

// Test
fakeClock := testclock.New(time.Date(2026, 5, 13, 10, 0, 0, 0, time.UTC))
uc := NewUsecase(fakeClock)

// Advance time
fakeClock.Advance(1 * time.Hour)
```

### Fixtures (Builder Pattern)

```go
import "github.com/username/sekre-backend/internal/test/fixtures"

user := fixtures.NewUser().
    WithEmail("test@example.com").
    WithRole(types.RoleOwner).
    Build()
```

### HTTP Test Helpers

```go
import testhttp "github.com/username/sekre-backend/internal/test/http"

req := testhttp.AuthedRequest(t, "GET", "/tasks", nil, testhttp.AuthOpts{
    UserID: uuid.New(),
    OrgID:  uuid.New(),
    Role:   types.RoleOwner,
})
```

## Debugging Tests

### Run Specific Test

```bash
go test -run TestRole_Validate ./internal/domain/types
go test -run TestAuthUsecase ./internal/application/auth
```

### Verbose Output

```bash
go test -v ./internal/domain/...
```

### Race Detector

```bash
go test -race ./...
```

### Debug with Delve

```bash
dlv test ./internal/domain/types
```

## Troubleshooting

### Tests fail locally but pass in CI

- Check Go version: `go version`
- Clear test cache: `go clean -testcache`
- Update dependencies: `go mod tidy`

### Integration tests fail

- Ensure PostgreSQL is running
- Check environment variables
- Verify database schema is up to date

### Coverage lower than expected

- Check `.codecov.yml` exclusions
- Ensure tests actually run (not just compile)
- Look for untested error paths

### Mock methods not found

- Regenerate mocks: `make mocks`
- Check interface method names match
- Ensure interface is listed in `.mockery.yaml`

## Resources

- [Go Testing](https://pkg.go.dev/testing)
- [Testify](https://github.com/stretchr/testify)
- [Mockery](https://github.com/vektra/mockery)
- [Testcontainers Go](https://golang.testcontainers.org/)
- [gotestsum](https://github.com/gotestyourself/gotestsum)
