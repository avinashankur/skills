# Agent Skills: Complete Usage Guide

> **Audience:** Developers, AI agent practitioners, and team leads  
> **Package:** `@avinashh/skills`  
> **Repository:** `https://github.com/avinashankur/skills`

This guide provides complete, detailed documentation on how to install, configure, update, and use agent skills in your development workflows — both for **individual projects** and **globally across your entire machine**.

---

## Table of Contents

1. [What Are Agent Skills?](#1-what-are-agent-skills)
2. [The Two Dimensions of "Global"](#2-the-two-dimensions-of-global)
3. [CLI Execution: On-Demand vs. Global Binary](#3-cli-execution-on-demand-vs-global-binary)
4. [Installation Scopes: Local vs. Global](#4-installation-scopes-local-vs-global)
   - [Project-Level Installation (Recommended for Teams)](#project-level-installation-recommended-for-teams)
   - [Global / User-Level Installation (Recommended for Personal Use)](#global--user-level-installation-recommended-for-personal-use)
   - [Ecosystem Installation via skills.sh](#ecosystem-installation-via-skillssh)
5. [Detailed CLI Command Reference](#5-detailed-cli-command-reference)
   - [`init` / `i` (Interactive & Batch Setup)](#init--i-interactive--batch-setup)
   - [`add` (Targeted Skill Installation with Typo Suggestions)](#add-targeted-skill-installation-with-typo-suggestions)
   - [`list` / `ls` (Workspace Inspection)](#list--ls-workspace-inspection)
   - [`update` (Safe Updates & Custom Skill Isolation)](#update-safe-updates--custom-skill-isolation)
6. [Conflict Strategies & Overwrite Protection](#6-conflict-strategies--overwrite-protection)
7. [The Lockfile Specification (`skills-lock.json`)](#7-the-lockfile-specification-skills-lockjson)
8. [How AI Coding Assistants Consume Skills](#8-how-ai-coding-assistants-consume-skills)
9. [Product Roadmap: Native `-g` / `--global` CLI Flag](#9-product-roadmap-native--g---global-cli-flag)
10. [Available Skills Catalog](#10-available-skills-catalog)
11. [Troubleshooting & FAQ](#11-troubleshooting--faq)

---

## 1. What Are Agent Skills?

An **Agent Skill** is a self-contained directory containing instructions, workflows, rules, and scripts that teach AI coding assistants (such as Antigravity, Claude Code, Cursor, Copilot, Windsurf, Roo Code, etc.) how to execute specific engineering tasks reliably.

Each skill folder follows the standard Agent Skill format centered around a `SKILL.md` file:

```
my-skill/
├── SKILL.md             # Core instructions with YAML frontmatter (name, description)
├── references/          # Optional: deep-dive guides, frameworks, API conventions
├── rules/               # Optional: modular rules and coding standards
├── evals/               # Optional: evaluation benchmarks and test scenarios
└── scripts/             # Optional: automation or helper scripts
```

The YAML frontmatter provides the semantic metadata agents need to recognize when to trigger the skill:

```markdown
---
name: git-commit
description: Ultra-compressed commit message generator. Use when staging changes, writing commits, or generating conventional commit messages.
---
```

---

## 2. The Two Dimensions of "Global"

When discussing "global" skills, there are two distinct concepts:

| Dimension | What It Means | Where It Lives |
|-----------|---------------|----------------|
| **Global CLI Command** | Installing the `skills` binary on your system so you can invoke it from any terminal without the `npx` prefix. | Global Node/npm bin directory |
| **Global Agent Skills** | Installing skills into the user's home directory so AI coding agents have access to them across **all** repositories without needing a `.agents/` folder in each project. | `~/.agents/skills/` |

Both can be used independently or together.

---

## 3. CLI Execution: On-Demand vs. Global Binary

You can run `@avinashh/skills` via either method:

### Option A: On-Demand via `npx` (No Installation Needed)
Executes directly without leaving permanent CLI binaries:

```bash
npx @avinashh/skills init
npx @avinashh/skills add git-commit
npx @avinashh/skills update
```

### Option B: Global CLI Installation
Install the command globally once with npm:

```bash
npm install --global @avinashh/skills
```

Once installed, use the short `skills` command directly from anywhere:

```bash
skills init
skills list
skills add git-commit
skills update
```

*(Aliases: `i` for `init`, `ls` for `list`.)*

---

## 4. Installation Scopes: Local vs. Global

### Project-Level Installation (Recommended for Teams)

When you run the CLI inside a repository or workspace, skills are installed into the project's `.agents/` directory:

```bash
cd /path/to/my-project
npx @avinashh/skills init
```

**Project Directory Structure:**
```
my-project/
├── .agents/
│   ├── skills-lock.json       # Pinned versions of installed skills
│   └── skills/                # The installed skill directories
│       ├── code-review/
│       │   └── SKILL.md
│       └── git-commit/
│           └── SKILL.md
├── package.json
└── src/
```

**Why use project-level?**
- **Team Consistency:** Commit `.agents/` to Git so every developer, reviewer, and CI agent uses identical workflows and coding standards.
- **Repository Isolation:** Each repository can have only the skills relevant to its tech stack.

---

### Global / User-Level Installation (Recommended for Personal Use)

If you want your personal AI assistant to have access to your favorite skills across **every repository and directory on your computer** without modifying individual project repositories:

```bash
# 1. Navigate to your user home directory
cd ~

# 2. Run the installer
npx @avinashh/skills init
# or if installed globally:
skills init
```

**User Home Directory Structure:**
```
~ (Home: /home/<user> or C:\Users\<user>)
└── .agents/
    ├── skills-lock.json       # Tracks user-level skills
    └── skills/
        ├── caveman/
        │   └── SKILL.md
        ├── git-commit/
        │   └── SKILL.md
        ├── humanizer/
        │   └── SKILL.md
        └── ...
```

**How AI Assistants Detect Global Skills:**
AI agent tools (Antigravity, Claude Code, Cursor, Copilot) automatically check the user's home directory (`~/.agents/skills/`) for available skills when a local `.agents/` directory is absent or as complementary global tools.

**Updating Global Skills:**
To update your global skills when a new package version is released:

```bash
cd ~ && skills update
```

---

### Ecosystem Installation via skills.sh

If you use the broader open agent skills ecosystem CLI (`npx skills`), individual skills from this repository can also be installed globally via:

```bash
npx skills add avinashankur/skills@<skill-name> -g -y
```

- `-g` / `--global`: Targets user-level configuration (`~/.agents/skills`).
- `-y`: Skips interactive confirmation prompts.

---

## 5. Detailed CLI Command Reference

### `init` / `i` (Interactive & Batch Setup)

Initializes skills in the target directory (interactive checkbox picker by default).

```bash
# Interactive mode (checkbox picker)
skills init

# Install all available skills without interactive prompts
skills init --all

# Overwrite skills that already exist
skills init --force

# Silently skip skills that already exist (default for CI/scripts)
skills init --skip-existing
```

**Interactive Picker Details:**
- Discovers all bundled skills in `@avinashh/skills`.
- Inspects the destination folder and marks installed skills with `(installed)`.
- Automatically pre-checks only skills that are **not** yet installed.

---

### `add` (Targeted Skill Installation with Typo Suggestions)

Installs one or more specific skills by name.

```bash
# Install one skill
skills add git-commit

# Install multiple skills in one go
skills add code-review research create-spec

# Force overwrite existing skills
skills add git-commit --force
```

**Intelligent Typo Correction:**
If a skill name is mistyped, the CLI computes Levenshtein distances against available skills and suggests the closest match:

```
$ skills add committ
✖ Unknown skill: committ
  Did you mean?
    git-commit
```

---

### `list` / `ls` (Workspace Inspection)

Lists all skills available in the package along with their installation status in the current workspace:

```bash
skills list
```

**Sample Output:**
```
Agent Skills
Target: /path/to/my-project

Available skills (28 total):

  [installed] git-commit
    Ultra-compressed conventional commit message generator

  [installed] code-review
    Review changes since a fixed point (commit, branch, tag, or merge-base)

  [available] create-spec
    Execute Spec-Driven Development (SDD) inspired by GitHub Spec Kit

Summary: 2 installed, 26 available
```

---

### `update` (Safe Updates & Custom Skill Isolation)

Updates all CLI-managed skills to the version currently bundled in the package:

```bash
skills update
```

**Safety Features:**
- **Custom Skills Are Preserved:** If you added hand-crafted skills into `.agents/skills/my-custom-skill/`, `skills update` reads `skills-lock.json` and leaves custom directories untouched.
- **Removed Skills Protection:** If an upstream skill is deprecated or removed from the package, `update` logs a warning and leaves your local copy intact.

---

## 6. Conflict Strategies & Overwrite Protection

| Flag / Setting | Strategy | Behavior |
|----------------|----------|----------|
| *(Interactive)* | Prompt-guided | Checkbox picker unchecks existing skills; selecting one skips with a warning unless `--force` is passed. |
| `--skip-existing` | `skip` | Leaves existing directories untouched. Ideal for CI scripts and non-destructive installs. |
| `--force` | `overwrite` | Replaces the target skill directory with the canonical version. |

---

## 7. The Lockfile Specification (`skills-lock.json`)

Installed skills and versions are tracked in `.agents/skills-lock.json`:

```json
{
  "version": 1,
  "packageVersion": "2.2.3",
  "installedSkills": {
    "code-review": {
      "version": "2.2.3"
    },
    "git-commit": {
      "version": "2.2.3"
    }
  }
}
```

### Why the Lockfile Matters:
1. **Ownership Boundary:** Distinguishes CLI-installed skills from custom in-house skills.
2. **Version Pinning:** Records the exact package version each skill was installed from.
3. **Automatic Legacy Migration:** If an older project uses `.agents/agent-skills.json` or `.agents/skills.json`, the CLI automatically reads it, writes the new `.agents/skills-lock.json`, and cleans up the legacy file upon the next run.

---

## 8. How AI Coding Assistants Consume Skills

When an AI coding assistant starts in a workspace containing `.agents/skills/` (or user-level `~/.agents/skills/`):

1. **Discovery:** The assistant scans for all `SKILL.md` files and indexes their names and descriptions.
2. **Autonomous Triggering:** When your prompt aligns with a skill's description, the agent reads the skill instructions and applies the rules.
   - *Example:* "I'm ready to push these changes" → triggers `git-commit`.
   - *Example:* "Audit the frontend design system" → triggers `extract-design-md`.
3. **Slash Command Execution:** You can explicitly invoke skills via slash commands matching the folder name:
   - `/git-commit`
   - `/code-review`
   - `/create-spec`
   - `/ship-it`

---

## 9. Product Roadmap: Native `-g` / `--global` CLI Flag

To make global installation seamless from any working directory without having to `cd ~`, a first-class `--global` / `-g` flag is planned for the CLI.

### Proposed CLI Interface:

```bash
# Install skills into ~/.agents/skills from anywhere
skills init --global
skills init -g

# Add a specific skill globally
skills add git-commit --global
skills add code-review -g

# List globally installed skills
skills list --global
skills list -g

# Update all globally installed skills
skills update --global
skills update -g
```

### Architecture:
- Target path dynamically resolves to `os.homedir()` when `-g` is supplied.
- Global lockfile lives at `~/.agents/skills-lock.json`.
- Project-level lockfiles remain completely isolated at `<project-root>/.agents/skills-lock.json`.

---

## 10. Available Skills Catalog

| Skill | Category | Description |
|-------|----------|-------------|
| `git-commit` | Git & Release | Ultra-compressed conventional commit message generator |
| `git-stage` | Git & Release | Organize and partition uncommitted changes into clean, atomic commits |
| `create-pr` | Git & Release | Take uncommitted work all the way to an open pull request |
| `ship-it` | Git & Release | Full handoff orchestrator — takes work from code review to open PR |
| `npm-publish` | Git & Release | Publish an npm package to registry and sync releases with GitHub |
| `setup-pre-commit` | Git & Release | Set up Husky pre-commit hooks with lint-staged, type checking, and tests |
| `code-review` | Code Quality | Review changes since a fixed point (commit, branch, tag, or merge-base) |
| `caveman-review` | Code Quality | Ultra-compressed, blunt code review feedback |
| `create-spec` | Architecture | Execute Spec-Driven Development (SDD) inspired by GitHub Spec Kit |
| `project-docs` | Architecture | Generate and maintain comprehensive technical engineering documentation |
| `improve-codebase-architecture` | Architecture | Scan a codebase for architectural improvements and present an HTML report |
| `fronted-coding-standards` | Frontend | Enterprise frontend standards for TypeScript/Vite/Next.js projects |
| `shadcn` | Frontend | Manage shadcn components — adding, searching, fixing, styling |
| `extract-design-md` | Frontend | Extract a website's design system tokens and components into a DESIGN.md file |
| `redesign-existing-projects` | Frontend | Upgrade existing websites and apps to premium design quality |
| `bro` | Communication | Re-explain previous assistant replies in a much simpler, casual way |
| `caveman` | Communication | Ultra-compressed communication mode cutting output tokens |
| `humanizer` | Communication | Remove signs of AI-generated writing from text to make it natural and human |
| `cold-email` | Communication | Write B2B cold emails and follow-up sequences that get replies |
| `copywriting` | Communication | Write, rewrite, or improve marketing copy for any page |
| `to-prd` | Communication | Turn a conversation into a PRD and publish to the project issue tracker |
| `handoff` | Communication | Compact a conversation into a handoff document for another agent |
| `skill-creator` | Meta & Tooling | Create, modify, and improve skills; measure skill performance and benchmark |
| `find-skills` | Meta & Tooling | Discover and install agent skills from the open ecosystem |
| `teach` | Meta & Tooling | Teach a new skill or concept within the workspace |
| `grill-me` | Meta & Tooling | Relentless interview to sharpen a plan or design |
| `grilling` | Meta & Tooling | Stress-test plans or designs with relentless questioning |
| `research` | Meta & Tooling | Investigate questions against primary sources and capture Markdown findings |
| `issue-tracker-gh` | Meta & Tooling | Create, list, search, update, close, and manage GitHub issues with `gh` CLI |

---

## 11. Troubleshooting & FAQ

#### Q: Should I commit `.agents/` to Git?
**Yes for team repositories.** Committing `.agents/skills/` and `.agents/skills-lock.json` ensures that all team members and automated CI agents use identical skills and rules.

#### Q: Can I edit an installed skill directly?
**Yes.** Once installed, skills are plain Markdown files in your repo. If you modify a skill and later run `skills update`, Git diff lets you review and merge any upstream changes.

#### Q: How do I remove a skill?
Delete its folder from `.agents/skills/<skill-name>` and optionally delete its key in `.agents/skills-lock.json`.
