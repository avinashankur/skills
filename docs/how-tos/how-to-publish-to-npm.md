# How to Publish to NPM

> **Audience:** Repository maintainers
> **Time required:** 2-5 minutes
> **Last verified:** 2026-08-09

This guide explains the workflow for publishing a new version of the `@avinashh/skills` CLI to NPM after you have made and tested your changes locally.

## Prerequisites

- Set your home directory (this is required for some CLI tools like npm to find your configs on Windows Git Bash):
  ```bash
  export HOME=/c/Users/avina
  ```
- You must be logged into NPM via the CLI with an account that has publish access to `@avinashh/skills`.
  - Run `npm whoami` to check if you are logged in.
  - Run `npm login` if you are not.
- **You must have a verified email address on your NPM account** (check your account settings on npmjs.com).
- **The `@avinashh` organization must exist** on NPM and your account must be a member of it.
- All your changes should be committed and your working directory should be clean.

## Steps

### 1. Bump the version

Decide what kind of version bump your changes require (patch, minor, or major) based on Semantic Versioning.

```bash
# For backwards-compatible bug fixes or small tweaks:
npm version patch

# For new features that are backwards-compatible:
npm version minor

# For breaking changes:
npm version major
```

Expected result: This command will automatically update the version number in `package.json`, create a new git commit for the version bump, and create a git tag (e.g., `v1.1.3`).

### 2. Publish to NPM

Run the publish command.

```bash
npm publish
```

Expected result: The package will be uploaded to the NPM registry.
*Note: Our `package.json` includes a `prepublishOnly` script (`npm run build && npm run test`). This means NPM will automatically run the build step and the test suite before it actually publishes. If either fails, the publish will abort safely.*

### 3. Push changes and tags to GitHub

Finally, push the new version commit and the associated git tag to the remote repository.

```bash
git push --follow-tags
```

Expected result: The new commit and tag will appear on GitHub.

## Verify it worked

Check the public NPM page for the package to ensure the new version is listed as the latest release:

```bash
npm view @avinashh/skills version
```
(It may take a minute or two for the NPM registry to reflect the update).

## Overall Flow Summary

1. **Develop**: Write your code, update skills, test locally (`npm run dev`, `npm run test`).
2. **Commit**: Save your changes to git.
3. **Version**: Run `npm version <type>` to tag the release.
4. **Publish**: Run `npm publish` (this auto-runs the build and tests).
5. **Sync**: Run `git push --follow-tags` to sync with GitHub.

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `npm whoami` fails with 401 Unauthorized | You are not logged in | Run `npm login` and follow the prompts. |
| `npm publish` fails with 403 Forbidden | Not logged in, or lack permissions | Run `npm login` with the correct account. |
| `npm publish` fails with 404 Not Found | Org doesn't exist, email unverified, or wrong scope | 1. Ensure you have verified your email on npmjs.com.<br>2. Ensure the `@avinashh` organization exists on NPM.<br>3. Check if you need to use `npm publish --access public`. |
| `npm publish` fails during `prepublishOnly` | Tests or build are failing | Fix the underlying code issues. Run `npm test` and `npm run build` locally to debug. |
| `npm version` fails | Working directory not clean | Commit or stash all your outstanding changes first. |
