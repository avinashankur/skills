# Project Constitution Reference

## Purpose

The **Constitution** (`specs/constitution.md`) establishes the permanent, non-negotiable rules of engagement for a project. It serves as the foundational steering document for AI agents and developers alike.

While feature specs (`spec.md`) define *what* a specific feature should do, the constitution defines *how any code must be written* across the entire repository. Every subsequent plan, task, and code change must comply with this document.

---

## When to Create or Update

- **First-time project setup:** Initialize before writing the first feature specification.
- **Architectural shifts:** Update when the team agrees on a new project-wide standard (e.g., migrating from REST to tRPC, adopting a new testing framework).
- **Recurring AI mistakes:** If an AI coding assistant repeatedly violates an unspoken convention (e.g., creating circular dependencies, using `any`), codify that rule in the constitution.

---

## Constitution Template

Save to: `specs/constitution.md`

```markdown
# Project Constitution

> Single source of truth for architectural standards, invariants, and coding conventions.
> Last updated: YYYY-MM-DD

---

## 1. Core Engineering Principles

- **Simplicity over cleverness:** Favor explicit, readable code over abstractions. No premature optimization.
- **Locality of behavior:** Related logic should stay close together. Avoid scattering single-purpose logic across multiple layers.
- **Fail fast and loud:** Validate inputs at system boundaries. Throw descriptive errors rather than silently swallowing exceptions.

---

## 2. Tech Stack & Invariants

| Layer | Standard | Strict Invariants |
| :--- | :--- | :--- |
| **Language** | TypeScript (Strict Mode) | No `any` types. No `as unknown as T` casts without explanatory comments. |
| **Runtime** | Node.js (LTS) | ESM modules only (`import/export`). No CommonJS `require()`. |
| **Data Validation** | Zod | All external inputs (HTTP bodies, query params, env vars) MUST validate against a Zod schema before consumption. |
| **Database** | PostgreSQL + Prisma / Kysely | No raw string-concatenated SQL queries. All writes must run within transactions when touching multiple tables. |
| **Testing** | Vitest / Jest | External behavior is tested, not private implementation details. Unit tests run in under 30 seconds. |

---

## 3. Architectural Boundaries & Seams

- **Separation of Concerns:**
  - Route handlers: HTTP concerns only (parsing, schema validation, status codes). Never write database queries in route handlers.
  - Domain Services: Pure business logic. Independent of HTTP request/response objects.
  - Data Access Layer: Encapsulates all database interactions.
- **State Management:** Background workers and API handlers must be stateless. Never persist state to local disk or in-memory globals.
- **Secrets & Config:** Zero hardcoded secrets. All environment variables must be declared in a centralized config validator (e.g., `src/config.ts`).

---

## 4. Testing Standards & Quality Gates

- **Test-Driven Delivery:** When implementing tasks, write the failing test before writing the feature logic.
- **Seam Selection:** Prefer testing at the highest stable boundary (integration over unit tests where feasible, but keep tests fast).
- **Determinism:** Tests must not depend on external live networks or clock-sensitive races. Always mock time and third-party APIs.
- **Required Passing Gate:** Before committing or completing a task:
  ```bash
  npm run typecheck && npm run lint && npm test
  ```

---

## 5. Explicit Anti-Patterns ("What NOT to Do")

- **DO NOT** install new dependencies without checking if existing utilities or standard library modules solve the problem.
- **DO NOT** invent new API error formats. All error responses must adhere to the project's standard error envelope:
  `{ "error": { "code": string, "message": string, "details"?: unknown } }`
- **DO NOT** use `console.log` in production code. Use the centralized structured logger (`logger.info`, `logger.error`).
- **DO NOT** leave dangling promises or unhandled rejections.

---

## 6. Review & Evolution

- Any rule in this constitution can be amended through a proposed ADR or explicit developer consensus.
- When an AI agent encounters a design conflict between a feature requirement and this constitution, **the constitution takes precedence** until the developer explicitly updates it.
```

---

## Quality Checklist

Before finalizing `specs/constitution.md`:

- [ ] Does it capture concrete, verifiable rules (not just generic platitudes like "write good code")?
- [ ] Are input validation and data typing invariants explicitly stated?
- [ ] Is the verification gate command (e.g. `npm test && npm run typecheck`) accurate and runnable?
- [ ] Does the "What NOT to Do" list address the top 3-5 mistakes an AI agent would typically make in this codebase?
