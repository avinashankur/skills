---
name: git-stage
description: >
  Analyze uncommitted changes in the working tree, partition related files into
  logical commit-sized changesets, and interactively stage + commit each changeset.
  Use when the user says "create changesets", "git stage", "smart stage", "what should I
  commit together", "split my changes into commits", "help me commit",
  "/git-stage", "/smart-stage", or any phrasing about organizing messy uncommitted work
  into clean, separate commits.
---

# Git Stage

Inspect all uncommitted changes (staged + unstaged + untracked), cluster
them into logical changesets that belong in the same commit, present the changesets
for approval, and stage + commit each approved changeset one at a time.

## Step 1 — Collect the full picture

Run these commands to get the complete state:

```bash
git status --short                        # all changed / untracked files
git diff --stat                           # unstaged diff summary
git diff --cached --stat                  # already-staged diff summary
```

If `git status` is clean, stop and tell the user there's nothing to stage.

Also gather context that helps with assembling changesets:

```bash
git log --oneline -10                     # recent commits for context
```

## Step 2 — Understand every change

For each changed file, read enough to understand *what* the change is about.
Use the most efficient approach per file:

- **Modified files**: `git diff <file>` (or `git diff --cached <file>` if staged) — read the diff, not the whole file.
- **Untracked / new files**: read the file directly (or at least the first ~100 lines and any obvious indicators like package name, component name, imports).
- **Deleted files**: note the deletion; check `git log -1 -- <file>` for context on what it was.

Build a mental model of each change's *purpose* — what feature, fix, chore,
or refactor does it serve?

## Step 3 — Assemble changesets

Partition files into changesets where each changeset represents **one logical change**
that belongs in a single commit. Use these signals:

| Signal | Weight |
|---|---|
| **Same feature / component** — files in the same feature directory, or a component + its styles/tests/types | Strongest |
| **Same concern** — e.g. all dependency updates, all CI config, all docs | Strong |
| **Cross-cutting but coupled** — e.g. a util change + every call-site that needed updating | Strong |
| **Temporal proximity in `git log`** — files last touched in the same recent commit | Weak tiebreaker |

### Changeset rules

1. **Don't over-split.** If all changes genuinely serve one purpose, produce
   **one changeset**. Multiple changesets only when the changes are clearly unrelated.
   Err on the side of fewer changesets — the user can always split further.
2. **Don't leave orphans.** Every changed file must appear in exactly one
   changeset.
3. **Order changesets** by dependency: if changeset B depends on changeset A's changes
   (e.g. A adds a utility, B uses it), A comes first.
4. **Name each changeset** with a short label that could serve as a commit scope
   (e.g. "shadcn UI setup", "auth page restyling", "docs updates").
5. **Co-locate documentation with relevant changes.** Do not isolate documentation
   updates (such as `ARCHITECTURE.md`, `CONTEXT.md`, `README.md`, `DESIGN.md`, or
   how-to guides) into a separate generic docs commit if they describe or accompany
   the specific feature, refactor, or UI changes in a changeset. Bundle those docs
   directly with the corresponding code/feature commit.

## Step 4 — Present the changesets

Output the changesets in a clear, scannable format. For each changeset show:

```
### Changeset N: <label>
<1-sentence rationale for why these files belong together>

Files:
- path/to/file1  (modified)
- path/to/file2  (new)
- path/to/file3  (modified)
```

After listing all changesets, show a summary table:

| # | Label | Files |
|---|---|---|
| 1 | ... | N |
| 2 | ... | N |

Then **ask the user** how they'd like to proceed. Use the `ask_question`
tool with options like:

- "Stage and commit all changesets in order"
- "Let me pick which changesets to commit (by number)"
- "Walk me through one changeset at a time"
- "I want to modify the changesets first"

### Batch mode ("all" or "pick by number")

If the user approves all changesets, or selects specific ones (e.g. "1, 3, 4"),
process each approved changeset sequentially **without asking again between
changesets** — just commit them in dependency order and report progress.

### Interactive mode ("one at a time")

Process one changeset at a time, asking before each:
- "Yes, stage and commit this changeset"
- "Skip this changeset"
- "I want to modify this changeset first"

### Modify mode

If the user wants to modify changesets (move files, rename, change message,
merge two changesets, split one), make the changes and re-present the updated
changesets before proceeding to staging.

## Step 5 — Stage and commit (per approved changeset)

For each changeset being committed (whether batch or interactive):

1. **Unstage everything first** (safety reset):
   ```bash
   git reset HEAD
   ```
2. **Stage only this changeset's files**:
   ```bash
   git add <file1> <file2> ...
   ```
3. **Verify** what's staged matches the changeset:
   ```bash
   git diff --cached --stat
   ```
4. **Generate the commit message using the `git-commit` skill.**
   Invoke the `git-commit` skill against the currently staged diff to produce
   the commit message (both subject and body when warranted by `git-commit` rules).
   
   *Fallback (only if `git-commit` skill is not available in the workspace):*
   - Subject: `<type>(<scope>): <imperative summary>` (≤50 chars, max 72, no trailing period).
   - Body: Add only when *why* isn't obvious, for breaking changes, or when bundling coupled elements (bullets `- ...` wrapped at 72 chars).
5. **Commit** with the generated message (preserving any body produced):
   - Subject only:
     ```bash
     git commit -m "<subject>"
     ```
   - Subject + body:
     ```bash
     git commit -m "<subject>" -m "<body>"
     ```

In batch mode, repeat steps 1–5 for each changeset in order, printing a
one-line confirmation after each commit (`✅ Changeset N: <hash> <subject>`).

## Step 6 — Wrap up

After all changesets are processed, show a summary:

```
✅ Committed:
  - <hash> <subject>
  - <hash> <subject>

⏭️ Skipped:
  - Changeset 3: <label> (N files still uncommitted)

Remaining uncommitted files: N
```

If any files remain uncommitted, offer to stage them as a final catch-all
commit or leave them for later.

## Edge cases

- **Already-staged files**: include them in the analysis. If they logically
  belong with unstaged files, bundle them together (they'll be unstaged and
  re-staged as part of the changeset).
- **Merge conflicts**: if `git status` shows conflicts, stop and tell the
  user to resolve them first.
- **Large number of files (>30)**: still organize them into changesets, but be more aggressive
  about combining into fewer changesets to avoid review fatigue. Mention that the
  user can ask you to split specific changesets further.
- **Binary files**: include them in changesets based on their path/name, but
  note them as `(binary)` since their diff can't be read.

## Commit messages

**All commit messages are generated by the `git-commit` skill.**
Always read and follow `.agents/skills/git-commit/SKILL.md` to produce the message
from the staged diff. Do not author messages independently when `git-commit` is available.
Be sure to preserve and commit any body generated by `git-commit` using multiple `-m` arguments
(`git commit -m "<subject>" -m "<body>"`).

Only if `git-commit` is missing from the workspace, fall back to standard Conventional Commits
with a body included only when required (non-obvious rationale, coupled changes, migrations, breaking changes).

## Boundaries

- This skill **partitions, stages, and commits**. It does **not** push.
  After all commits are done, remind the user they can push when ready:
  `git push origin <branch>`.
- If the user only wants changeset suggestions without committing, stop
  after Step 4 and don't proceed to staging.
- Respect the user's decisions — if they want to merge or rearrange changesets,
  do it without pushback.
