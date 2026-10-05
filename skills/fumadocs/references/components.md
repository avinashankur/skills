# Fumadocs / Fumapress Component Reference

> This file documents **every interactive component** available in the MDX content layer.
> All components listed below are globally registered — no imports needed inside `.mdx` files.

> **⚠️ Cross-check before using**: Component APIs may have changed since this file was
> written. Before implementing, fetch the latest component docs from
> **https://fumadocs.dev/docs/ui/components** using `read_url_content` to verify
> prop names, types, and usage patterns are still accurate.

---

## Callout

Highlights important information with colored left border and icon.

### Props

| Prop    | Type                          | Default  | Description                             |
| :------ | :---------------------------- | :------- | :-------------------------------------- |
| `type`  | `"info" \| "warn" \| "error"` | `"info"` | Visual severity                         |
| `title` | `string`                      | —        | Optional title rendered as bold heading |

### Usage

```mdx
<Callout type="info">This is an informational callout. Use for background context.</Callout>

<Callout type="warn">
  ### Custom Title Warning callouts support markdown inside, including headings.
</Callout>

<Callout type="error">This operation is destructive and cannot be reversed.</Callout>
```

### When to Use

- `info` — Supplementary context, definitions, "good to know"
- `warn` — Trade-offs, potential pitfalls, deprecations, latency concerns
- `error` — Breaking changes, critical bugs, dangerous/irreversible operations

### When NOT to Use

- Don't use for general emphasis — use bold text instead
- Don't stack multiple callouts consecutively — add prose between them

---

## Tabs / Tab

Organize content into switchable tabbed panels. Great for showing alternatives.

### Props — `<Tabs>`

| Prop      | Type       | Default  | Description                                                   |
| :-------- | :--------- | :------- | :------------------------------------------------------------ |
| `items`   | `string[]` | Required | Tab labels                                                    |
| `groupId` | `string`   | —        | Share active tab across multiple `<Tabs>` with same `groupId` |
| `persist` | `boolean`  | `false`  | Persist selected tab to localStorage                          |

### Props — `<Tab>`

| Prop    | Type     | Default  | Description                          |
| :------ | :------- | :------- | :----------------------------------- |
| `value` | `string` | Required | Must match one of the parent `items` |

### Usage

````mdx
<Tabs items={['npm', 'pnpm', 'yarn']}>
  <Tab value="npm">```bash npm install fumadocs-core fumadocs-ui fumadocs-mdx ```</Tab>
  <Tab value="pnpm">```bash pnpm add fumadocs-core fumadocs-ui fumadocs-mdx ```</Tab>
  <Tab value="yarn">```bash yarn add fumadocs-core fumadocs-ui fumadocs-mdx ```</Tab>
</Tabs>
````

### Syncing Tabs Across Page

```mdx
<Tabs items={['TypeScript', 'JavaScript']} groupId="lang" persist>
  <Tab value="TypeScript">...</Tab>
  <Tab value="JavaScript">...</Tab>
</Tabs>

<!-- Later on the same page, this stays in sync -->

<Tabs items={['TypeScript', 'JavaScript']} groupId="lang" persist>
  <Tab value="TypeScript">...</Tab>
  <Tab value="JavaScript">...</Tab>
</Tabs>
```

### When to Use

- Package manager alternatives (npm/pnpm/yarn/bun)
- Language variants (TypeScript/JavaScript)
- Framework alternatives (Next.js/Fumapress)
- Before/after comparisons
- Different config approaches

---

## Steps / Step

Numbered step-by-step instructions with visual step indicators.

### Usage

````mdx
<Steps>
  <Step>
    ### Install Dependencies

    ```bash
    npm install fumadocs-core fumadocs-ui
    ```

  </Step>
  <Step>
    ### Configure Source

    Create `source.config.ts` in the project root:

    ```typescript title="source.config.ts"
    import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

    export const docs = defineDocs({ dir: 'content/docs' });
    export default defineConfig();
    ```

  </Step>
  <Step>
    ### Start Development Server

    ```bash
    npm run dev
    ```

  </Step>
</Steps>
````

### When to Use

- Installation guides
- Setup walkthroughs
- Multi-step deployment procedures
- Any sequential process with > 2 steps

### When NOT to Use

- Simple 1-2 step actions → just use prose
- Non-sequential content → use `<Accordions>` or `<Cards>`

---

## Cards / Card

Navigation grid for linking to sub-pages or external resources.

### Props — `<Card>`

| Prop          | Type        | Default  | Description                                 |
| :------------ | :---------- | :------- | :------------------------------------------ |
| `title`       | `string`    | Required | Card heading                                |
| `description` | `string`    | —        | Short description below title               |
| `href`        | `string`    | —        | Link destination                            |
| `icon`        | `ReactNode` | —        | Lucide icon component: `icon={<Compass />}` |

### Usage

```mdx
<Cards>
  <Card
    icon={<Compass />}
    title="Getting Started"
    description="Learn the fundamentals and set up your environment"
    href="/docs/getting-started"
  />
  <Card
    icon={<Layers />}
    title="Architecture"
    description="System design and component interactions"
    href="/docs/architecture"
  />
  <Card
    icon={<Wrench />}
    title="Guides"
    description="Step-by-step tutorials for common tasks"
    href="/docs/guides"
  />
</Cards>
```

### Design Rules

- Always include `icon`, `title`, `description`, and `href`.
- Use on **section index pages** to link to child pages.
- Keep descriptions to ≤ 15 words.
- Use 2–6 cards per grid. More than 6 becomes overwhelming.

### When NOT to Use

- Content display — cards are for **navigation**, not for showing information
- FAQs → use `<Accordions>`
- Data comparisons → use tables

---

## Accordions / Accordion

Collapsible sections ideal for FAQs, optional detail, and long reference content.

### Props — `<Accordion>`

| Prop    | Type     | Default  | Description              |
| :------ | :------- | :------- | :----------------------- |
| `title` | `string` | Required | Trigger label            |
| `id`    | `string` | —        | URL-linkable hash anchor |

### Usage

````mdx
<Accordions>
  <Accordion title="What is a Health Factor?" id="health-factor">
    The Health Factor (HF) is the ratio of a borrower's collateral value to
    their outstanding debt. When HF drops below 1.0, the position becomes
    eligible for liquidation.

    ```
    HF = Collateral Value × Liquidation Threshold / Borrowed Value
    ```

  </Accordion>
  <Accordion title="How does the auction window work?" id="auction-window">
    The auction window opens when an unhealthy position is detected and remains
    open for 1–2 blocks to collect competing bids.
  </Accordion>
</Accordions>
````

### When to Use

- FAQ sections
- "Learn more" expandable details
- Optional deep-dive content that most readers will skip
- Glossary definitions

---

## Files / Folder / File

Renders a visual file tree with expand/collapse folders.

### Usage

```mdx
<Files>
  <Folder name="content" defaultOpen>
    <Folder name="docs" defaultOpen>
      <File name="index.mdx" />
      <File name="meta.json" />
      <Folder name="getting-started">
        <File name="meta.json" />
        <File name="index.mdx" />
        <File name="setup.mdx" />
      </Folder>
    </Folder>
  </Folder>
  <File name="source.config.ts" />
  <File name="next.config.mjs" />
</Files>
```

### Props — `<Folder>`

| Prop          | Type      | Default  | Description         |
| :------------ | :-------- | :------- | :------------------ |
| `name`        | `string`  | Required | Folder label        |
| `defaultOpen` | `boolean` | `false`  | Expanded by default |

### Props — `<File>`

| Prop   | Type     | Default  | Description |
| :----- | :------- | :------- | :---------- |
| `name` | `string` | Required | File label  |

### When to Use

- Showing project structure in setup guides
- Explaining content directory layout
- Documenting config file locations

---

## InlineTOC

Renders the page's table of contents inline within the content body.

### Usage

```mdx
---
title: Comprehensive Reference
description: Full API reference for all modules
---

This page covers all modules. Use the table of contents below to jump to any section.

<InlineTOC />

## Module A

...

## Module B

...
```

### When to Use

- Very long reference pages with 8+ H2 headings
- Pages where the sidebar TOC is disabled (`full: true`)

---

## Mermaid

Renders Mermaid diagrams as responsive SVGs with automatic dark/light theme switching.

> [!IMPORTANT]
> **Setup Required**: Neither Fumadocs nor Fumapress ships with a built-in Mermaid renderer. Without setup, ` ```mermaid ` code blocks display as raw syntax-highlighted code.
>
> Install `mermaid` (`npm i mermaid next-themes`), create `src/components/mermaid.tsx`, and register `Mermaid` in `getMDXComponents`.

### Component Implementation (`src/components/mermaid.tsx`)

To avoid blurry shadows, fuzzy gradient strokes, and React hydration/ID collisions:

1. In `mermaid.initialize()`, set `look: 'classic'`, `theme: 'base'`, `fontSize: 13`, and configure neutral grayscale `themeVariables` with `useGradient: false` and `dropShadow: 'none'`.
2. Add CSS overrides and scaling to the SVG wrapper container: `[&>svg]:max-w-[480px] md:[&>svg]:max-w-[540px] [&>svg]:w-auto [&>svg]:h-auto [&_rect]:filter-none! [&_polygon]:filter-none! [&_circle]:filter-none! [&_.node_rect]:stroke-[1.25px]!`.
3. Sanitize `useId()` with `.replace(/[^a-zA-Z0-9_-]/g, '')` to avoid invalid CSS selector crashes.

```tsx title="src/components/mermaid.tsx"
'use client';

import { use, useId, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';

const cache = new Map<string, Promise<unknown>>();

function cachePromise<T>(key: string, setPromise: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached) return cached as Promise<T>;
  const promise = setPromise();
  cache.set(key, promise);
  return promise;
}

type RenderResult =
  | { success: true; svg: string; bindFunctions?: (element: Element) => void }
  | { success: false; error: string };

function MermaidContent({ chart, className = '' }: { chart: string; className?: string }) {
  const rawId = useId();
  const id = `mermaid-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const { default: mermaid } = use(cachePromise('mermaid', () => import('mermaid')));

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    fontFamily: 'inherit',
    fontSize: 13,
    themeCSS: 'margin: 0 !important;',
    look: 'classic',
    theme: 'base',
    flowchart: {
      padding: 8,
    },
    themeVariables: {
      useGradient: false,
      dropShadow: 'none',
      darkMode: isDark,
      background: 'transparent',
      fontFamily: 'inherit',
      fontSize: '13px',

      // Pure monochrome / neutral grayscale colors (no colorful tints)
      primaryColor: isDark ? '#18181b' : '#ffffff',
      primaryTextColor: isDark ? '#f4f4f5' : '#18181b',
      primaryBorderColor: isDark ? '#3f3f46' : '#71717a',

      secondaryColor: isDark ? '#27272a' : '#f4f4f5',
      secondaryTextColor: isDark ? '#f4f4f5' : '#18181b',
      secondaryBorderColor: isDark ? '#3f3f46' : '#71717a',

      tertiaryColor: isDark ? '#18181b' : '#ffffff',
      tertiaryTextColor: isDark ? '#f4f4f5' : '#18181b',
      tertiaryBorderColor: isDark ? '#3f3f46' : '#71717a',

      lineColor: isDark ? '#71717a' : '#71717a',
      arrowheadColor: isDark ? '#71717a' : '#71717a',
      textColor: isDark ? '#f4f4f5' : '#18181b',

      clusterBkg: isDark ? '#121214' : '#fafafa',
      clusterBorder: isDark ? '#27272a' : '#e4e4e7',
      titleColor: isDark ? '#a1a1aa' : '#52525b',

      edgeLabelBackground: isDark ? '#18181b' : '#ffffff',
      nodeBorder: isDark ? '#3f3f46' : '#71717a',
      nodeTextColor: isDark ? '#f4f4f5' : '#18181b',
      mainBkg: isDark ? '#18181b' : '#ffffff',
    },
  });

  const result = use(
    cachePromise<RenderResult>(`${chart}-${resolvedTheme}`, async () => {
      try {
        const res = await mermaid.render(id, chart.replaceAll('\\n', '\n'));
        return {
          success: true,
          svg: res.svg,
          bindFunctions: res.bindFunctions,
        };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }),
  );

  if (!result.success) {
    return (
      <div className="my-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs font-mono text-red-400">
        Mermaid Render Error: {result.error}
      </div>
    );
  }

  return (
    <div
      className={`mermaid-wrapper my-4 flex w-full justify-start overflow-x-auto rounded-lg border border-fd-border bg-fd-card/30 p-4 shadow-xs [&>svg]:m-0! [&>svg]:max-w-135 [&>svg]:w-auto [&>svg]:h-auto [&_rect]:filter-none! [&_polygon]:filter-none! [&_circle]:filter-none! [&_.node_rect]:stroke-[1.25px]! ${className}`}
      ref={(container) => {
        if (container && result.bindFunctions) result.bindFunctions(container);
      }}
      dangerouslySetInnerHTML={{ __html: result.svg }}
    />
  );
}

export function Mermaid({
  chart,
  children,
  className = '',
}: {
  chart?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const code = (
    typeof chart === 'string' ? chart : typeof children === 'string' ? children : ''
  ).trim();
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!isClient || !code) return null;
  return <MermaidContent chart={code} className={className} />;
}
```

### Usage

Use the `<Mermaid />` component directly in MDX:

```mdx
<Mermaid
  chart={`
flowchart LR
    A["Step 1: Detect"] --> B["Step 2: Auction"]
    B --> C["Step 3: Settle"]
`}
/>
```

### Supported Diagram Types

| Type      | Syntax                  | Best For                          |
| :-------- | :---------------------- | :-------------------------------- |
| Flowchart | `flowchart LR/TD/BT/RL` | Process flows, decision trees     |
| Sequence  | `sequenceDiagram`       | API interactions, message passing |
| Timeline  | `timeline`              | Chronological events              |
| Class     | `classDiagram`          | Data models, interfaces           |
| State     | `stateDiagram-v2`       | State machines, lifecycle         |
| ER        | `erDiagram`             | Database schemas                  |
| Graph     | `graph LR/TD`           | Relationship diagrams             |

### Rules

- **Always** quote labels with special characters: `A["Label (with parens)"]`
- Avoid HTML tags inside labels
- Keep diagrams ≤ 15 nodes for readability
- Use `LR` for linear processes, `TD` for hierarchical structures

---

## Math & Complexity Notation

> [!WARNING]
> **Avoid Raw LaTeX Dollar Signs (`$O(n)$`, `$k$`)**:
> MDX without `remark-math` and `rehype-katex` does not compile LaTeX equations. Using single dollar signs results in:
>
> 1. Raw dollar signs rendered on the page (e.g. `$O(1)$`, `$O(n)$`).
> 2. Build crashes when braces like `${...}` or `2^{h+1}` are parsed by Acorn as JSX JavaScript expressions (`ReferenceError`).
> 3. Parser errors when `<` or `>` in math expressions (e.g. `$p < curr$`) are misinterpreted as unclosed JSX elements.

### Correct Formatting Guide

| Concept                    | Do NOT Use          | Correct Syntax                  | Rendered Output      |
| :------------------------- | :------------------ | :------------------------------ | :------------------- |
| **Big-O Time Complexity**  | `$O(1)$`, `$O(n)$`  | `` `O(1)` ``, `` `O(n)` ``      | `O(1)`, `O(n)` badge |
| **Logarithmic Complexity** | `$O(\log n)$`       | `` `O(log n)` ``                | `O(log n)` badge     |
| **Variables / Sizes**      | `$k$`, `$n$`, `$h$` | `` `k` ``, `` `n` ``, `` `h` `` | `k`, `n`, `h` badge  |
| **Inequalities**           | `$\le$`, `$\ge$`    | `` `<=` ``, `` `>=` ``          | `<=`, `>=`           |
| **Arrows / Pointers**      | `$\rightarrow$`     | `->`                            | `->`                 |
