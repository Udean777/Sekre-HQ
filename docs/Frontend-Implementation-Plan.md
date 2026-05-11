# Frontend Implementation Plan - SvelteKit 5 + Runes Mode

**Created:** 2026-05-11  
**Status:** Planning  
**Tech Stack:** SvelteKit 2.57, Svelte 5.55, TypeScript 6, Tailwind CSS 4  
**Backend API:** Go REST API at `http://localhost:8080/api/v1`

---

## 🎯 Project Goals

Membangun frontend SaaS dashboard untuk Organization ERP Lite dengan:
- Multi-tenant authentication
- Division management
- Task management (Kanban)
- Event scheduling
- Finance tracking
- Responsive design
- SSR-first architecture
- Type-safe API integration

---

## 📋 Implementation Phases

### **PHASE 0: Foundation & Setup** ⚙️
**Duration:** 30-45 minutes  
**Priority:** CRITICAL  
**Status:** PENDING

#### Objectives
- Setup environment configuration
- Create type definitions for backend API
- Setup API client utilities
- Create base response handlers

#### Tasks
- [ ] Create `.env` file with `PUBLIC_API_BASE_URL`
- [ ] Create `src/lib/api/types.ts` - TypeScript interfaces for all backend entities
- [ ] Create `src/lib/api/errors.ts` - Error handling utilities
- [ ] Create `src/lib/server/api.ts` - Server-side API client with cookie auth
- [ ] Create `src/lib/utils/format.ts` - Formatting utilities (currency, date)
- [ ] Create `src/app.d.ts` - SvelteKit app types

#### Deliverables
```
.env
src/
  app.d.ts
  lib/
    api/
      types.ts
      errors.ts
    server/
      api.ts
    utils/
      format.ts
```

#### Type Definitions Required
- `Organization`
- `User`
- `Division`
- `Task`
- `Event`
- `Transaction`
- `ApiResponse<T>`
- `ApiError`

#### API Response Format
Backend wraps all responses as:
```typescript
{
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
```

---

### **PHASE 1: Authentication System** 🔐
**Duration:** 1-1.5 hours  
**Priority:** CRITICAL  
**Status:** PENDING  
**Dependencies:** Phase 0

#### Objectives
- Implement register/login with JWT cookie auth
- Create protected route guards
- Setup session management
- Auto-redirect based on auth state

#### Backend Endpoints
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

#### Tasks
- [ ] Create `src/hooks.server.ts` - Global auth middleware
- [ ] Create `src/routes/+layout.server.ts` - Root layout with auth check
- [ ] Create `src/routes/+page.server.ts` - Root redirect logic
- [ ] Create `src/routes/login/+page.svelte` - Login form
- [ ] Create `src/routes/login/+page.server.ts` - Login action
- [ ] Create `src/routes/register/+page.svelte` - Register form
- [ ] Create `src/routes/register/+page.server.ts` - Register action
- [ ] Create `src/lib/server/auth.ts` - Auth utilities (verify token, get session)

#### Features
**Register Page:**
- Organization name input
- Subdomain input (with validation pattern `^[a-z0-9-]+$`)
- Email input
- Password input (min 8 chars)
- Full name input
- Form validation
- Loading state
- Error display

**Login Page:**
- Subdomain input
- Email input
- Password input
- Form validation
- Loading state
- Error display
- Link to register

**Auth Flow:**
1. User submits login/register form
2. Server action calls backend API
3. On success, store JWT in `httpOnly` cookie named `sekre_token`
4. Redirect to `/app`
5. On error, return error to form

**Root Redirect Logic (`/`):**
- If authenticated → redirect to `/app`
- If not authenticated → redirect to `/login`

#### Deliverables
```
src/
  hooks.server.ts
  routes/
    +layout.server.ts
    +page.server.ts
    login/
      +page.svelte
      +page.server.ts
    register/
      +page.svelte
      +page.server.ts
  lib/
    server/
      auth.ts
```

---

### **PHASE 2: Base UI Components** 🎨
**Duration:** 1-1.5 hours  
**Priority:** HIGH  
**Status:** PENDING  
**Dependencies:** Phase 0

#### Objectives
- Create reusable UI components with Svelte 5 runes
- Establish consistent design system
- Build form components
- Build feedback components

#### Tasks
- [ ] Create `src/lib/components/ui/Button.svelte`
- [ ] Create `src/lib/components/ui/Input.svelte`
- [ ] Create `src/lib/components/ui/Card.svelte`
- [ ] Create `src/lib/components/ui/Badge.svelte`
- [ ] Create `src/lib/components/ui/Alert.svelte`
- [ ] Create `src/lib/components/ui/Modal.svelte`
- [ ] Create `src/lib/components/ui/EmptyState.svelte`
- [ ] Create `src/lib/components/ui/Spinner.svelte`
- [ ] Create `src/lib/components/ui/Field.svelte` (label + input + error wrapper)

#### Component Specs

**Button:**
- Props: `variant`, `size`, `disabled`, `loading`, `type`
- Variants: `primary`, `secondary`, `danger`, `ghost`
- Sizes: `sm`, `md`, `lg`
- Loading spinner integration

**Input:**
- Props: `type`, `name`, `value`, `placeholder`, `disabled`, `error`
- Support `bind:value`
- Error state styling

**Card:**
- Props: `title`, `children` (Snippet)
- Padding and shadow styles

**Badge:**
- Props: `variant`, `children` (Snippet)
- Variants: `default`, `success`, `warning`, `danger`, `info`

**Alert:**
- Props: `variant`, `title`, `message`, `dismissible`
- Variants: `success`, `error`, `warning`, `info`

**Modal:**
- Props: `isOpen`, `title`, `children` (Snippet), `onClose`
- Backdrop click to close
- Escape key to close
- Focus trap

**EmptyState:**
- Props: `title`, `description`, `icon`, `action` (optional)

**Spinner:**
- Props: `size`
- Sizes: `sm`, `md`, `lg`

**Field:**
- Props: `label`, `error`, `helperText`, `required`, `children` (Snippet)
- Wrapper for label + input + error message

#### Design Tokens
Use Tailwind CSS 4 utilities with consistent values:
- Primary color: `blue-600`
- Success: `green-600`
- Warning: `yellow-600`
- Danger: `red-600`
- Gray scale: `gray-50` to `gray-900`

#### Deliverables
```
src/lib/components/ui/
  Button.svelte
  Input.svelte
  Card.svelte
  Badge.svelte
  Alert.svelte
  Modal.svelte
  EmptyState.svelte
  Spinner.svelte
  Field.svelte
```

---

### **PHASE 3: Dashboard Layout & Shell** 🏗️
**Duration:** 1.5-2 hours  
**Priority:** HIGH  
**Status:** PENDING  
**Dependencies:** Phase 1, Phase 2

#### Objectives
- Create protected app layout
- Build responsive sidebar navigation
- Build header with user menu
- Setup mobile navigation
- Create dashboard home page

#### Backend Endpoints
- `GET /api/v1/auth/me` (for user/org data)
- `GET /api/v1/organizations/me` (optional)

#### Tasks
- [ ] Create `src/routes/app/+layout.server.ts` - Protected layout loader
- [ ] Create `src/routes/app/+layout.svelte` - App shell layout
- [ ] Create `src/lib/components/layout/AppSidebar.svelte`
- [ ] Create `src/lib/components/layout/AppHeader.svelte`
- [ ] Create `src/lib/components/layout/MobileNav.svelte`
- [ ] Create `src/lib/components/layout/UserMenu.svelte`
- [ ] Create `src/routes/app/+page.server.ts` - Dashboard data loader
- [ ] Create `src/routes/app/+page.svelte` - Dashboard page

#### Layout Features

**AppSidebar:**
- Logo/organization name
- Navigation menu:
  - Dashboard
  - Divisions
  - Tasks
  - Events
  - Finance
- Active route highlighting
- Collapsible on desktop
- Hidden on mobile (drawer)

**AppHeader:**
- Breadcrumbs (optional for MVP)
- Organization info (name, plan badge)
- User menu dropdown
- Mobile hamburger menu button

**UserMenu:**
- User name and email
- Organization name
- Logout action

**MobileNav:**
- Slide-in drawer
- Same menu as sidebar
- Backdrop overlay

**Dashboard Page:**
- Welcome message
- Summary cards:
  - Total divisions
  - Total tasks (by status)
  - Upcoming events
  - Finance balance (if available)
- Quick actions
- Recent activity (optional)

#### Responsive Breakpoints
- Mobile: `< 768px` - Hidden sidebar, mobile nav
- Tablet: `768px - 1024px` - Collapsible sidebar
- Desktop: `> 1024px` - Full sidebar

#### Auth Guard
`+layout.server.ts` must:
1. Check for `sekre_token` cookie
2. If missing → redirect to `/login`
3. If present → fetch `/auth/me`
4. If token invalid → clear cookie, redirect to `/login`
5. Return user and organization data to layout

#### Deliverables
```
src/routes/app/
  +layout.server.ts
  +layout.svelte
  +page.server.ts
  +page.svelte

src/lib/components/layout/
  AppSidebar.svelte
  AppHeader.svelte
  MobileNav.svelte
  UserMenu.svelte
```

---

### **PHASE 4: Divisions Management** 📁
**Duration:** 1.5-2 hours  
**Priority:** HIGH  
**Status:** PENDING  
**Dependencies:** Phase 3

#### Objectives
- List all divisions
- Create new division
- Edit division
- Delete division
- Show division members
- Add/remove division members
- Update member roles

#### Backend Endpoints
- `GET /api/v1/divisions`
- `POST /api/v1/divisions`
- `GET /api/v1/divisions/{id}`
- `PUT /api/v1/divisions/{id}`
- `DELETE /api/v1/divisions/{id}`
- `GET /api/v1/divisions/{id}/members`
- `POST /api/v1/divisions/{id}/members`
- `PATCH /api/v1/divisions/{id}/members/{userId}`
- `DELETE /api/v1/divisions/{id}/members/{userId}`

#### Tasks
- [ ] Create `src/lib/features/divisions/types.ts`
- [ ] Create `src/routes/app/divisions/+page.server.ts`
- [ ] Create `src/routes/app/divisions/+page.svelte`
- [ ] Create `src/lib/features/divisions/DivisionForm.svelte`
- [ ] Create `src/lib/features/divisions/DivisionCard.svelte`
- [ ] Create `src/lib/features/divisions/MemberList.svelte`
- [ ] Create `src/lib/features/divisions/AddMemberModal.svelte`

#### Features

**Divisions List Page:**
- Grid/list of division cards
- Each card shows:
  - Division name
  - Member count
  - Created date
  - Actions (edit, delete, view members)
- Create division button
- Empty state if no divisions
- Free plan limit indicator (max 7 divisions)

**Create/Edit Division:**
- Modal or inline form
- Fields:
  - Name (required)
- Form validation
- Loading state
- Success/error feedback

**Delete Division:**
- Confirmation modal
- Warning if division has active data
- Loading state
- Success/error feedback

**Division Members:**
- List of members with:
  - Name
  - Email
  - Role (HEAD/STAFF)
  - Actions (change role, remove)
- Add member button
- Empty state if no members

**Add Member:**
- Modal form
- Search/select user (if user management exists)
- Or input user ID/email
- Select role (HEAD/STAFF)
- Form validation

#### Form Actions
- `?/createDivision`
- `?/updateDivision`
- `?/deleteDivision`
- `?/addMember`
- `?/updateMemberRole`
- `?/removeMember`

#### Deliverables
```
src/routes/app/divisions/
  +page.server.ts
  +page.svelte

src/lib/features/divisions/
  types.ts
  DivisionForm.svelte
  DivisionCard.svelte
  MemberList.svelte
  AddMemberModal.svelte
```

---

### **PHASE 5: Task Management (Kanban)** ✅
**Duration:** 2-2.5 hours  
**Priority:** HIGH  
**Status:** PENDING  
**Dependencies:** Phase 3, Phase 4

#### Objectives
- Display tasks in Kanban board (TODO, IN_PROGRESS, DONE)
- Create new task
- Edit task
- Delete task
- Update task status (move between columns)
- Filter by division and assignee

#### Backend Endpoints
- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `GET /api/v1/tasks/{id}`
- `PUT /api/v1/tasks/{id}`
- `PATCH /api/v1/tasks/{id}/status`
- `DELETE /api/v1/tasks/{id}`

#### Tasks
- [ ] Create `src/lib/features/tasks/types.ts`
- [ ] Create `src/routes/app/tasks/+page.server.ts`
- [ ] Create `src/routes/app/tasks/+page.svelte`
- [ ] Create `src/lib/features/tasks/KanbanBoard.svelte`
- [ ] Create `src/lib/features/tasks/KanbanColumn.svelte`
- [ ] Create `src/lib/features/tasks/TaskCard.svelte`
- [ ] Create `src/lib/features/tasks/TaskForm.svelte`
- [ ] Create `src/lib/features/tasks/TaskFilters.svelte`

#### Features

**Kanban Board:**
- 3 columns: TODO, IN_PROGRESS, DONE
- Each column shows:
  - Column title
  - Task count
  - List of task cards
- Drag and drop (optional for MVP, can use move buttons)

**Task Card:**
- Task title
- Assignee name
- Due date (with overdue indicator)
- Division badge
- Quick actions (edit, delete, move)
- Click to view details

**Create/Edit Task:**
- Modal form
- Fields:
  - Title (required)
  - Description (optional)
  - Division (select, required)
  - Assignee (select, required)
  - Due date (optional)
  - Status (for edit only)
- Form validation
- Loading state

**Task Filters:**
- Filter by division (dropdown)
- Filter by assignee (dropdown)
- Filter by status (tabs or dropdown)
- Clear filters button

**Move Task:**
- Button to move to next/previous status
- Or drag and drop (advanced)
- Calls `PATCH /tasks/{id}/status`

#### Form Actions
- `?/createTask`
- `?/updateTask`
- `?/deleteTask`
- `?/updateTaskStatus`

#### Deliverables
```
src/routes/app/tasks/
  +page.server.ts
  +page.svelte

src/lib/features/tasks/
  types.ts
  KanbanBoard.svelte
  KanbanColumn.svelte
  TaskCard.svelte
  TaskForm.svelte
  TaskFilters.svelte
```

---

### **PHASE 6: Event Scheduling** 📅
**Duration:** 1.5-2 hours  
**Priority:** HIGH  
**Status:** PENDING  
**Dependencies:** Phase 3, Phase 4

#### Objectives
- Display events in timeline/list view
- Create new event
- Edit event
- Delete event
- Filter by division and date range

#### Backend Endpoints
- `GET /api/v1/events`
- `POST /api/v1/events`
- `GET /api/v1/events/{id}`
- `PUT /api/v1/events/{id}`
- `DELETE /api/v1/events/{id}`

#### Tasks
- [ ] Create `src/lib/features/events/types.ts`
- [ ] Create `src/routes/app/events/+page.server.ts`
- [ ] Create `src/routes/app/events/+page.svelte`
- [ ] Create `src/lib/features/events/EventTimeline.svelte`
- [ ] Create `src/lib/features/events/EventCard.svelte`
- [ ] Create `src/lib/features/events/EventForm.svelte`
- [ ] Create `src/lib/features/events/EventFilters.svelte`

#### Features

**Events Timeline/List:**
- Chronological list of events
- Group by date (today, upcoming, past)
- Each event shows:
  - Title
  - Division badge
  - Start/end time
  - Location
  - Actions (edit, delete)
- Create event button
- Empty state if no events

**Event Card:**
- Event title
- Division name
- Date and time range
- Location
- Description (truncated)
- Status indicator (upcoming, ongoing, past)

**Create/Edit Event:**
- Modal or page form
- Fields:
  - Title (required)
  - Description (optional)
  - Division (select, required)
  - Start time (datetime, required)
  - End time (datetime, required)
  - Location (text, optional)
- Validation:
  - End time must be after start time
- Loading state

**Event Filters:**
- Filter by division
- Filter by date range (start date, end date)
- Filter by status (upcoming, past)
- Clear filters

#### Form Actions
- `?/createEvent`
- `?/updateEvent`
- `?/deleteEvent`

#### Deliverables
```
src/routes/app/events/
  +page.server.ts
  +page.svelte

src/lib/features/events/
  types.ts
  EventTimeline.svelte
  EventCard.svelte
  EventForm.svelte
  EventFilters.svelte
```

---

### **PHASE 7: Finance Tracker** 💰
**Duration:** 2-2.5 hours  
**Priority:** HIGH  
**Status:** PENDING  
**Dependencies:** Phase 3, Phase 4, Phase 6

#### Objectives
- Display finance summary (income, expense, balance)
- List all transactions
- Create new transaction
- Edit transaction
- Delete transaction
- Filter by division, type, status, date range
- Link transaction to event (optional)

#### Backend Endpoints
- `GET /api/v1/transactions`
- `POST /api/v1/transactions`
- `GET /api/v1/transactions/{id}`
- `PUT /api/v1/transactions/{id}`
- `DELETE /api/v1/transactions/{id}`
- `GET /api/v1/finance/summary`

#### Tasks
- [ ] Create `src/lib/features/finance/types.ts`
- [ ] Create `src/routes/app/finance/+page.server.ts`
- [ ] Create `src/routes/app/finance/+page.svelte`
- [ ] Create `src/lib/features/finance/FinanceSummary.svelte`
- [ ] Create `src/lib/features/finance/TransactionTable.svelte`
- [ ] Create `src/lib/features/finance/TransactionRow.svelte`
- [ ] Create `src/lib/features/finance/TransactionForm.svelte`
- [ ] Create `src/lib/features/finance/TransactionFilters.svelte`

#### Features

**Finance Summary:**
- Cards showing:
  - Total income (green)
  - Total expense (red)
  - Balance (blue)
- Period selector (optional: this month, last month, all time)

**Transaction Table:**
- Columns:
  - Date
  - Description
  - Division
  - Type (INCOME/EXPENSE badge)
  - Amount (formatted as IDR)
  - Status (PENDING/APPROVED/REJECTED badge)
  - Actions (edit, delete)
- Sortable by date, amount
- Pagination (if many transactions)
- Empty state if no transactions

**Create/Edit Transaction:**
- Modal form
- Fields:
  - Division (select, required)
  - Type (select: INCOME/EXPENSE, required)
  - Amount (number, required)
  - Description (text, required)
  - Event (select, optional - link to event)
  - Receipt URL (text/upload, optional)
- Form validation
- Loading state
- Note: For Free plan, status auto-approved by backend

**Transaction Filters:**
- Filter by division
- Filter by type (INCOME/EXPENSE/ALL)
- Filter by status (PENDING/APPROVED/REJECTED/ALL)
- Filter by date range
- Clear filters

**Currency Formatting:**
- Format amounts as IDR: `Rp 150.000`
- Use `src/lib/utils/format.ts`

#### Form Actions
- `?/createTransaction`
- `?/updateTransaction`
- `?/deleteTransaction`

#### Deliverables
```
src/routes/app/finance/
  +page.server.ts
  +page.svelte

src/lib/features/finance/
  types.ts
  FinanceSummary.svelte
  TransactionTable.svelte
  TransactionRow.svelte
  TransactionForm.svelte
  TransactionFilters.svelte
```

---

### **PHASE 8: Polish & Refinement** ✨
**Duration:** 1-1.5 hours  
**Priority:** MEDIUM  
**Status:** PENDING  
**Dependencies:** Phase 1-7

#### Objectives
- Improve error handling
- Add loading states
- Add success feedback
- Improve form validation
- Add confirmation modals
- Improve responsive design
- Add keyboard shortcuts (optional)
- Accessibility improvements

#### Tasks
- [ ] Add global error boundary
- [ ] Add toast notification system
- [ ] Improve form validation messages
- [ ] Add confirmation modals for delete actions
- [ ] Add loading skeletons for data fetching
- [ ] Test on mobile devices
- [ ] Test keyboard navigation
- [ ] Add focus indicators
- [ ] Improve color contrast
- [ ] Add page transitions (optional)

#### Toast Notification System
- Create `src/lib/stores/toast.ts`
- Create `src/lib/components/ui/Toast.svelte`
- Methods: `toast.success()`, `toast.error()`, `toast.info()`
- Auto-dismiss after 3-5 seconds
- Stack multiple toasts

#### Confirmation Modal
- Create `src/lib/components/ui/ConfirmModal.svelte`
- Props: `isOpen`, `title`, `message`, `onConfirm`, `onCancel`
- Danger variant for delete actions

#### Loading States
- Skeleton loaders for:
  - Division cards
  - Task cards
  - Event cards
  - Transaction rows
- Spinner for form submissions
- Disabled state for buttons during loading

#### Form Validation
- Client-side validation before submit
- Show field errors inline
- Highlight invalid fields
- Focus first invalid field

#### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus management in modals
- Color contrast WCAG AA

#### Deliverables
```
src/lib/stores/
  toast.ts

src/lib/components/ui/
  Toast.svelte
  ConfirmModal.svelte
  Skeleton.svelte
```

---

### **PHASE 9: Testing & Documentation** 📝
**Duration:** 1 hour  
**Priority:** MEDIUM  
**Status:** PENDING  
**Dependencies:** Phase 8

#### Objectives
- Manual testing all features
- Cross-browser testing
- Mobile testing
- Document component usage
- Create README for frontend

#### Tasks
- [ ] Test auth flow (register, login, logout)
- [ ] Test divisions CRUD
- [ ] Test tasks CRUD and Kanban
- [ ] Test events CRUD
- [ ] Test finance CRUD
- [ ] Test filters and search
- [ ] Test responsive design
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on iOS Safari, Android Chrome
- [ ] Document component props and usage
- [ ] Update frontend README

#### Testing Checklist
- [ ] Register new organization
- [ ] Login with existing account
- [ ] Logout
- [ ] Create division
- [ ] Edit division
- [ ] Delete division
- [ ] Add division member
- [ ] Remove division member
- [ ] Create task
- [ ] Edit task
- [ ] Move task between statuses
- [ ] Delete task
- [ ] Filter tasks
- [ ] Create event
- [ ] Edit event
- [ ] Delete event
- [ ] Filter events
- [ ] Create transaction
- [ ] Edit transaction
- [ ] Delete transaction
- [ ] Filter transactions
- [ ] View finance summary
- [ ] Test on mobile (sidebar, navigation)
- [ ] Test form validation
- [ ] Test error handling
- [ ] Test loading states

#### Documentation
- Component usage examples
- API integration guide
- Environment setup
- Development workflow
- Build and deployment

---

## 📊 Progress Tracking

| Phase | Status | Duration | Priority |
|-------|--------|----------|----------|
| Phase 0: Foundation | PENDING | 30-45 min | CRITICAL |
| Phase 1: Authentication | PENDING | 1-1.5 hrs | CRITICAL |
| Phase 2: UI Components | PENDING | 1-1.5 hrs | HIGH |
| Phase 3: Dashboard Layout | PENDING | 1.5-2 hrs | HIGH |
| Phase 4: Divisions | PENDING | 1.5-2 hrs | HIGH |
| Phase 5: Tasks | PENDING | 2-2.5 hrs | HIGH |
| Phase 6: Events | PENDING | 1.5-2 hrs | HIGH |
| Phase 7: Finance | PENDING | 2-2.5 hrs | HIGH |
| Phase 8: Polish | PENDING | 1-1.5 hrs | MEDIUM |
| Phase 9: Testing | PENDING | 1 hr | MEDIUM |

**Total Estimated Time:** 13-17 hours

---

## 🔧 Technical Decisions

### Authentication Strategy
- JWT stored in `httpOnly` cookie named `sekre_token`
- Server-side auth checks in `+layout.server.ts`
- Auto-redirect based on auth state
- Token refresh not implemented in MVP (manual re-login)

### Data Fetching Strategy
- SSR-first: Use `+page.server.ts` load functions
- Protected data fetched server-side with cookie token
- Client-side fetch only for non-protected or real-time data

### Form Handling Strategy
- Use SvelteKit form actions for mutations
- Progressive enhancement (works without JS)
- Client-side validation for UX
- Server-side validation as source of truth

### State Management Strategy
- Page data from SvelteKit load functions
- Local component state with `$state()` runes
- Global state with Svelte stores (if needed)
- No external state management library

### Styling Strategy
- Tailwind CSS 4 with `@import` syntax
- Utility-first approach
- Consistent spacing and colors
- Responsive design with mobile-first
- No custom CSS files (use Tailwind)

### Component Architecture
- Svelte 5 runes mode (mandatory)
- TypeScript for all components
- Props with `$props()`
- Children with `Snippet` type
- Event handlers with `onclick`, `onsubmit`, etc.

---

## 🚀 Getting Started

### Prerequisites
- Backend API running at `http://localhost:8080`
- Node.js 20+ or Bun
- PostgreSQL with seeded data

### Setup
```bash
cd sekre-frontend

# Install dependencies
bun install

# Create .env file
echo "PUBLIC_API_BASE_URL=http://localhost:8080/api/v1" > .env

# Run development server
bun run dev
```

### Development Workflow
1. Start backend API
2. Start frontend dev server
3. Open `http://localhost:5173`
4. Register new organization or login
5. Test features

---

## 📚 Resources

- [Svelte 5 Documentation](https://svelte.dev/docs/svelte)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Backend API Spec](./api/openapi.yaml)
- [Svelte 5 Runes Guide](./Svelte-5-Runes-Guide.md)
- [Svelte 5 Quick Reference](./Svelte-5-Quick-Reference.md)

---

## 🎯 Success Criteria

### Functional Requirements
- ✅ User can register new organization
- ✅ User can login to organization
- ✅ User can view dashboard
- ✅ User can manage divisions
- ✅ User can manage tasks in Kanban board
- ✅ User can manage events
- ✅ User can manage finance transactions
- ✅ User can view finance summary
- ✅ User can logout

### Non-Functional Requirements
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Type-safe API integration
- ✅ Loading states for all async operations
- ✅ Error handling for all API calls
- ✅ Form validation (client and server)
- ✅ Accessible (keyboard navigation, ARIA)
- ✅ Fast page loads (SSR)
- ✅ Clean code with TypeScript

---

## 🔮 Future Enhancements (Post-MVP)

### Phase 10: Advanced Features
- Drag and drop for Kanban
- Calendar view for events
- Charts for finance analytics
- Export data to CSV/Excel
- File upload for receipts
- Real-time updates with WebSocket
- Notifications system
- Search functionality
- Bulk actions
- Keyboard shortcuts

### Phase 11: Paid Features UI
- Transaction approval workflow (Lite plan)
- AI-generated LPJ (Lite plan)
- Custom branding (Pro plan)
- Public organization page (Pro plan)
- Cloud storage integration (Pro plan)
- Advanced analytics (Pro plan)
- Subscription management UI
- Payment integration UI

### Phase 12: Performance & Optimization
- Code splitting
- Image optimization
- Lazy loading
- Service worker (PWA)
- Caching strategy
- Bundle size optimization
- Lighthouse score > 90

---

**Last Updated:** 2026-05-11  
**Author:** AI Assistant  
**Status:** Ready for Implementation
