---
name: git-commit
description: >
  Ultra-compressed commit message generator. Cuts noise from commit messages while preserving
  intent and reasoning. Conventional Commits format. Subject ≤50 chars, body only when "why"
  isn't obvious. Use when user says "write a commit", "commit message", "generate commit",
  "/commit", or invokes /git-commit. Auto-triggers when staging changes.
---

Write commit messages terse and exact. Conventional Commits format. No fluff. Why over what. Only generate commit messages for staged files or changes.

## Rules

**Subject line:**

- `<type>(<scope>): <imperative summary>` — `<scope>` optional
- Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `build`, `ci`, `style`, `revert`
- Imperative mood: "add", "fix", "remove" — not "added", "adds", "adding"
- ≤50 chars when possible, hard cap 72
- No trailing period
- Match project convention for capitalization after the colon

**Body (only if needed):**

- Skip entirely when subject is self-explanatory
- Add body only for: non-obvious _why_, breaking changes, migration notes, linked issues
- Wrap at 72 chars
- Bullets `-` not `*`
- Reference issues/PRs at end: `Closes #42`, `Refs #17`

**What NEVER goes in:**

- "This commit does X", "I", "we", "now", "currently" — the diff says what
- "As requested by..." — use Co-authored-by trailer
- "Generated with Claude Code" or any AI attribution — unless the user's own rule requires an `Assisted-by`/AI-attribution trailer, then add it as a trailer
- Emoji (unless project convention requires)
- Restating the file name when scope already says it

## Examples

Diff: new endpoint for user profile with body explaining the why

- ❌ "feat: add a new endpoint to get user profile information from the database"
- ✅
  ```
  feat(api): add GET /users/:id/profile

  Mobile client needs profile data without the full user payload
  to reduce LTE bandwidth on cold-launch screens.

  Closes #128
  ```

Diff: breaking API change

- ✅
  ```
  feat(api)!: rename /v1/orders to /v1/checkout

  BREAKING CHANGE: clients on /v1/orders must migrate to /v1/checkout
  before 2026-06-01. Old route returns 410 after that date.
  ```

## Auto-Clarity

Always include body for: breaking changes, security fixes, data migrations, anything reverting a prior commit. Never compress these into subject-only — future debuggers need the context.

## Workflow

1. Inspect staged changes (`git diff --cached`). If nothing is staged, notify the user.
2. Formulate the terse Conventional Commit message following the rules above.
3. Display the generated commit message and the corresponding `git commit` command.
4. When invoked directly by the user (or via `/git-commit`), prompt the user using the `ask_question` tool:
   - **Question**: `"Do you want to commit with this message?"`
   - **Options**:
     - `"(Recommended) Yes, commit with this message"`
     - `"No, do not commit"`
5. **Handle the user's choice**:
   - **Yes**: Execute `git commit -m "<subject>"` (and add `-m "<body>"` if a body is present) via `run_command`. Show `git log -1 --oneline` to confirm.
   - **No**: Stop without committing. Keep the staging area intact.
   - **Custom text / Edit** (via write-in): If the user enters an edited message, use that message or adjust and ask again.

*(Note: When called as an internal helper by another orchestrator like `git-stage`, return the message without prompting, allowing the parent skill to manage commits.)*

## Boundaries

- Commits only upon explicit user confirmation.
- Does not stage files automatically (files should already be staged, or use the `git-stage` skill).
- Does not run `git push`.
- Does not amend prior commits unless explicitly requested.
- "stop git-commit" or "normal mode": revert to verbose commit style.
