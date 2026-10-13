#!/usr/bin/env python3
"""Map a repo or folder for the codeviva skill. Prints JSON.

Usage: scan_repo.py [path] [--diff [BASE]]
"""
import argparse
import json
import os
import re
import subprocess
from collections import Counter
from pathlib import Path

SKIP_DIRS = {
    "node_modules", ".git", "dist", "build", ".next", ".venv", "venv", "env",
    "__pycache__", "target", "vendor", ".cache", "coverage", ".turbo", ".idea",
    ".vscode", "site-packages", ".mypy_cache", ".pytest_cache",
}
SRC_EXT = {
    ".py", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".go", ".rs", ".java",
    ".kt", ".rb", ".php", ".cs", ".swift", ".c", ".cpp", ".h", ".sql", ".vue",
    ".svelte", ".prisma", ".graphql", ".proto",
}
MANIFESTS = {
    "package.json", "pyproject.toml", "requirements.txt", "go.mod", "Cargo.toml",
    "pom.xml", "build.gradle", "Gemfile", "composer.json", "Dockerfile",
    "docker-compose.yml", "docker-compose.yaml", ".env.example", "schema.prisma",
    "vercel.json", "next.config.js", "next.config.ts", "vite.config.ts",
    "tsconfig.json", "README.md",
}
ENTRY_STEMS = {"main", "index", "app", "server", "manage", "wsgi", "asgi", "cli"}
ENTRY_NAMES = {"route.ts", "route.js", "page.tsx", "layout.tsx"}
ROUTE_RE = re.compile(
    r"\b(app|router|api|bp)\.(get|post|put|patch|delete|use)\("
    r"|@(app|router|bp)\.(get|post|put|patch|delete|route)"
    r"|@(Get|Post|Put|Patch|Delete|Controller)\("
    r"|\bpath\(|\bHandleFunc\("
)
TEST_RE = re.compile(r"(^|/)(tests?|__tests__|spec)/|\.(test|spec)\.|(^|/)test_[^/]*\.py$")
LARGE_FILES, LARGE_LOC = 300, 40000


def git(root, *args):
    try:
        out = subprocess.run(
            ["git", "-C", str(root), *args], capture_output=True, text=True, timeout=30
        )
        return out.stdout.strip() if out.returncode == 0 else ""
    except Exception:
        return ""


def list_files(root):
    if (root / ".git").exists():
        out = git(root, "ls-files", "--cached", "--others", "--exclude-standard")
        if out:
            return [p for p in out.splitlines() if not set(p.split("/")) & SKIP_DIRS]
    files = []
    for dp, dns, fns in os.walk(root):
        dns[:] = [d for d in dns if d not in SKIP_DIRS]
        files += [str((Path(dp) / f).relative_to(root)) for f in fns]
    return files


def read(root, rel, limit=300_000):
    p = root / rel
    try:
        if p.stat().st_size > limit:
            return None
        return p.read_text(errors="ignore")
    except OSError:
        return None


def diff_info(root, base):
    if base == "auto":
        base = next((b for b in ("main", "master") if git(root, "rev-parse", "--verify", b)), "")
    changed = set()
    if base:
        changed |= set(git(root, "diff", "--name-only", f"{base}...HEAD").splitlines())
    changed |= set(git(root, "diff", "--name-only", "HEAD").splitlines())
    return {
        "base": base or None,
        "changed_files": sorted(c for c in changed if c),
        "recent_commits": git(root, "log", "--oneline", "-n", "15", f"{base}..HEAD").splitlines() if base else [],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path", nargs="?", default=".")
    ap.add_argument("--diff", nargs="?", const="auto", default=None)
    args = ap.parse_args()
    root = Path(args.path).resolve()

    files = list_files(root)
    ext_count, dir_stats, largest, entry, tests, manifests = Counter(), {}, [], [], [], []
    route_hits, src_files, total_loc = [], 0, 0

    for rel in files:
        p = Path(rel)
        if p.name in MANIFESTS:
            manifests.append(rel)
        if TEST_RE.search(rel):
            tests.append(rel)
        if p.suffix not in SRC_EXT:
            continue
        text = read(root, rel)
        if text is None:
            continue
        loc = text.count("\n") + 1
        src_files += 1
        total_loc += loc
        ext_count[p.suffix] += 1
        top = p.parts[0] if len(p.parts) > 1 else "."
        d = dir_stats.setdefault(top, {"files": 0, "loc": 0})
        d["files"] += 1
        d["loc"] += loc
        largest.append((loc, rel))
        if p.stem in ENTRY_STEMS or p.name in ENTRY_NAMES:
            entry.append(rel)
        hits = len(ROUTE_RE.findall(text))
        if hits:
            route_hits.append((hits, rel))

    result = {
        "root": str(root),
        "git": (root / ".git").exists(),
        "source_files": src_files,
        "loc": total_loc,
        "large": src_files > LARGE_FILES or total_loc > LARGE_LOC,
        "languages": dict(ext_count.most_common(8)),
        "manifests": sorted(manifests)[:25],
        "entry_points": sorted(entry)[:25],
        "top_level": dict(sorted(dir_stats.items(), key=lambda kv: -kv[1]["loc"])[:20]),
        "route_files": [f for _, f in sorted(route_hits, reverse=True)[:15]],
        "tests": {"files": len(tests), "samples": sorted(tests)[:5]},
        "largest_files": [{"file": f, "loc": n} for n, f in sorted(largest, reverse=True)[:10]],
    }
    if args.diff is not None:
        result["diff"] = diff_info(root, args.diff)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()