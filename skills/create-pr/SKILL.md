---
name: create-pr
description: Take the current uncommitted work all the way to an open PR — smart-stage only what's relevant, create a branch (inferring its name from the work, confirmed with the user), get the commit message from the git-commit skill and run the commit, push, then open a PR against main via the gh CLI, linking the originating issue if one is found. Use this skill when the user wants to open a PR, ship their changes, "raise a PR", "push this up", or hand off finished work for review — as distinct from just committing locally (that's the git-commit skill's job) or reviewing a diff (that's the code-review skill's job). This skill orchestrates branching + staging + committing + pushing + PR creation as one flow; it does not draft commit messages itself (delegates to git-commit) and does not review code (delegates to code-review if the user wants a review first).
---

# PR Create (gh)

Takes uncommitted working-tree changes to an open, pushed PR: smart-stage → branch (confirmed) → commit (via `git-commit`) → push → open PR. Always targets `main` as the base.

This skill deliberately does not draft commit messages or review code itself — it calls the `git-commit` and (optionally) `code-review` skills for those and focuses on the branch/stage/push/PR mechanics around them.

## Step 1 — Check there's something to do

```bash
git status --porcelain
```
If there are no uncommitted changes and nothing ahead of `main` unpushed, tell the user there's nothing to raise a PR for and stop.

## Step 2 — Smart-stage the relevant changes

Load `references/staging-strategy.md` and follow it. In short: cluster the uncommitted changes into logical groups (by directory, paired tests, cross-file symbol relatedness, and actual diff content — not just filenames), and stage only the group that represents one coherent unit of work. If the user explicitly asked to stage everything, skip clustering and stage all. If multiple unrelated groups are found, stop and ask the user which one this PR is for; the rest stay unstaged for a later run.

## Step 3 — Determine the branch

```bash
git branch --show-current
```

- **If the current branch is `main`** (or whatever the repo's base branch is): a new branch is required — you can't PR `main` into itself. Proceed to branch-name inference below.
- **If the current branch is anything else**: treat it as the working feature branch already. Skip branch creation and go to Step 5, unless the user indicates they want a fresh branch instead.

### Infer the branch name

Base the name on what the staged change actually is — the same understanding the `git-commit` skill will use for the commit message (change type: feat/fix/chore/docs/refactor, plus a short slug describing it). If an issue number was found (see Step 6's detection), fold it in, e.g. `feat/142-per-user-rate-limit`.

**Always confirm the inferred name with the user before creating the branch.** Show the proposed name and let them accept or correct it — never create the branch silently, even when the inference seems obvious.

```bash
git checkout -b <confirmed-branch-name>
```

## Step 4 — (Already on a feature branch) confirm reuse

If Step 3 found the user already on a non-base branch, briefly confirm this is the branch they want the PR to come from, rather than assuming — a quick "you're on `<branch>` already, using that for the PR" is enough; only pause for real input if it seems like the wrong branch for this change (e.g. branch name suggests unrelated work).

## Step 5 — Commit

Hand off to the `git-commit` skill to get the commit message for the staged diff — don't draft the message here. Once you have it, run the actual commit yourself (the `git-commit` skill produces the message/command but doesn't execute it):
```bash
git commit -m "<message from git-commit skill>"
```

## Step 6 — Push

```bash
git push -u origin <branch-name>
```

## Step 7 — Open the PR

**Find the issue, if any**, the same way `code-review` does: issue references in the commit message just created (`#123`, `Closes #45`), or in the branch name if it was inferred with an issue number. Fetch details via the `issue-tracker-gh` skill if available, else `gh issue view <number>`.

Draft the PR:
- **Title**: short, from the commit/change summary.
- **Body**: brief description of the change; if an issue was found, include `Closes #<number>` so GitHub auto-closes it on merge, and summarize what the issue asked for so the reviewer has context.

```bash
gh pr create --base main --head <branch-name> --title "<title>" --body "<body>"
```

Report back the PR URL.

## Notes

- This skill always targets `main` as the PR base — it doesn't ask or infer a different target.
- It doesn't run `code-review` automatically. If the user wants a review before opening the PR, that's a separate step (either they ask for it first, or a final orchestrator skill sequences it in ahead of this one).
- If any step fails (staging ambiguity unresolved, `gh` not authenticated, push rejected, etc.), stop there and surface the failure — don't continue partway through the sequence on a guess.