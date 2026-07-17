# State (Zustand), Styling (Tailwind v4), & Components (shadcn/ui)

## Zustand

### One store per domain/feature, not one global store

Each feature that needs state outside its component tree gets its own store
in `features/<feature>/store/<feature>.store.ts`. Avoid a single root store
that every feature reads/writes into — it recreates the "everything coupled
to everything" problem this whole architecture is trying to avoid.

Promote a store to `shared/store/` only if it's genuinely cross-cutting
(e.g. a `uiStore` for global toasts/modals, or a `sessionStore` two+ features
need).

### Store shape

```ts
// features/auth/store/auth.store.ts
import { create } from "zustand";
import type { User } from "../types/auth.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  logout: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

Conventions:

- Separate the **state** interface from the **actions** interface, then
  combine them (`AuthState & AuthActions`) — keeps the state shape readable
  on its own, e.g. for serialization or devtools inspection.
- Name the hook `use<Feature>Store`, export it as a named export (no
  defaults, per `typescript-conventions.md`).
- Actions live inside the store, not as free functions that call `.setState`
  from outside — keeps all mutation logic in one place.

### Selecting state (avoid unnecessary re-renders)

Select only the slice a component needs rather than destructuring the whole
store, so unrelated state changes don't trigger a re-render:

```ts
// Good: component only re-renders when `user` changes
const user = useAuthStore((state) => state.user);

// Avoid: re-renders on every store change, even unrelated ones
const { user } = useAuthStore();
```

For multiple fields, use a shallow-equality selector (`useShallow` from
`zustand/react/shallow`) rather than destructuring the full store:

```ts
import { useShallow } from "zustand/react/shallow";

const { user, logout } = useAuthStore(
  useShallow((state) => ({ user: state.user, logout: state.logout })),
);
```

### Middleware

Reach for `persist` (localStorage/sessionStorage) and `devtools` middleware
per-store, only when actually needed — don't wrap every store in both by
default:

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      /* ...state and actions... */
    }),
    { name: "auth-storage" },
  ),
);
```

### Server state vs. client state

Zustand is for **client state** (UI state, auth session, form wizards,
feature flags toggled client-side). Don't use it for **server state**
(fetched data, cache, pagination) — that belongs in a dedicated data-fetching
layer (e.g. TanStack Query / SWR) which already handles caching, refetching,
and invalidation better than a hand-rolled store would.

## Tailwind CSS (v4+)

This skill standardizes on **Tailwind v4 or later**. v4 is CSS-first: there
is no `tailwind.config.js`/`.ts` by default, no PostCSS `postcss.config.js`
boilerplate to hand-write, and theming happens via the `@theme` directive
directly in CSS. Don't scaffold a v3-style `tailwind.config.ts` — it's not
required and mixing v3 and v4 conventions in the same project causes
confusion.

### Setup

**Vite**: install the dedicated Vite plugin instead of configuring PostCSS
by hand:

```bash
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

**Next.js**: Tailwind v4 still goes through PostCSS in Next.js — install the
PostCSS plugin package:

```bash
npm install tailwindcss @tailwindcss/postcss
```

```js
// postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**Both**: `globals.css` is the entire config surface for the common case —
a single import plus theme tokens:

```css
/* src/styles/globals.css (Vite) or src/app/globals.css (Next.js) */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.55 0.2 260);
  --font-sans: "Inter", sans-serif;
  --radius-md: 0.5rem;
}
```

- Keep `globals.css` limited to the `@import` line, the `@theme` block for
  design tokens (colors, spacing, radii, fonts), and genuinely global
  base-layer tweaks (e.g. `@font-face`). Don't accumulate ad-hoc utility
  classes or component styles there.
- Centralize design tokens in `@theme` rather than hardcoding hex values or
  magic numbers in `className` strings — tokens defined this way
  automatically generate corresponding utility classes (e.g.
  `--color-primary` → `bg-primary`, `text-primary`).
- If a token needs to vary at runtime (e.g. light/dark mode, per-tenant
  theming) define it as a plain CSS custom property outside `@theme` and
  reference it, or use `@theme` alongside a `.dark { --color-primary: ... }`
  override block — v4's theme variables are just CSS variables under the
  hood, so standard CSS overriding techniques apply.
- A `tailwind.config.ts` is only needed for advanced cases v4's CSS-first
  API doesn't cover yet (e.g. some third-party plugins) — add one
  deliberately when a real need comes up, not by default.

### Component conventions

- Compose utility classes directly in JSX for one-off styling. Once a
  combination of classes is repeated across 3+ places, extract it — either
  as a small wrapper component (preferred, since it also encapsulates
  behavior) or a `class-variance-authority` (`cva`) variant definition for
  components with multiple visual variants (size, intent, etc.).
- Use `cva` for components with a real variant matrix (buttons, badges,
  alerts) instead of chains of ternaries inside `className`:

  ```ts
  import { cva, type VariantProps } from 'class-variance-authority';

  const buttonVariants = cva('rounded-md font-medium transition-colors', {
    variants: {
      intent: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
      },
    },
    defaultVariants: { intent: 'primary', size: 'md' },
  });

  interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
      VariantProps<typeof buttonVariants> {}

  export function Button({ intent, size, className, ...props }: ButtonProps) {
    return (
      <button className={buttonVariants({ intent, size, className })} {...props} />
    );
  }
  ```

- Use `clsx` (or `tailwind-merge`'s `twMerge` when className conflicts need
  resolving, e.g. a consumer overriding a default padding) for conditional
  classes rather than manual string concatenation/ternaries.
- Let `prettier-plugin-tailwindcss` (configured in
  `eslint-prettier-config.md`) own class ordering — don't hand-arrange
  utility classes.
- In practice, the `cva` pattern above is exactly what shadcn/ui generates
  for you — see the shadcn/ui section below before hand-rolling a variant
  component that shadcn already provides (Button, Badge, Alert, etc.).

### Where Tailwind isn't enough

For the rare case Tailwind's utilities genuinely can't express something
(complex keyframe animations, print-specific styles), colocate a scoped CSS
Module (`Component.module.css`) next to the component rather than adding to
`globals.css`.

## shadcn/ui

shadcn/ui is the base component layer for both project types. Unlike a
normal npm dependency, its CLI **copies component source into your repo** —
you own and can freely edit the code, rather than depending on an opaque
package. This fits the module-boundary model directly: shadcn components are
generic, cross-cutting UI, so they belong in `shared/components/ui/`.

### Setup

```bash
npx shadcn@latest init
```

The init flow (both Vite and Next.js, v4-aware) will:

- Detect Tailwind v4 and configure the CSS-variable-based theme in
  `globals.css` under `@theme inline` (mapping shadcn's semantic tokens —
  `background`, `foreground`, `primary`, `border`, etc. — to CSS variables
  it defines).
- Add a `components.json` at the project root recording where components,
  utils, and the Tailwind CSS file live.
- Add the `cn()` helper (a thin `clsx` + `tailwind-merge` wrapper) to
  `shared/lib/utils.ts` — use `cn()` anywhere you need to conditionally
  merge/override Tailwind classes, including in non-shadcn components.

When prompted for paths during `init` (or by editing `components.json`
after), point shadcn at this skill's structure:

```json
{
  "aliases": {
    "components": "@/shared/components",
    "ui": "@/shared/components/ui",
    "utils": "@/shared/lib/utils",
    "hooks": "@/shared/hooks"
  }
}
```

### Adding components

```bash
npx shadcn@latest add button dialog form input
```

Each command adds the component source directly into
`shared/components/ui/`. Do not hand-edit generated files to add unrelated
project-specific behavior — instead, wrap a shadcn primitive in a feature or
shared component if you need to extend it, so a future `shadcn add` (to pick
up upstream fixes) doesn't clobber custom logic:

```tsx
// shared/components/SubmitButton.tsx — wraps the shadcn Button
import { Button, type ButtonProps } from "@/shared/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export function SubmitButton({
  isLoading,
  children,
  ...props
}: SubmitButtonProps) {
  return (
    <Button disabled={isLoading} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
```

Direct edits to a generated file _are_ fine for genuine design-system
customization (adjusting the `cva` variants themselves, e.g. adding a new
`intent` to the Button) — that's the whole point of owning the source. The
distinction is: edit the file for changes to the primitive itself; wrap it
for one-off, feature-specific behavior.

### Forms

Use shadcn's `Form` component (a thin wrapper around `react-hook-form`) with
`zod` for schema validation — this is the expected pairing in the shadcn
ecosystem and keeps validation logic declarative and colocated with the
form's type:

```bash
npx shadcn@latest add form
npm install react-hook-form zod @hookform/resolvers
```

Feature-specific forms live in `features/<feature>/components/`, importing
the shared `Form`, `FormField`, etc. primitives from `shared/components/ui/`.
