# GitHub backend

Operates **only on the current repository** (from the git remote). Never pass `--repo` to target another repo, and never ask which repo.

## Preflight
```bash
gh repo view --json nameWithOwner -q .nameWithOwner
```
Fails → tell the user to run `gh auth login` and/or check the GitHub remote. Stop.

Resolve "me": `gh api user -q .login` (or use `@me` where gh accepts it).

## Operations

| Op | Command |
|---|---|
| Create | `gh issue create --title "<t>" --body-file <tmp.md> [--label L]... [--assignee U]... [--milestone M]` |
| View | `gh issue view <n> --json number,title,state,stateReason,labels,assignees,body,comments,url` |
| List | `gh issue list [--state open\|closed\|all] [--label L] [--assignee U\|@me] [--limit 20] --json number,title,state,labels,assignees` |
| Search | `gh issue list --state all --search "<terms> [in:title] [label:x] [author:x]" --limit 10` |
| Edit | `gh issue edit <n> [--title] [--body-file] [--add-label] [--remove-label] [--add-assignee] [--remove-assignee] [--milestone]` |
| Comment | `gh issue comment <n> --body-file <tmp.md>` |
| Close | `gh issue close <n> --reason completed\|"not planned" [--comment "<why>"]` |
| Reopen | `gh issue reopen <n>` |
| Delete | `gh issue delete <n> --yes` (after user confirmation; needs admin — on permission error, offer close as "not planned") |
| Start work | `gh issue develop <n> --checkout` then add the in-progress label/status if the repo uses one |

Write multi-line bodies to a temp file in the scratchpad and use `--body-file` — avoids shell-quoting breakage, especially on Windows.

**Status mapping:** `open`/`done`/`cancelled` = open / closed(completed) / closed(not planned). `in-progress` has no native state: use an `in-progress` label unless config says otherwise (or a Projects status field if the user has one set up).

**Priority:** label `priority:<level>` unless config says otherwise.

## Linking

Native relationships use the issue's numeric **database id**, not its number:
```bash
ID=$(gh api repos/{owner}/{repo}/issues/<n> --jq .id)
```

- **Blocked by** (issue `<x>` blocked by `<y>`):
  ```bash
  gh api -X POST repos/{owner}/{repo}/issues/<x>/dependencies/blocked_by -F issue_id=$(gh api repos/{owner}/{repo}/issues/<y> --jq .id)
  ```
  If the endpoint errors (feature unavailable), append `Blocked by: #<y>` to `<x>`'s body instead.
- **Sub-issue** (`<child>` under `<parent>`):
  ```bash
  gh api -X POST repos/{owner}/{repo}/issues/<parent>/sub_issues -F sub_issue_id=$(gh api repos/{owner}/{repo}/issues/<child> --jq .id)
  ```
  Fallback: `Parent: #<parent>` line in the child body.
- **PR closes issue**: append `Closes #<n>` to the PR body:
  ```bash
  gh pr view <pr> --json body -q .body > pr.md && printf '\n\nCloses #%s\n' <n> >> pr.md && gh pr edit <pr> --body-file pr.md
  ```
  When creating a new PR, put `Closes #<n>` in the initial body instead.
- **What a PR fixes**: `gh pr view [<pr>] --json body,headRefName,closingIssuesReferences` — report `closingIssuesReferences` plus any `#N` in the body/branch.

`{owner}/{repo}` placeholders are filled in automatically by `gh api` from the current repo.
