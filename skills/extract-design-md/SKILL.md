---
name: extract-design-md
description: Extract a website's design system (colors, typography, spacing, radii, components) into a DESIGN.md file following Google Labs' official open spec (github.com/google-labs-code/design.md). Use this whenever the user wants to reverse-engineer a site's visual identity into a portable, agent-readable spec — triggers include "make a DESIGN.md from <site>", "extract the design system/tokens from <url>", "get the design tokens off <site>", "I want my UI to look like <site>", "clone the design of <site>", or any request to capture a website's colors/fonts/spacing/style into a reusable file. Also use when asked to update, regenerate, or lint an existing DESIGN.md, or to explain/apply the DESIGN.md format itself.
---

# Extract DESIGN.md

Turn a website into a `DESIGN.md` file: YAML front-matter design tokens (colors,
typography, spacing, rounded corners, components) plus markdown prose, in the exact
section order the [official spec](https://github.com/google-labs-code/design.md)
requires. The output is meant to be handed to a coding agent so it can build new UI
that matches the source site.

## Environment constraint — read this first

This environment has no browser/rendering tool and `web_fetch` returns **cleaned
content, not raw HTML** — no `<style>` blocks, no linked CSS, no `<link>` tags, and
images can't be fetched or viewed at all. What survives extraction is: visible text,
meta tags (`theme-color`, `og:*`, `twitter:*`, `description`), and link/image _URLs_
as plain strings. `bash_tool`'s network is also locked to package registries and code
hosts (npm, pypi, github, crates) — it cannot reach an arbitrary live site directly.

This means **you cannot read a live site's actual CSS in this environment.** There
are two real paths, tried in order:

- **Path A — source available (preferred, high confidence):** if the site's frontend
  code is public on GitHub, clone it and read the real stylesheet/token/config files.
  This is source-of-truth, better than scraped computed styles would be.
- **Path B — no public source (fallback, low confidence):** extract only what
  survives `web_fetch` — theme-color meta, and any color/font/spacing language
  mentioned in the page's own copy. This yields a thin file. Say so plainly and omit
  every section you don't have real evidence for.

Tell the user which path you're on and why, right when you start — this materially
changes how much they should trust the output.

## Workflow

### 1. Confirm the target and look for a public repo

- Need a public, reachable URL. If the user names a site without a URL, resolve the
  obvious one; if ambiguous, ask.
- `web_fetch` the homepage. Scan the extracted content for a GitHub link (nav/footer
  "GitHub" link, `og:url` pointing at a repo, "open source" mentions). If none is
  obvious, `web_search "<site name> github repo"`.
- If the site requires login or `web_fetch` can't reach it at all, say so and stop —
  don't fabricate a design system from nothing.

### 2A. Path A — clone and read source

- `git clone --depth 1 <repo-url>` via `bash_tool` into `/home/claude/` (github.com and
  raw.githubusercontent.com are reachable).
- Locate the actual styling source. Check, roughly in this priority order:
  - `tailwind.config.*` (theme.colors, theme.fontFamily, theme.borderRadius, theme.spacing)
  - `globals.css` / `app.css` / any file with a `:root { --... }` block or `@theme` block
  - A dedicated tokens file (`tokens.json`, `theme.ts`, `design-tokens.*`)
  - Component source for buttons/cards/inputs (radius, padding, color classes actually
    used, not just what's defined)
- Large monorepos: don't clone blindly and don't read every file. Narrow with
  `find`/`grep` for the patterns above before opening files. If the repo doesn't
  actually contain the marketing/docs site's own styling (e.g. it's a library repo
  and the live site is built separately, unstyled by this code), treat it as if no
  source was found and drop to Path B.
- Note whether values are literal (`#1A1C1E`) or resolved through a framework's
  default scale (e.g. bare Tailwind `slate-900` with no override) — the latter is a
  customization signal, not a token to invent (see Common pitfalls).

### 2B. Path B — thin extraction from web_fetch

- Pull what you can from the fetched content: `theme-color` meta value (a real,
  if partial, color signal), any explicit color/font names in body copy ("we use a
  deep charcoal and a single amber accent"), general layout/spacing language if the
  copy describes it.
- Sample 1–2 more pages only if you have real reason to expect different visible
  language (e.g. a pricing page might describe component styling) — don't burn calls
  chasing pages that will only add more prose, no more tokens.
- Do not invent hex values, font names, or spacing scales to fill gaps. A Path B
  DESIGN.md will legitimately have only `name`, maybe one or two `colors` entries,
  and a short Overview section — that's the honest ceiling here, not a failure to fix.

### 3. Detect theme

If dark-mode evidence exists (Path A: a `.dark`/`[data-theme]` block with different
values; Path B: `theme-color` mentioned alongside a `prefers-color-scheme` reference
in copy), note it in prose but still emit a **single** `DESIGN.md` — default to the
light/primary values in frontmatter tokens, mention dark-mode variants in the Colors
section.

### 4. Write DESIGN.md

Follow `references/spec-summary.md` for the exact frontmatter schema and section
order. Non-negotiables from the spec:

- Frontmatter delimited by `---` / `---`, valid YAML, `name` required.
- Section order when present: Overview → Colors → Typography → Layout →
  Elevation & Depth → Shapes → Components → Do's and Don'ts. Omit sections you have no
  evidence for — the spec explicitly allows omission, and on Path B most sections
  should be omitted.
- Every color/typography/rounded/spacing token named in prose should have a
  corresponding token in the frontmatter (and vice versa).
- Use `{path.to.token}` reference syntax in the `components` section instead of
  repeating literal values (e.g. `backgroundColor: "{colors.primary}"`).
- Don't fabricate values you didn't actually find, on either path.
- **Name the main accent color `primary`**, even if the source uses its own name
  internally (e.g. a codebase calling it `brand`). The official linter specifically
  warns when no `primary` is defined ("agent will auto-generate key colors, reducing
  your control") — confirmed by testing. Map the source's own name to `primary` (and
  note the source's internal name in prose if it's useful context), rather than
  preserving the source's naming literally into the frontmatter.
- **Double-check section order before delivering** — Overview, Colors, Typography,
  Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts, with any omitted
  sections simply skipped (not reordered around the gap). This is easy to get wrong
  when writing sections in the order you gathered evidence for them, rather than spec
  order — confirmed by testing (Shapes was drafted before Layout because radius
  evidence was gathered first, and the linter caught it as an ordering error).

### 5. Lint (best-effort)

Try validating with the official linter:

```bash
npx --yes @google/design.md lint <path-to-DESIGN.md>
```

This should work since npm registry domains are reachable here. If it fails for any
reason (network, package not resolvable, timeout), don't block on it — tell the user
linting was skipped and why, and still deliver the file. Don't retry more than once.

### 6. Deliver

Save to `/mnt/user-data/outputs/DESIGN.md` (or a name reflecting the site, e.g.
`DESIGN-linear.md`, if extracting from multiple sites in one conversation) and use
`present_files`. Always state: which path you used (A or B) and why, which
pages/files you actually drew from, lint result, and which sections you omitted for
lack of evidence. On Path B, be explicit that the file is a thin starting point, not
a full extraction.

## Common pitfalls

- **Don't let one accent color bleed everywhere.** If a site uses its accent color
  sparingly (e.g. only on primary CTAs), say so explicitly in Do's and Don'ts.
- **Don't confuse a one-off override with a token.** A value needs to repeat across
  at least 2–3 places (or be an explicit named token in source) before it earns a
  scale-level entry.
- **Framework/library defaults aren't the brand.** If Path A source shows an
  unmodified UI framework or default Tailwind palette with no override, say so — the
  DESIGN.md should reflect actual customization, not restate a framework's stock system.
- **Don't quietly upgrade Path B to look like Path A.** A thin, honest file is more
  useful to the user than a padded one that looks authoritative but is half invented.

## Reference

- `references/spec-summary.md` — condensed DESIGN.md schema and section-by-section
  guidance (load this before writing the frontmatter or prose).
