# ACTION PLAN - SEKRE BACKEND IMPROVEMENTS

**Created:** 2026-05-14
**Status:** Planning Phase
**Total Estimated Time:** 8-10 weeks

---

## OVERVIEW

This document outlines a phased approach to fix critical issues, improve UX, and enhance the Sekre backend system. Each phase is designed to be completed in 1-2 weeks with clear deliverables.

---

## PHASE 0: PREPARATION (Week 0)
**Duration:** 3-5 days
**Goal:** Setup infrastructure for safe development

### Tasks

#### 0.1 Setup Development Environment
- [ ] Create `develop` branch from `main`
- [ ] Setup feature branch workflow
- [ ] Configure pre-commit hooks
- [ ] Setup local testing environment

#### 0.2 Create Test Suite Foundation
- [ ] Setup test database
- [ ] Create test fixtures
- [ ] Setup integration test framework
- [ ] Create test helper utilities

#### 0.3 Documentation
- [ ] Document current API endpoints (OpenAPI spec)
- [ ] Create API testing collection (Postman/Insomnia)
- [ ] Document environment variables
- [ ] Create deployment checklist

**Deliverables:**
- Development workflow documented
- Test infrastructure ready
- API documentation baseline

**Estimated Effort:** 3-5 days

---

## PHASE 1: CRITICAL SECURITY FIXES (Week 1-2)
**Duration:** 1-2 weeks
**Goal:** Fix critical security vulnerabilities before any production deployment

### Priority: CRITICAL 🔴

### Tasks

#### 1.1 Implement RBAC Middleware
**File:** `internal/delivery/http/middleware/rbac.go`

```go
// Create role-based access control middleware
func RequireRole(allowedRoles ...types.Role) mux.MiddlewareFunc
func RequireDivisionRole(allowedRoles ...types.DivisionRole) mux.MiddlewareFunc
```

**Changes Required:**
- [ ] Create RBAC middleware package
- [ ] Add role validation logic
- [ ] Apply to organization endpoints (OWNER/ADMIN only)
- [ ] Apply to division endpoints (HEAD only for certain ops)
- [ ] Apply to member management endpoints
- [ ] Write unit tests for RBAC logic
- [ ] Write integration tests for authorization

**Files to Update:**
- `cmd/api/main.go` - Apply middleware to routes
- `internal/delivery/http/handler/organization_handler.go`
- `internal/delivery/http/handler/division_handler.go`
- `internal/delivery/http/handler/member_handler.go`

**Estimated Effort:** 3-4 days

---

#### 1.2 Add Rate Limiting
**File:** `internal/delivery/http/middleware/rate_limit.go`

```go
// Implement rate limiting using token bucket algorithm
func RateLimitMiddleware(requests int, window time.Duration) mux.MiddlewareFunc
```

**Implementation:**
- [ ] Install rate limiting library (e.g., `golang.org/x/time/rate`)
- [ ] Create rate limiter middleware
- [ ] Apply to auth endpoints (login: 5/min, register: 3/min)
- [ ] Apply to bulk import (1/min)
- [ ] Add rate limit headers (X-RateLimit-*)
- [ ] Configure limits via environment variables
- [ ] Write tests for rate limiting

**Rate Limits:**
- Login: 5 requests/minute per IP
- Register: 3 requests/minute per IP
- Bulk Import: 1 request/minute per user
- General API: 100 requests/minute per user

**Estimated Effort:** 2-3 days

---

#### 1.3 Fix CORS Configuration
**File:** `cmd/api/main.go`

**Changes:**
- [ ] Remove wildcard CORS
- [ ] Add allowed origins from config
- [ ] Add allowed methods whitelist
- [ ] Add allowed headers whitelist
- [ ] Configure credentials handling
- [ ] Add preflight caching
- [ ] Test CORS from different origins

**Config Addition:**
```go
type CORSConfig struct {
    AllowedOrigins []string
    AllowedMethods []string
    AllowedHeaders []string
    MaxAge         int
}
```

**Estimated Effort:** 1 day

---

#### 1.4 Add Input Sanitization
**File:** `internal/delivery/http/middleware/sanitize.go`

**Implementation:**
- [ ] Install sanitization library (e.g., `github.com/microcosm-cc/bluemonday`)
- [ ] Create sanitization middleware
- [ ] Sanitize all text inputs (HTML escape)
- [ ] Validate email formats
- [ ] Validate URL formats
- [ ] Add max length validation
- [ ] Apply to all POST/PUT/PATCH endpoints
- [ ] Write sanitization tests

**Fields to Sanitize:**
- Organization name, subdomain
- User full name, email
- Division name, description
- Task title, description
- Event title, description, location
- Transaction description

**Estimated Effort:** 2-3 days

---

#### 1.5 Strong Temporary Password Generation
**File:** `internal/application/organization/member_creation_usecase.go`

**Changes:**
- [ ] Remove hardcoded "password123"
- [ ] Implement crypto/rand password generator
- [ ] Generate 12-character random password (alphanumeric + symbols)
- [ ] Return generated passwords in bulk import response
- [ ] Add password strength validation
- [ ] Write tests for password generation

**Implementation:**
```go
func generateStrongPassword() string {
    // Use crypto/rand
    // 12 chars: uppercase, lowercase, numbers, symbols
    // Ensure at least 1 of each type
}
```

**Estimated Effort:** 1 day

---

### Phase 1 Testing Checklist
- [ ] All RBAC tests pass
- [ ] Rate limiting works correctly
- [ ] CORS only allows whitelisted origins
- [ ] Input sanitization prevents XSS
- [ ] Temporary passwords are strong and unique
- [ ] Integration tests pass
- [ ] Security audit completed

**Phase 1 Deliverables:**
- RBAC middleware implemented and tested
- Rate limiting active on all endpoints
- CORS properly configured
- Input sanitization active
- Strong password generation
- Security test suite passing

**Total Phase 1 Effort:** 10-14 days

---

## PHASE 2: UX IMPROVEMENTS (Week 3-4)
**Duration:** 1-2 weeks
**Goal:** Fix major UX issues that make the API hard to use

### Priority: HIGH 🟡

### Tasks

#### 2.1 Add Pagination
**Files:** Multiple handlers and repositories

**Implementation:**
- [ ] Create pagination types
- [ ] Add pagination to list endpoints
- [ ] Update repositories to support LIMIT/OFFSET
- [ ] Add pagination metadata to responses
- [ ] Set default page size (20 items)
- [ ] Add max page size limit (100 items)
- [ ] Update API documentation

**Endpoints to Update:**
- GET /users
- GET /members
- GET /divisions
- GET /tasks
- GET /events
- GET /transactions

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 150,
    "total_pages": 8
  }
}
```

**Estimated Effort:** 3-4 days

---

#### 2.2 Make Event List division_id Optional
**File:** `internal/delivery/http/handler/event_handler.go`

**Changes:**
- [ ] Remove required validation for division_id
- [ ] Update repository to filter by organization only if no division_id
- [ ] Add division_id as optional query param
- [ ] Update tests
- [ ] Update API documentation

**Estimated Effort:** 1 day

---

#### 2.3 Support Partial Updates (PATCH)
**Files:** Task, Event, Transaction handlers

**Implementation:**
- [ ] Create PATCH endpoints alongside PUT
- [ ] Use pointer fields for optional updates
- [ ] Only update non-nil fields
- [ ] Validate partial update logic
- [ ] Write tests for partial updates
- [ ] Update API documentation

**Endpoints:**
- PATCH /tasks/{id}
- PATCH /events/{id}
- PATCH /transactions/{id}

**Example:**
```go
type TaskPartialUpdate struct {
    Title       *string           `json:"title,omitempty"`
    Description *string           `json:"description,omitempty"`
    Status      *types.TaskStatus `json:"status,omitempty"`
    DueDate     *time.Time        `json:"due_date,omitempty"`
}
```

**Estimated Effort:** 2-3 days

---

#### 2.4 Add Date Range Filter for Finance Summary
**File:** `internal/delivery/http/handler/finance_handler.go`

**Changes:**
- [ ] Add start_date and end_date query params
- [ ] Update usecase to filter by date range
- [ ] Update repository query
- [ ] Add validation for date range
- [ ] Default to current month if not specified
- [ ] Add preset filters (this_month, last_month, this_year)
- [ ] Write tests
- [ ] Update API documentation

**Query Params:**
```
?division_id=uuid&start_date=2026-01-01&end_date=2026-01-31
?division_id=uuid&preset=this_month
```

**Estimated Effort:** 2 days

---

#### 2.5 Add Search and Filters for Transactions
**File:** `internal/delivery/http/handler/finance_handler.go`

**Implementation:**
- [ ] Add search query param (search in description)
- [ ] Add amount_min and amount_max filters
- [ ] Add date range filters
- [ ] Add status filter
- [ ] Update repository with dynamic query building
- [ ] Add sorting options (date, amount)
- [ ] Write tests
- [ ] Update API documentation

**Query Params:**
```
?division_id=uuid&search=meeting&amount_min=10000&amount_max=50000&start_date=2026-01-01&sort=date_desc
```

**Estimated Effort:** 2-3 days

---

### Phase 2 Testing Checklist
- [ ] Pagination works on all list endpoints
- [ ] Event list works with and without division_id
- [ ] Partial updates work correctly
- [ ] Finance summary filters by date range
- [ ] Transaction search and filters work
- [ ] All tests pass
- [ ] API documentation updated

**Phase 2 Deliverables:**
- Pagination implemented on all list endpoints
- Event list more flexible
- Partial update support
- Finance summary with date filters
- Transaction search and filters
- Updated API documentation

**Total Phase 2 Effort:** 10-13 days

---

## PHASE 3: DATA INTEGRITY FIXES (Week 5-6)
**Duration:** 1-2 weeks
**Goal:** Fix data integrity and business logic issues

### Priority: MEDIUM 🟡

### Tasks

#### 3.1 Fix Division Member Limit Constant
**Files:** 
- `internal/application/organization/member_creation_usecase.go`
- `internal/application/organization/division_usecase.go`

**Changes:**
- [ ] Create constants package
- [ ] Define single source of truth for limits
- [ ] Update all usages
- [ ] Add config override option
- [ ] Write tests
- [ ] Document business rules

**File:** `internal/domain/constants/limits.go`
```go
const (
    MaxDivisionsFreePlan    = 7
    MaxMembersPerDivision   = 15
    MaxHeadsPerDivision     = 3
    MinHeadsPerDivision     = 1
)
```

**Estimated Effort:** 1 day

---

#### 3.2 Allow Event Division Update
**File:** `internal/delivery/http/handler/event_handler.go`

**Changes:**
- [ ] Allow division_id in update request
- [ ] Validate new division exists
- [ ] Validate user has access to new division
- [ ] Update event with new division_id
- [ ] Write tests
- [ ] Update API documentation

**Estimated Effort:** 1 day

---

#### 3.3 Validate Task Assignee Membership
**File:** `internal/application/task/task_usecase.go`

**Implementation:**
- [ ] Add division member check before assign
- [ ] Query division_members table
- [ ] Return error if assignee not in division
- [ ] Apply to create and update
- [ ] Write tests
- [ ] Update error messages

**Estimated Effort:** 1-2 days

---

#### 3.4 Check Duplicate Email in Member Creation
**File:** `internal/application/organization/member_creation_usecase.go`

**Changes:**
- [ ] Check if email exists in organization before create
- [ ] Return clear error message
- [ ] Apply to single and bulk creation
- [ ] Handle bulk import duplicates gracefully
- [ ] Write tests
- [ ] Update API documentation

**Estimated Effort:** 1-2 days

---

#### 3.5 Implement Soft Delete
**Files:** Multiple entities and repositories

**Implementation:**
- [ ] Add deleted_at field to all entities
- [ ] Update GORM models with gorm.DeletedAt
- [ ] Update all queries to exclude soft-deleted
- [ ] Add restore endpoints (optional)
- [ ] Add permanent delete for admins (optional)
- [ ] Run migration
- [ ] Write tests
- [ ] Update API documentation

**Entities:**
- User
- Organization
- Division
- Task
- Event
- Transaction

**Estimated Effort:** 3-4 days

---

#### 3.6 Add Transaction Status Validation
**File:** `internal/application/finance/finance_usecase.go`

**Implementation:**
- [ ] Define status transition rules
- [ ] Validate transitions on update
- [ ] Prevent update of approved transactions
- [ ] Add approval workflow (for future)
- [ ] Write tests
- [ ] Document status flow

**Status Transitions:**
```
PENDING -> APPROVED (allowed)
PENDING -> REJECTED (allowed)
APPROVED -> * (not allowed)
REJECTED -> * (not allowed)
```

**Estimated Effort:** 2 days

---

### Phase 3 Testing Checklist
- [ ] Constants used consistently
- [ ] Event can move between divisions
- [ ] Task assignee validation works
- [ ] Duplicate email check works
- [ ] Soft delete works on all entities
- [ ] Transaction status validation works
- [ ] All tests pass

**Phase 3 Deliverables:**
- Consistent business rule constants
- Event division update support
- Task assignee validation
- Duplicate email prevention
- Soft delete implementation
- Transaction status validation

**Total Phase 3 Effort:** 9-12 days

---

## PHASE 4: API IMPROVEMENTS (Week 7)
**Duration:** 1 week
**Goal:** Improve API design and developer experience

### Priority: LOW 🟢

### Tasks

#### 4.1 Add API Versioning
**File:** `cmd/api/main.go`

**Changes:**
- [ ] Add /api/v1 prefix to all routes
- [ ] Update all handlers
- [ ] Keep backward compatibility (optional)
- [ ] Update API documentation
- [ ] Update frontend/mobile clients

**Estimated Effort:** 1-2 days

---

#### 4.2 Standardize Response Format
**Files:** All handlers

**Implementation:**
- [ ] Create response wrapper types
- [ ] Standardize success responses
- [ ] Standardize error responses
- [ ] Add metadata field
- [ ] Update all handlers
- [ ] Write response helpers
- [ ] Update API documentation

**Standard Format:**
```json
{
  "success": true,
  "data": {...},
  "meta": {
    "request_id": "uuid",
    "timestamp": "2026-05-14T10:00:00Z"
  }
}
```

**Error Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  },
  "meta": {
    "request_id": "uuid",
    "timestamp": "2026-05-14T10:00:00Z"
  }
}
```

**Estimated Effort:** 2-3 days

---

#### 4.3 Add Request ID Tracing
**File:** `internal/delivery/http/middleware/request_id.go`

**Implementation:**
- [ ] Create request ID middleware
- [ ] Generate UUID for each request
- [ ] Add to context
- [ ] Add to response headers
- [ ] Add to logs
- [ ] Update logger to include request_id
- [ ] Write tests

**Estimated Effort:** 1 day

---

#### 4.4 Add Audit Logging
**Files:** New audit package

**Implementation:**
- [ ] Create audit_logs table
- [ ] Create audit log entity
- [ ] Create audit log repository
- [ ] Add audit middleware
- [ ] Log sensitive operations (create, update, delete)
- [ ] Include actor, timestamp, changes
- [ ] Add audit log query endpoint
- [ ] Write tests

**Audit Log Fields:**
- id, organization_id, user_id
- action (CREATE, UPDATE, DELETE)
- resource_type, resource_id
- changes (JSON)
- ip_address, user_agent
- created_at

**Estimated Effort:** 2-3 days

---

### Phase 4 Testing Checklist
- [ ] API versioning works
- [ ] Response format consistent
- [ ] Request ID in all responses
- [ ] Audit logs created for sensitive ops
- [ ] All tests pass

**Phase 4 Deliverables:**
- API versioning (/api/v1)
- Standardized response format
- Request ID tracing
- Audit logging system

**Total Phase 4 Effort:** 6-9 days

---

## PHASE 5: PERFORMANCE & OPTIMIZATION (Week 8)
**Duration:** 1 week
**Goal:** Optimize performance and add caching

### Priority: LOW 🟢

### Tasks

#### 5.1 Fix N+1 Query Problems
**Files:** Repository layer

**Implementation:**
- [ ] Identify N+1 queries
- [ ] Add eager loading with GORM Preload
- [ ] Optimize task list (preload assignee)
- [ ] Optimize division list (preload members)
- [ ] Optimize event list (preload division)
- [ ] Write performance tests
- [ ] Benchmark before/after

**Estimated Effort:** 2-3 days

---

#### 5.2 Add Database Indexes
**File:** New migration

**Implementation:**
- [ ] Analyze slow queries
- [ ] Create indexes for foreign keys
- [ ] Create indexes for frequently queried fields
- [ ] Create composite indexes
- [ ] Run migration
- [ ] Benchmark query performance
- [ ] Document indexes

**Indexes to Add:**
- users(email)
- organizations(subdomain)
- tasks(organization_id, division_id, status)
- events(organization_id, division_id, start_time)
- transactions(organization_id, division_id, type, created_at)

**Estimated Effort:** 1-2 days

---

#### 5.3 Add Redis Caching Layer
**Files:** New cache package

**Implementation:**
- [ ] Setup Redis connection
- [ ] Create cache interface
- [ ] Implement Redis cache
- [ ] Add cache middleware
- [ ] Cache organization data
- [ ] Cache user profiles
- [ ] Cache division lists
- [ ] Add cache invalidation
- [ ] Write tests

**Cache Strategy:**
- Organization: 1 hour TTL
- User profile: 30 minutes TTL
- Division list: 15 minutes TTL
- Invalidate on update/delete

**Estimated Effort:** 3-4 days

---

### Phase 5 Testing Checklist
- [ ] N+1 queries eliminated
- [ ] Database indexes created
- [ ] Caching works correctly
- [ ] Cache invalidation works
- [ ] Performance improved
- [ ] All tests pass

**Phase 5 Deliverables:**
- Optimized queries (no N+1)
- Database indexes
- Redis caching layer
- Performance benchmarks

**Total Phase 5 Effort:** 6-9 days

---

## PHASE 6: DOCUMENTATION & TESTING (Week 9-10)
**Duration:** 1-2 weeks
**Goal:** Complete documentation and comprehensive testing

### Priority: MEDIUM 🟡

### Tasks

#### 6.1 Generate OpenAPI Specification
**Tool:** Use swaggo/swag or manual creation

**Implementation:**
- [ ] Install swag CLI
- [ ] Add swagger comments to handlers
- [ ] Generate swagger.json
- [ ] Setup Swagger UI endpoint
- [ ] Document all endpoints
- [ ] Document request/response schemas
- [ ] Document error codes
- [ ] Publish API docs

**Estimated Effort:** 3-4 days

---

#### 6.2 Create Comprehensive Test Suite
**Files:** All test files

**Implementation:**
- [ ] Increase unit test coverage to 80%+
- [ ] Write integration tests for all endpoints
- [ ] Write end-to-end tests
- [ ] Add security tests
- [ ] Add performance tests
- [ ] Setup CI/CD pipeline
- [ ] Add test coverage reporting

**Test Categories:**
- Unit tests (usecase, domain logic)
- Integration tests (handler + database)
- E2E tests (full API flows)
- Security tests (auth, authorization, injection)
- Performance tests (load testing)

**Estimated Effort:** 5-7 days

---

#### 6.3 Create Deployment Documentation
**File:** `docs/DEPLOYMENT.md`

**Content:**
- [ ] Environment setup guide
- [ ] Database migration guide
- [ ] Configuration reference
- [ ] Docker deployment
- [ ] Kubernetes deployment (optional)
- [ ] Monitoring setup
- [ ] Backup and restore procedures
- [ ] Troubleshooting guide

**Estimated Effort:** 2-3 days

---

#### 6.4 Create Developer Guide
**File:** `docs/DEVELOPER_GUIDE.md`

**Content:**
- [ ] Project structure overview
- [ ] Development workflow
- [ ] Coding standards
- [ ] Testing guidelines
- [ ] Git workflow
- [ ] PR review checklist
- [ ] Common tasks guide

**Estimated Effort:** 2 days

---

### Phase 6 Testing Checklist
- [ ] OpenAPI spec complete
- [ ] Test coverage > 80%
- [ ] All integration tests pass
- [ ] Security tests pass
- [ ] Documentation complete
- [ ] CI/CD pipeline working

**Phase 6 Deliverables:**
- OpenAPI specification
- Comprehensive test suite
- Deployment documentation
- Developer guide
- CI/CD pipeline

**Total Phase 6 Effort:** 12-16 days

---

## SUMMARY

### Total Timeline: 8-10 weeks

| Phase | Duration | Effort | Priority |
|-------|----------|--------|----------|
| Phase 0: Preparation | 3-5 days | 3-5 days | Setup |
| Phase 1: Security | 1-2 weeks | 10-14 days | CRITICAL |
| Phase 2: UX | 1-2 weeks | 10-13 days | HIGH |
| Phase 3: Data Integrity | 1-2 weeks | 9-12 days | MEDIUM |
| Phase 4: API Improvements | 1 week | 6-9 days | LOW |
| Phase 5: Performance | 1 week | 6-9 days | LOW |
| Phase 6: Documentation | 1-2 weeks | 12-16 days | MEDIUM |

### Critical Path (Must Do Before Production)
1. Phase 0: Preparation
2. Phase 1: Security Fixes (ALL tasks)
3. Phase 2: UX Improvements (at least pagination)
4. Phase 6: Basic documentation and testing

### Recommended Team Size
- 2-3 backend developers
- 1 QA engineer
- 1 DevOps engineer (part-time)

### Risk Mitigation
- Start with Phase 1 (security) immediately
- Run parallel development where possible
- Maintain backward compatibility
- Use feature flags for gradual rollout
- Keep staging environment in sync
- Regular code reviews
- Continuous integration testing

### Success Metrics
- [ ] All critical security issues resolved
- [ ] Test coverage > 80%
- [ ] API response time < 200ms (p95)
- [ ] Zero data integrity issues
- [ ] Complete API documentation
- [ ] Successful production deployment

---

## NEXT STEPS

1. **Review this plan** with the team
2. **Prioritize phases** based on business needs
3. **Assign tasks** to team members
4. **Setup project tracking** (Jira, Linear, etc.)
5. **Create feature branches** for each phase
6. **Start with Phase 0** immediately

---

**Document Version:** 1.0
**Last Updated:** 2026-05-14
**Owner:** Development Team
