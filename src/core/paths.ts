import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * Resolves paths for two distinct locations:
 *  - the package's own bundled `skills/` directory (source of truth)
 *  - the target project's `.agents/skills` directory (install destination)
 *
 * The CLI is executed via `npx`/`npm exec`/a global bin, so we must never
 * assume the current working directory is the package directory. We derive
 * the package root from this module's own file URL instead.
 */

const AGENTS_DIR_NAME = ".agents";
const SKILLS_DIR_NAME = "skills";
const MANIFEST_FILE_NAME = "agent-skills.json";

/** Root of the installed npm package (works both from src/ via tsx and dist/ after build). */
export function getPackageRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  // This file lives at either:
  //   <pkgRoot>/src/core/paths.ts   (dev, via tsx)
  //   <pkgRoot>/dist/cli.js         (bundled, single file — see getPackageRoot fallback)
  // tsup bundles everything into dist/cli.js, so at runtime in production
  // this module's code executes from dist/cli.js directly.
  const dir = path.dirname(currentFile);

  if (dir.endsWith(path.join("src", "core"))) {
    // Running from source (tsx dev mode)
    return path.resolve(dir, "..", "..");
  }

  // Running from bundled dist/cli.js -> package root is one level up.
  return path.resolve(dir, "..");
}

/** Directory inside the package containing canonical SKILL.md folders. */
export function getBundledSkillsDirectory(): string {
  return path.join(getPackageRoot(), SKILLS_DIR_NAME);
}

/** The `.agents` directory inside the target project. */
export function getAgentsDirectory(targetDirectory: string): string {
  return path.join(targetDirectory, AGENTS_DIR_NAME);
}

/** The `.agents/skills` directory inside the target project. */
export function getTargetSkillsDirectory(targetDirectory: string): string {
  return path.join(getAgentsDirectory(targetDirectory), SKILLS_DIR_NAME);
}

/** The `.agents/agent-skills.json` manifest path inside the target project. */
export function getManifestPath(targetDirectory: string): string {
  return path.join(getAgentsDirectory(targetDirectory), MANIFEST_FILE_NAME);
}
