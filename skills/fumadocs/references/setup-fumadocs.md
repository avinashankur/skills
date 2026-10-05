# Fumadocs Setup Reference (Next.js)

> **IMPORTANT**: Fumadocs evolves rapidly. This file provides the high-level architecture
> and the files you need to create. **Always fetch the latest setup instructions from
> the official documentation before implementing.**

---

## Official Documentation

Before setting up Fumadocs, fetch and read the current guides:

1. **Getting Started**: https://fumadocs.dev/docs/headless
2. **Source API**: https://fumadocs.dev/docs/headless/source-api
3. **MDX Integration**: https://fumadocs.dev/docs/mdx
4. **UI Theme Setup**: https://fumadocs.dev/docs/ui
5. **Components Reference**: https://fumadocs.dev/docs/ui/components

Use `read_url_content` on these URLs to get the latest instructions.

---

## Architecture Overview

Fumadocs is composed of three layers:

| Package | Role |
| :--- | :--- |
| `fumadocs-core` | Headless library — content sourcing, navigation tree, search |
| `fumadocs-ui` | Default Tailwind-based theme — layouts, sidebar, search dialog, components |
| `fumadocs-mdx` | Content adapter — processes `.mdx` files into typed page data |

---

## Files You Need to Create / Modify

When integrating Fumadocs into a Next.js project, these are the key files:

### 1. `source.config.ts` (project root)

Tells `fumadocs-mdx` where content lives and how to process it.

- Defines content directory (typically `content/docs`)
- Configures schemas (`pageSchema`, `metaSchema`)
- Configures MDX plugins (remark/rehype)

### 2. `next.config.mjs`

Wrap the Next.js config with `createMDX()` from `fumadocs-mdx/next`.

### 3. `src/lib/source.ts`

The source loader that creates a typed page tree:

- Uses `loader()` from `fumadocs-core/source`
- Uses `defineDocs()` from `fumadocs-mdx/macro`
- Optionally adds plugins like `lucideIconsPlugin()`

### 4. `src/app/layout.tsx`

Wrap the app with `RootProvider` from `fumadocs-ui/provider/next`.

### 5. `src/app/docs/layout.tsx`

Uses `DocsLayout` from `fumadocs-ui/layouts/docs` with the page tree.

> For multi-section or framework switchers across root tabs in Next.js, see [Official Folder Group Root Tabs Guide](./folder-group-root-tabs.md). *(Note: `setup-section-switcher.md` is strictly for Fumapress / Waku and may be stale).*

### 6. `src/app/docs/[[...slug]]/page.tsx`

Catch-all route that renders individual doc pages using:
- `DocsPage`, `DocsTitle`, `DocsDescription`, `DocsBody` from `fumadocs-ui/layouts/docs/page`
- The MDX component map

### 7. `src/components/mdx.tsx` & `src/components/mermaid.tsx`

Registers all interactive components (Callout, Tabs, Steps, Cards, Mermaid, etc.) for global
availability in MDX. Uses `defaultMdxComponents` from `fumadocs-ui/mdx` as a base.

For Mermaid diagrams without blurry shadows or uneven gradient borders:
- Implement `src/components/mermaid.tsx` with `look: 'classic'`, `theme: 'base'`, and `themeVariables: { useGradient: false, dropShadow: 'none' }`.
- Add container SVG overrides: `[&_rect]:filter-none! [&_polygon]:filter-none! [&_circle]:filter-none! [&_.node_rect]:stroke-[1.25px]!`.
- Register `Mermaid` inside `getMDXComponents`.

### 8. `src/app/global.css`

Imports the fumadocs theme preset CSS:
```css
@import 'fumadocs-ui/css/neutral.css';  /* or ocean, purple, vite */
@import 'fumadocs-ui/css/preset.css';
```

### 9. `content/docs/`

The content directory containing `.mdx` files and `meta.json` sidebar configs.

---

## Setup Workflow

```
1. Install: npm install fumadocs-core fumadocs-ui fumadocs-mdx
2. Fetch the latest setup guide from https://fumadocs.dev/docs/headless
3. Create each file listed above following the official guide
4. Create content/docs/index.mdx and content/docs/meta.json
5. Run npm run dev to verify
```

---

## New Project Shortcut

For a fresh project, use the CLI which scaffolds everything:

```bash
npm create fumadocs-app
```
