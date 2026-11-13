# Local backend — markdown files in `.scratch/`

No network, no auth. Tickets are plain files the user and agents can read, grep, and commit.

## Layout
```
.scratch/
  <feature-slug>/
    spec.md                 # optional: the plan/spec these tickets came from
    issues/
      01-<slug>.md
      02-<slug>.md
  backlog/
    issues/                 # standalone issues not tied to a feature
      01-<slug>.md
```
- `<feature-slug>`: kebab-case, short (`sso-login`, `billing-export`).
- `NN`: two-digit, per feature, sequential. Next number = highest existing + 1 (never reuse a deleted number). For break-downs, number in dependency order so blockers come first.
- Ref format: `<feature-slug>/<NN>` (e.g. `sso-login/03`). Bare `03` is fine when only one feature is in play.
- Standalone issues ("file a bug for X") go in `backlog/` unless they clearly belong to an existing feature folder.

## Preflight
`ls .scratch` (create it on first write). Nothing else.

## File format
```markdown
# <Title>

Status: open
Labels: bug, ready-for-agent
Assignee: <name or none>
Priority: <urgent|high|medium|low or none>
Parent: <ref or none>
Blocked by: sso-login/01, sso-login/02

<body: summary, what to build / repro, acceptance criteria, etc.>

## Comments

### <YYYY-MM-DD> — <author>
<comment text>
```
- Header lines are one per line, in this order, right under the title. Omit lines whose value is `none` except `Status:`.
- `Status:` values: `open`, `in-progress`, `done`, `cancelled`.
- `## Comments` is always the last section; append new comments at the bottom. Author = git user name (`git config user.name`) or `AI agent` when the agent writes it unprompted.

## Operations

| Op | How |
|---|---|
| Create | Pick folder + next `NN`, write the file. Report the path |
| View | Read the file |
| List | Glob `.scratch/*/issues/*.md`, read the header lines, filter (default `Status: open` and `in-progress`), print a table: ref · title · status · labels |
| Search | Grep titles and bodies under `.scratch/` (case-insensitive), include `done`/`cancelled` for duplicate checks |
| Edit | Edit the specific header line or body section in place |
| Comment | Append under `## Comments` |
| Close / reopen / move | Change the `Status:` line (+ optional comment with the reason) |
| Delete | After confirmation, delete the file. Then grep `.scratch/` for its ref in `Blocked by:`/`Parent:` lines and report them (offer to clean them up). Don't renumber other files |
| Rename / retitle | Update the `# Title`; rename the file slug only if the user asks (refs use the number, so they stay valid) |

## Linking
- Blockers: edit the `Blocked by:` line (comma-separated refs).
- Parent: `Parent:` line. A feature's `spec.md` acts as the implicit parent of everything in that folder.
- "Ready to work on" = `Status: open` and every `Blocked by` ref is `done`. Compute this when the user asks "what can I pick up next?".
- PR: nothing closes local tickets automatically. Put the ticket ref in the PR body for traceability, add the PR URL as a comment on the ticket, and set `Status: done` once it merges (or when the user says so).
- Start work: `git checkout -b <feature-slug>/<NN>-<slug>`, set `Status: in-progress`.

## Committing
Don't commit ticket files automatically. If the repo config says `Committed: yes`, mention that the new/changed files are ready to commit.
