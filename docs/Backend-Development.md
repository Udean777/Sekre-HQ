# Backend Development - Quick Start

## Live Reload with Air

Backend sudah dikonfigurasi dengan **Air** untuk live reload otomatis saat development.

### Start Development Server

```bash
cd sekre-backend
make dev
```

Atau langsung:

```bash
air
```

### What Happens?

- ✅ Server starts automatically
- ✅ Watches for `.go` file changes
- ✅ Auto-rebuilds on save
- ✅ Auto-restarts server
- ✅ Shows build errors in terminal

### Configuration

Air configuration: `.air.toml`

**Watched directories:**
- `cmd/`
- `internal/`
- `pkg/`

**Excluded:**
- `migrations/`
- `tmp/`
- `*_test.go`

**Watched extensions:**
- `.go`
- `.tpl`, `.tmpl`, `.html`

### Makefile Commands

```bash
make help              # Show all commands
make dev               # Run with live reload ⚡
make run               # Run without live reload
make build             # Build binary
make test              # Run tests
make test-coverage     # Tests with coverage
make clean             # Clean artifacts
make migrate           # Run migrations
```

### Development Workflow

1. **Start server:**
   ```bash
   make dev
   ```

2. **Edit code** - Server reloads automatically

3. **Check logs** - Build errors shown in terminal

4. **Test changes:**
   ```bash
   curl http://localhost:8080/health
   ```

### Troubleshooting

#### Air not found

```bash
make install-tools
```

Or manually:

```bash
go install github.com/cosmtrek/air@latest
```

#### Port already in use

Change port in `.env`:

```env
SERVER_PORT=8081
```

Or kill process:

```bash
lsof -ti:8080 | xargs kill -9
```

#### Build errors not showing

Check `build-errors.log`:

```bash
tail -f build-errors.log
```

### Without Air

If you prefer not to use Air:

```bash
make run
```

Or:

```bash
go run cmd/api/main.go
```

### Production Build

```bash
make build
./bin/sekre-api
```

---

**Tip:** Keep `make dev` running in a terminal while coding for instant feedback!
