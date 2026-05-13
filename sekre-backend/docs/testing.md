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

# Run E2E tests (full stack)
make test-e2e

# Run fuzz tests (30s each)
make test-fuzz

# Run benchmarks
make bench

# Run full CI checks locally
make ci
```

## Test Tags Registry

Tests are categorized by build tags to control when they run.

| Tag | Use Case | Runs In | Skipped In |
|-----|----------|---------|------------|
| (none) | Unit tests, < 1s | Every push, pre-commit | - |
| `integration` | DB/testcontainers | PR, nightly | Pre-commit (slow) |
| `e2e` | Full stack, HTTP | PR, nightly | Pre-commit, local dev |
| `slow` | Unit > 5s (crypto, large fixture) | PR, nightly | Pre-commit |
| `manual` | External services (SMTP prod) | Manual trigger | CI |

### Usage

```bash
# Run only unit tests (no tag)
go test ./...

# Run only integration tests
go test -tags=integration ./...

# Run only e2e tests
go test -tags=e2e ./...

# Run multiple tags
go test -tags="integration e2e" ./...
```

### Writing Tagged Tests

Add build tag at the top of the file:

```go
//go:build integration

package mypackage_test
// ...
```

For tests that should run with multiple tags:

```go
//go:build integration || e2e
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

## Test Data Management

### Rules

- **Each test is independent**: Create data within each test, never rely on state from other tests
- **Unique IDs**: Always use `uuid.New()`, never hardcode IDs
- **No shared state**: Each test should create its own fixtures
- **Cleanup**: Use `t.Cleanup()` for deferred cleanup

### Transactional Tests

For integration tests, wrap in a transaction that rolls back:

```go
func withTx(t *testing.T, db *gorm.DB, fn func(tx *gorm.DB)) {
    tx := db.Begin()
    t.Cleanup(func() { tx.Rollback() })
    fn(tx)
}

// Or use testdb helper
testdb.RunInTx(t, func(tx *gorm.DB) {
    // Test code runs in transaction
    // Auto-rollback on completion
})
```

### Builder Pattern

Prefer builders over raw struct literals:

```go
// Good - clear intent, defaults provided
user := entityfixtures.NewUser().
    WithEmail("test@example.com").
    Build()

// Avoid - verbose, error-prone
user := entity.User{
    ID:           uuid.New(),
    Email:        "test@example.com",
    PasswordHash: "...",
    FullName:     "...",
    CreatedAt:    time.Now(),
    UpdatedAt:    time.Now(),
}
```

### Scenario Over Individual Fixtures

For complex test setups, use scenarios:

```go
// Good - reusable, expressive
s := scenario.NewSingleTenant()
// s.Owner, s.Admin, s.Member, s.Organization

// Avoid - lots of boilerplate
owner := entityfixtures.NewUser().Build()
admin := entityfixtures.NewUser().Build()
member := entityfixtures.NewUser().Build()
org := entityfixtures.NewOrganization().Build()
// ... manually wire up relationships
```

## Flaky Test Policy

Flaky tests erode confidence in the test suite. Zero tolerance policy:

### Detection

A test is flaky if:
- It fails intermittently without code changes
- It depends on timing, external services, or random state
- It depends on test execution order
- It fails in CI but passes locally (or vice versa)

### Process

**1. First Occurrence:**
- Label test with `// FLAKY: <issue-link>`
- Skip the test to unblock CI:

```go
func TestSomethingFlaky(t *testing.T) {
    t.Skip("FLAKY: https://github.com/org/repo/issues/123 - race condition")
    // ... test body
}
```

**2. Fix Deadline:**
- Mandatory fix within 2 weeks (1 sprint)
- Owner: engineer who introduced the test

**3. Zero Tolerance:**
- Flaky tests on `main` are blockers for all PRs
- Must fix or remove, never ignore

### Common Causes & Fixes

| Cause | Fix |
|-------|-----|
| `time.Sleep` | Use `clock.FakeClock` |
| Random IDs compared | Sort before asserting |
| Map iteration order | Use slices or sorted keys |
| Goroutine timing | Use `sync.WaitGroup` or channels |
| Network calls | Mock with `httptest.Server` |
| Database state | Use transactions with rollback |
| File system | Use `t.TempDir()` |

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

## Testing Operations

### Running Tests Efficiently

**Daily development workflow:**
```bash
# 1. Before committing
make pre-commit          # Fast checks (fmt + vet + lint + short tests)

# 2. After major changes
make test-cover-check    # Unit tests with coverage enforcement

# 3. Before pushing to main
make ci                  # Full CI simulation
```

**When to run each test type:**
- **Unit tests**: Every file save, fast feedback
- **Integration tests**: Before PR, after DB/repository changes
- **E2E tests**: Before PR, after handler/middleware changes
- **Fuzz tests**: Weekly, after validator/parser changes
- **Benchmarks**: Before/after optimization work

### Performance Testing

**Run benchmarks:**
```bash
make bench                      # All benchmarks
make bench-save                 # Save baseline to docs/benchmarks/

# Specific benchmark
go test -bench=BenchmarkMoney -benchmem -run=^$ ./internal/domain/valueobject

# Compare against baseline
benchstat docs/benchmarks/2026-04.md docs/benchmarks/2026-05.md
```

**Bcrypt cost calibration:**
```bash
go test -bench=BenchmarkBcryptCost -benchtime=5x -run=^$ \
  ./internal/infrastructure/auth
```

**Target:** ~100-200ms per hash (cost 10-11 in production)

### Fuzz Testing

```bash
# Quick sanity check (30s per fuzz target)
make test-fuzz

# Specific target with longer duration
go test -fuzz=FuzzValidateEmail -fuzztime=5m ./internal/infrastructure/auth

# Run fuzz corpus (regression prevention)
go test -run=FuzzValidateEmail ./internal/infrastructure/auth
```

If fuzz finds a failing input, it saves to `testdata/fuzz/<FuzzName>/` and runs on every future test run.

### CI Pipeline

See `.github/workflows/backend-ci.yml` for full CI config.

**Jobs:**
1. **lint** - golangci-lint + go vet
2. **unit-tests** - Unit tests with coverage enforcement
3. **integration-tests** - Integration tests with PostgreSQL service
4. **build** - Compile binaries

**Artifacts:**
- `unit-test-results` - JUnit XML + HTML coverage report
- `integration-test-results` - JUnit XML
- `backend-binaries` - Compiled api and migrate

### Coverage Targets

| Layer | Target | Current |
|-------|--------|---------|
| domain | 80% | 75% |
| application | 60% | 75% |
| infrastructure | 50% | Integration tests |
| delivery | 60% | Handler tests |
| **Overall** | **60%** | **~75%** |

Coverage is **enforced** in CI. Build fails if total drops below 60%.

### Benchmark Regression Policy

- Benchmarks run monthly, saved to `docs/benchmarks/YYYY-MM.md`
- PR with >20% regression = blocker
- Use `benchstat` to compare against main
- Regression requires justification or optimization

### Monitoring Test Health

```bash
# Find slowest tests
go test -v ./... | grep -E "^(ok|---)" | sort -k3 -n

# Count tests per package
go test -list ".*" ./... | grep "^Test" | wc -l

# Find skipped tests (potential tech debt)
grep -r "t.Skip\b" --include="*_test.go" .

# Find FLAKY tags
grep -r "FLAKY:" --include="*_test.go" .
```

## Resources

- [Go Testing](https://pkg.go.dev/testing)
- [Testify](https://github.com/stretchr/testify)
- [Mockery](https://github.com/vektra/mockery)
- [Testcontainers Go](https://golang.testcontainers.org/)
- [gotestsum](https://github.com/gotestyourself/gotestsum)
