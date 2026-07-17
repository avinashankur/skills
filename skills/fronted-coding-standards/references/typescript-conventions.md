# TypeScript Conventions

Adapted and condensed from the
[Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html),
narrowed to what matters most for enterprise app code (as opposed to library/
compiler-author concerns). Apply these by default; only deviate when the
existing codebase already has a different, consistent convention.

## Contents

- [Exports & imports](#exports--imports)
- [Types](#types)
- [`any` and `unknown`](#any-and-unknown)
- [Classes & functions](#classes--functions)
- [Naming](#naming)
- [Control flow & errors](#control-flow--errors)
- [Comments](#comments)
- [React/TSX-specific additions](#reacttsx-specific-additions)

## Exports & imports

- **Named exports only.** Never use `export default`. Default exports allow
  the importer to rename freely, which erodes a codebase's ability to
  grep/refactor reliably, and they encourage dumping unrelated things behind
  one export.
  - **Next.js exception**: files the framework requires to have a default
    export (`page.tsx`, `layout.tsx`, `loading.tsx`, `route.ts` handlers,
    `middleware.ts`) may use one, because the framework, not your own code,
    is the consumer. Everything else — components, hooks, utils, stores —
    uses named exports.
- Prefer relative imports (`./foo`, `../shared/x`) for files within the same
  logical module, and path aliases (`@/shared/x`) across module boundaries.
  Avoid long relative chains (`../../../../x`) — that's a sign the file is
  either misplaced or the import should go through the module's public
  `index.ts`.
- Use `import type { Foo } from './foo'` when importing only for type
  positions; keep it as a regular import when the symbol is also used as a
  value.
- Don't create "container" objects purely to namespace unrelated constants or
  functions (e.g. a class with only `static` members). Export the constants
  and functions individually instead.
- Minimize what a module exports. Only export what other modules actually
  need — a smaller public surface is easier to refactor safely.

## Types

- Prefer `interface` for object shapes; use `type` for unions, tuples,
  mapped/conditional types, and primitive aliases.
- Use the `T[]` / `readonly T[]` shorthand for simple element types rather
  than `Array<T>` / `ReadonlyArray<T>`. Reserve the longer generic form for
  more complex element types (unions, object literals).
- Let the compiler infer trivial types (`const x = 15;`, `const name = 'a';`)
  — don't annotate what's already obvious from the initializer. Do annotate
  when the inferred type would be too wide (e.g. an empty array/`Map`/`Set`)
  or when the expression is complex enough that the type isn't obvious at a
  glance.
- Mark class properties `readonly` whenever they're never reassigned outside
  the constructor.
- Prefer optional properties (`field?: T`) over `field: T | undefined` — they
  behave differently when constructing/calling (optional fields can be
  omitted entirely).
- Type aliases should not themselves include `| null` or `| undefined` —
  add the nullability at the point of use, not baked into the alias, so it's
  clear exactly where a value can be absent.
- Avoid deeply clever mapped/conditional types in app code. A little
  duplication (e.g. spelling out an interface instead of a `Pick<>` chain) is
  usually cheaper long-term than a type expression the next reader has to
  mentally evaluate.
- Type assertions (`x as Foo`) and non-null assertions (`y!`) are last
  resorts, not conveniences — they silence the compiler without adding a
  runtime check. Prefer narrowing (`if (x instanceof Foo)`, `if (y)`). If an
  assertion truly is safe, leave a comment explaining why.
- Never use `@ts-ignore`, `@ts-expect-error`, or `@ts-nocheck` to make a red
  squiggle go away — fix the underlying type issue, or use a narrow, commented
  assertion instead.

## `any` and `unknown`

- Avoid `any`. Reach for one of, in order of preference:
  1. A specific interface/type for the shape you actually have.
  2. A generic (`function f<T>(x: T)`), if the function is meant to work
     across types.
  3. `unknown`, when the value's shape genuinely isn't known yet — it forces
     narrowing before use, unlike `any`.
- If `any` is truly unavoidable (e.g. mocking a complex service in a test),
  add a short comment explaining why, so a reviewer doesn't flag it as an
  oversight.
- Avoid the `{}` type (means "anything non-nullish") — use `unknown` for
  opaque values, `Record<string, T>` for dictionary-like objects, or `object`
  when you specifically want to exclude primitives.

## Classes & functions

- Use `const`/`let`, never `var`. Default to `const`.
- One variable per `let`/`const` statement.
- Always use `===`/`!==`. The only accepted exception is `== null` to check
  for both `null` and `undefined` in one comparison.
- Use parameter properties to avoid boilerplate constructor assignment:
  `constructor(private readonly service: FooService) {}` instead of manually
  declaring the field and assigning it in the body.
- Don't use TypeScript's `#private` fields; use the `private` keyword
  instead — it's sufficient for static analysis and avoids downlevel-emit
  cost.
- Never use `this` inside a `static` method — it creates surprising behavior
  around inheritance. Prefer module-level functions over private static
  methods where reasonable.
- Prefer function declarations for named, top-level functions; use arrow
  functions for callbacks, and for cases needing lexical `this` or an
  explicit function-type annotation.
- Pass an explicit arrow function to callbacks rather than a bare named
  function reference, unless you're certain of the callback's exact call
  signature (classic footgun: `['1','2'].map(parseInt)`).
- Always throw `Error` (or an `Error` subclass), never a string/plain object
  — otherwise stack traces are lost and debugging gets much harder.

## Naming

| Style            | Use for                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `UpperCamelCase` | classes, interfaces, types, enums, type parameters, React components |
| `lowerCamelCase` | variables, parameters, functions, methods, properties, hooks         |
| `CONSTANT_CASE`  | module-level constants, enum values                                  |

- Names must be descriptive; don't abbreviate by dropping internal letters
  (`cstmrId` → `customerId`). Short names (`i`, `x`) are fine only for
  variables scoped to a handful of lines.
- Treat acronyms as words in camelCase: `loadHttpUrl`, not `loadHTTPURL`.
- No leading/trailing underscores for "private" — use the `private` keyword
  instead, and no `opt_` prefixes for optional params — use `?`.
- Don't decorate interface names with `I` (`IUser`) — name the interface for
  what it represents, and only add a qualifier when it genuinely
  distinguishes it from a related class (e.g. `User` the domain object vs.
  `UserRecord` the storage shape).

## Control flow & errors

- Braces are required for every `if`/`for`/`while` body, even single
  statements — the only exception is a single-line `if` with no `else`.
- Don't assign inside a condition (`if (x = f())`) unless intentional, and
  if so, wrap it in an extra set of parens to signal that it's deliberate.
- `switch` statements must always include a `default` case, and every
  non-empty `case` must terminate (`break`/`return`/`throw`) — no
  fallthrough except for grouped empty cases.
- Prefer `for...of` for iterating arrays; reserve manual index loops for
  when the index itself is actually needed.
- Keep `try` blocks focused — only the statements that can actually throw
  belong inside; do the rest outside so it's clear what's being guarded.
- Don't leave empty `catch` blocks silently — if truly no action is needed,
  say why in a comment.

## Comments

- Use `/** JSDoc */` for anything a consumer of the code should read
  (exported functions, components, hooks, types); use `//` for
  implementation notes meant only for maintainers of that file.
- Document all top-level exports — what they do and any non-obvious
  behavior/edge cases. Don't just restate the name in prose.
- Mark deprecated APIs with `@deprecated` and a one-line pointer to the
  replacement.

## React/TSX-specific additions

These extend the above for component code specifically:

- Component functions use `UpperCamelCase` and are declared with named
  function declarations (`export function UserCard(props: UserCardProps) {}`),
  not default-exported arrow functions.
- Props are typed with an `interface` named `<Component>Props`, defined
  directly above the component, not inlined for anything beyond 1–2 trivial
  fields.
- Don't use `React.FC` — it adds an implicit `children` prop even for
  components that don't accept one, and return-type inference typically does
  the job just as well.
- Custom hooks are named `useX`, live in `hooks/`, and follow the same
  named-export, no-`any` rules as everything else.
