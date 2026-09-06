# Feature Specification Reference (`spec.md`)

## Purpose

The **Feature Spec** (`specs/<feature-id>/spec.md`) answers the question: **What are we building and why, without committing to code?**

In Spec-Driven Development, writing code before agreeing on the spec is considered an anti-pattern. The spec acts as an executable behavioral contract between the human and the AI agent.

---

## When to Create or Update

- **New feature or capability:** Write before any architecture or code work begins.
- **Significant refactor or redesign:** Document the intended behavioral change before modifying existing files.
- **Requirement changes:** If scope expands or assumptions change during development, update `spec.md` first. Never let the code silently outpace the specification.

---

## Naming & Directory Convention

Feature directories are placed inside `specs/` using a sequential 3-digit prefix and kebab-case descriptor:
- `specs/001-user-authentication/spec.md`
- `specs/002-stripe-webhook-handler/spec.md`
- `specs/003-rate-limiting/spec.md`

---

## Feature Spec Template

Save to: `specs/<NNN-feature-name>/spec.md`

```markdown
# Feature Spec: [Feature Title]

> **Feature ID:** [NNN-feature-name]
> **Status:** Draft | Approved | In Progress | Implemented
> **Author:** [Name / Agent]
> **Last Updated:** YYYY-MM-DD

---

## 1. Problem Statement & User Impact

### Context
[2-3 sentences explaining the current state, pain point, or opportunity.]

### Why This Matters
[What happens if we don't build this? What is the user or business impact?]

---

## 2. User Stories & Priorities

Group stories by priority. **P1 stories form the Minimum Viable Deliverable (MVD).**

### Priority 1: Core Must-Haves (P1)
- **US-1.1:** As a [role], I want to [action], so that [outcome].
- **US-1.2:** As a [role], I want to [action], so that [outcome].

### Priority 2: Secondary Enhancements (P2)
- **US-2.1:** As a [role], I want to [action], so that [outcome].

### Priority 3: Nice-to-Haves / Deferred (P3)
- **US-3.1:** As a [role], I want to [action], so that [outcome].

---

## 3. Acceptance Criteria (Given / When / Then)

Every story must map to at least one testable scenario. Avoid subjective criteria (e.g., "must be fast").

### Scenario 1: [Happy path name]
- **Given** [pre-condition or initial state]
- **When** [the user or system performs action]
- **Then** [expected observable outcome]
- **And** [secondary observable outcome]

### Scenario 2: [Validation / Error path]
- **Given** [pre-condition with invalid input or missing credentials]
- **When** [the action is attempted]
- **Then** [system returns specific error envelope or status]
- **And** [no side effects or corrupt state are persisted]

### Scenario 3: [Boundary / Edge condition]
- **Given** [system reaches a limit, e.g. token expired or rate limit threshold reached]
- **When** [another request arrives]
- **Then** [expected fallback, rejection, or retry behavior]

---

## 4. Explicit Scope Exclusions (What This Feature Does NOT Do)

Explicitly stating what is out of scope prevents AI agents from wandering into over-engineering.

- Does **NOT** include [feature or capability deferred to future spec].
- Does **NOT** modify [unrelated component or database table].
- Does **NOT** support [unsupported platform, protocol, or legacy client].

---

## 5. Non-Functional Requirements & Constraints

- **Performance:** [e.g., Latency < 150ms for 95% of requests, DB queries < 2 per transaction]
- **Security & Privacy:** [e.g., Passwords hashed with bcrypt (salt cost 12), no PII in log lines]
- **Compatibility:** [e.g., Must work with existing API clients without breaking schema]

---

## 6. Open Questions & Assumptions

| Question / Assumption | Impact | Status | Resolution |
| :--- | :--- | :--- | :--- |
| [e.g., "Should rate limit reset on rolling window or fixed hour?"] | High | Resolved | Fixed 1-hour window |
```

---

## Quality Checklist

Before moving to the **Plan** phase, verify:

- [ ] Are user stories prioritized (P1, P2, P3)?
- [ ] Is every acceptance criteria written as an observable, testable condition (Given/When/Then)?
- [ ] Are explicit out-of-scope boundaries defined?
- [ ] Are edge cases (unauthorized, invalid input, timeouts, rate limits) identified?
- [ ] Are all open questions resolved or documented with fallback assumptions?
