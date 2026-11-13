---
name: issue-tracker
description: Manage issues/tickets in whichever tracker the current repo uses — GitHub Issues (gh CLI), Linear (MCP or GraphQL API), or local markdown files under .scratch/ — and break plans, specs, or conversations into vertical-slice tickets. Use this skill whenever the user wants to file a bug, create a task/issue/ticket, view or list issues, search for an issue, edit title/body/labels/assignees/status/priority, comment, close, reopen, delete, link blockers or parent/sub-issues, link an issue to a PR, or "break this into tickets / turn this plan into issues / create tickets from the spec". Triggers on natural language ("file a bug for the login crash", "what's open", "close #42", "move ENG-12 to in progress", "assign this to me", "split this PRD into tickets") and slash-style commands (/issue create|list|search|view|edit|comment|close|reopen|delete|link|tickets|setup). Also use it when filing an issue about a bug found in the current session (it pulls in file/line context). Always use this skill instead of running raw `gh issue`, Linear API calls, or hand-editing .scratch issue files, so backend selection, duplicate checks, confirmation rules, and formatting stay consistent.
---

# Issue Tracker

One interface over three backends. The workflows below are backend-agnostic; the exact commands live in the backend reference:

| Backend | Reference | Tooling |
|---|---|---|
| `github` | [references/github.md](references/github.md) | `gh` CLI + `gh api` |
| `linear` | [references/linear.md](references/linear.md) | Linear MCP tools, else GraphQL via `curl` + `LINEAR_API_KEY` |
| `local` | [references/local.md](references/local.md) | Markdown files in `.scratch/<feature>/issues/` |

Load **only** the reference for the backend in use (plus [references/tickets.md](references/tickets.md) for the break-down workflow).

## Step 0 — Resolve the backend

Do this before every operation, in order:

1. **Explicit override in the request** — "in Linear, create…", "add a local ticket…", "on GitHub…". Use it for this operation only; don't rewrite config.
2. **Repo config** — read `docs/agents/issue-tracker.md`. Its `Backend:` line decides. (CLAUDE.md / AGENTS.md may point to it under `## Agent skills`.)
3. **No config** — run the **Setup** workflow ([references/setup.md](references/setup.md)): auto-detect, confirm with the user in one question, write the config, then continue the original request. Don't make the user re-ask.

Then run the backend's preflight check (auth / repo / team / directory) from its reference. If it fails, tell the user the one fix to apply and stop.

## Issue references

Accept whatever the user says and normalise it:
- GitHub: `#42`, `42`, an issue URL.
- Linear: `ENG-123`, a Linear URL.
- Local: `auth/03`, `03` (when the feature is unambiguous), or the file path.
- "this issue" / "that one" → the issue most recently created or discussed in this session. If none, ask.
- "me" as an assignee → the authenticated user (see backend reference).

## Canonical model

Map every backend onto these fields so workflows read the same everywhere:

| Field | Notes |
|---|---|
| title | Short, imperative or symptom-first ("Login fails with SSO users") |
| body | Markdown |
| status | `open` · `in-progress` · `done` · `cancelled` — mapped to the backend's states in config |
| labels | Free-form, plus the role labels below |
| assignees | Optional |
| priority | Optional; `urgent` · `high` · `medium` · `low` (Linear native; GitHub/local use a label or line) |
| blocked_by | Other issue refs |
| parent | Optional parent/epic ref |

**Role labels** (strings are mapped per repo in config; defaults shown): `bug`, `enhancement`, `needs-triage`, `needs-info`, `ready-for-agent` (fully specified, an agent can pick it up unattended), `ready-for-human` (needs a human decision or access).

## Workflows

### Create

1. **Duplicate check.** Pull 3–5 key terms and search open *and* closed issues (backend "search"). If something plausibly matches, show ref · title · state and ask: create anyway, comment on the existing one, or reopen it. Skip only if the user said "don't check" or the text is too generic to search.
2. **Draft.** Turn rough descriptions into a concise title and a structured body:
   - Bug: Summary · Steps to reproduce · Expected vs actual · Context/environment.
   - Task/feature: Summary · What to build · Acceptance criteria (checklist) · Out of scope.
   If you inferred significant content, show the draft before creating; otherwise just create it.
3. **Code context (only when real).** If the issue is about code touched in this session, add the file path + line range and a ≤10-line snippet, plus last-commit info if useful:
   ```bash
   git blame -L <start>,<end> -- <file>
   git log -1 --format="%h %an %ad" -- <file>
   ```
   Never invent a location; search (`rg`) or ask if unsure.
4. **Create** with only the metadata the user gave or that's obvious (labels, assignee, priority, parent, status). Apply config defaults (e.g. default Linear team/project).
5. **Report** ref + link (or file path for local) in one line.

### View
Show title, status, labels, assignee, priority, blockers, parent, a trimmed body, and the latest few comments. Summarise; don't dump JSON.

### List / Search
- Default to open issues, newest first, limit ~20. Honour filters: status, label, assignee ("mine"), priority, parent/feature, text.
- Output a compact table: ref · title · status · labels · assignee. Mention if results were truncated.

### Edit
Change only the fields asked for: title, body (rewrite or append a section), labels add/remove, assignees add/remove, priority, parent, status. To change body text, fetch the current body first and edit it — never blindly overwrite. Prefer a **comment** when the user is adding information rather than correcting the description.

### Comment
Add a comment. Comments written autonomously by the agent (not dictated by the user) start with `> *Posted by an AI agent.*` so humans can tell them apart.

### Status changes (close / reopen / start / move)
- Close: run directly, no confirmation. Use the backend's "completed" vs "not planned/cancelled" distinction based on intent; add the user's reason as a comment if given.
- Reopen / move to in-progress / any named state: run directly.

### Delete
**Always confirm.** Show ref + title, say what deletion means on this backend (GitHub: permanent, admin-only; Linear: moved to trash, recoverable ~30 days; local: file removed — recoverable from git only if committed), and offer the softer alternative (close as not planned / archive). Proceed only on an explicit yes, even if the request sounded certain. For local, also report other issues whose `Blocked by` referenced it.

### Link
Only when asked.
- **Blockers:** "X is blocked by Y" → native dependency where supported, else a `Blocked by:` line in X's body.
- **Parent / sub-issue:** native where supported, else a `Parent:` line.
- **PR:** "close this when PR #n merges" → add `Closes #<issue>` (GitHub) or the Linear identifier (Linear auto-links by `ENG-123` in branch/PR title/body) to the PR body. "What does this PR fix?" → read the PR body/branch name and report referenced issues.
- **Branch:** "start work on #42" → create a branch named from the issue (GitHub: `gh issue develop`; Linear: its `branchName` field; local: `<feature>/<NN>-<slug>`), and move the issue to in-progress.

### Tickets — break a plan into issues
When the user wants a plan, spec, PRD, issue, or the conversation turned into a set of tickets, follow [references/tickets.md](references/tickets.md). It drafts tracer-bullet vertical slices, gets the user's approval, then publishes them via **Create** + **Link** on the active backend.

### Setup
"set up the issue tracker", "switch this repo to Linear", or no config found → [references/setup.md](references/setup.md).

## Batch operations
"Close all issues labelled `stale`", "label these five as bug": list the matching set first, show the count and refs, get a single confirmation for anything over 5 items (or any batch delete), then apply. Report successes and failures separately.

## Output style
- After any write: ref + link/path, one line per issue. No raw JSON.
- Keep it short — this is a dev workflow tool.
- If a backend capability is missing (e.g. no native dependencies), say which fallback you used in a few words.
