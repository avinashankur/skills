# @your-scope/agent-skills

Maintain one canonical collection of agent skills, publish it to npm, and
install those skills into any new or existing project with a single command.

```bash
npx @your-scope/agent-skills init
```

```text
your-project/
├── src/
├── package.json
└── .agents/
    ├── agent-skills.json
    └── skills/
        ├── code-review/
        │   └── SKILL.md
        ├── create-issue/
        │   └── SKILL.md
        └── debugging/
            ├── SKILL.md
            └── references/
                └── debugging-guide.md
```

Safe to run in a brand-new project, an existing project, a project that
already has `.agents/`, or a project with project-specific custom skills —
the CLI never deletes anything it didn't create.

## Commands

```bash
# Interactive install (checkbox picker)
npx @your-scope/agent-skills init

# Install every bundled skill, no prompt
npx @your-scope/agent-skills init --all

# List available skills and their installed state in this project
npx @your-scope/agent-skills list

# Install specific skills by name
npx @your-scope/agent-skills add code-review debugging

# Update all CLI-managed skills to the current package version.
# Custom, project-specific skills are left untouched.
npx @your-scope/agent-skills update
```

Short aliases: `i` for `init`, `ls` for `list`.

After a global install (`npm install --global @your-scope/agent-skills`), the
same commands work without the `npx` prefix.

### Conflict handling

| Flag              | Behavior                                   |
| ------------------ | ------------------------------------------ |
| _(default, interactive)_ | Checkbox picker only pre-checks skills not already installed; re-selecting an existing skill is skipped with a warning. |
| `--skip-existing`  | Never overwrite an existing skill (default for non-interactive runs). |
| `--force`          | Overwrite the selected/managed skills.     |

### How `update` knows what's "yours"

Every skill the CLI installs is recorded in `.agents/agent-skills.json`:

```json
{
  "version": 1,
  "packageVersion": "1.0.0",
  "installedSkills": {
    "code-review": { "version": "1.0.0" },
    "debugging": { "version": "1.0.0" }
  }
}
```

`update` only touches directories listed in this manifest. A hand-written
skill living at `.agents/skills/project-deployment/` — never installed by
this CLI — is never modified or removed.

## Adding or editing skills in this package

Skills live in `skills/<name>/SKILL.md` (plus any supporting files, e.g. a
`references/` subdirectory) at the repository root, outside `src/`. Every
subdirectory containing a `SKILL.md` is automatically discovered — there's no
separate registry file to maintain.

## Development

```bash
npm install
npm run dev -- init --all       # run the CLI from source via tsx
npm run typecheck
npm test
npm run build                   # bundles to dist/cli.js
```

To test the CLI as a real consumer would install it:

```bash
npm run build
npm pack
mkdir /tmp/consumer && cd /tmp/consumer && npm init -y
npm install /path/to/your-scope-agent-skills-1.0.0.tgz
npx agent-skills init
```

To iterate against another local project during development:

```bash
npm run build
npm link
cd ../some-other-project
agent-skills init
```

## Publishing

```bash
npm version patch   # or minor / major
git push --follow-tags
```

Pushing a `v*.*.*` tag triggers `.github/workflows/publish.yml`, which
typechecks, tests, builds, verifies the tag matches `package.json`, and runs
`npm publish --access public`. Requires an `NPM_TOKEN` repository secret (or
configure npm trusted publishing directly).

## Design notes / non-goals for v1

Deliberately out of scope for now: remote skill registries, downloading
skills at runtime, a database, a plugin system, per-skill npm packages,
dependency resolution between skills, and authentication. The npm package
itself is the distribution mechanism — `GitHub repo → npm package → npx CLI
→ .agents/skills` — and that's enough.
