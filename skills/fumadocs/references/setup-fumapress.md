# Fumapress Setup Reference (Waku-based Site Generator)

> **IMPORTANT**: Fumapress evolves rapidly. This file provides the high-level architecture
> and decision framework. **Always fetch the latest setup instructions from
> the official documentation before implementing.**

---

## Official Documentation

Before setting up Fumapress, fetch and read the current guides:

1. **Homepage / Overview**: https://press.fumadocs.dev
2. **Getting Started**: https://press.fumadocs.dev/docs
3. **Plugin Catalog**: https://press.fumadocs.dev/docs/plugins
4. **Blog**: https://press.fumadocs.dev/blog

Use `read_url_content` on these URLs to get the latest instructions.

---

## Fumadocs vs. Fumapress — Decision Guide

| Aspect | Fumadocs | Fumapress |
| :--- | :--- | :--- |
| **Type** | Framework library (layered) | Site generator (batteries-included) |
| **Underlying Framework** | Next.js | Waku (Vite-based React framework) |
| **Config** | Multiple files (source, next, layouts) | Single `press.config.tsx` |
| **Routing** | Manual Next.js App Router setup | Automatic routing |
| **Plugins** | Manual integration | First-class `.plugins()` chain |
| **Migration** | Full control from day 1 | Start simple, eject to full Fumadocs later |
| **MDX Components** | Identical | Identical |
| **Content Format** | Identical `.mdx` + `meta.json` | Identical `.mdx` + `meta.json` |

> **Key insight**: The MDX authoring experience, component library, frontmatter conventions,
> and `meta.json` sidebar config are **100% identical** between Fumadocs and Fumapress.
> Only the project scaffolding and framework plumbing differ.

---

## Architecture Overview

Fumapress is a composable site generator built on the Fumadocs ecosystem + Waku.
It uses a single config file with a builder pattern:

```
press.config.tsx
  → defineConfig({ content: { ... } })
  → .adapters(fumadocsMdx())
  → .plugins(flexsearchPlugin(), llmsPlugin(), ...)
```

### Key Concepts

- **Adapters**: Connect content sources (e.g., `fumadocsMdx()` for MDX files)
- **Plugins**: Add features via a chainable API (search, blog, sitemap, AI, etc.)
- **Content**: Same `content/docs/` directory with `.mdx` and `meta.json`

---

## Known Plugin Categories

These are the plugin categories available in Fumapress. **Fetch the latest list and
API from the official docs** as new plugins are added frequently:

| Category | Examples |
| :--- | :--- |
| **Search** | FlexSearch, Orama Search |
| **AI / LLM** | AI Chat, MCP Server, llms.txt |
| **Content** | Blog, Changelog (Tegami) |
| **SEO / Meta** | Sitemap, OG Images (Takumi), Link Validation |
| **API Docs** | OpenAPI, AsyncAPI |
| **UX** | Feedback, Image Optimization |

---

## Project Structure

```
my-site/
├── content/
│   └── docs/                 # Same format as Fumadocs
│       ├── index.mdx
│       └── meta.json
├── press.config.tsx          # Single config file
├── package.json
└── tsconfig.json
```

---

## Setup Workflow

```
1. Run: npm create fumapress
2. Follow CLI prompts for project name and options
3. Create content under content/docs/
4. Add plugins to press.config.tsx as needed
5. Run: npm run dev
```

---

## Multi-Section & Framework Switcher Setup

When structuring documentation across distinct subjects or frameworks (e.g. `/guides`, `/api`, `/sdk`):

1. **Mark Root Sections**: In each section folder, create `meta.json` with `"root": "subject"`.
2. **Intercept Layout**: In `press.config.tsx`, use `createDocsLayoutPage` and `renderLayout` to:
   - Call `getLayoutTabs(props.tree)` and unbind `$folder` so tabs persist on `/`.
   - Add `"/"` to the default tab's `urls` set so it displays active on the root page.
   - Unpack default folder `index` and `children` into `tree.children` on `/` to eliminate redundant folder chevrons.

For the complete guide, Fumadocs internals, and TypeScript nuances, see [Root Section Switcher Setup Guide](./setup-section-switcher.md).

---

## Global MDX Component Registration & Mermaid Support

By default, Fumapress's `fumadocsMdx()` adapter only injects `defaultMdxComponents` (basic HTML tags, `Card`, `Cards`, and `Callout`). It does **not** globally expose `<Tabs>`, `<Steps>`, `<Accordions>`, `<Files>`, Lucide icons, or a Mermaid diagram renderer.

Without registering them:
1. Using `<Tabs>` or `<Boxes />` without a manual import causes build errors: `Error: Expected component <Name> to be defined`.
2. Fenced ```` ```mermaid ```` code blocks render as raw plain-text code blocks highlighted by Shiki rather than visual diagrams.

To support Mermaid diagrams cleanly without bloating `press.config.tsx`:
1. Install `beautiful-mermaid`: `npm i beautiful-mermaid`
2. Create a dedicated component in `src/components/mermaid.tsx`:

```tsx title="src/components/mermaid.tsx"
import { renderMermaidSVG } from "beautiful-mermaid";
import type React from "react";

export function Mermaid({ chart, children, className = "", ...props }: { chart?: string; children?: React.ReactNode; [key: string]: any }) {
  const code = (typeof chart === "string" ? chart : typeof children === "string" ? children : "").trim();
  if (!code) return null;

  try {
    const svg = renderMermaidSVG(code, {
      bg: "var(--color-fd-card)",
      fg: "var(--color-fd-foreground)",
      transparent: true,
    });
    return (
      <div
        className={`mermaid-wrapper my-6 flex justify-center overflow-x-auto rounded-xl border border-fd-border bg-fd-card/50 p-6 shadow-xs [&>svg]:max-w-full [&>svg]:h-auto [&_rect]:filter-none! [&_polygon]:filter-none! [&_circle]:filter-none! [&_.node_rect]:stroke-[1.25px]! ${className}`}
        dangerouslySetInnerHTML={{ __html: svg }}
        {...props}
      />
    );
  } catch (err: any) {
    return (
      <div className="my-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs font-mono text-red-400">
        Mermaid Render Error: {err?.message || String(err)}
      </div>
    );
  }
}
```

3. Register `Mermaid` along with other interactive components in `press.config.tsx`:

```tsx title="press.config.tsx"
import defaultMdxComponents, { createRelativeLink } from "fumadocs-ui/mdx";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import { LayoutGrid, Boxes, Layers, BookOpen } from "lucide-react";
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
        LayoutGrid,
        Boxes,
        Layers,
        BookOpen,
      };
    },
  })
);
```

---

## When to Choose Which

### Choose Fumadocs (Next.js) When:
- You have an existing Next.js app and want to add docs to it
- You need full control over routing, middleware, and API routes
- You're building a complex site with non-docs pages (dashboards, landing pages)
- You need features specific to Next.js (ISR, middleware, server actions)

### Choose Fumapress (Waku) When:
- You want a dedicated docs/content site with minimal config
- You prefer a single-file config over managing multiple layout files
- You want built-in plugin support without manual wiring
- You're starting from scratch and want the fastest path to a beautiful docs site
- You may want to eject to full Fumadocs later (migration path exists)

---

## Content Authoring

Content authoring is **identical to Fumadocs**. See the main `SKILL.md` and
`references/components.md` for the full component and design guide.
