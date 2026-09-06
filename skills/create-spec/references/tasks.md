# Task Decomposition Reference (`tasks.md`)

## Purpose

The **Tasks Document** (`specs/<feature-id>/tasks.md`) decomposes the technical plan into an executable, dependency-ordered task graph.

In Spec-Driven Development, an AI agent should never be asked to "build the whole feature" in a single prompt. Doing so leads to token exhaustion, hallucinated logic, and skipped error handling. Instead, the feature is broken into discrete, atomic units of work where each unit has an automated verification command.

---

## Task Decomposition Rules

1. **Strict Ordering (Bottom-Up):**
   - Phase 1: Contracts & Types (Zod schemas, TypeScript types, database migrations)
   - Phase 2: Core Domain Logic & Unit Tests (Service layer, pure business logic)
   - Phase 3: Boundary & API Integration (Route handlers, middleware, external APIs)
   - Phase 4: End-to-End Verification & Documentation Sync
2. **Every Task Must Be Binary & Testable:**
   - A task is either complete or incomplete. No vague tasks like "work on billing logic".
   - Include the exact verification command (e.g., `npm test tests/...`, `npm run typecheck`).
3. **Atomic File Scope:**
   - A single task should touch 1–3 files maximum.
   - If a task touches 6 files, split it into two sub-tasks.

---

## Tasks Template

Save to: `specs/<NNN-feature-name>/tasks.md`

```markdown
# Execution Tasks: [Feature Title]

> **Feature ID:** [NNN-feature-name]
> **Spec Reference:** [spec.md](./spec.md)
> **Plan Reference:** [plan.md](./plan.md)
> **Status:** Not Started | In Progress | Completed
> **Progress:** 0 / N tasks completed

---

## Phase 1: Data Contracts & Database Schema

- [ ] **Task 1.1: Define Data Schemas & Types**
  - **Files:** `src/types/[resource].ts`
  - **Action:** Implement `CreateResourceRequestSchema`, `ResourceResponseSchema`, and exported TypeScript types as specified in `plan.md`.
  - **Verification:** `npx tsc --noEmit`

- [ ] **Task 1.2: Database Migration**
  - **Files:** `prisma/schema.prisma` (or migration SQL)
  - **Action:** Add `[Resource]` model and generate/run migration.
  - **Verification:** `npx prisma migrate dev --name add_[resource]` (or equivalent DB check)

---

## Phase 2: Domain Services & Unit Tests (TDD)

- [ ] **Task 2.1: Write Service Unit Tests (Red)**
  - **Files:** `tests/unit/services/[resource].service.test.ts`
  - **Action:** Write tests covering happy path, validation errors, and duplicate handling. Tests should initially fail.
  - **Verification:** `npm test tests/unit/services/[resource].service.test.ts` (Expect failures)

- [ ] **Task 2.2: Implement Domain Service Logic (Green)**
  - **Files:** `src/services/[resource].service.ts`
  - **Action:** Implement service methods (`createResource`, `getResourceById`) to satisfy Task 2.1 tests.
  - **Verification:** `npm test tests/unit/services/[resource].service.test.ts` (Must pass)

---

## Phase 3: Route Handlers & Integration

- [ ] **Task 3.1: Implement Route Handlers & Validation Middleware**
  - **Files:** `src/api/routes/[resource].ts`, `src/api/app.ts`
  - **Action:** Register `POST` and `GET` routes with Zod validation middleware and mount on main app router.
  - **Verification:** `npm run typecheck`

- [ ] **Task 3.2: Integration Route Tests**
  - **Files:** `tests/integration/routes/[resource].test.ts`
  - **Action:** Add integration tests for HTTP 201, 400 (validation), 401 (unauthorized), and 409 (conflict).
  - **Verification:** `npm test tests/integration/routes/[resource].test.ts`

---

## Phase 4: Final Verification & Spec Audit

- [ ] **Task 4.1: Run Full Test Suite & Linting**
  - **Action:** Ensure zero regressions across entire project.
  - **Verification:** `npm run typecheck && npm run lint && npm test`

- [ ] **Task 4.2: Update CONTEXT.md Glossary & README if Applicable**
  - **Files:** `CONTEXT.md`, `README.md`
  - **Action:** If new domain terms were introduced, record them in the `CONTEXT.md` glossary.
  - **Verification:** Review git diff
```

---

## Quality Checklist

Before starting implementation:

- [ ] Are all tasks organized into logical, dependency-ordered phases?
- [ ] Does every task specify the exact target files?
- [ ] Does every task provide a copy-pasteable verification command?
- [ ] Is test-driven development (TDD) enforced by pairing unit tests before service implementation?
