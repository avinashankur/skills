# ADR — Architecture Decision Record Reference

## Purpose

An ADR captures _why_ a decision was made, not just what was decided. It prevents "why did we do it this way?" archaeology months or years later. An ADR is written once (at decision time) and then mostly read, not edited. Good ADRs are opinionated, concise, and specific about trade-offs.

## When to write an ADR

Write an ADR whenever:

- You are choosing between two or more meaningfully different approaches
- The decision is hard to reverse or expensive to change later
- The team will wonder "why" when they encounter the results of this decision
- You are documenting a past decision that is causing confusion

Do NOT write an ADR for:

- Trivial implementation details
- Decisions that can be easily reversed
- Personal preference without technical consequence

## Clarifying questions to ask

1. What decision are you making (or have you already made)?
2. What problem is it solving?
3. What alternatives did you consider?
4. What constraints influenced the decision? (time, cost, team skills, existing infra, compliance)
5. What are the known downsides of the chosen approach?
6. Has this decision already been made, or is this a proposal?
7. What is the ADR numbering scheme? (e.g., ADR-001, 0001, or date-based)

## File naming convention

Typical conventions:

- docs/adr/001-use-postgresql.md (default)
- docs/adr/ADR-001-use-postgresql.md
- docs/architecture/decisions/0001-record-architecture-decisions.md
- adr/2024-01-15-choose-monorepo.md

## ADR Template

---

# [NNN]-ADR: [Short, imperative title — what was decided]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-[NNN]
**Deciders:** [names or roles — who was involved in this decision]
**Tags:** [optional: auth, database, infrastructure, frontend, ...]

---

## Context

[2–4 sentences. What is the situation? What problem are we solving? What forces are at play — technical constraints, business requirements, deadlines, team capabilities? Write this as if explaining to someone unfamiliar with the current state.]

## Decision

[1–3 sentences. What did we decide to do? Be specific and unambiguous. Use active voice: "We will use X" not "X will be used".]

## Alternatives Considered

[List every serious alternative you evaluated. For each, give a one-paragraph honest assessment. This is the most valuable part of the ADR — don't shortchange it.]

### Option A: [Name]

[Description of the approach. Pros: ... Cons: ... Why we didn't choose it: ...]

### Option B: [Name]

[Same structure.]

### Option C (chosen): [Name]

[Why this one. What tips the balance.]

## Consequences

### Positive

- [What gets better as a result of this decision]
- [What becomes easier or possible]

### Negative

- [What gets worse or harder]
- [What we are giving up]
- [Technical debt we are taking on]

### Neutral

- [Things that are just different, not better or worse]

## Follow-up Actions

- [ ] [Concrete task that must happen as a result — who, by when]
- [ ] [Another task]

## References

- [Link to RFC, design doc, StackOverflow discussion, benchmark, etc.]
- [Related ADRs: ADR-NNN, ADR-NNN]

---

## Example: Good vs. Bad ADR

### Bad ADR (too vague)

> **Decision:** We chose PostgreSQL.
> **Reason:** It's a good database.

### Good ADR (opinionated, specific)

> **Context:** We are building a SaaS platform that needs to store user accounts, subscriptions, and activity logs. The data is highly relational. The team has strong PostgreSQL experience. We evaluated MongoDB initially because one team member had used it.
>
> **Decision:** We will use PostgreSQL 15 as the primary datastore.
>
> **Alternatives Considered:**
>
> - MongoDB: Strong document flexibility, but our data model is inherently relational (user → subscriptions → invoices → line items). Joins in MongoDB require application-layer workarounds that would increase complexity significantly.
> - SQLite: Excellent for local dev, but cannot support multi-instance deployments or concurrent writes at our scale.
>
> **Consequences:**
>
> - Positive: Strong consistency, ACID transactions, familiar tooling, good managed options (RDS, Supabase, Neon).
> - Negative: Schema migrations require careful planning; no schema-less flexibility for future unstructured data needs.

## Quality Checklist

Before finishing:

- [ ] Status is set (not left blank)
- [ ] Context explains the _why behind the why_ — not just "we needed a database"
- [ ] At least 2 alternatives are documented with honest trade-off analysis
- [ ] Consequences section includes both positives AND negatives
- [ ] Decision is written in active voice and is unambiguous
- [ ] Date and deciders are filled in
- [ ] File is placed in the correct ADR directory
