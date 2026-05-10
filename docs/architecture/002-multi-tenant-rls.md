# ADR-002: Multi-Tenant Architecture with Row-Level Security

## Status
Accepted

## Context
As a SaaS platform serving multiple organizations, we need to ensure complete data isolation between tenants while maintaining performance and simplicity. We need to decide on the multi-tenancy approach.

## Decision
We will implement **Shared Database, Shared Schema** architecture with **PostgreSQL Row-Level Security (RLS)** for tenant isolation.

### Implementation Details
1. Every tenant-scoped table includes `organization_id` column
2. RLS policies automatically filter queries based on session context
3. Application sets session context after JWT validation:
   ```sql
   SELECT set_session_context(org_id, user_id);
   ```
4. All subsequent queries are automatically scoped to the organization

## Consequences

### Positive
- **Security by default**: Even if application code has bugs, database enforces isolation
- **Simplified application code**: No need to manually add WHERE clauses
- **Cost-effective**: Single database for all tenants
- **Easy backup/restore**: Single database to manage
- **Performance**: Shared connection pool, efficient resource usage
- **Compliance**: Built-in audit trail at database level

### Negative
- **PostgreSQL-specific**: Tied to PostgreSQL (acceptable trade-off)
- **Complex migrations**: Schema changes affect all tenants
- **Potential noisy neighbor**: One tenant's heavy load affects others
- **Scaling limits**: Single database has upper limits

### Mitigations
- Monitor per-tenant resource usage
- Implement connection pooling (PgBouncer)
- Plan for read replicas when needed
- Consider sharding strategy for future (Pro plan customers on dedicated shards)

## Alternatives Considered

### 1. Separate Database per Tenant (Rejected)
**Pros:**
- Complete isolation
- Easy to scale individual tenants
- Simpler to implement custom features per tenant

**Cons:**
- Expensive: Need to provision database for each tenant
- Complex management: Hundreds of databases to maintain
- Difficult migrations: Must run migration on every database
- Connection pool exhaustion
- Not cost-effective for free/lite plans

### 2. Separate Schema per Tenant (Rejected)
**Pros:**
- Better isolation than shared schema
- Still uses single database

**Cons:**
- Schema proliferation (thousands of schemas)
- Complex migrations
- Connection management issues
- PostgreSQL performance degrades with many schemas

### 3. Discriminator Column without RLS (Rejected)
**Pros:**
- Simple to implement
- Database-agnostic

**Cons:**
- **Security risk**: Application bugs can leak data
- Manual WHERE clauses everywhere (error-prone)
- No database-level enforcement
- Difficult to audit

## References
- [PostgreSQL Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/overview)
- [Citus Multi-Tenant Tutorial](https://docs.citusdata.com/en/stable/sharding/multi_tenant.html)
