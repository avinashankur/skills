---
name: git-stage
description: >
  Analyze uncommitted changes in the working tree, partition related files into
  logical commit-sized changesets, and interactively stage + commit each changeset.
  Supports creating a new branch and pushing commits to remote.
  Use when the user says "create changesets", "git stage", "smart stage", "what should I
  commit together", "split my changes into commits", "help me commit",
  "/git-stage", "/git-stage branch", "/git-stage push", "/git-stage branch push",
  or any phrasing about organizing messy uncommitted work into clean, separate commits.
---

# Git Stage

Inspect uncommitted changes (staged + unstaged + untracked), cluster
them into logical changesets that belong in the same commit, present the changesets
for approval, and stage + commit each approved changeset one at a time.
Supports creating a new branch for the changes and pushing commits to remote.

## Command Variants & Intent Detection

Parse the user's invocation to identify the execution mode:

| Command | Action |
|---|---|
| `/git-stage` | Stage and commit changesets on current branch (no push). |
| `/git-stage branch [name]` | Create/switch to a new branch, then stage and commit changesets (no push). |
| `/git-stage push` | Stage and commit changesets on current branch, then confirm and push to remote. |
| `/git-stage branch [name] push`<br>`/git-stage push branch [name]` | Create/switch to a new branch, stage and commit changesets, then confirm and push to remote. |

- **Branch mode**: Activated when `branch` is present in the prompt/command. If a branch name is provided (e.g. `/git-stage branch feat/login`), use that name. If no name is provided (`/git-stage branch`), infer one following `references/branch-conventions.md` and confirm with the user.
- **Push mode**: Activated when `push` is present in the prompt/command. Requires confirmation before running `git push`.

---

## Step 1 — Collect the full picture

Run these commands to get the complete repository state:

```bash
git status --short                        # all changed / untracked files
git diff --stat                           # unstaged diff summary
git diff --cached --stat                  # already-staged diff summary
git branch --show-current                 # current active branch
git remote -v                             # configured remotes
git log --oneline -10                     # recent commits for context
```

If `git status` is clean, stop and inform the user there are no uncommitted changes to stage.

---

## Step 2 — Understand every change

For each changed file, inspect enough context to understand *what* the change does:

- **Modified files**: `git diff <file>` (or `git diff --cached <file>` if staged) — read the diff, not the entire file.
- **Untracked / new files**: Read the file directly (or the first ~100 lines and structural elements like imports, exports, component/package names).
- **Deleted files**: Note the deletion; check `git log -1 -- <file>` for context on what it was.

Build a mental model of each change's *purpose* — what feature, fix, chore, or refactor does it serve?

---

## Step 3 — Assemble changesets & branch name

Partition files into changesets where each changeset represents **one logical change** that belongs in a single commit. Use these signals:

| Signal | Weight |
|---|---|
| **Same feature / component** — files in the same feature directory, or a component + its styles/tests/types | Strongest |
| **Same concern** — e.g. all dependency updates, all CI config, all docs | Strong |
| **Cross-cutting but coupled** — e.g. a util change + every call-site that needed updating | Strong |
| **Temporal proximity in `git log`** — files last touched in the same recent commit | Weak tiebreaker |

### Changeset rules

1. **Don't over-split.** If all changes genuinely serve one purpose, produce **one changeset**. Multiple changesets only when changes are clearly unrelated.
2. **Don't leave orphans.** Every changed file must appear in exactly one changeset.
3. **Order changesets** by dependency: if changeset B depends on changeset A (e.g. A adds a utility, B uses it), A comes first.
4. **Name each changeset** with a short label suitable for a commit scope (e.g. "shadcn UI setup", "auth page restyling", "docs updates").
5. **Co-locate documentation with relevant changes.** Do not isolate documentation updates (e.g. `README.md`, `ARCHITECTURE.md`, `DESIGN.md`) into a separate generic docs commit if they describe or accompany specific feature, refactor, or UI changes. Bundle those docs directly with the corresponding code/feature commit.

### Branch name inference (Branch mode only)

When **Branch mode** is active and the user did not supply a branch name:
1. Consult `references/branch-conventions.md`.
2. Infer the primary change type (`feat/`, `fix/`, `refactor/`, `chore/`, `docs/`, `test/`).
3. Create a concise 2–4 word kebab-case description based on the dominant changeset (e.g. `feat/branch-support`, `fix/login-token-refresh`).

---

## Step 4 — Present changesets & branch plan

### 4A. Branch setup (if Branch mode)

If the user requested a new branch:
- **If branch name was provided**: State the target branch (e.g. `Target branch: <name> (new branch)`).
- **If branch name was inferred**: Present the suggested branch name and use `ask_question` to confirm:
  - "(Recommended) Create branch '<inferred-name>' and proceed"
  - "Specify a custom branch name"
  - "Stay on current branch '<current-branch>' instead"

Once the branch name is confirmed, create and switch to the branch **before staging**:

```bash
git checkout -b <branch-name>
```

*(Git carries dirty working tree changes over to the newly created branch cleanly).*

### 4B. Present the changesets

Output the changesets in a clear, scannable format:

```markdown
### Changeset N: <label>
<1-sentence rationale for why these files belong together>

Files:
- path/to/file1  (modified)
- path/to/file2  (new)
- path/to/file3  (modified)
```

After listing all changesets, display a summary table:

| # | Label | Files |
|---|---|---|
| 1 | ... | N |
| 2 | ... | N |

Then **ask the user** how they would like to proceed using `ask_question`:
- "Stage and commit all changesets in order"
- "Let me pick which changesets to commit (by number)"
- "Walk me through one changeset at a time"
- "I want to modify the changesets first"

### Execution modes

- **Batch mode ("all" or "pick by number")**: Process approved changesets sequentially without pausing between changesets — commit them in dependency order and report progress.
- **Interactive mode ("one at a time")**: Prompt before each changeset:
  - "Yes, stage and commit this changeset"
  - "Skip this changeset"
  - "I want to modify this changeset first"
- **Modify mode**: If the user wants to adjust changesets (reassign files, rename, split, merge), apply modifications and re-present the updated changesets before staging.

---

## Step 5 — Stage and commit (per approved changeset)

For each changeset being committed:

1. **Unstage everything first** (safety reset):
   ```bash
   git reset HEAD
   ```
2. **Stage only this changeset's files**:
   ```bash
   git add <file1> <file2> ...
   ```
3. **Verify** staged files:
   ```bash
   git diff --cached --stat
   ```
4. **Generate the commit message using the `git-commit` skill.**
   Invoke the `git-commit` skill against the currently staged diff to produce the commit message (subject and body when warranted by `git-commit` rules).

   *Fallback (only if `git-commit` skill is not available in the workspace):*
   - Subject: `<type>(<scope>): <imperative summary>` (≤50 chars, max 72, no trailing period).
   - Body: Add only when *why* isn't obvious, for breaking changes, or when bundling coupled elements (bullets `- ...` wrapped at 72 chars).
5. **Commit** with the generated message:
   - Subject only:
     ```bash
     git commit -m "<subject>"
     ```
   - Subject + body:
     ```bash
     git commit -m "<subject>" -m "<body>"
     ```

In batch mode, print a one-line confirmation after each commit (`✅ Changeset N: <hash> <subject>`).

---

## Step 6 — Push (if Push mode)

- **If Push mode was NOT requested**:
  Do not push. Remind the user they can push when ready:
  - Existing branch: `git push origin <branch>`
  - New branch: `git push -u origin <branch>`

- **If Push mode WAS requested** (`/git-stage push` or `/git-stage branch push`):
  Show a confirmation prompt with branch and remote details before executing:
  - Remote: `origin` (or target remote)
  - Branch: `<current-or-new-branch>`
  - Upstream flag: `-u` if new branch

  Use `ask_question`:
  - `(Recommended) Push commits now (git push ...)`
  - `Cancel push (keep commits local)`

  Upon user confirmation, execute:
  - For existing branch:
    ```bash
    git push origin <branch>
    ```
  - For new branch:
    ```bash
    git push -u origin <branch>
    ```

  If canceled by the user, report that commits remain safely saved in the local branch and provide the manual command to push later.

---

## Step 7 — Wrap up

Display a final summary:

```markdown
✅ Committed:
  - <hash> <subject>
  - <hash> <subject>

Branch: <branch-name>
Push: <Pushed to origin/<branch> | Skipped / Local only>

⏭️ Skipped:
  - Changeset 3: <label> (N files still uncommitted)

Remaining uncommitted files: N
```

If any uncommitted files remain, offer to stage them into a final commit or leave them untouched.

---

## Edge cases

- **Already-staged files**: Include them in the analysis. If they logically belong with unstaged files, bundle them together (they are unstaged and re-staged as part of the changeset).
- **Merge conflicts**: If `git status` shows unmerged paths or conflicts, stop immediately and ask the user to resolve them first.
- **Large number of files (>30)**: Cluster more aggressively into fewer changesets to avoid review fatigue, noting that the user can request further splits.
- **Binary files**: Include them in changesets by path, marked as `(binary)` since diffs cannot be inspected.
- **Branch already exists**: If the requested or inferred new branch already exists, prompt the user to choose another name or switch to the existing branch.

---

## References

- **Branch Naming**: See `references/branch-conventions.md` for branch prefix types, format rules, and examples.
- **Commit Messages**: Follow `.agents/skills/git-commit/SKILL.md` to produce commit messages from staged diffs. Do not author messages independently when `git-commit` is available.
