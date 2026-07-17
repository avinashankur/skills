# ESLint + Prettier Setup

Both project types use ESLint's flat config format (`eslint.config.js` /
`.mjs`) with `typescript-eslint`, plus Prettier as the single source of truth
for formatting. **No Husky, no lint-staged** — that's handled by the user's
separate skill; don't wire it up here.

## Shared principle: ESLint lints, Prettier formats

Don't let ESLint own formatting rules (indentation, quotes, line length). Use
`eslint-config-prettier` to turn off every ESLint rule that would conflict
with Prettier, so the two tools never disagree.

## Packages (both project types)

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-config-prettier prettier
```

Add for import ordering / boundary enforcement (recommended for enterprise
scale — see `project-structure.md`'s module boundary rules):

```bash
npm install -D eslint-plugin-import eslint-import-resolver-typescript eslint-plugin-boundaries
```

## Prettier config (`.prettierrc.json`) — same for both

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

`prettier-plugin-tailwindcss` auto-sorts Tailwind utility classes into a
consistent order — install it alongside Prettier when Tailwind is in use:

```bash
npm install -D prettier-plugin-tailwindcss
```

`.prettierignore`:

```
dist
.next
node_modules
coverage
```

## Vite: `eslint.config.js`

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "error",
      // Named exports only — see typescript-conventions.md
      "import/no-default-export": "error",
    },
  },
  eslintConfigPrettier,
);
```

Packages this config needs beyond the shared list:

```bash
npm install -D eslint-plugin-react-hooks eslint-plugin-react-refresh
```

## Next.js: `eslint.config.mjs`

Next.js's own config (`eslint-config-next`) doesn't yet ship a native flat
config that works cleanly with type-checked rules, so bridge it in with
`FlatCompat` alongside `typescript-eslint`:

```js
import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "url";
import path from "path";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default tseslint.config(
  { ignores: [".next", "node_modules", "dist"] },
  js.configs.recommended,
  ...compat.extends("next/core-web-vitals"),
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  eslintConfigPrettier,
);
```

Note: `page.tsx`, `layout.tsx`, `loading.tsx`, `route.ts`, and
`middleware.ts` are exempt from the no-default-export rule since Next.js
requires default exports there — scope the rule with an `overrides`-style
block if you add `import/no-default-export`:

```js
{
  files: ['src/features/**/*.{ts,tsx}', 'src/shared/**/*.{ts,tsx}'],
  rules: { 'import/no-default-export': 'error' },
},
```

## Enforcing module boundaries (both project types)

To make the one-way `shared/` → `features/*` → `app/` dependency rule (see
`project-structure.md`) a lint error instead of a code-review reminder:

```js
import boundaries from 'eslint-plugin-boundaries';

// inside the config array:
{
  plugins: { boundaries },
  settings: {
    'boundaries/elements': [
      { type: 'shared', pattern: 'src/shared/*' },
      { type: 'features', pattern: 'src/features/*', capture: ['feature'] },
      { type: 'app', pattern: 'src/app/*' },
    ],
  },
  rules: {
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          { from: 'shared', allow: ['shared'] },
          { from: 'features', allow: ['shared', 'features'] },
          { from: 'app', allow: ['shared', 'features', 'app'] },
        ],
      },
    ],
  },
},
```

Tighten the `features → features` rule further (disallow entirely, or allow
only via `index.ts`) once the team agrees on how strict to be — starting
permissive and tightening is easier than the reverse.

## `package.json` scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit"
  }
}
```
