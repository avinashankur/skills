# Branch Naming Conventions

Use lowercase kebab-case in the format `<type>/<short-description>`.

## Types

| Type | When to use | Example |
|---|---|---|
| `feat/` | New features, capabilities, or user-facing additions | `feat/branch-support` |
| `fix/` | Bug fixes, error handling, patches | `fix/null-pointer-guard` |
| `refactor/` | Code restructuring without functional changes | `refactor/changeset-parser` |
| `chore/` | Tooling, dependencies, build/release setup | `chore/update-dependencies` |
| `docs/` | Documentation, guides, README updates | `docs/quickstart-guide` |
| `test/` | Adding or updating tests | `test/installer-specs` |

## Rules

- **Format**: `<type>/<kebab-case-description>`
- **Concise**: 2–4 words, max 35 characters after the prefix.
- **No filler words**: Omit `a`, `the`, `and`, `to`, `for` (e.g. `feat/auth-modal`, not `feat/add-a-modal-for-auth`).
- **Optional issue ID**: If an issue or ticket ID is known, prefix the description: `fix/104-login-crash` or `feat/gh-42-search-filter`.
