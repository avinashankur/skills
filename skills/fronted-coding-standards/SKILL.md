---
name: frontend-coding-standards
description: Enterprise-grade frontend coding standards for TypeScript projects using Vite or Next.js. Use this skill whenever the user is starting a new frontend project, scaffolding a Vite or Next.js app, asking about project structure, folder organization, "how should I structure this app", component architecture, ESLint/Prettier setup, TypeScript conventions, or wants their codebase to be scalable, modular, or "production-ready"/"enterprise-level". Also trigger when reviewing existing frontend code for structure/convention issues, when adding a new feature/module to an existing app and the user wants to know where it should live, or when asked about Zustand state management or Tailwind CSS conventions within a modular architecture. Do NOT use this skill for git-hook, husky, or lint-staged setup — that is covered elsewhere.
---

# Frontend Coding Standards (Enterprise TypeScript)

This skill defines a consistent, scalable set of conventions for enterprise-grade
frontend projects built with **TypeScript**, using either **Vite** (SPA/library)
or **Next.js** (App Router). It covers project structure, TypeScript style,
tooling (ESLint/Prettier), styling (Tailwind), and state management (Zustand).

The goal is codebases that stay maintainable as they grow: new engineers can
find things quickly, features can be added/removed without ripple effects, and
nothing depends on tribal knowledge.

**Explicitly out of scope**: git hooks, husky, lint-staged, and pre-commit
tooling — the user has a separate skill for that. Never suggest adding them
here.

## How to use this skill

1. Read this file fully first — it has the architecture decision and the
   non-negotiable rules.
2. Read the relevant reference file(s) below **before** writing config or
   scaffolding code:
   - `references/project-structure.md` — the folder architecture (feature-based),
     full example trees for Vite and Next.js, and the module-boundary rules.
   - `references/typescript-conventions.md` — condensed, opinionated TypeScript
     rules adapted from the Google TypeScript Style Guide.
   - `references/eslint-prettier-config.md` — ready-to-use ESLint + Prettier
     configs for both Vite and Next.js.
   - `references/state-and-styling.md` — Zustand store conventions and Tailwind
     CSS conventions.
3. Apply conventions consistently — don't mix patterns (e.g. don't put some
   components in `features/` and others in a flat `components/` free-for-all).
4. When scaffolding a **new** project, walk through: structure → tsconfig →
   ESLint/Prettier → Tailwind → base Zustand store shape → example feature
   module, in that order.
5. When reviewing **existing** code, check it against the module-boundary
   rules in `project-structure.md` first (imports going the wrong direction
   are the most common enterprise-scale bug), then TypeScript/style issues.

## Architecture decision: feature-based (domain-driven) structure

This skill standardizes on a **feature-based / domain-driven folder structure**
(sometimes called "screaming architecture") over a type-based structure
(`components/`, `hooks/`, `utils/` all flat at the root). Rationale:

- **Scales with the codebase, not against it.** A type-based structure gets
  harder to navigate as the app grows — `components/` becomes a 200-file
  junk drawer. A feature-based structure keeps growth _localized_: adding a
  feature adds a folder, not more files scattered across the tree.
- **Enforces module boundaries.** Each feature owns its components, hooks,
  api calls, types, and state. Cross-feature imports become visible and
  reviewable, instead of implicit.
- **Matches how enterprise teams actually split ownership** — by domain/
  feature, not by file type.

Full trees, import rules, and the boundary contract are in
`references/project-structure.md`. Read it before scaffolding anything.

## Non-negotiable rules (quick reference)

These apply regardless of which reference file you're using; treat them as
defaults unless the user's existing codebase already establishes a different,
consistent convention (see "Consistency" below).

### TypeScript

- Strict mode always on (`"strict": true` in `tsconfig.json`), no exceptions.
- Named exports only. No default exports, anywhere — not for components, not
  for utils, not for pages/routes when the framework allows an alternative.
  See `typescript-conventions.md` for the Next.js page/route exception.
- No `any`. Use `unknown` + narrowing, a generic, or a proper interface.
  See `typescript-conventions.md` for the escape hatch when truly needed.
- Prefer `interface` over `type` for object shapes; use `type` for unions,
  tuples, and primitives.
- Use `T[]`, not `Array<T>`, for simple element types.
- Path aliases (`@/features/*`, `@/shared/*`, etc.) over deep relative imports
  (`../../../../`).

### Structure

- All component files must use `kebab-case.tsx` naming convention. Do not use PascalCase or camelCase for component files.
- Feature/domain folders, not type-based folders, at the top level.
- A `shared/` (or `common/`) folder for truly cross-cutting code only —
  if two+ features need it, it graduates to `shared/`, not the other way
  around.
- One-way dependency rule: `features/*` may import from `shared/*`, never the
  reverse, and one feature must not deep-import another feature's internals
  (only its explicit public exports, if any cross-feature use is even
  needed — prefer composing at the app/route level instead).

### Tooling

- ESLint with `@typescript-eslint`, flat config (`eslint.config.js` / `.mjs`),
  `eslint-config-prettier` to disable formatting-conflicting rules.
- Prettier as the single source of truth for formatting — ESLint does not
  format, Prettier does.
- No Husky, no lint-staged — the user manages that separately.

### Styling & state (per project preferences already established)

- **Tailwind CSS v4+** for styling — utility-first, CSS-first config (no
  `tailwind.config.js` required), no ad-hoc CSS files unless for something
  Tailwind genuinely can't express. Details and conventions in
  `state-and-styling.md`.
- **shadcn/ui** for the base component layer — copied into
  `shared/components/ui/` and owned/customized by the project, not consumed
  as an opaque npm dependency. Details in `state-and-styling.md`.
- **Zustand** for state that needs to live outside component trees — one
  store per domain/feature, not one giant global store. Details in
  `state-and-styling.md`.

## Consistency

If the user already has an established, consistent pattern in their codebase
that differs from this skill (e.g. they already use `type` everywhere instead
of `interface`), follow their existing convention for that codebase rather
than forcing a rewrite — but still apply this skill's rules for anything new
in a project that has no established convention yet, and mention the
discrepancy so the user can decide whether to standardize.
