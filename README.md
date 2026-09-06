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

### Global installation (Use across all projects)

You can also install skills globally into your user home directory so your AI agent can use them in any project on your machine:

```bash
cd ~ && npx @avinashh/skills init
```

For the complete guide on all commands, runtime agent usage, and global configuration, see the [Usage Guide](docs/product/usage.md).

### Conflict handling

| Flag | Behavior |
|------|----------|
| _(default, interactive)_ | Checkbox picker only pre-checks skills not already installed; re-selecting an existing skill is skipped with a warning. |
| `--skip-existing` | Never overwrite an existing skill (default for non-interactive runs). |
| `--force` | Overwrite the selected/managed skills. |

### How `update` knows what's yours

Every skill installed by this CLI is recorded in `.agents/skills-lock.json`:

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
| `bro` | Re-explain previous assistant replies in a much simpler, casual way |
| `caveman` | Ultra-compressed communication mode cutting output tokens |
| `caveman-review` | Ultra-compressed, blunt code review feedback |
| `code-review` | Review changes since a fixed point (commit, branch, tag, or merge-base) |
| `cold-email` | Write B2B cold emails and follow-up sequences that get replies |
| `copywriting` | Write, rewrite, or improve marketing copy for any page |
| `create-pr` | Take uncommitted work all the way to an open pull request |
| `create-spec` | Execute Spec-Driven Development (SDD) inspired by GitHub Spec Kit |
| `extract-design-md` | Extract a website's design system tokens and components into a DESIGN.md file |
| `find-skills` | Discover and install agent skills |
| `fronted-coding-standards` | Enterprise-grade frontend coding standards for TypeScript/Vite/Next.js projects |
| `git-commit` | Ultra-compressed conventional commit message generator |
| `git-stage` | Organize and partition uncommitted changes into clean, atomic commits |
| `grill-me` | A relentless interview to sharpen a plan or design |
| `grilling` | Stress-test plans or designs with relentless questioning |
| `handoff` | Compact a conversation into a handoff document for another agent |
| `humanizer` | Remove signs of AI-generated writing from text to make it natural and human |
| `improve-codebase-architecture` | Scan a codebase for architecture improvement opportunities and present an HTML report |
| `issue-tracker-gh` | Create, list, search, update, close, and manage GitHub issues using the gh CLI |
| `npm-publish` | Publish an npm package to the registry and sync releases with GitHub |
| `project-docs` | Generate and maintain comprehensive technical and engineering documentation |
| `redesign-existing-projects` | Upgrade existing websites and apps to premium design quality |
| `research` | Investigate questions against primary sources and capture Markdown findings |
| `setup-pre-commit` | Set up Husky pre-commit hooks with lint-staged, type checking, and tests |
| `shadcn` | Manage shadcn components — adding, searching, fixing, debugging, styling |
| `ship-it` | Full handoff orchestrator — takes work from code review to open PR and issue update |
| `skill-creator` | Create, modify, and improve skills; measure skill performance and benchmark |
| `teach` | Teach a new skill or concept within the workspace |
| `to-prd` | Turn a conversation into a PRD and publish to the project issue tracker |

## License

MIT
