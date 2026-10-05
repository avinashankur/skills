---
name: fumadocs
description: >
  Write and design beautiful, well-structured documentation using Fumadocs and Fumapress.
  Covers MDX component selection, visual hierarchy, page templates, sidebar config,
  frontmatter conventions, and setup for both Fumadocs (Next.js) and Fumapress (Waku).
  Use this skill whenever the user asks to write, create, add, improve, or redesign
  documentation pages — including "write docs for", "add a docs page", "create a guide",
  "write a spec", "improve the docs", "make the docs look better", "restructure the sidebar",
  or "set up fumadocs / fumapress".
---

# Fumadocs / Fumapress Documentation Authoring Skill

> **Goal**: Produce documentation pages that look polished, are scannable, and make
> correct use of the rich interactive components available in the Fumadocs ecosystem.

---

## 0. Skill File Map

Read these companion files **before writing any docs**:

| File                                   | Purpose                                                                                                                                                                                                                                   |
| :------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `references/components.md`             | Component usage guide — `<Callout>`, `<Tabs>`, `<Steps>`, `<Cards>`, `<Accordions>`, `<Files>`, `<InlineTOC>`, and `<Mermaid>` with props, examples, and when-to-use guidance. **Always cross-check against official docs** before using. |
| `references/setup-fumadocs.md`         | Fumadocs (Next.js) setup guidance — high-level architecture and what to fetch from official docs                                                                                                                                          |
| `references/setup-fumapress.md`        | Fumapress (Waku) setup guidance — high-level architecture and what to fetch from official docs                                                                                                                                            |
| `references/folder-group-root-tabs.md` | Official folder group root tabs pattern (default subject at root `/`) — native `(framework)` folder groups, automatic sidebar scoping, and zero-hack layout                                                                               |
| `references/setup-section-switcher.md` | **(Strictly for Fumapress — may be stale)** Fumapress `press.config.tsx` section switcher workaround. For standard Fumadocs (Next.js), use `references/folder-group-root-tabs.md` instead.                                                |
| `examples/page-templates.md`           | Copy-paste MDX templates for section indexes, guides, specs, concept pages, and API references                                                                                                                                            |

---

## 1. Core Principles

### 1.1 Write for Scannability

- **Lead with a one-paragraph summary** — answer "what is this page?" immediately.
- **Use horizontal rules (`---`)** between major sections to give the eye breathing room.
- Prefer **short paragraphs** (≤3 sentences). Break walls of text with components.
- Every page must have a `title` and `description` in frontmatter. Description appears below the title on the rendered page.

### 1.2 Match Content to the Right Component

> Never default to raw paragraphs or plain markdown lists when a richer component
> exists. The component library is there to make docs **visually excellent**.

| Content Pattern                                       | Correct Component                                                                           | Do NOT Use                                                                 |
| :---------------------------------------------------- | :------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------- |
| **Navigation hub** (section index linking sub-pages)  | `<Cards>` with `<Card>` per sub-page, each with `icon`, `title`, `description`, `href`      | Bulleted link lists                                                        |
| **Warnings / important notes / info**                 | `<Callout type="info\|warn\|error">`                                                        | Bold text or blockquotes                                                   |
| **Step-by-step instructions**                         | `<Steps>` with `<Step>` per numbered step                                                   | Ordered lists `1. 2. 3.`                                                   |
| **Parallel alternatives** (e.g., npm vs pnpm vs yarn) | `<Tabs items={[...]}>` with `<Tab>` per variant                                             | Multiple code blocks stacked                                               |
| **FAQs or collapsible detail**                        | `<Accordions>` with `<Accordion>` per item                                                  | Static paragraphs or Card grids                                            |
| **File / folder structure**                           | `<Files>` with `<Folder>` and `<File>`                                                      | Code-fenced `tree` output                                                  |
| **Architecture / flow diagrams**                      | ` ```mermaid ``` ` fenced code block or `<Mermaid chart="..." />` (requires renderer setup) | ASCII diagrams                                                             |
| **Tabular data, comparisons, API params**             | Markdown `\| table \|` syntax                                                               | Nested lists or cards                                                      |
| **Time & Space Complexities, Variables**              | Inline code `` `O(1)` ``, `` `O(n)` ``, `` `k` ``                                           | Raw LaTeX math `$...$` (renders literal dollar signs without math plugins) |
| **KPIs / metrics / status values**                    | Inline `<code>` with `font-mono tabular-nums`                                               | Plain text numbers                                                         |
| **Long page with many headings**                      | `<InlineTOC>` at the top after intro paragraph                                              | No TOC at all                                                              |

### 1.3 Icon Usage in Cards

Cards on section index pages **should** include an `icon` prop using a Lucide icon component.
Check which icons are registered in the project's MDX component map (typically in
`src/components/mdx.tsx` or equivalent). Only registered icons are available in MDX files.

To use a new icon, add its import to the MDX component map file.

### 1.4 Sidebar Icons: Folders Only (No Single Pages)

> **Icon Rule**: Do **not** assign icons to single pages if nothing is nested inside them. Use sidebar icons strictly on **folders** (via `meta.json`) or section switcher tabs. Single leaf pages must remain text-only in the sidebar for a clean, distraction-free visual hierarchy.

Folders can have sidebar icons via `"icon": "LucideIconName"` in `meta.json`. When
`lucideIconsPlugin()` is configured in the source loader, icons resolve automatically
from the Lucide library — no manual import needed. Use PascalCase names (e.g., `"Compass"`, `"Layers"`).

> [!WARNING]
> If `lucideIconsPlugin()` is **not** enabled (e.g. standard Fumapress), `"icon": "Name"` in `meta.json` passes through as the raw string `"Name"`. In custom layouts, doing `tab.icon ?? <Fallback />` evaluates to the raw string and renders text inside the 16px icon slot, causing the word to overlap the title (e.g. rendering text inside the icon slot, like `"LayeOverview"`). Always guard: `(typeof tab.icon !== "string" && tab.icon) ? tab.icon : <Fallback />`.

### 1.5 Avoid Redundant Section Prefixes (No Stuttering in Subchapter Titles)

> **No Stuttering Rule**: When pages reside inside a section, category, or root tab (e.g., `Authentication`, `Billing`, `Deployment`, `API Reference`), the sidebar hierarchy, breadcrumbs, and section switchers **already provide the context**. Never prefix child page titles with the parent section or folder name.
>
> - **Wrong**: Section `Billing` containing `Billing Overview`, `Billing Webhooks`, `Billing Invoices`.
> - **Right**: Section `Billing` containing `Overview`, `Webhooks`, `Invoices`.
> - **Wrong**: Section `Auth` containing `Auth Quickstart`, `Auth Providers`, `Auth Sessions`.
> - **Right**: Section `Auth` containing `Quickstart`, `Providers`, `Sessions`.

#### Why This Matters:

1. **Sidebar Scannability**: Repeating the category name adds visual noise and forces the user's eye to filter out redundant words on every single row.
2. **Horizontal Space & Truncation**: Sidebars have limited width. Repeating prefixes like `Kubernetes Cluster Architecture` forces meaningful words to truncate as `Kubernetes Clust...`. Using `Cluster Architecture` preserves clarity.
3. **Hierarchy Integrity**: The sidebar and breadcrumbs already establish that `Invoices` is nested under `Billing`. Writing `Billing > Billing Invoices` is redundant stuttering.
4. **Section Index Pages**: The `index.mdx` of any section should typically be titled `Overview` (or `Introduction`), not `[Section Name] Overview`.

---

## 2. Frontmatter Reference

Every `.mdx` file begins with YAML frontmatter inside `---` fences.

```yaml
---
title: Page Title # Required — rendered as <h1>
description: One-line summary # Required — rendered below title, used in OG
full: true # Optional — full-width layout (no TOC sidebar)
---
```

> **Note on Icons**: Do **not** add `icon` to page frontmatter. Icons are reserved exclusively for folders in `meta.json`.

### Key Rules

- `title` ≤ 60 characters. It becomes the `<title>` tag and the sidebar label.
- **Never repeat the parent section name in `title`** (e.g., inside an `auth/` directory, write `title: Overview` or `title: OAuth Setup`, never `title: Auth Overview` or `title: Auth OAuth Setup`).
- `description` ≤ 160 characters. It becomes the meta description and the subtitle.
- Do **not** add a manual `# Title` heading — fumadocs renders the frontmatter title as `<h1>` via `<DocsTitle>`.

---

## 3. Content File & Folder Structure

### 3.1 Directory Layout

All MDX content lives under `content/docs/`. Each folder is a sidebar section.

```
content/docs/
├── index.mdx            # Landing page for /docs
├── meta.json            # Root sidebar ordering
├── <section>/
│   ├── meta.json        # Section sidebar ordering + icon + title
│   ├── index.mdx        # Section overview page
│   ├── page-a.mdx
│   └── page-b.mdx
```

### 3.2 `meta.json` Format

```json
{
  "title": "Section Name",
  "icon": "Compass",
  "pages": ["index", "page-a", "page-b"]
}
```

- `pages` controls sidebar order. Items are filenames **without** `.mdx`.
- Use `"---Label---"` for separator headings in the root `meta.json`.
- Use `"...subfolder"` (three-dot prefix) to auto-expand a subfolder's children inline.

### 3.3 Root `meta.json` Example

```json
{
  "pages": [
    "---Welcome---",
    "index",
    "---Foundation---",
    "getting-started",
    "architecture",
    "---Technical---",
    "...specs",
    "---Reference---",
    "guides"
  ]
}
```

---

## 4. Visual Design Commandments

### 4.1 Section Index Pages

Every folder **must** have an `index.mdx` that:

1. Sets `title: Overview` (or a concise functional title like `Introduction` or `Getting Started`) in frontmatter — never repeat the parent section name.
2. Starts with a 1–2 sentence intro.
3. (Optional) Includes a Mermaid flowchart showing the reading order.
4. Ends with a `<Cards>` grid linking to each child page with icons.

### 4.2 Breathing Room

- Place `---` (horizontal rule) between every `## H2` section.
- Do **not** stack two components directly (e.g., `<Callout>` then immediately `<Tabs>`).
  Add at least one line of connective prose between them.

### 4.3 Mermaid Diagrams

> [!IMPORTANT]
> **Mermaid is NOT Built-In**: Neither Fumadocs nor Fumapress includes a Mermaid renderer out of the box. Without a configured renderer, ` ```mermaid ` code blocks display as raw plain text with a copy button.
>
> **Recommended Setup (Client Component with `mermaid`)**:
>
> 1. Install `mermaid` and `next-themes` (`npm install mermaid next-themes`).
> 2. Create `src/components/mermaid.tsx` using `mermaid.initialize()` and client-side hydration guard.
> 3. Register `Mermaid` in `src/components/mdx.tsx` (Fumadocs / Next.js) or `press.config.tsx` (Fumapress) under `getMDXComponents`.
> 4. In MDX, invoke directly: `<Mermaid chart={`flowchart TD ...`} />`.
>
> _(Alternatively, install `beautiful-mermaid` for a lighter server-rendered SVG approach)._

#### Fixing Blurry Shadows, Colored Tints & Oversized Diagrams

By default, Mermaid diagrams can render with blurry SVG drop-shadow filters, muddy gradient borders, colored fills, and massive 100%-width scaling.

To ensure diagrams are crisp, solid, uncolored (neutral monochrome), and comfortably proportioned:

1. **Mermaid Initialization (Monochrome & Crisp)**: In `mermaid.initialize()`, set `look: 'classic'`, `theme: 'base'`, `fontSize: 13`, and configure neutral grayscale `themeVariables` with `useGradient: false` and `dropShadow: 'none'`:

   ```ts
   const neutralBorder = isDark ? "#52525b" : "#71717a";
   const neutralLine = isDark ? "#71717a" : "#71717a";

   mermaid.initialize({
     startOnLoad: false,
     securityLevel: "loose",
     fontFamily: "inherit",
     fontSize: 13,
     themeCSS: "margin: 0 !important;",
     theme: "base",
     look: "classic",
     flowchart: {
       padding: 8,
     },
     themeVariables: {
       useGradient: false,
       dropShadow: "none",
       darkMode: isDark,
       background: "transparent",
       fontSize: "13px",
       // Strictly neutral shades of black / zinc / gray (zero blue or colored tints)
       primaryColor: isDark ? "#18181b" : "#ffffff",
       primaryTextColor: isDark ? "#f4f4f5" : "#18181b",
       primaryBorderColor: neutralBorder,
       secondaryColor: isDark ? "#27272a" : "#f4f4f5",
       secondaryTextColor: isDark ? "#f4f4f5" : "#18181b",
       secondaryBorderColor: neutralBorder,
       tertiaryColor: isDark ? "#18181b" : "#ffffff",
       tertiaryBorderColor: neutralBorder,
       lineColor: neutralLine,
       arrowheadColor: neutralLine,
       nodeBorder: neutralBorder,
       textColor: isDark ? "#f4f4f5" : "#18181b",
       clusterBkg: isDark ? "#121214" : "#fafafa",
       clusterBorder: isDark ? "#27272a" : "#e4e4e7",
     },
   });
   ```

2. **SVG Wrapper Scale & Zero Left Margin**: Align diagrams flush with the document content, prevent oversized scaling, and strip SVG filters:
   ```tsx
   className =
     "mermaid-wrapper my-4 flex w-full justify-start overflow-x-auto rounded-lg border border-fd-border bg-fd-card/30 p-4 shadow-xs [&>svg]:m-0! [&>svg]:max-w-135 [&>svg]:w-auto [&>svg]:h-auto [&_rect]:filter-none! [&_polygon]:filter-none! [&_circle]:filter-none! [&_.node_rect]:stroke-[1.25px]!";
   ```

   - `[&>svg]:m-0!` and `themeCSS: 'margin: 0 !important;'`: Eliminates weird left margins caused by Mermaid's default `margin: auto` injection inside flex containers.
   - `justify-start` & `w-full`: Aligns the container and diagram naturally with text and code blocks (no awkward `mx-auto` indentation).
   - `[&>svg]:max-w-[540px] [&>svg]:w-auto`: Prevents diagrams from blowing up to oversized billboard dimensions.
   - `[&_rect]:filter-none! [&_polygon]:filter-none! [&_circle]:filter-none!`: Strips SVG drop-shadow filters from all diagram shapes.
   - `[&_.node_rect]:stroke-[1.25px]!`: Forces solid, crisp 1.25px borders across all node bounding boxes.
3. **Sanitize React `useId()`**: React's `useId()` produces colons (`:r1:`) which trigger `DOMException: '#:r1:' is not a valid selector` in Mermaid. Always sanitize: `id = 'mermaid-' + useId().replace(/[^a-zA-Z0-9_-]/g, '')`.

- Use `flowchart`, `sequenceDiagram`, `timeline`, `graph`, or `classDiagram` as needed.
- **Always** quote node labels containing special characters: `A["Label (Info)"]`.
- Prefer `LR` (left-to-right) for linear flows to keep vertical footprint compact.

### 4.4 Code Blocks

- Always specify the language: ` ```typescript `, ` ```solidity `, ` ```bash `, etc.
- Use `title="filename.ts"` for named code blocks: ` `typescript title="config.ts" `
- Fumadocs renders code blocks with Shiki syntax highlighting and a copy button automatically.

### 4.5 Tables

- Use tables for **comparative data**, **API parameters**, **tech stacks**, and **config options**.
- Always left-align text columns (`:---`) and optionally center numeric columns (`:---:`).
- Add a bold header row. Keep cells concise.

### 4.6 Callout Types

| Type    | Use For                                                    |
| :------ | :--------------------------------------------------------- |
| `info`  | Supplementary context, background knowledge, definitions   |
| `warn`  | Trade-offs, potential pitfalls, things to be careful about |
| `error` | Breaking changes, critical bugs, dangerous operations      |

---

## 5. Workflow: Creating a New Docs Page

```
1. Identify which section the page belongs to (or create a new section folder)
2. Create the .mdx file under content/docs/<section>/
3. Add frontmatter with title, description, and optional icon
4. Write the content following the component selection rules above
5. Update the section's meta.json to include the new page in the `pages` array
6. If this is a new section folder:
   a. Create meta.json with title, icon, and pages
   b. Create index.mdx as a section overview with <Cards> navigation
   c. Update the parent meta.json to include the new section
7. Run `npx tsc --noEmit` to verify no TypeScript errors
```

---

## 6. Workflow: Creating a New Section

```
1. Create content/docs/<section-name>/
2. Create content/docs/<section-name>/meta.json:
   { "title": "Section Title", "icon": "IconName", "pages": ["index", ...] }
3. Create content/docs/<section-name>/index.mdx with:
   - Frontmatter (title, description)
   - Intro paragraph
   - Optional Mermaid reading-order diagram
   - <Cards> grid linking to child pages
4. Add "<section-name>" to the parent meta.json pages array
5. Create each child page .mdx file

> **Root Switcher Sections (`"root": "subject"`)**:
> - Add `"root": "subject"` and `"icon": "AnyLucideIcon"` (e.g. `"Binary"`, `"Cpu"`) to `meta.json`.
> - **Zero Config Changes Needed**: Any Lucide icon works dynamically when `getLayoutTabs(props.tree, { transform: (opt) => opt })` is paired with an icon resolver. No changes to `press.config.tsx` needed for new sections or icons. In MDX cards, strings work directly: `<Card icon="Binary" />`.
> - **Dev Server Watcher Gotcha**: When adding an entirely new directory on disk while `npm run dev` is running, Vite's build macro on Windows may not detect the new folder until the dev server is restarted or `press.config.tsx` is saved.
```

---

## 7. Anti-Patterns to Avoid

| Anti-Pattern                                                      | Why It's Bad                                                                                                                                         | Fix                                                                                              |
| :---------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| Repeating parent section/folder name in child titles (stuttering) | Degrades sidebar scannability, wastes horizontal space causing truncation, and duplicates breadcrumb/switcher context (e.g., 'Auth > Auth Overview') | Strip the parent prefix: use 'Overview', 'Quickstart', 'Configuration', 'Architecture'           |
| Plain bulleted link list for navigation                           | Looks like a plain README, not a docs site                                                                                                           | Use `<Cards>` with icons                                                                         |
| Raw LaTeX dollar signs for math/Big-O (`$O(n)$`, `$k$`, `$\le$`)  | MDX without KaTeX/MathJax plugins renders literal `$` signs, and braces like `${...}` or `2^{h+1}` trigger Acorn JSX syntax errors                   | Use inline code backticks: `` `O(1)` ``, `` `O(n)` ``, `` `O(log n)` ``, `` `k` ``, `` `<= e` `` |
| Relying on Mermaid without configuring a renderer                 | Fenced ` ```mermaid ` blocks render as plain raw code text                                                                                           | Install `beautiful-mermaid` and configure `CustomPre` + `<Mermaid>` in `press.config.tsx`        |
| Ordered list for setup instructions                               | Missing visual step indicators                                                                                                                       | Use `<Steps>` / `<Step>`                                                                         |
| Bold text for warnings                                            | Easy to miss, no visual weight                                                                                                                       | Use `<Callout type="warn">`                                                                      |
| Multiple code blocks for package manager variants                 | Cluttered, repetitive                                                                                                                                | Use `<Tabs>` with npm/pnpm/yarn                                                                  |
| ASCII art for diagrams                                            | Breaks on different screens, ugly                                                                                                                    | Use Mermaid fenced blocks or `<Mermaid>`                                                         |
| No `description` in frontmatter                                   | Empty subtitle, bad SEO                                                                                                                              | Always provide description                                                                       |
| Manual `# Title` heading                                          | Duplicates the rendered frontmatter title                                                                                                            | Remove manual `# Title`                                                                          |
| Walls of text with no components                                  | Unscalable, hard to scan                                                                                                                             | Break with `<Callout>`, tables, diagrams                                                         |
| Putting static FAQ text in cards                                  | Cards are for navigation, not content                                                                                                                | Use `<Accordions>`                                                                               |

---

## 8. Quick Reference: Import Paths

All components are available directly in MDX without imports (they are globally
registered via the MDX component map, typically in `src/components/mdx.tsx`).

If you need to use a component in a `.tsx` file (not MDX), import from:

```typescript
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Callout } from "fumadocs-ui/components/callout";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import { InlineTOC } from "fumadocs-ui/components/inline-toc";
```

### Fumapress Component Registration (`press.config.tsx`)

In Fumapress, `defaultMdxComponents` only provides basic HTML tags, `Card`, `Cards`, and `Callout`. To make `<Tabs>`, `<Steps>`, `<Accordions>`, `<Files>`, Lucide icons, and custom components like `<Mermaid>` globally available without manual imports in every `.mdx` file, configure `getMdxComponents`:

```typescript
import defaultMdxComponents, { createRelativeLink } from "fumadocs-ui/mdx";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import { Mermaid } from "./src/components/mermaid";

export default defineConfig({
  // ...
}).adapters(
  fumadocsMdx({
    async getMdxComponents(page) {
      return {
        ...defaultMdxComponents,
        Mermaid,
        a: createRelativeLink(await this.getLoader(), page),
        Tabs,
        Tab,
        Steps,
        Step,
        Accordion,
        Accordions,
        File,
        Files,
        Folder,
      };
    },
  }),
);
```
