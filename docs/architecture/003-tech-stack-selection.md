# ADR-003: Tech Stack Selection

## Status
Accepted

## Context
We need to select technologies for building a multi-platform SaaS application with the following requirements:
- High performance backend API
- Modern, responsive web dashboard
- Native mobile experience (Android & iOS)
- AI integration capabilities
- Cost-effective for startup

## Decision

### Backend: Golang
**Framework**: Standard library + Chi router (or Fiber)
**Architecture**: Modular Monolith with Clean Architecture

**Rationale:**
- Excellent performance and low resource usage
- Strong concurrency support (goroutines) for handling multiple tenants
- Fast compilation and deployment
- Great for building APIs
- Strong typing and tooling
- Low memory footprint = lower hosting costs

### Database: PostgreSQL 16+
**Rationale:**
- Mature, battle-tested RDBMS
- Native Row-Level Security (RLS) for multi-tenancy
- JSONB support for flexible data
- Excellent performance and reliability
- Strong community and ecosystem
- Free and open-source

### Message Queue: Redis + Asynq
**Rationale:**
- Fast, in-memory data store
- Asynq provides robust task queue on top of Redis
- Perfect for AI job processing (LPJ generation)
- Can also be used for caching
- Simple to deploy and maintain

### Web Frontend: SvelteKit
**Rationale:**
- Excellent performance (compiles to vanilla JS)
- Built-in SSR for better SEO and initial load
- Smaller bundle sizes than React/Vue
- Great developer experience
- File-based routing
- Growing ecosystem

### Mobile: Compose Multiplatform
**Rationale:**
- 95%+ code sharing between Android and iOS
- Native performance and UI
- Kotlin language (modern, safe, productive)
- Backed by JetBrains and Google
- Offline-first capabilities with Room/SQLDelight
- Future-proof (Google's direction for Android)

### AI Integration: Hybrid Approach
**Local LLM**: Llama 3 / Mistral (Free/Lite plans)
**Cloud LLM**: OpenAI GPT-4 / Gemini Pro (Pro plan)

**Rationale:**
- Cost optimization: Local LLM for basic features
- Quality: Cloud LLM for premium features
- Flexibility: Can switch providers easily
- Control: Own infrastructure for sensitive data

## Consequences

### Positive
- **Performance**: All technologies chosen for speed
- **Cost-effective**: Low resource usage, open-source stack
- **Developer productivity**: Modern languages and frameworks
- **Scalability**: All components can scale independently
- **Type safety**: Golang, TypeScript, Kotlin all strongly typed
- **Code sharing**: Compose Multiplatform reduces mobile development time by 50%

### Negative
- **Learning curve**: Team needs to learn multiple technologies
- **Compose Multiplatform maturity**: Still evolving for iOS
- **Golang ecosystem**: Smaller than Node.js for web APIs
- **SvelteKit**: Smaller community than React/Next.js

### Mitigations
- Invest in team training
- Start with Android, add iOS later
- Use well-established Golang libraries
- Leverage SvelteKit's excellent documentation

## Alternatives Considered

### Backend Alternatives

#### Node.js + Express/Fastify (Rejected)
**Pros:** Large ecosystem, JavaScript everywhere
**Cons:** Higher memory usage, weaker typing, slower performance

#### Python + FastAPI (Rejected)
**Pros:** Great for AI integration, fast development
**Cons:** Slower runtime, GIL limitations, higher resource usage

#### Rust + Actix (Rejected)
**Pros:** Maximum performance, memory safety
**Cons:** Steep learning curve, slower development, smaller ecosystem

### Frontend Alternatives

#### React + Next.js (Rejected)
**Pros:** Largest ecosystem, most developers know it
**Cons:** Larger bundle sizes, more complex, React overhead

#### Vue + Nuxt (Rejected)
**Pros:** Good balance, progressive framework
**Cons:** Smaller than React, not as performant as Svelte

### Mobile Alternatives

#### React Native (Rejected)
**Pros:** Large ecosystem, JavaScript
**Cons:** Bridge overhead, less native feel, performance issues

#### Flutter (Rejected)
**Pros:** Beautiful UI, good performance, single codebase
**Cons:** Dart language (less popular), larger app size, not truly native

#### Native (Swift + Kotlin) (Rejected)
**Pros:** Best performance, full platform access
**Cons:** 2x development time, 2x maintenance, no code sharing

## References
- [Golang Performance Benchmarks](https://benchmarksgame-team.pages.debian.net/benchmarksgame/)
- [SvelteKit vs Next.js](https://www.youtube.com/watch?v=MoGkX4RvZ38)
- [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
