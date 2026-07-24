---
name: sync-docs
description: >
  Keep CONTEXT.md and ARCHITECTURE.md accurate and consistent as the codebase
  evolves. Use this skill whenever the user builds, changes, or discusses any
  part of the project — adding a new module, wiring up a dependency, changing a
  design decision, naming a concept, or asking "how should X work?". Also
  triggers on: "update the docs", "update CONTEXT", "update ARCHITECTURE",
  "the docs are stale", "let's keep docs in sync", or any session where code
  is written and documentation hasn't been mentioned yet.
---

# Sync Docs

Your job in every session is to keep `CONTEXT.md` and `ARCHITECTURE.md` honest.
Neither file should drift from what the code actually does. You are the one who
notices when they diverge and does something about it.

Read both files at the start of any session that involves code changes. You
won't always need to update them, but you need to know what's in them before
you can guard them.

---

## The three things you always do

### 1. Guard the glossary

When the user uses a term that conflicts with the language already in
`CONTEXT.md`, call it out before continuing.

> "Your glossary defines 'chunk' as a segment of a Document with optional
> embedding — but you just said 'chunk' to mean the raw split text before
> embedding. Which is it?"

Don't let ambiguous usage slide. A term means one thing in this project. If the
user is redefining it, surface that explicitly, get a decision, then update the
glossary.

### 2. Sharpen fuzzy language

When the user uses a vague or overloaded term, propose a precise canonical
alternative before writing any code or docs.

> "You said 'process the document' — do you mean *load* it (produce a
> `Document`), *chunk* it (produce `Chunk[]`), or *ingest* it (the full
> load → chunk → embed → upsert pipeline)? Those are four different things
> with four different owners in this codebase."

Don't accept imprecise language as a foundation for precise code.

### 3. Cross-reference code with claims

When the user describes how something works, verify it against the actual code.
If there's a gap, name it.

> "You said the reranker scores chunks individually — but `basic.py` currently
> returns the list unchanged. Either the code is behind the description, or the
> description is ahead of the code. Which is right?"

Surface contradictions before they get baked in.

---

## When to update `CONTEXT.md`

Update it when:

- A new concept is introduced and resolved (new term → add to glossary)
- An existing term's definition changes (edit in place)
- A decision is made or reversed (update §2 / open questions)
- The current phase of the project meaningfully changes
- A previously open question gets answered

Do **not** add implementation detail to `CONTEXT.md`. It is a glossary and
project-state log — not a spec. Keep it free of file paths, import chains, and
framework specifics. If you're writing something that belongs in
`ARCHITECTURE.md`, write it there instead.

Always set `**Last updated:**` to today's date when you edit `CONTEXT.md`.

---

## When to update `ARCHITECTURE.md`

Update it when:

- A new layer, module, or component is added to the codebase
- A port or adapter is created or renamed
- The data flow diagram changes
- A design principle is revised
- A module's responsibility shifts
- The directory structure changes (§6)

Keep it structural, not chatty. The architecture doc describes *what* exists and
*why* it's structured that way — not the conversation that led to the decision
(that's what ADRs are for).

If both files need updating in the same session, update `ARCHITECTURE.md` first
(structure → then state).

---

## Deciding whether something warrants an ADR

Only propose an ADR when **all three** are true:

1. **Hard to reverse** — changing direction later has meaningful cost
2. **Surprising without context** — a future reader would wonder "why this?"
3. **A real trade-off** — there were genuine alternatives and one was chosen

If any is missing, skip the ADR and just update `CONTEXT.md` or
`ARCHITECTURE.md` directly.

---

## Practical rhythm

At the **end of any session that involved code changes**, before signing off:

1. Check whether any new concept was introduced — if so, add it to the glossary
2. Check whether any module, port, or adapter was created/renamed — if so,
   update `ARCHITECTURE.md`
3. Check whether any decision from §3 (open questions) was resolved — if so,
   move it to §2 and update `**Last updated:**`
4. If `CONTEXT.md` says "No application code written yet" but code now exists —
   fix that immediately

Don't batch these up across multiple sessions. Stale docs compound.

---

## Things to never do

- Don't silently rename a term in the docs without flagging it to the user.
- Don't rewrite docs speculatively ("I'll assume we'll add streaming later").
  Only document what is decided or built.
- Don't paste file paths or import statements into `CONTEXT.md`.
- Don't update `ARCHITECTURE.md` to describe code that doesn't exist yet unless
  the decision is explicitly locked and the user confirms it.
