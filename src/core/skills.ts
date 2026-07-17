import path from "node:path";
import { getBundledSkillsDirectory } from "./paths.js";
import { listSubdirectories, pathExists } from "../utils/filesystem.js";

export type AvailableSkill = {
  name: string;
  /** Absolute path to the skill's source directory inside the package. */
  sourceDirectory: string;
};

/**
 * Scans the package's bundled `skills/` directory and treats every
 * subdirectory containing a SKILL.md as an available skill. No database
 * or registry file is required — the filesystem is the registry.
 */
export async function discoverAvailableSkills(): Promise<AvailableSkill[]> {
  const skillsRoot = getBundledSkillsDirectory();
  const directories = await listSubdirectories(skillsRoot);

  const skills: AvailableSkill[] = [];
  for (const name of directories.sort()) {
    const sourceDirectory = path.join(skillsRoot, name);
    const hasSkillFile = await pathExists(path.join(sourceDirectory, "SKILL.md"));
    if (hasSkillFile) {
      skills.push({ name, sourceDirectory });
    }
  }
  return skills;
}

export async function findAvailableSkill(name: string): Promise<AvailableSkill | null> {
  const skills = await discoverAvailableSkills();
  return skills.find((skill) => skill.name === name) ?? null;
}

/** Suggests the closest matching skill name for a typo, using simple Levenshtein distance. */
export function suggestClosestSkillName(input: string, candidates: string[]): string | null {
  let best: { name: string; distance: number } | null = null;
  for (const candidate of candidates) {
    const distance = levenshtein(input, candidate);
    if (best === null || distance < best.distance) {
      best = { name: candidate, distance };
    }
  }
  if (best && best.distance <= 3) {
    return best.name;
  }
  return null;
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i += 1) matrix[i]![0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0]![j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost,
      );
    }
  }

  return matrix[a.length]![b.length]!;
}
