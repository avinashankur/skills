# DESIGN.md spec — condensed reference

Source of truth: https://github.com/google-labs-code/design.md/blob/main/docs/spec.md
(alpha version at time of writing — re-fetch if something here seems off).

## File shape

```
---
<YAML frontmatter: design tokens>
---
<Markdown body: ## sections, in the fixed order below>
```

## Frontmatter schema

```yaml
version: alpha # optional
name: <string> # required
description: <string> # optional
omitted: [<string>] # optional — list of sections intentionally left out
colors:
  <token-name>: <Color>
typography:
  <token-name>:
    fontFamily: <string>
    fontSize: <Dimension>
    fontWeight: <number> # bare or quoted, e.g. 600 or "600"
    lineHeight: <Dimension|number> # unitless number = multiplier of fontSize
    letterSpacing: <Dimension>
    fontFeature: <string> # optional, font-feature-settings
    fontVariation: <string> # optional, font-variation-settings
rounded:
  <scale-level>: <Dimension>
spacing:
  <scale-level>: <Dimension|number>
components:
  <component-name>:
    backgroundColor: <Color>
    textColor: <Color>
    typography: <Typography|token ref>
    rounded: <Dimension|token ref>
    padding: <Dimension>
    size: <Dimension>
    height: <Dimension>
    width: <Dimension>
```

- **Color**: any valid CSS color string (hex, named, rgb/hsl/hwb, oklch/oklab/lab/lch,
  color-mix). Hex is the recommended default for simplicity.
- **Dimension**: string with unit suffix — px, em, or rem only.
- **Token reference**: `{path.to.token}` — must point to a primitive value except
  inside `components`, where references to composite values like `{typography.label-md}`
  are allowed.
- `<scale-level>` is any descriptive key (commonly xs/sm/md/lg/xl/full) — not fixed.

## Section order (h2 headings, omit what you have no evidence for)

1. **Overview** (aka "Brand & Style") — holistic personality/emotional-response
   description; foundational context for decisions with no explicit token/rule.
2. **Colors** — prose naming each palette role (primary/secondary/tertiary/neutral is
   the common convention) with the hex and why it's used that way.
3. **Typography** — prose per family/role (headline vs. body vs. label/mono), why.
4. **Layout** (aka "Layout & Spacing") — grid model, spacing rhythm/scale rationale.
5. **Elevation & Depth** — how hierarchy is conveyed: shadows, or flat-design
   alternatives (borders, contrast, tonal layers).
6. **Shapes** — corner-radius language and what it signals (sharp = engineered,
   rounded = soft/modern, etc).
7. **Components** — per-component guidance: buttons, chips, lists, tooltips,
   checkboxes, radio buttons, input fields are the common set; add domain-specific
   ones if evidenced.
8. **Do's and Don'ts** — a short bullet list of concrete guardrails, e.g. "Do use the
   primary color only for the single most important action per screen."

Duplicate `##` headings are a spec violation (the linter rejects the file). Unknown
section headings, unknown token names, etc. are fine to include — spec consumers
must preserve/accept unknown content rather than error, but stick to the standard
names above when the value maps cleanly onto them.

## Recommended (non-normative) token names

- Colors: `primary`, `secondary`, `tertiary`, `neutral`, `surface`, `on-surface`, `error`
- Typography: `headline-display`, `headline-lg`, `headline-md`, `body-lg`, `body-md`,
  `body-sm`, `label-lg`, `label-md`, `label-sm`
- Rounded: `none`, `sm`, `md`, `lg`, `xl`, `full`

These are conventions, not requirements — match what the source site's own naming/
structure suggests where it's clearer than the generic scheme.

## Minimal worked example

```yaml
---
name: Heritage
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  tertiary: "#B8422E"
  neutral: "#F7F5F2"
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 3rem
  body-md:
    fontFamily: Public Sans
    fontSize: 1rem
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 0.75rem
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 8px
  md: 16px
---

## Overview

Architectural Minimalism meets Journalistic Gravitas. The UI evokes a premium matte
finish — a high-end broadsheet or contemporary gallery.

## Colors

The palette is rooted in high-contrast neutrals and a single accent color.
```
