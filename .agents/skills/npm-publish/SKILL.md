---
name: npm-publish
description: >
  Publishes an npm package to the NPM registry and syncs with GitHub. Follows
  the full release workflow: verify clean working tree, commit staged changes,
  bump version (patch/minor/major), run npm publish (which auto-runs build and
  tests via prepublishOnly), then push commits and tags to GitHub. Pauses for
  user action on any step that requires authentication or manual approval
  (npm login, OTP, etc.). Use when the user says "publish to npm", "release
  this package", "ship to npm", "push to npm", or invokes /npm-publish.
---

# npm-publish

Takes a package from a clean (or staged) working tree all the way to a published NPM release and a synced GitHub repo. Does not make code changes — that is the user's job before invoking this skill.

## Prerequisites check (Step 0)

Before doing anything, verify the environment is ready. Run each check and report status:

1. **Working directory is clean or staged only** — run `git status`. If there are unstaged changes unrelated to the release, stop and tell the user to commit or stash them first. Staged changes that belong to the release are fine — they will be committed in Step 1.
2. **npm login** — run `export HOME=/c/Users/avina && npm whoami`. If the command fails with 401 or similar, **stop and ask the user to run `npm login`** in their terminal. Do not attempt login on the user's behalf — it requires interactive authentication (browser or OTP).
3. **Determine package context** — if the user specified a package directory, cd into it for all subsequent commands. If not, assume the current directory is the package root (contains a `package.json`). Confirm the package name and current version by reading `package.json` and report it to the user.

If any prerequisite fails, stop and explain what the user needs to do before this skill can continue.

## Step 1 — Commit staged changes (if any)

If `git status` shows staged changes, generate a commit message for them using the `git-commit` skill and commit. If the working tree is already clean (nothing staged), skip this step.

Do not stage files automatically — only commit what the user has already staged.

## Step 2 — Decide version bump

Ask the user which bump type to apply if they haven't already specified it:

- **patch** — bug fixes, tweaks, no new API surface (e.g. `1.0.0` → `1.0.1`)
- **minor** — new backwards-compatible features (e.g. `1.0.0` → `1.1.0`)
- **major** — breaking changes (e.g. `1.0.0` → `2.0.0`)

If the user already said which bump type (e.g. "publish a patch", "bump minor"), skip asking and use what they said.

Once confirmed, run:
`ash
export HOME=/c/Users/avina && npm version <patch|minor|major>
`

Expected: updates `package.json`, creates a version-bump commit, and creates a git tag (e.g. `v1.2.3`). Report the new version to the user.

If this fails because the working directory is dirty, stop and tell the user to commit or stash all changes first.

## Step 3 — Publish to NPM

Run:
`ash
export HOME=/c/Users/avina && npm publish
`

The `prepublishOnly` script (if present) will automatically run the build and test suite first. If it fails, do not retry — report the failure output to the user and stop. They need to fix the underlying build/test issue.

**OTP / 2FA**: If npm prompts for a one-time password, stop and ask the user to enter it in their terminal. This skill cannot interact with interactive prompts.

**Access errors (403/404)**: Stop and surface the error with the relevant row from the troubleshooting table below. Do not retry automatically.

Expected: package version is live on the NPM registry.

## Step 4 — Push to GitHub

Run:
`ash
git push --follow-tags
`

This pushes both the version-bump commit and the new git tag to the remote. Expected: commit and tag appear on GitHub.

If push fails (e.g. remote has diverged), stop and report the error. Do not force-push.

## Step 5 — Verify

Run:
`ash
export HOME=/c/Users/avina && npm view <package-name> version
`

Report the published version. Note that the registry may take a minute or two to reflect the update — if the version looks stale, tell the user to wait briefly and check again.

## Step 6 — Summarize

Report back concisely:
- Package name and version published
- Git tag created
- GitHub push status
- NPM registry link: `https://www.npmjs.com/package/<package-name>`

Keep it short — one paragraph or a tight bullet list.

---

## Troubleshooting reference

| Problem | Cause | Fix |
|---------|-------|-----|
| `npm whoami` fails with 401 | Not logged in | User runs `npm login` in their terminal |
| `npm publish` fails with 403 Forbidden | Not logged in or no publish permission | User runs `npm login` with the correct account |
| `npm publish` fails with 404 Not Found | Org doesn't exist, email unverified, or wrong scope | 1. Verify email on npmjs.com. 2. Ensure the org exists on NPM. 3. Try `npm publish --access public` |
| `npm publish` fails during `prepublishOnly` | Build or tests are failing | Fix the code. Run `npm test` and `npm run build` locally to debug |
| `npm version` fails | Working directory not clean | Commit or stash all outstanding changes first |
| `git push` fails | Remote has diverged | Pull and rebase/merge before pushing |

## Boundaries

This skill does not:
- Write or modify source code
- Stage files (user must stage before invoking)
- Run `npm login` interactively — the user must do that
- Force-push or resolve merge conflicts
- Auto-retry on publish failures — failures are surfaced to the user

Invoke with "publish to npm", "release this package", "ship to npm", "/npm-publish", or similar.
