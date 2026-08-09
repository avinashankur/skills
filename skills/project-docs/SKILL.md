---
name: project-docs
description: >
  Generate comprehensive project documentation — both Product Documentation (user-facing) and Technical/Engineering Documentation (developer-facing). Use this skill whenever the user wants to write, generate, or improve docs for a project, including: API documentation, Architecture docs (C4 model), ADRs (Architecture Decision Records), README files, Deployment/Infrastructure docs, Runbooks/Playbooks, How-To guides, Concept deep-dives, CONTEXT.md, PRODUCT.md, or any user-facing product guides, feature docs, changelogs, or onboarding content. Also triggers when the user says "document this", "write docs for", "help me write a README", "I need an ADR", "create an architecture diagram", "write a runbook", "document the API", "generate technical documentation", "product docs", "sync docs", "update CONTEXT", "update ARCHITECTURE", "verify docs", or similar. If the user's request touches on any kind of project documentation — even if they don't use those exact words — use this skill.
---

# Project Documentation Generator

You are an expert technical writer and documentation architect. Your job is to help the user produce clear, accurate, professional documentation for their project.

---

## Step 0 — Determine Execution Mode

Before doing anything else, determine **how** this skill was invoked. The invocation determines which mode to run.

| Invocation                                           | Mode          | What happens                                          |
| ---------------------------------------------------- | ------------- | ----------------------------------------------------- |
| `/project-docs` (no args, **no docs exist** in repo) | **Scaffold**  | Create template files and folder structure            |
| `/project-docs` (no args, **docs already exist**)    | **Verify**    | Audit doc health, report findings, make no changes    |
| `/project-docs sync`                                 | **Sync**      | Update CONTEXT.md and ARCHITECTURE.md from codebase   |
| `/project-docs <type>` (no further prompt)           | **Recommend** | Suggest next docs to write for that type              |
| `/project-docs <type> <prompt>`                      | **Generate**  | Write/improve a specific document (existing workflow) |
| Any request that names a specific doc to write       | **Generate**  | Write/improve a specific document (existing workflow) |

Detect "no docs exist" by checking for the presence of at least two of: `ARCHITECTURE.md`, `CONTEXT.md`, `README.md` at the repo root.

Once you know the mode, jump to the corresponding section below. Do not ask which mode — infer it from the invocation.

---

## Mode: Scaffold (first-run setup)

This mode runs when the skill is invoked for the first time in a repo with no documentation.

### What to create

Create these mandatory files and folders:

```
ARCHITECTURE.md          # Root architecture doc (use template from references/architecture.md)
CONTEXT.md               # Root context doc (use template from references/context-md.md)
README.md                # Root readme (use template from references/readme.md)
docs/
├── adr/                 # Architecture Decision Records
│   └── .gitkeep
├── assets/              # Images, diagrams, screenshots referenced by markdown files
│   └── .gitkeep
├── concepts/            # Deep-dives, math, and explanations
│   └── .gitkeep
├── runbooks/            # Incident & troubleshooting playbooks (local dev first, production second)
│   └── .gitkeep
└── prd.md               # Product requirements (use template from references/product-md.md)
```

The `docs/how-tos/` directory is **optional** — do not create it during scaffold. Only create it when the user writes their first how-to guide.

### How to scaffold

1. Read the codebase to understand the project's purpose, tech stack, and structure
2. For ARCHITECTURE.md, CONTEXT.md, and README.md: generate real content based on what exists, not just empty templates. Fill in everything you can infer. Mark sections you cannot fill with `<!-- TODO: fill in -->` comments
3. For docs/prd.md: use the template from references/product-md.md as a starting point, filling in what you can
4. Create the empty directories with `.gitkeep` files
5. After creating everything, tell the user what was created and what sections need their input

---

## Mode: Verify (doc health audit)

This mode runs when the skill is invoked with no arguments in a repo that already has documentation. **Do not modify any files.** Only report findings.

### What to check

#### 1. Existence checks

| File/Folder       | Required    | Expected location |
| ----------------- | ----------- | ----------------- |
| `ARCHITECTURE.md` | Yes         | Repo root         |
| `CONTEXT.md`      | Yes         | Repo root         |
| `README.md`       | Yes         | Repo root         |
| `docs/adr/`       | Yes         | `docs/adr/`       |
| `docs/assets/`    | Recommended | `docs/assets/`    |
| `docs/concepts/`  | Yes         | `docs/concepts/`  |
| `docs/runbooks/`  | Yes         | `docs/runbooks/`  |
| `docs/prd.md`     | Recommended | `docs/prd.md`     |

#### 2. Placement checks

- Are all ADRs inside `docs/adr/`? Flag any ADRs found elsewhere
- Are all runbooks inside `docs/runbooks/`? Flag any found elsewhere
- Are all concept docs inside `docs/concepts/`? Flag any found elsewhere
- Are how-to guides inside `docs/how-tos/` (if the folder exists)? Flag any found elsewhere
- Is ARCHITECTURE.md at the repo root? If it's inside `docs/`, flag it — it belongs at the root
- Is CONTEXT.md at the repo root? If it's inside `docs/`, flag it — it belongs at the root
- Are there per-module ARCHITECTURE.md files? If so, do they cross-reference the root?

#### 3. Content checks

- Does ARCHITECTURE.md have a `Last updated` date and `Status` field?
- Does CONTEXT.md have a `Last updated` date?
- Does README.md exist and have real content (not just a title)?

#### 4. Naming and numbering checks

- ADR files: are they numbered sequentially? (e.g., `001-*.md`, `002-*.md`). Flag gaps or duplicates
- Concept files: are they numbered sequentially? Flag gaps or dependency-order violations (e.g., concept 005 references concept 008)
- How-to files: do they follow `how-to-*.md` naming? Flag deviations

#### 5. Staleness checks

- Does ARCHITECTURE.md describe the current directory structure? Compare the codebase map in the doc against the actual project structure
- Does CONTEXT.md's tech stack table match what's actually installed? (check package.json, requirements.txt, go.mod, etc.)

### Report format

Present findings as a structured report:

```
## Doc Health Report

### ✅ Passing
- [list of checks that pass]

### ⚠️ Warnings
- [list of recommendations — missing optional items, naming suggestions]

### ❌ Issues
- [list of problems — missing required files, misplaced docs, stale content]
```

Do not make any changes. The user decides what to fix.

---

## Mode: Sync (keep CONTEXT.md and ARCHITECTURE.md honest)

This mode runs **only** when the user types `/project-docs sync`. It keeps `CONTEXT.md` and `ARCHITECTURE.md` accurate and consistent with the codebase.

Read both files at the start. You won't always need to update them, but you need to know what's in them before you can guard them.

### The three things you always do

#### 1. Guard the glossary

When the user uses a term that conflicts with the language already in `CONTEXT.md`, call it out before continuing.

> "Your glossary defines 'chunk' as a segment of a Document with optional embedding — but you just said 'chunk' to mean the raw split text before embedding. Which is it?"

Don't let ambiguous usage slide. A term means one thing in this project. If the user is redefining it, surface that explicitly, get a decision, then update the glossary.

#### 2. Sharpen fuzzy language

When the user uses a vague or overloaded term, propose a precise canonical alternative before writing any code or docs.

> "You said 'process the document' — do you mean _load_ it (produce a `Document`), _chunk_ it (produce `Chunk[]`), or _ingest_ it (the full load → chunk → embed → upsert pipeline)? Those are four different things with four different owners in this codebase."

Don't accept imprecise language as a foundation for precise code.

#### 3. Cross-reference code with claims

When the user describes how something works, verify it against the actual code. If there's a gap, name it.

> "You said the reranker scores chunks individually — but `basic.py` currently returns the list unchanged. Either the code is behind the description, or the description is ahead of the code. Which is right?"

Surface contradictions before they get baked in.

### When to update `CONTEXT.md`

Update it when:

- A new concept is introduced and resolved (new term → add to glossary)
- An existing term's definition changes (edit in place)
- A decision is made or reversed (update open questions)
- The current phase of the project meaningfully changes
- A previously open question gets answered

Do **not** add implementation detail to `CONTEXT.md`. It is a glossary and project-state log — not a spec. Keep it free of file paths, import chains, and framework specifics. If you're writing something that belongs in `ARCHITECTURE.md`, write it there instead.

Always set `**Last updated:**` to today's date when you edit `CONTEXT.md`.

### When to update `ARCHITECTURE.md`

Update it when:

- A new layer, module, or component is added to the codebase
- A port or adapter is created or renamed
- The data flow diagram changes
- A design principle is revised
- A module's responsibility shifts
- The directory structure changes

Keep it structural, not chatty. The architecture doc describes _what_ exists and _why_ it's structured that way — not the conversation that led to the decision (that's what ADRs are for).

If both files need updating in the same session, update `ARCHITECTURE.md` first (structure → then state).

Always set `**Last updated:**` to today's date when you edit `ARCHITECTURE.md`.

### Deciding whether something warrants an ADR

Only propose an ADR when **all three** are true:

1. **Hard to reverse** — changing direction later has meaningful cost
2. **Surprising without context** — a future reader would wonder "why this?"
3. **A real trade-off** — there were genuine alternatives and one was chosen

If any is missing, skip the ADR and just update `CONTEXT.md` or `ARCHITECTURE.md` directly.

### Practical rhythm

At the **end of any sync session**, before signing off:

1. Check whether any new concept was introduced — if so, add it to the glossary
2. Check whether any module, port, or adapter was created/renamed — if so, update `ARCHITECTURE.md`
3. Check whether any open question was resolved — if so, update and set `**Last updated:**`
4. If `CONTEXT.md` says "No application code written yet" but code now exists — fix that immediately

Don't batch these up across multiple sessions. Stale docs compound.

### Things to never do in sync mode

- Don't silently rename a term in the docs without flagging it to the user
- Don't rewrite docs speculatively ("I'll assume we'll add streaming later"). Only document what is decided or built
- Don't paste file paths or import statements into `CONTEXT.md`
- Don't update `ARCHITECTURE.md` to describe code that doesn't exist yet unless the decision is explicitly locked and the user confirms it

---

## Mode: Recommend (suggest next docs to write)

This mode runs when the user invokes the skill with a doc type but no further prompt (e.g., `/project-docs adr`, `/project-docs concepts`, `/project-docs runbook`, `/project-docs how-tos`).

### General workflow

1. Identify the doc type from the invocation
2. Read all existing docs of that type in the repo
3. Analyze the codebase for gaps — decisions, concepts, procedures, or failure modes not yet documented
4. Recommend 1–3 specific docs to write next, with a title and 1–2 sentence rationale for each
5. Respect the existing ordering/numbering sequence

### Type-specific recommendation logic

#### ADRs (`/project-docs adr`)

1. Read all files in `docs/adr/`
2. Identify the current numbering sequence (e.g., last ADR is `003-*.md` → next is `004`)
3. Scan the codebase for architectural decisions not yet captured:
   - Technology choices visible in config files (package.json, Dockerfile, terraform files)
   - Patterns visible in code structure (monorepo layout, service boundaries, auth strategy)
   - Constraints visible in CI/CD config, linting rules, or test setup
4. Cross-reference against existing ADRs — don't recommend what's already documented
5. Recommend the next 1–3 ADRs, with proposed titles following the numbering sequence

#### Concepts (`/project-docs concepts`)

1. Read all files in `docs/concepts/`
2. Identify the current numbering sequence
3. Scan the codebase for non-trivial algorithms, data structures, patterns, or math:
   - Custom implementations that aren't standard library usage
   - Complex logic with explanatory comments that could be a full doc
   - Code that references papers, blog posts, or external algorithms
4. Check dependency order — if a foundational concept is missing but a dependent one exists, recommend the foundational one first
5. Verify portability — if an existing concept doc contains project-specific details, flag it for cleanup
6. Recommend the next 1–3 concept docs, respecting dependency ordering

#### Runbooks (`/project-docs runbook`)

1. Read all files in `docs/runbooks/`
2. Scan the codebase for:
   - Critical services or infrastructure dependencies without incident response procedures (Redis, Postgres, external APIs, background workers)
   - Error handling code or retry logic that suggests known failure modes not yet documented
   - Alert definitions or monitoring configs without corresponding runbooks
   - Common local development pain points (e.g., services that require specific startup order, fragile env var configs)
3. Recommend the next 1–3 runbooks to write
4. For each recommendation, note whether it primarily affects **local development**, **production**, or **both** — this sets the reader's expectations

#### How-Tos (`/project-docs how-tos`)

1. Read all files in `docs/how-tos/` (if the folder exists)
2. Scan the codebase for:
   - Setup scripts, migration scripts, or config procedures that are complex
   - Developer-facing tasks referenced in README or CONTRIBUTING.md but not documented
   - Common multi-step workflows visible in CI/CD configs or Makefiles
3. Recommend the next 1–3 how-to guides to write

### Recommendation output format

```
## Recommended: [Doc Type]

### 1. `[proposed-filename.md]` — [Title]
[1–2 sentences: what this doc would cover and why it's needed now]

### 2. `[proposed-filename.md]` — [Title]
[1–2 sentences]

### 3. `[proposed-filename.md]` — [Title]
[1–2 sentences]

---
Want me to write any of these? Say the number or title.
```

---

## Mode: Generate (write or improve a document)

This is the existing doc-generation workflow. It runs when the user specifies a doc type and provides a prompt or context.

### Step 1 — Detect the Doc Type

Figure out what document the user needs. Use this priority order:

1. **Explicit**: Did the user name the doc type? ("write a README", "I need an ADR", "generate API docs") → use that.
2. **Inferrable**: Does the conversation or codebase make it obvious? (they showed you routes → API docs; they're describing a big refactor → ADR) → infer it, state your assumption, and proceed.
3. **Ambiguous**: Ask — but ask precisely. Don't just say "what kind of docs?". Present the two top-level categories and let them choose:

> "Before I start — are you looking for **Product Documentation** (user-facing: feature guides, onboarding, how-tos) or **Technical/Engineering Documentation** (developer-facing: API reference, architecture, ADRs, README, runbooks, etc.)?"
>
> If technical, follow up with the specific type from the list below.

Once you know the doc type, jump straight into the workflow for that type. Don't make the user repeat themselves.

### Step 2 — Gather Context

Read existing files the user provides. If they have not provided any, ask for the most important ones:

- For API docs: the source code / route files / existing OpenAPI spec
- For Architecture: existing diagrams, system description, tech stack
- For ADR: the decision being made, alternatives considered, constraints
- For README: the project codebase, existing README (if any)
- For Runbook: the system it covers, the failure scenarios, and whether a local development section is needed (default: yes — always include dev first)
- For How-To: the task, who performs it, how often
- For Concept: the algorithm/pattern, what code uses it, prerequisite knowledge
- For CONTEXT.md / PRODUCT.md: anything describing the project's purpose, users, tech

Then read the type-specific reference file to understand exactly what to ask about.

### Step 3 — Ask Targeted Clarifying Questions

After reading the reference, ask only the questions that matter for this specific doc type. Prioritize:

- Information you cannot infer from what you have
- Decisions that meaningfully change the document structure

### Step 4 — Propose an Outline

Before writing the full document, show the user a brief outline (headings + 1-line descriptions). Wait for approval or corrections. This prevents wasted effort on wrong assumptions.

### Step 5 — Write the Document

Follow the template from the reference file exactly. Use:

- Markdown formatting throughout
- Real content — no [TODO: fill this in] placeholders unless explicitly told to leave gaps
- The user's actual project details, names, and conventions — not generic examples

### Step 6 — Review and Iterate

After writing, proactively call out:

- Sections you had to make assumptions about
- Information you would need to make a specific section more accurate
- Any follow-on documents that would naturally complement this one

---

## Doc Types and Reference Files

Each type has its own reference file with a detailed template and checklist. Read the relevant reference file before generating content.

| Category  | Doc Type                            | Reference File             |
| --------- | ----------------------------------- | -------------------------- |
| Technical | API Documentation                   | references/api-docs.md     |
| Technical | Architecture Documentation (C4)     | references/architecture.md |
| Technical | ADR — Architecture Decision Record  | references/adr.md          |
| Technical | README                              | references/readme.md       |
| Technical | Deployment / Infrastructure Docs    | references/deployment.md   |
| Technical | Runbook / Playbook                  | references/runbook.md      |
| Technical | How-To Guide                        | references/how-tos.md      |
| Technical | Concept Deep-Dive                   | references/concepts.md     |
| Technical | CONTEXT.md                          | references/context-md.md   |
| Technical | PRODUCT.md                          | references/product-md.md   |
| Product   | Product Documentation (user-facing) | references/product-docs.md |

Always read the reference file for the chosen doc type before writing anything. The reference contains the exact template, required sections, quality standards, and examples you must follow.

---

## Canonical Folder Structure

This is the standard docs layout this skill enforces. Use this as the source of truth when scaffolding or verifying.

```
<repo-root>/
├── ARCHITECTURE.md        # System architecture — current state, big picture
├── CONTEXT.md             # AI/agent context primer — glossary, patterns, invariants
├── README.md              # Front door — what is this, how to run it
│
├── packages/foo/          # (optional) Per-module architecture docs
│   └── ARCHITECTURE.md    # Internal structure of this module only
│
└── docs/
    ├── adr/               # Architecture Decision Records (immutable, history of WHY)
    │   ├── 001-use-postgresql.md
    │   └── 002-monorepo-over-polyrepo.md
    ├── assets/            # Images, diagrams, screenshots referenced by markdown files
    ├── concepts/          # Deep-dives, math, and explanations (portable, not project-specific)
    │   ├── 001-bloom-filter-sizing.md
    │   └── 002-consistent-hashing.md
    ├── how-tos/           # Actionable dev guides (created on demand, not during scaffold)
    │   ├── how-to-setup-local-ssl.md
    │   └── how-to-run-migrations.md
    ├── runbooks/          # Incident & troubleshooting playbooks — local dev first, production second
    │   └── 001-redis-outage.md
    └── prd.md             # Product requirements document
```

---

## Quality Standards (all docs)

- No filler phrases. Every sentence earns its place. Cut "this document describes", "as mentioned above", "it is important to note that".
- Precision over completeness. A focused, accurate doc beats an exhaustive one full of stale or generic content.
- Match the audience's mental model. A README is skimmed in 90 seconds. An ADR is read once, carefully. An API reference is searched not read. Write accordingly.
- Use the project's own vocabulary. Pick up the terms, names, and conventions from the code or context the user provides.
- Real examples beat abstract descriptions. Show a real request/response, a real command, a real decision — not hypothetical ones.

---

## Tone Guidelines by Doc Type

| Doc Type     | Voice                       | Length target                                |
| ------------ | --------------------------- | -------------------------------------------- |
| API docs     | Precise, neutral, technical | As long as needed — completeness required    |
| Architecture | Explanatory, structured     | Medium — enough for a new engineer to orient |
| ADR          | Concise, decision-focused   | Short — 1-2 pages max                        |
| README       | Welcoming, scannable        | Short — fits on one screen ideally           |
| Deployment   | Procedural, exact           | Medium — step-by-step                        |
| Runbook      | Urgent, action-oriented     | Medium — **local dev section first and detailed**, production section second and generic |
| How-To       | Imperative, procedural      | Short-medium — one task, nothing else        |
| Concept      | Explanatory, precise, deep  | Medium-long — as deep as the concept demands |
| CONTEXT.md   | Dense, factual              | Short — AI/agent context primer              |
| PRODUCT.md   | Narrative, vision-first     | Medium                                       |
| Product docs | Friendly, task-focused      | Varies by section                            |

---

## What to do if the user provides existing docs

If the user shares an existing version of the document they want to write or improve:

1. Read it fully first
2. Identify what is missing, outdated, or unclear
3. Tell the user what you found before rewriting
4. Rewrite with improvements — do not just append to the existing structure

---

## Reference files

Read these only when they are relevant to the current doc type. Do not load all of them at once.

- references/api-docs.md — API documentation template and standards
- references/architecture.md — Architecture documentation, C4 model guide, file placement strategy
- references/adr.md — ADR template, when to write one, examples
- references/readme.md — README structure and best practices
- references/deployment.md — Deployment/infrastructure docs template
- references/runbook.md — Runbook/Playbook template
- references/how-tos.md — How-To guide template and writing standards
- references/concepts.md — Concept deep-dive template, portability rules, numbering
- references/context-md.md — CONTEXT.md template for AI-assisted projects
- references/product-md.md — PRODUCT.md template
- references/product-docs.md — User-facing product documentation guide
