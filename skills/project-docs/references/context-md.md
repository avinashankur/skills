# CONTEXT.md Reference

## Purpose

CONTEXT.md is a dense, factual file placed at the root of a repository. Its primary audience is **AI coding assistants** (Claude, Copilot, Cursor, etc.) and secondarily new engineers. It front-loads the most important information about the project so that an AI or human arriving with zero context can become useful quickly.

Unlike README (which is for getting started) or architecture docs (which are comprehensive), CONTEXT.md is optimized for **fast context loading** — it is short, dense, and structured.

## When to choose this doc type

- The project uses AI coding assistants and they are making wrong assumptions about the codebase
- A team member says "I always have to explain the same things to Claude/Copilot"
- There is no single doc that gives a new engineer (or AI) the essential mental model
- The project has unusual conventions, constraints, or architectural decisions that aren't obvious from the code

## Clarifying questions to ask

1. What does this system do in one sentence?
2. What is the primary tech stack (language, framework, runtime, key libraries)?
3. What are the most important architectural patterns or conventions? (e.g., "we use CQRS", "all services are stateless", "we never use ORMs")
4. What are the known constraints or requirements? (e.g., "must run on-prem", "no external HTTP calls from workers", "all dates in UTC")
5. What are the most important things NOT to do? (anti-patterns the AI should avoid)
6. Are there established patterns for common tasks? (e.g., "to add a new endpoint, follow the pattern in src/api/users.ts")
7. What directories should an AI focus on vs. avoid?
8. What does "success" look like for code changes? (passes tests, no TypeScript errors, follows linting rules)

## CONTEXT.md Template

---

# CONTEXT.md

> This file provides essential context for AI coding assistants and new contributors. It is intentionally dense — read fully before making changes.
> Last updated: YYYY-MM-DD

---

## What this is

[1–3 sentences. Name, purpose, and primary users. Be specific.]

**Example:** "Acme is a B2B SaaS platform for logistics companies to track shipments and generate customs documentation. It serves ~200 enterprise customers via a web app and REST API."

---

## Tech Stack

| Layer     | Technology     | Version | Notes               |
| --------- | -------------- | ------- | ------------------- |
| Language  | TypeScript     | 5.3     | Strict mode enabled |
| Runtime   | Node.js        | 20 LTS  |                     |
| Framework | Express        | 4.x     |                     |
| ORM       | Prisma         | 5.x     |                     |
| Database  | PostgreSQL     | 15      |                     |
| Cache     | Redis          | 7       |                     |
| Testing   | Vitest         | 1.x     |                     |
| CI        | GitHub Actions |         |                     |
| Hosting   | AWS ECS + RDS  |         |                     |

---

## Codebase Map

`src/
  api/          - Express route handlers (one file per resource)
  services/     - Business logic (pure, no HTTP or DB direct)
  repositories/ - All DB access (Prisma queries)
  middleware/   - Auth, error handling, logging
  jobs/         - Bull queue workers
  types/        - Shared TypeScript types
  utils/        - Pure utility functions (no side effects)
prisma/
  schema.prisma - Single source of truth for DB schema
tests/
  unit/         - Per-service tests (no DB)
  integration/  - Tests against test DB
docs/`

Do not look for business logic in route handlers — it belongs in services. Do not write raw SQL — use Prisma.

---

## Key Patterns

[List the most important conventions. Be specific and opinionated.]

**Adding a new API endpoint:**

1. Add route in src/api/[resource].ts following the existing pattern
2. Implement business logic in src/services/[resource].service.ts
3. DB access in src/repositories/[resource].repository.ts
4. Add integration test in ests/integration/[resource].test.ts

**Error handling:**

- All errors must be instances of AppError (see src/utils/errors.ts)
- Never throw plain Error objects in services
- The global error middleware in src/middleware/error.ts formats the response

**Auth:**

- All routes are authenticated by default via
  equireAuth middleware
- Public routes must explicitly use the publicRoute wrapper
- User context is always available as
  eq.user after auth middleware

**Database:**

- Never run queries outside of repository files
- Use Prisma transactions for multi-step writes: prisma.([...])
- All timestamps are stored as UTC; convert to user timezone in the frontend

---

## Key Invariants

Things that must ALWAYS be true. Do not write code that violates these:

- All API responses follow the envelope format: { data: ..., error: null } or { data: null, error: { code, message } }
- All database writes go through the repository layer
- Workers are stateless — never write to local disk
- No hardcoded secrets in code (use process.env.\* with validation in src/config.ts)
- TypeScript strict mode is enforced — no ny types

---

## What NOT to do

- Do not add new npm packages without checking if the functionality already exists in the project or a core library
- Do not bypass the repository layer with direct Prisma calls in services
- Do not add new environment variables without updating src/config.ts and .env.example
- Do not use console.log — use the logger at src/utils/logger.ts
- Do not write mutations in GET endpoints

---

## Development Workflow

`ash
npm install           # Install dependencies
npm run dev           # Start dev server (hot reload)
npm test              # Run tests
npm run lint          # ESLint + Prettier check
npm run typecheck     # tsc --noEmit
`

Before committing:
pm run lint && npm run typecheck && npm test must all pass.

---

## Gotchas

[Known traps that aren't obvious from the code.]

- The user.id in the session is always a UUID string, not a number. Comparing with === against a number will silently fail.
- Redis is used for both caching AND session storage. Flushing Redis in dev kills all sessions.
- The test database is seeded from prisma/seed.ts — if tests behave unexpectedly, try
  pm run db:reset.
- Email sending is mocked in test and dev environments via MAIL_PROVIDER=mock.

---

## Quality Checklist

Before finishing:

- [ ] One-sentence system description is specific and accurate
- [ ] Full tech stack table includes versions
- [ ] Codebase map reflects the actual directory structure
- [ ] Key patterns are written as imperative instructions
- [ ] Invariants capture things that must never be broken
- [ ] "What not to do" list covers the most common AI/new-hire mistakes
- [ ] Gotchas section covers non-obvious traps
- [ ] File is under 300 lines (dense, not exhaustive)
