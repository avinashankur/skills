---
name: ship-it
description: 'The final handoff skill — takes finished working-tree changes all the way from review to an opened PR with the issue updated. Orchestrates the other skills in sequence: runs code-review, pauses on real findings for the user to decide (fix code / sync docs / proceed anyway), then runs create-pr (which itself handles smart staging, branching, delegating to git-commit, pushing, and opening the PR), then leaves a comment on the linked issue pointing to the new PR via issue-tracker-gh. Use this skill when the user says things like "ship this", "wrap this up", "hand this off", "I''m done, take it from here", "review this and open a PR", or "do the full handoff" — anything that means "finish the whole cycle for me," as opposed to asking for one step in isolation (reviewing, committing, or opening a PR alone — those are code-review, git-commit, and create-pr respectively). This skill does not reimplement any of those skills'' logic itself; it only sequences them and owns the one high-level decision point between review and shipping.'
---

# Ship It

The final step: finished code in the working tree → reviewed → committed → pushed → PR open → issue updated. This skill doesn't do any of that work itself — it calls `code-review`, `project-docs sync`, `create-pr` (which itself calls `git-commit`), and `issue-tracker-gh` in sequence, and owns exactly one judgment call: what to do when the review isn't clean.

Sub-skills keep their own confirmation gates — branch-name confirmation and staging ambiguity in `create-pr`, delete confirmation in `issue-tracker-gh`, etc. This skill does not duplicate those; it just triggers the sequence and handles the one gate that's genuinely its own (Step 2).

## Step 1 — Review

Invoke `code-review` on the current diff. Pass along any comparison point or spec path the user specified; otherwise let `code-review`'s own Step 1 infer it.

Let `code-review` run to completion and produce its Standards + Spec report.

## Step 2 — The one gate this skill owns

Look at what came back:

- **No findings on either axis** (or only trivial/no-op notes): proceed straight to Step 3 without pausing — a clean review shouldn't require a rubber-stamp confirmation.
- **Real findings on either axis**: stop and summarize them for the user, then ask how to proceed. The live options, depending on what the findings actually are:
  - **Fix the code** — the user goes and fixes it themselves (or asks agent to, as a separate explicit step); this skill does not silently rewrite code to satisfy a review it just ran. Once fixed, re-run from Step 1.
  - **The docs are stale, not the code** — if a Spec-axis finding looks like the docs are out of date rather than the code being wrong, invoke `project-docs sync` to reconcile, then re-run `code-review` once to confirm it resolved. Don't loop more than once automatically — if it's still not clean after that, hand back to the user rather than retrying indefinitely.
  - **Proceed anyway** — the user accepts the findings as-is (e.g. they're minor/judgement-call smells) and wants to ship regardless. Move to Step 3.

Never pick one of these on the user's behalf — the findings are opinions, not blockers, and only the user knows which response fits.

## Step 3 — Commit, push, and open the PR

Invoke `create-pr`. It owns the rest of this mechanically: smart-staging (with its own group-selection gate if the diff has unrelated changes), branch inference and confirmation, calling `git-commit` for the message, committing, pushing, and opening the PR against `main` — including finding and linking the originating issue in the PR body if one exists.

Don't re-derive any of this here — if `create-pr` needs something from the review (e.g. which issue was found), let it do its own detection rather than passing partial state through; the two skills are independently capable of finding the issue reference.

## Step 4 — Update the issue

If `create-pr` found and linked an issue, add a short comment on that issue via `issue-tracker-gh` pointing to the new PR (e.g. "Opened #<pr-number>: <pr-url>"). This is informational only — don't close the issue here; the `Closes #N` link in the PR body already handles that automatically on merge.

If no issue was found/linked, skip this step silently — there's nothing to update.

## Step 5 — Summarize

Report back concisely: review verdict (clean, or what was found and how it was resolved), the PR URL, and whether an issue was updated. This is the final handoff report — keep it short, it's a summary of five other reports, not a sixth one.