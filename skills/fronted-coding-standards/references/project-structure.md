# Project Structure — Feature-Based / Domain-Driven

This is the folder architecture to use for both Vite and Next.js projects.
The core idea: **organize by domain/feature first, by file-type second.**

## Contents

- [Core principles](#core-principles)
- [Vite app structure](#vite-app-structure)
- [Next.js (App Router) structure](#nextjs-app-router-structure)
- [Anatomy of a feature module](#anatomy-of-a-feature-module)
- [Module boundary rules](#module-boundary-rules)
- [Path aliases](#path-aliases)
- [When to promote something to `shared/`](#when-to-promote-something-to-shared)

## Core principles

1. **Top-level folders are domains/features**, not file types. You should be
   able to look at the top level of `features/` (or `modules/`) and know what
   the product _does_, not just what kind of files exist.
2. **Each feature is a vertical slice**: its own components, hooks, api calls,
   types, and (if needed) store — colocated, not scattered across
   `components/`, `hooks/`, `types/` root folders.
3. **`shared/`** holds only code used by two or more features (or generic
   infra). It is not a dumping ground for "things I wasn't sure where to put".
4. **Barrel files (`index.ts`) at feature boundaries only**, to define the
   feature's public surface. Don't add barrel files inside every subfolder —
   that just adds indirection.

## Vite app structure

```
my-app/
├── public/
├── src/
│   ├── app/                      # App shell: root component, providers, router
│   │   ├── App.tsx
│   │   ├── providers.tsx         # Wraps app in QueryClient, ThemeProvider, etc.
│   │   └── router.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── LoginForm.test.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── api/
│   │   │   │   └── auth.api.ts
│   │   │   ├── store/
│   │   │   │   └── auth.store.ts   # Zustand store scoped to this feature
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   └── index.ts            # Public exports for this feature only
│   │   ├── dashboard/
│   │   │   └── ... (same shape)
│   │   └── billing/
│   │       └── ... (same shape)
│   ├── shared/
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn/ui primitives (Button, Dialog, Input...)
│   │   │   └── ...                 # Other hand-rolled generic components
│   │   ├── hooks/                 # useDebounce, useMediaQuery, etc.
│   │   ├── lib/                   # api client instance, query client, cn() helper, etc.
│   │   ├── types/                 # Cross-cutting types (e.g. Pagination<T>)
│   │   └── utils/                 # Pure helper functions
│   ├── config/
│   │   ├── env.ts                 # Typed, validated env var access
│   │   └── constants.ts
│   ├── styles/
│   │   └── globals.css            # Tailwind v4 @import + @theme only
│   ├── main.tsx
│   └── vite-env.d.ts
├── eslint.config.js
├── .prettierrc.json
├── tsconfig.json
├── vite.config.ts
└── package.json
```

Notes:

- `app/` is the composition root — it's the only place allowed to import from
  multiple features to wire them together (e.g. the router referencing each
  feature's route components).
- Routing: colocate route-level components inside the feature
  (`features/dashboard/components/DashboardPage.tsx`), and only reference
  them from `app/router.tsx`.

## Next.js (App Router) structure

Next.js forces routing structure into `app/`, so the feature-based
architecture lives in `src/` alongside it, and route files stay as thin as
possible — they import from features rather than containing logic.

```
my-app/
├── public/
├── src/
│   ├── app/                        # Next.js routing (framework-owned)
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Thin: imports from features/home
│   │   ├── globals.css             # Tailwind v4 @import + @theme only
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # Thin: renders <LoginForm /> from features/auth
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   └── api/
│   │       └── auth/
│   │           └── route.ts        # Thin: delegates to features/auth/api
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   └── LoginForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── actions/
│   │   │   │   └── auth.actions.ts  # Server Actions for this feature
│   │   │   ├── api/
│   │   │   │   └── auth.service.ts  # Shared logic used by route.ts and actions
│   │   │   ├── store/
│   │   │   │   └── auth.store.ts
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   └── index.ts
│   │   └── dashboard/
│   │       └── ... (same shape)
│   ├── shared/
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui primitives (Button, Dialog, Input...)
│   │   │   └── ...
│   │   ├── hooks/
│   │   ├── lib/                   # api client, query client, cn() helper, etc.
│   │   ├── types/
│   │   └── utils/
│   └── config/
│       ├── env.ts
│       └── constants.ts
├── eslint.config.mjs
├── .prettierrc.json
├── tsconfig.json
├── next.config.ts
└── package.json
```

Notes:

- **`app/` stays thin.** Route files (`page.tsx`, `layout.tsx`, `route.ts`)
  should mostly import and compose from `features/*`. If a `page.tsx` grows
  past a simple data-fetch + render, the logic belongs in the feature.
- **Server Components by default.** Only add `'use client'` to the leaf
  components that actually need interactivity/state — push it down as far as
  possible rather than marking whole subtrees client.
- **Server Actions** live inside the owning feature (`features/x/actions/`),
  not in `app/`.
- Route groups (`(auth)`) are used for organization/layout sharing, not as a
  substitute for the feature boundary — the actual logic still lives in
  `features/auth`.

## Anatomy of a feature module

Every feature folder follows the same internal shape so any engineer can
navigate any feature without relearning conventions:

```
features/<feature-name>/
├── components/    # Feature-specific UI, not reused elsewhere
├── hooks/         # Feature-specific hooks
├── api/           # Data-fetching / server-communication for this feature
├── actions/       # (Next.js only) Server Actions
├── store/         # Zustand store(s) scoped to this feature, if needed
├── types/         # Types/interfaces specific to this feature
├── utils/         # Feature-local pure helpers (promote to shared/ if reused)
└── index.ts       # Public surface: only what other parts of the app may import
```

Not every feature needs every folder — a simple feature might just have
`components/` and `index.ts`. Don't create empty folders "for consistency".

## Module boundary rules

1. **`shared/` → anything.** Shared code has no knowledge of features and
   must never import from `features/*`.
2. **`features/*` → `shared/*` and `config/*`.** Freely allowed.
3. **`features/a` → `features/b`: avoid.** If feature A needs something from
   feature B, prefer one of:
   - Promote the shared piece to `shared/`.
   - Compose them together at the `app/` level instead of cross-importing.
   - If truly unavoidable, import only from `features/b/index.ts` (the
     public surface), never reach into `features/b/components/Internal.tsx`
     directly.
4. **`app/` → `features/*`.** This is the one place multi-feature imports are
   expected — it's the composition root.
5. Enforce this with `eslint-plugin-boundaries` or `import/no-restricted-paths`
   in the ESLint config (see `eslint-prettier-config.md`) rather than relying
   on code review alone — for enterprise codebases, an automated check is
   worth the setup cost.

## Path aliases

Configure TypeScript path aliases so imports read by domain, not by relative
depth:

```jsonc
// tsconfig.json (compilerOptions.paths)
{
  "@/*": ["./src/*"],
  "@/features/*": ["./src/features/*"],
  "@/shared/*": ["./src/shared/*"],
  "@/config/*": ["./src/config/*"],
}
```

```ts
// Good
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/Button";

// Avoid
import { useAuth } from "../../../features/auth/hooks/useAuth";
```

## When to promote something to `shared/`

A piece of code (component, hook, util, type) belongs in `shared/` when:

- **Two or more features** need it, _or_
- It has **zero domain knowledge** — it would make sense in a completely
  different product (e.g. a `Modal` component, a `useDebounce` hook, a
  `formatCurrency` util).

Don't promote something preemptively "in case it's needed later" — that's how
`shared/` becomes a junk drawer again. Start it in the feature; move it out
the moment a second feature needs it.
