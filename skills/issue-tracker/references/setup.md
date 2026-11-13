# Setup — choose and record the backend

Run once per repo, when the user asks to (re)configure, or when `docs/agents/issue-tracker.md` is missing.

## 1. Detect

Gather signals quietly, then propose one backend:

```bash
git remote get-url origin 2>/dev/null        # github.com → github
ls -d .scratch 2>/dev/null                    # existing local tickets → local
```
- Linear signals: Linear MCP tools are available in this session (tool names containing `linear`), `LINEAR_API_KEY` is set, or branch names / commit messages contain identifiers like `ABC-123` (`git log --oneline -50`).
- More than one signal (e.g. GitHub remote and Linear MCP) → ask which one is the source of truth for issues.
- No signal (no remote, nothing else) → suggest `local`.

## 2. Confirm in one question

Ask the user to confirm the detected backend (offer the other two as options). Then collect only what that backend needs:

- **github** — nothing more. Optional: label overrides for the role labels if the repo already uses different names (`gh label list`).
- **linear** — team key (list teams and let them pick; default to the only team if there's one), optional default project, optional default labels. Map canonical statuses to the team's workflow states (fetch states; pick the obvious ones: `open`→ first *unstarted* state (often "Todo"), `in-progress`→ first *started* state, `done`→ first *completed*, `cancelled`→ first *canceled*). Only ask if ambiguous.
- **local** — nothing more. Root is `.scratch/`. Ask whether `.scratch/` should be committed or git-ignored (default: committed, so tickets are shared).

## 3. Write `docs/agents/issue-tracker.md`

Use this template, filling only the relevant section:

```markdown
# Issue tracker

Backend: github | linear | local

## Role labels
| Role | Label |
|---|---|
| bug | bug |
| enhancement | enhancement |
| needs-triage | needs-triage |
| needs-info | needs-info |
| ready-for-agent | ready-for-agent |
| ready-for-human | ready-for-human |

## GitHub
Repo: <owner/name>   # informational; always operate on the current repo

## Linear
Team: <KEY>
Default project: <name or none>
Default labels: <comma list or none>
Status map: open=<state>, in-progress=<state>, done=<state>, cancelled=<state>

## Local
Root: .scratch/
Committed: yes | no
```

Users may edit this file by hand afterwards; always re-read it rather than caching.

## 4. Point the agent docs at it

If `CLAUDE.md` exists, add (or update) this block; otherwise use `AGENTS.md`. Never create one of them when the other already exists; if neither exists, create `AGENTS.md`.

```markdown
## Agent skills

- Issue tracker: see `docs/agents/issue-tracker.md` (backend: <backend>). Use the `issue-tracker` skill for all issue operations.
```

## 5. Labels (github only, optional)

If role labels don't exist yet, offer to create them in one go:
```bash
gh label create "ready-for-agent" --color 0E8A16 --description "Fully specified; an agent can pick it up" --force
gh label create "ready-for-human" --color FBCA04 --description "Needs human judgment or access" --force
gh label create "needs-triage"    --color D4C5F9 --force
gh label create "needs-info"      --color C5DEF5 --force
```

For local, `git check-ignore .scratch` to verify the committed/ignored choice and add `.scratch/` to `.gitignore` only if they chose "no".

Report what was written in two lines, then carry on with the original request.
