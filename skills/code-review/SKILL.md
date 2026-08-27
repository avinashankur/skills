---
name: code-review
description: Two-axis review of the diff between HEAD and a fixed comparison point (a commit, branch, tag, or HEAD~N) — checking both (1) conformance to the repo's coding standards, its documentation (README/architecture/design docs), a baseline set of Fowler code smells, general industry best practices, and whether the change adds unnecessary complexity to the codebase, and (2) faithfulness to the originating issue/spec. Use this skill whenever the user asks to review a diff, review their changes, review a PR/branch before opening it, check code against the spec, issue, or docs, check for added complexity, or do a code review — including phrasing like "review my changes", "check this against the issue", "does this diff look good", "review before I push", "is this over-engineered". Runs standards and spec checks as separate parallel passes and reports them separately — do not use this for single-file linting or for reviewing without a git diff involved.
---

# Code Review

Two-axis review of a diff: **Standards** (does the code conform to how this repo writes code) and **Spec** (does the code faithfully implement what it was supposed to). The two axes run independently and are reported independently — never merged or reranked into one verdict, because they answer different questions and mixing them hides which kind of problem you actually have.

## Step 1 — Pin the fixed point

Determine the fixed comparison point:
- If the user specified one (a SHA, branch, tag, `HEAD~5`, etc.), use it.
- Otherwise, default to: the state just after the last commit, or `main` if the user is currently on a different branch.
- If neither is clear (e.g. ambiguous branch state, detached HEAD with no obvious base), ask the user rather than guessing.

Once you have a candidate, validate it **before** doing anything else:
```bash
git rev-parse <fixed-point>
```
If this fails, stop and tell the user the ref doesn't resolve — don't proceed into sub-agents with a bad ref.

Then capture, once, for reuse by both sub-agents:
```bash
git diff <fixed-point>...HEAD      # three-dot: diff against the merge-base
git log <fixed-point>..HEAD --oneline
```
If the diff is empty, stop and tell the user there's nothing to review — don't spawn sub-agents over nothing.

## Step 2 — Identify the spec source

Look for the originating spec, in this order:
1. Issue references in the commit messages from the `git log` output above (`#123`, `Closes #45`, GitLab `!67`, etc.). Fetch the issue content using the `issue-tracker-gh` skill if it's available; otherwise fall back to `gh issue view <number>` directly.
2. A path the user passed as an argument (a spec doc, design doc, etc.) — read it directly.
3. Repo documentation describing intended behaviour or design for the area the diff touches — `README.md`, `docs/`, architecture docs, ADRs, API docs. If the diff touches an area these docs describe, treat that description as part of the spec: the Spec axis should check the diff against it the same way it checks against an issue, in addition to whatever issue/spec-path was found in 1–2 (not instead of).

If none of these yield anything, there is no spec source. Note this and skip the Spec axis entirely in Step 4 — don't fabricate a spec or silently substitute the standards review for it.

## Step 3 — Identify the standards sources

Look for repo-documented standards: `CODING_STANDARDS.md`, `CONTRIBUTING.md`, `.editorconfig`-adjacent style docs, or similar files at the repo root or in `docs/`. Read whatever exists.

On top of whatever the repo documents, the Standards axis **always** carries this smell baseline — a fixed set of Fowler code smells (*Refactoring*, ch. 3) that applies even when the repo documents nothing:

| Smell | What it is | Fix direction |
|---|---|---|
| Mysterious Name | A function, variable, or type whose name doesn't reveal what it does or holds | Rename it; if no honest name comes, the design's murky |
| Duplicated Code | The same logic shape appears in more than one hunk or file in the change | Extract the shared shape, call it from both |
| Feature Envy | A method that reaches into another object's data more than its own | Move the method onto the data it envies |
| Data Clumps | The same few fields or params keep travelling together | Bundle them into one type, pass that |
| Primitive Obsession | A primitive or string standing in for a domain concept that deserves its own type | Give the concept its own small type |
| Repeated Switches | The same switch/if-cascade on the same type recurs across the change | Replace with polymorphism, or one map both sites share |
| Shotgun Surgery | One logical change forces scattered edits across many files in the diff | Gather what changes together into one module |
| Divergent Change | One file or module is edited for several unrelated reasons | Split so each module changes for one reason |
| Speculative Generality | Abstraction, parameters, or hooks added for needs the spec doesn't have | Delete it; inline back until a real need shows |
| Message Chains | Long `a.b().c().d()` navigation the caller shouldn't depend on | Hide the walk behind one method on the first object |
| Middle Man | A class or function that mostly just delegates onward | Cut it, call the real target direct |
| Refused Bequest | A subclass or implementer that ignores or overrides most of what it inherits | Drop the inheritance, use composition |

Two rules bind the baseline:
- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress that smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation. Like any standard here, skip anything tooling already enforces (a linter/formatter rule already catches it).

On top of the smell baseline, the Standards axis also always checks two more things, repo docs or not:

- **General industry best practices** for the language/framework in play — things like: input validation and safe handling of untrusted data, sane error handling (not swallowing exceptions, not failing silently), reasonable test coverage for new logic, dependency hygiene (no unnecessary new dependencies for something the standard library or existing deps already cover), and consistent naming/structure with the rest of the codebase. Same rules apply as the smells: repo docs override, and it's a judgement call, not a hard rule.
- **Added complexity, at the codebase level, not just the diff.** A diff can be locally clean and still make the *system* more complex: a new abstraction layer, a new config surface, a new dependency, or new coupling between modules that the spec didn't call for. Judge this against the codebase the diff lands in, not just the lines changed — a new class that's the third parallel implementation of the same idea is added complexity even if each individual line is fine. Prefer flagging complexity that isn't earned by an actual requirement over complexity that is.

## Step 4 — Run both axes

Each axis gets this brief: report (a) what's missing or partial, (b) what's present but wasn't asked for, (c) what looks implemented but looks wrong — quoting the source (spec line, standards doc line, or smell name) for every finding. Under 400 words. The Standards axis now covers more ground (repo standards, smells, best practices, complexity) under the same cap — if space is tight, prioritize the findings most likely to matter (repo-documented violations first, then clear smells/complexity, then general best-practice notes) over exhaustively listing everything.

- **Spec axis** — brief: report (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. If repo docs (README/architecture/design docs) were folded in as part of the spec source in Step 2, check the diff against them the same way. Quote the spec (or doc) line for each finding. Under 400 words.
- **Standards axis** — brief: report (a) documented repo standards that are violated or not followed; (b) baseline smells present in the diff (labelled as judgement calls, not violations); (c) anything that looks conformant but is subtly off; (d) unearned complexity the diff adds to the codebase (new abstractions, dependencies, config surface, or coupling not called for by the spec); (e) departures from general industry best practice (error handling, input validation, test coverage, dependency hygiene) not already covered by the repo's own docs. Quote the relevant standards doc line or name the smell/practice for each finding. Under 400 words. Apply the repo-overrides and judgement-call rules from Step 3 before finalizing findings — don't flag something the repo explicitly endorses, and don't flag something existing tooling already catches.

**If sub-agents are available** (Claude Code, Cowork, or any environment with a Task-spawning tool): spawn both axes as separate parallel sub-agents, each given only what it needs — the diff, the commit list, and its respective source material (spec content, or standards docs + smell baseline) plus its brief above. Keeping them in separate contexts is the point: neither axis should see or be influenced by the other's framing.

**If sub-agents are not available** (plain chat): run the two passes sequentially yourself instead, but keep them as genuinely separate passes — complete and write down the full Spec-axis findings first, based only on the spec brief, before looking at standards material at all; then do the same for Standards. Don't let a finding from one pass leak into how you frame the other.

If there's no spec source (from Step 2), skip the Spec axis and note in the final report that no spec was found.

## Step 5 — Aggregate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned up for formatting only. Do not merge, cross-reference, or rerank findings between the two axes — they're deliberately kept separate because they answer different questions (how the code is written vs. what it does), and combining them would obscure which kind of problem is which.

End with a one-line summary: total findings per axis, and the worst issue within each axis if any (e.g. "Standards: 4 findings, worst: possible Shotgun Surgery across 5 files. Spec: 2 findings, worst: rate-limit requirement missing entirely."). Don't pick an overall winner or a single combined verdict across axes — that's exactly the reranking the separation exists to prevent.

If the Spec axis was skipped (no spec found), say so plainly in the summary rather than omitting it silently.