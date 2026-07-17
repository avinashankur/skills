import path from "node:path";
import { getTargetSkillsDirectory } from "./paths.js";
import {
  copyDirectoryRecursive,
  ensureDirectory,
  listSubdirectories,
  pathExists,
  removeDirectoryRecursive,
} from "../utils/filesystem.js";
import { resolveConflict, type ConflictStrategy, type ConflictResolution } from "./conflicts.js";
import { markSkillInstalled, readManifest, writeManifest, type Manifest } from "./manifest.js";
import type { AvailableSkill } from "./skills.js";

export type InstallSkillOptions = {
  skill: AvailableSkill;
  targetDirectory: string;
  conflictStrategy: ConflictStrategy;
};

export type InstallSkillResult = {
  skillName: string;
  resolution: ConflictResolution;
};

export class SkillAlreadyExistsError extends Error {
  constructor(public readonly skillName: string) {
    super(`Skill "${skillName}" already exists and conflict strategy is "error".`);
    this.name = "SkillAlreadyExistsError";
  }
}

/**
 * Installs a single skill into the target project's .agents/skills directory.
 * Never deletes anything it didn't create itself; overwrite only removes the
 * specific managed skill directory being replaced, never sibling directories.
 */
export async function installSkill(options: InstallSkillOptions): Promise<InstallSkillResult> {
  const { skill, targetDirectory, conflictStrategy } = options;
  const targetSkillsDir = getTargetSkillsDirectory(targetDirectory);
  const destination = path.join(targetSkillsDir, skill.name);

  const exists = await pathExists(destination);
  const resolution = resolveConflict(exists, conflictStrategy);

  switch (resolution) {
    case "install":
      await ensureDirectory(targetSkillsDir);
      await copyDirectoryRecursive(skill.sourceDirectory, destination);
      break;
    case "overwrite":
      await removeDirectoryRecursive(destination);
      await copyDirectoryRecursive(skill.sourceDirectory, destination);
      break;
    case "skip":
      break;
    case "error":
      throw new SkillAlreadyExistsError(skill.name);
  }

  return { skillName: skill.name, resolution };
}

export type InstallManyOptions = {
  skills: AvailableSkill[];
  targetDirectory: string;
  conflictStrategy: ConflictStrategy;
  packageVersion: string;
};

export type InstallManyResult = {
  results: InstallSkillResult[];
  manifest: Manifest;
};

/** Installs multiple skills and persists the manifest once at the end. */
export async function installSkills(options: InstallManyOptions): Promise<InstallManyResult> {
  const { skills, targetDirectory, conflictStrategy, packageVersion } = options;

  let manifest = await readManifest(targetDirectory, packageVersion);
  const results: InstallSkillResult[] = [];

  for (const skill of skills) {
    const result = await installSkill({ skill, targetDirectory, conflictStrategy });
    results.push(result);

    if (result.resolution === "install" || result.resolution === "overwrite") {
      manifest = markSkillInstalled(manifest, skill.name, packageVersion);
    }
  }

  await writeManifest(targetDirectory, manifest);

  return { results, manifest };
}

/** Directory names currently present in the target project's .agents/skills. */
export async function listInstalledSkillNames(targetDirectory: string): Promise<string[]> {
  return listSubdirectories(getTargetSkillsDirectory(targetDirectory));
}
