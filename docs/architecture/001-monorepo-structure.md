# ADR-001: Monorepo Structure

## Status
Accepted

## Context
We need to decide on the repository structure for our multi-platform SaaS application that consists of:
- Backend API (Golang)
- Web Frontend (SvelteKit)
- Mobile App (Compose Multiplatform)

Options considered:
1. **Monorepo**: Single repository containing all projects
2. **Multi-repo**: Separate repositories for backend, frontend, and mobile

## Decision
We will use a **monorepo structure** with the following layout:

```
sekre-project/
├── sekre-backend/      # Golang API
├── sekre-frontend/     # SvelteKit Web
├── sekre-mobile/       # Compose Multiplatform
├── docs/               # Shared documentation
├── scripts/            # Shared scripts
└── .github/workflows/  # CI/CD pipelines
```

## Consequences

### Positive
- **Atomic commits**: Changes across multiple projects can be committed together
- **Shared documentation**: API contracts, architecture decisions in one place
- **Easier dependency management**: Shared types and contracts between frontend/backend
- **Simplified CI/CD**: Single pipeline can test all affected components
- **Better code reuse**: Shared utilities and configurations
- **Consistent versioning**: All components versioned together

### Negative
- **Larger repository size**: More data to clone
- **Potential for slower CI**: Need to implement smart path filtering
- **Learning curve**: Team needs to understand monorepo workflows

### Mitigations
- Use GitHub Actions path filters to run only affected CI jobs
- Implement sparse checkout for developers who only work on specific components
- Use Nx or Turborepo if build times become an issue

## Alternatives Considered

### Multi-repo (Rejected)
**Pros:**
- Smaller, focused repositories
- Independent versioning per component
- Clearer ownership boundaries

**Cons:**
- Difficult to maintain consistency across repos
- Complex dependency management between repos
- Harder to make atomic changes across components
- Duplicated CI/CD configuration
- API contract synchronization issues

The cons outweighed the pros, especially for a small team where atomic changes and shared contracts are critical.

## References
- [Monorepo vs Multi-repo](https://monorepo.tools/)
- [Google's Monorepo Philosophy](https://research.google/pubs/pub45424/)
