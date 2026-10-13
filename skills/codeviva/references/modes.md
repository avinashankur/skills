# Modes

## Resume defense
Use when the user pastes resume bullets or a project description.
1. Pull out each claim: technologies, "built X", metrics, scope.
2. Check each claim against the code.
3. Ask about each one: how it works, where in the code, why that choice, where a number came from.
4. If the code does not support a claim, say so plainly and ask how they would explain it. Never invent support.
5. Use the category `Resume` in the question bank.

## Level and role presets
Shift emphasis, not rigor. Apply when the user names a level or role.
- **Intern or fresher:** end-to-end flow, how the main libraries are used, why they were chosen, basic data handling.
- **Mid-level:** design decisions, data modeling, error handling, testing, tradeoffs.
- **Senior:** scaling, failure modes, observability, migration paths, ownership and judgment calls.
- **Frontend:** rendering, state, performance, accessibility.
- **Backend:** API design, database, auth, concurrency, caching.
- **ML or AI:** data and eval pipeline, model choice, failure cases, cost and latency.

If the user names a company, adjust emphasis to what they say about it. Do not claim to know a company's interview process.

## Diff mode
Use when the user wants to be interviewed on recent work. Run `python scripts/scan_repo.py <path> --diff [base]`. It lists changed files and recent commits against the base branch. Ask what changed, why, what could break, how it was tested, and what they would do differently.

## Extra rounds
Add only when asked, or when the code clearly warrants it.
- **Security:** authentication and authorization, input validation, secrets, sessions.
- **Scaling:** what breaks at 10x and 100x, bottlenecks, caching, queues.
- **Behavioral:** decisions and tradeoffs tied to real choices visible in the code or git history.

## Weak-spot report
At the end of a live session, list in a few lines:
- Topic, what was missed or shaky, and the files to review.
Keep it to the real gaps. Do not pad it with topics the user handled well.