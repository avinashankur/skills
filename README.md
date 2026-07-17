# @avinashh/skills

Maintain one canonical collection of agent skills and install them into any project with a single command.

```bash
npx @avinashh/skills init
```

## Commands

```bash
# Interactive install (checkbox picker)
npx @avinashh/skills init

# Install every skill at once, no prompt
npx @avinashh/skills init --all

# List available skills and their installed state
npx @avinashh/skills list

# Install specific skills by name
npx @avinashh/skills add code-review git-commit research

# Update all managed skills to the latest version
npx @avinashh/skills update
```

Short aliases: `i` for `init`, `ls` for `list`.

After a global install (`npm install --global @avinashh/skills`), drop the `npx` prefix:

```bash
skills init
skills list
skills add git-commit
skills update
```

### Conflict handling

| Flag | Behavior |
|------|----------|
| _(default, interactive)_ | Checkbox picker only pre-checks skills not already installed; re-selecting an existing skill is skipped with a warning. |
| `--skip-existing` | Never overwrite an existing skill (default for non-interactive runs). |
| `--force` | Overwrite the selected/managed skills. |

### How `update` knows what's yours

Every skill installed by this CLI is recorded in `.agents/skills.json`:

```json
{
  "version": 1,
  "packageVersion": "1.0.0",
  "installedSkills": {
    "code-review": { "version": "1.0.0" },
    "git-commit": { "version": "1.0.0" }
  }
}
```

`update` only touches directories listed in this manifest. A hand-written skill living at `.agents/skills/my-custom-skill/` — never installed by this CLI — is never modified or removed.

## Available Skills

| Skill | Description |
|-------|-------------|
| `caveman` | Dumbs down explanations to absolute basics |
| `caveman-commit` | Git commits in blunt, no-nonsense language |
| `caveman-review` | Code reviews with brutal simplicity |
| `code-review` | Review changes since a fixed point (commit, branch, tag, or merge-base) |
| `cold-email` | Write B2B cold emails and follow-up sequences that get replies |
| `copywriting` | Write, rewrite, or improve marketing copy for any page |
| `domain-modeling` | Build and sharpen a project's domain model |
| `find-skills` | Helps discover and install agent skills |
| `fronted-coding-standards` | Enterprise-grade frontend coding standards for TypeScript/Vite/Next.js projects |
| `git-commit` | Execute git commit with conventional commit message analysis and intelligent staging |
| `grill-me` | A relentless interview to sharpen a plan or design |
| `grill-with-docs` | Relentless interview that also creates ADRs and supporting docs |
| `grilling` | Stress-test plans or designs with relentless questioning |
| `handoff` | Compact a conversation into a handoff document for another agent |
| `improve-codebase-architecture` | Scan a codebase for improvement opportunities and present an HTML report |
| `project-docs` | Generate and maintain project documentation |
| `redesign-existing-projects` | Upgrade existing websites and apps to premium quality |
| `research` | Investigate a question against high-trust primary sources |
| `setup-pre-commit` | Set up Husky pre-commit hooks with lint-staged, type checking, and tests |
| `shadcn` | Manage shadcn components — adding, searching, fixing, debugging, styling |
| `skill-creator` | Create, modify, and improve skills; measure skill performance |
| `teach` | Teach a new skill or concept within the workspace |
| `to-prd` | Turn a conversation into a PRD and publish to the project issue tracker |
| `turborepo` | Turborepo monorepo setup and management |
| `vercel-react-best-practices` | React and Next.js performance optimization guidelines from Vercel Engineering |

## License

MIT
