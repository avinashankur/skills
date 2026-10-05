# Official Folder Group Root Tabs & Subject Switcher Guide (Fumadocs)

This guide documents the official, zero-hack pattern used by **Fumadocs** (as implemented on `fumadocs.dev` and in `fuma-nama/fumadocs/apps/docs`) to serve a default documentation subject directly at the root (`/`) with an active **Layout Tabs (Dropdown)** switcher and an exclusively scoped sidebar.

---

## 1. Official Fumadocs Terminology

Fumadocs uses precise terms for these components and content constructs:

| Term | What It Refers To | Where It Appears |
| :--- | :--- | :--- |
| **Layout Tabs (Dropdown)** / **Sidebar Tabs** | The UI component in the sidebar rendered as a dropdown with icon, title, and up/down arrows (`^v`). | `<DocsLayout />`, `SidebarTabsDropdown` (`fumadocs-ui`) |
| **Layout Tab** (`LayoutTab`) | The TypeScript data object representing a single selectable option in the switcher (contains `title`, `icon`, `url`, `description`, `$folder`, etc.). | `fumadocs-ui/layouts/shared` |
| **Root Folder** | Any directory in `content/docs/` designated as a top-level section by setting `"root": true` in its `meta.json`. Fumadocs automatically renders root folders as tabs in the sidebar. | `meta.json` (`"root": true`) |
| **Root Type** | A string assigned to the `root` property (e.g. `"root": "subject"`, `"root": "version"`). Root folders sharing the same root type under the same parent scope are considered interchangeable, grouping them into a **Tabs Group** dropdown. | `meta.json` (`"root": "subject"`) |
| **Folder Group** | A directory name wrapped in parentheses, e.g. `(framework)`. In Fumadocs page conventions, wrapping a folder in parentheses omits the directory name from the generated URL slugs while preserving folder structure and metadata. | Directory naming (`content/docs/(name)`) |

---

## 2. The Problem with Naive Multiple Root Folders

When creating multiple subject folders (e.g., `content/docs/framework` and `content/docs/library`), naive implementations face two problems on the root URL (`/`):
1. **Disconnected Home Page**: Having a separate `content/docs/index.mdx` makes the home page an external landing page rather than the first subject's overview.
2. **Missing Active Tab on `/`**: Because `/` is outside `content/docs/framework/`, Fumadocs cannot match an active root folder. The `SidebarTabsDropdown` trigger disappears on `/`, and the sidebar displays root folders with collapsible `>` disclosure chevrons instead of a scoped subject tree.

---

## 3. The Official Solution: Parentheses Folder Groups `(subject)`

Fumadocs solves this natively using **Folder Groups**: wrapping the default subject directory in parentheses, e.g. `(framework)`.

```
content/docs/
├── (framework)/               <-- Folder Group: omitted from URL slugs
│   ├── meta.json              <-- "root": true, "title": "Framework", "icon": "Building"
│   ├── index.mdx              <-- Slugs: [] -> served at / (Framework Overview)
│   └── getting-started.mdx    <-- Slugs: ['getting-started'] -> served at /getting-started
├── library/                   <-- Standard Root Folder
│   ├── meta.json              <-- "root": true, "title": "Library", "icon": "BookOpen"
│   ├── index.mdx              <-- Slugs: ['library'] -> served at /library (Library Overview)
│   └── components.mdx         <-- Slugs: ['library', 'components'] -> served at /library/components
└── meta.json                  <-- Root meta: { "pages": ["(framework)", "library"] }
```

### Why This Works (Zero Custom Layout Code)
1. **Omitted Slug**: Because `(framework)` is wrapped in parentheses, Fumadocs generates `slugs: []` for `(framework)/index.mdx`. Its canonical URL is `/`.
2. **Automatic Active Match**: When a visitor loads `/`, Fumadocs's `useTreePath()` matches `(framework)` as the active **Root Folder** because its index page URL matches `/`.
3. **Automatic Scoping**: Because `(framework)` is the active root folder, Fumadocs UI scopes the sidebar **exclusively** to Framework's pages (`index.mdx`, `getting-started.mdx`). Sibling root folders (like `library`) are automatically hidden from the sidebar.
4. **Active Switcher**: The **Sidebar Tabs Dropdown** displays **Framework** as active on `/`. Clicking the dropdown displays the available subjects (`Framework`, `Library`).

---

## 4. Configuration Reference

### 4.1 Root Subject: `content/docs/(framework)/meta.json`
```json
{
  "title": "Framework",
  "root": true,
  "icon": "Building",
  "pages": [
    "index",
    "getting-started"
  ]
}
```

### 4.2 Secondary Subject: `content/docs/library/meta.json`
```json
{
  "title": "Library",
  "root": true,
  "icon": "BookOpen",
  "pages": [
    "index",
    "components"
  ]
}
```

### 4.3 Root Ordering: `content/docs/meta.json`
```json
{
  "pages": [
    "(framework)",
    "library"
  ]
}
```

### 4.4 Clean Docs Layout: `src/app/(docs)/layout.tsx`
No URL manipulation, no manual tabs array, and no client-side hooks are required:

```tsx
import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
```

---

## 5. Runtime Navigation Behavior

| URL | Active Subject in Switcher | Page Rendered | Sidebar Tree Content |
| :--- | :--- | :--- | :--- |
| `http://localhost:3000/` | **Framework** (Building icon) | `(framework)/index.mdx` | Framework Overview, Getting Started |
| `http://localhost:3000/getting-started` | **Framework** (Building icon) | `(framework)/getting-started.mdx` | Framework Overview, Getting Started |
| `http://localhost:3000/library` | **Library** (BookOpen icon) | `library/index.mdx` | Library Overview, Components |
| `http://localhost:3000/library/components` | **Library** (BookOpen icon) | `library/components.mdx` | Library Overview, Components |
