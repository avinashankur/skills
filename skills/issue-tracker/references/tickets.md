# Tickets — break a plan into vertical slices

Turn a plan, spec, PRD, existing issue, or the current conversation into a set of tickets that agents (or humans) can pick up one at a time, then publish them to the active backend.

## 1. Gather the source

- **Spec / plan file path** → read it. For local backend, if it isn't already at `.scratch/<feature>/spec.md`, ask whether to copy it there.
- **Issue ref** (`#42`, `ENG-12`, `auth/00`) → fetch it with body *and* comments. It becomes the **parent**.
- **Conversation** → summarise the agreed plan back in 3–6 bullets before slicing, so misunderstandings surface now.

If the plan has open questions that change the slicing, ask them first (max 3, batched).

## 2. Explore just enough

Skim the code the plan touches to learn the real seams: entry points, data model, existing tests, layers a feature crosses. Note any **prefactor** that would make the slices cleaner (e.g. extract a shared module) — it becomes the first ticket if worth it.

## 3. Draft slices

Each ticket is a **tracer bullet**: a thin, end-to-end path through every layer it needs (schema → API → UI → tests), producing something that can be demoed or verified on its own. Rules:

- **Vertical, not horizontal.** "User can reset password via email link" — not "Add DB columns" + "Add API" + "Add UI".
- **One agent session each.** If a ticket needs more than one sitting of focused work, split it. If it's trivial, merge it into a neighbour.
- **First slice = walking skeleton.** The narrowest happy path end-to-end; later slices widen it (validation, edge cases, error states, polish).
- **Explicit blockers.** Every ticket lists what must land first. Prefer parallelisable slices — minimise chains.
- **Wide mechanical changes** (renames, API migrations across many files): *expand* (add new alongside old) → *migrate* in batches (one ticket per batch) → *contract* (remove old).
- **AFK vs HITL.** Mark each ticket `AFK` (fully specified; an agent can do it unattended → `ready-for-agent`) or `HITL` (needs a design call, credentials, product decision, or manual QA → `ready-for-human`). Aim for mostly AFK; say why each HITL one is HITL.
- **Describe behaviour, not files.** Tickets outlive the code layout, so name interfaces, endpoints, components, and behaviours — not file paths or line numbers. Exception: a short snippet that *encodes a decision* (a type signature, an API shape).

## 4. Review with the user

Present a table, then ask for changes:

| # | Title | Type | Blocked by | Covers |
|---|---|---|---|---|
| 1 | Walking skeleton: … | AFK | — | story A |
| 2 | … | AFK | 1 | story A |
| 3 | … | HITL | 1 | story B |

Ask specifically: is the granularity right, are the dependencies right, anything to merge/split, any type wrong, anything missing from the plan? Iterate until the user approves. Don't publish before an explicit go-ahead.

## 5. Publish

Create tickets **in dependency order** (blockers first) so each ticket can reference real refs. For each:

1. **Create** via the backend with the template below and role label (`ready-for-agent` / `ready-for-human`, mapped through config), plus any labels the user asked for.
2. **Link** blockers natively (fallback: `Blocked by:` line).
3. **Parent**: if the source was an issue, attach each ticket as a sub-issue (GitHub sub-issues / Linear `parentId` / local `Parent:` line). **Never edit, relabel, or close the parent itself.**
   - If there was no parent issue and there are 4+ tickets, offer to create a lightweight parent/epic issue that links the spec and lists the children.
4. Local backend: folder `.scratch/<feature-slug>/issues/`, numbered `01…` in the order created.

Skip the duplicate check per ticket (the user just approved the set), but do one search for the feature as a whole before publishing if there's no parent issue.

## Ticket template

```markdown
## Context
Part of <parent ref / spec link>. <One or two sentences on why this slice exists.>

## What to build
<The end-to-end behaviour this slice delivers, in user/system terms.>

## Acceptance criteria
- [ ] <observable, testable outcome>
- [ ] <…>
- [ ] Tests cover the new behaviour

## Out of scope
- <what later slices handle — prevents scope creep>

## Notes
<Type: AFK | HITL (+ why). Key interfaces, decisions, constraints. Blocked by: <refs> if not natively linked.>
```

## 6. Report

A final table: ref · title · type · blocked by · link/path. Then name the tickets that are ready to start right now (no open blockers).
