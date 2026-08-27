# Smart staging strategy

Goal: stage only the files that belong to one coherent unit of work, so the branch/commit/PR this run produces represents one logical change — not everything that happens to be dirty in the working tree.

## When to skip this entirely

If the user explicitly says to stage everything ("stage all", "just commit everything", "add -A"), skip straight to `git add -A` and don't run clustering. This override always wins.

Otherwise, always run the clustering pass below — even if you expect it to find just one group. Don't assume a single group without checking; that assumption is exactly what causes unrelated changes to get swept into the same commit.

## Step 1 — Inventory the changes

```bash
git status --porcelain
git diff            # unstaged
git diff --stat
```

Get the full list of changed/added/deleted files and a sense of the size and shape of each change.

## Step 2 — Cluster into candidate groups

Group changed files using these signals, roughly in priority order:

1. **Directory/module locality.** Files under the same feature directory or module are likely one change. Files in unrelated top-level areas (e.g. `src/auth/` vs `src/billing/`) are likely separate.
2. **Source + its paired test/spec file.** `foo.ts` and `foo.test.ts` (or equivalent) belong together even if the naming/directory heuristic alone wouldn't group them.
3. **Symbol-level relatedness.** If a function/class/type renamed or added in one file is referenced by changes in another file (check the diff hunks, not just filenames), group them — this catches cross-file changes that directory locality misses.
4. **Shared commit-worthy intent.** Read the actual diff content, not just paths. Two files in different directories can still be the same logical change (e.g. a schema file and the migration that uses it); two files in the same directory can still be unrelated (e.g. an unrelated typo fix sitting next to a real feature edit).

**Special-case files** — don't let these force an extra group on their own:
- **Lockfiles** (`package-lock.json`, `yarn.lock`, `poetry.lock`, etc.) — attach to whichever group's `package.json`/`pyproject.toml`/etc. changed. If no manifest changed alongside it, treat it as its own minor group and flag it as such.
- **Formatting/whitespace-only diffs** scattered across otherwise-unrelated files — these usually come from an editor/linter auto-run, not deliberate work. Group them separately and flag them as likely incidental; don't fold them into a feature group just because they happen to touch the same files.
- **Docs changes** — group with the code they document if the relationship is clear from content; otherwise treat as their own group.

## Step 3 — Decide what to do with the groups

- **One group found:** proceed — that's the staging set. Show the user a short summary of what's being staged (file list, one-line description) before running `git add`, so they can catch a miscluster, but don't block on explicit approval for the single-group case.
- **Multiple groups found:** stop and show the user each group (files + a one-line inferred description of what it does) and ask which one to stage for this branch/PR. Make clear the others will stay unstaged, available for a later run — don't silently drop them or silently include them.
- **Ambiguous split** (a file could plausibly belong to more than one group): don't force a guess — surface the ambiguity to the user as part of the group listing rather than picking silently.

## Step 4 — Stage

```bash
git add <files in the chosen group>
```
Never blanket `git add -A` in the multi-group case — stage exactly the files in the chosen group, explicitly, by path.