import { discoverAvailableSkills } from "../core/skills.js";
import { installSkills, listInstalledSkillNames } from "../core/installer.js";
import { readManifest, isManagedByManifest } from "../core/manifest.js";
import { getPackageVersion } from "../core/version.js";
import { logger } from "../utils/logger.js";

export type UpdateOptions = {
  cwd?: string;
};

export async function runUpdate(options: UpdateOptions): Promise<void> {
  const targetDirectory = options.cwd ?? process.cwd();
  const packageVersion = await getPackageVersion();

  const manifest = await readManifest(targetDirectory, packageVersion);
  const installedNames = await listInstalledSkillNames(targetDirectory);
  const available = await discoverAvailableSkills();
  const availableByName = new Map(available.map((skill) => [skill.name, skill]));

  const managedInstalled = installedNames.filter((name) => isManagedByManifest(manifest, name));
  const customInstalled = installedNames.filter((name) => !isManagedByManifest(manifest, name));

  if (managedInstalled.length === 0) {
    logger.info("No CLI-managed skills to update.");
    if (customInstalled.length > 0) {
      logger.muted(`(${customInstalled.length} custom skill(s) present and left untouched.)`);
    }
    return;
  }

  logger.title("Updating CLI-managed skills");

  const toUpdate = managedInstalled
    .map((name) => availableByName.get(name))
    .filter((skill): skill is NonNullable<typeof skill> => Boolean(skill));

  const removedFromPackage = managedInstalled.filter((name) => !availableByName.has(name));
  for (const name of removedFromPackage) {
    logger.warn(`${name} is no longer published in this version of the package — left as-is.`);
  }

  const { results } = await installSkills({
    skills: toUpdate,
    targetDirectory,
    conflictStrategy: "overwrite",
    packageVersion,
  });

  for (const result of results) {
    logger.success(`${result.skillName} updated`);
  }

  if (customInstalled.length > 0) {
    logger.plain("");
    logger.muted(`${customInstalled.length} custom skill(s) left untouched: ${customInstalled.join(", ")}`);
  }
}
