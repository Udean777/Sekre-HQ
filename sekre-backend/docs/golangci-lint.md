# Golangci-lint Configuration

This document explains the linters enabled in `.golangci.yml` and their purpose.

## Enabled Linters

### Core Linters (Default)
- **errcheck**: Checks for unchecked errors. Critical for preventing silent failures.
- **govet**: Standard Go vet checks. Catches common mistakes like printf format errors.
- **ineffassign**: Detects ineffectual assignments. Helps identify dead code.
- **staticcheck**: Advanced static analysis. Comprehensive checks for bugs and performance issues.
- **unused**: Finds unused code (constants, variables, functions, types).

### Style and Best Practices
- **revive**: Fast, configurable linter. Enforces Go best practices and naming conventions.
- **gocritic**: Opinionated linter with many checks. Catches subtle bugs and style issues.
- **misspell**: Finds commonly misspelled words in comments and strings.
- **unconvert**: Removes unnecessary type conversions.
- **unparam**: Finds unused function parameters.
- **whitespace**: Checks for unnecessary whitespace.
- **godot**: Ensures comments end with a period (documentation consistency).
- **predeclared**: Finds code that shadows predeclared identifiers (e.g., `len`, `error`).

### Complexity
- **gocyclo**: Measures cyclomatic complexity (threshold: 15). Helps identify overly complex functions.
- **dupl**: Detects duplicate code (threshold: 100 tokens). Encourages DRY principle.
- **goconst**: Finds repeated strings that should be constants (min 3 chars, 3 occurrences).

### Security
- **gosec**: Security-focused linter. Detects common security issues like SQL injection, weak crypto.

### Error Handling
- **errname**: Checks error naming conventions (`ErrXxx` for sentinels, `XxxError` for types).
- **errorlint**: Ensures proper error wrapping with Go 1.13+ `%w` format.
- **nilerr**: Finds code that returns nil even when error is not nil.

### Resource Management
- **bodyclose**: Ensures HTTP response bodies are closed (prevents resource leaks).
- **rowserrcheck**: Checks that `sql.Rows.Err()` is checked after iteration.
- **sqlclosecheck**: Ensures `sql.Rows` and `sql.Stmt` are closed.

### Context Usage
- **noctx**: Finds HTTP requests without context (important for timeouts/cancellation).

### Memory and Performance
- **makezero**: Finds slice declarations with non-zero initial length (potential bugs).
- **copyloopvar**: Checks for pointers to loop variables (common Go gotcha).
- **wastedassign**: Finds wasted assignment statements.

### Testing
- **thelper**: Detects test helpers without `t.Helper()` call.

## Configuration Highlights

### Errcheck Settings
- Check type assertions: `true`
- Check blank assignments: `true`
- Exclude `Close()` methods (handled by other linters)

### Govet Settings
- All checks enabled except `shadow` (too noisy)

### Revive Rules
- 20+ rules enabled covering:
  - Context usage
  - Error handling
  - Naming conventions
  - Code structure
  - Documentation

### Gocritic Tags
- Diagnostic: Bug detection
- Style: Code style issues
- Performance: Performance improvements
- Experimental: Cutting-edge checks
- Opinionated: Subjective best practices

### Gosec Settings
- Medium severity and confidence
- Excludes:
  - G104: Covered by errcheck
  - G304: Too many false positives for file paths

### Complexity Thresholds
- Cyclomatic complexity: 15 (reasonable for business logic)
- Duplicate code: 100 tokens (catches significant duplication)
- Constant strings: 3 chars, 3 occurrences

### Test Exclusions
Test files (`_test.go`) exclude:
- gocyclo: Tests can be complex
- errcheck: Test errors often ignored intentionally
- dupl: Test setup code often duplicated
- gosec: Security less critical in tests
- goconst: Test strings often repeated

## Running the Linter

```bash
# Run all linters
golangci-lint run ./...

# Run with auto-fix (where supported)
golangci-lint run --fix ./...

# Run specific linters only
golangci-lint run --enable-only=errcheck,govet ./...

# Run on specific files
golangci-lint run internal/domain/...
```

## CI Integration

Add to GitHub Actions:

```yaml
- name: golangci-lint
  uses: golangci/golangci-lint-action@v3
  with:
    version: latest
    args: --timeout=5m
```

## Current Status

Initial run found 5 issues:
- 4 code duplications (dupl)
- 1 test duplication

These will be addressed in Phase 6.9.

## Benefits

1. **Consistency**: Enforces Go best practices across the codebase
2. **Bug Prevention**: Catches common mistakes before they reach production
3. **Security**: Identifies security vulnerabilities early
4. **Maintainability**: Reduces complexity and duplication
5. **Documentation**: Ensures code is well-documented
6. **Performance**: Identifies performance issues
7. **Resource Safety**: Prevents resource leaks (HTTP, SQL)
8. **Context Awareness**: Ensures proper context usage for timeouts/cancellation

## References

- [golangci-lint Documentation](https://golangci-lint.run/)
- [Linters List](https://golangci-lint.run/usage/linters/)
- [Configuration Guide](https://golangci-lint.run/usage/configuration/)
