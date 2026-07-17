import { checkbox } from "@inquirer/prompts";
import { discoverAvailableSkills } from "../core/skills.js";
import { installSkills } from "../core/installer.js";
import { listInstalledSkillNames } from "../core/installer.js";
import { getPackageVersion } from "../core/version.js";
import { logger } from "../utils/logger.js";
import type { ConflictStrategy } from "../core/conflicts.js";

export type InitOptions = {
  all?: boolean;
  force?: boolean;
  skipExisting?: boolean;
  cwd?: string;
};

function resolveNonInteractiveStrategy(options: InitOptions): ConflictStrategy | null {
  if (options.force) return "overwrite";
  if (options.skipExisting) return "skip";
  return null;
}

export async function runInit(options: InitOptions): Promise<void> {
  const targetDirectory = options.cwd ?? process.cwd();
  const available = await discoverAvailableSkills();

  logger.title("Agent Skills");
  logger.muted(`Target: ${targetDirectory}`);

  if (available.length === 0) {
    logger.warn("No skills found in the package. Nothing to install.");
    return;
  }

  const alreadyInstalled = new Set(await listInstalledSkillNames(targetDirectory));

  let selectedNames: string[];
  if (options.all) {
    selectedNames = available.map((skill) => skill.name);
  } else {
    selectedNames = await checkbox({
      message: "Select skills to install:",
      choices: available.map((skill) => ({
        name: alreadyInstalled.has(skill.name) ? `${skill.name} (installed)` : skill.name,
        value: skill.name,
        checked: !alreadyInstalled.has(skill.name),
      })),
    });
  }

  if (selectedNames.length === 0) {
    logger.warn("No skills selected. Nothing to install.");
    return;
  }

  const selectedSkills = available.filter((skill) => selectedNames.includes(skill.name));
  const packageVersion = await getPackageVersion();

  const nonInteractiveStrategy = resolveNonInteractiveStrategy(options);
  const conflictStrategy: ConflictStrategy = nonInteractiveStrategy ?? "skip";

  if (!nonInteractiveStrategy) {
    const conflicting = selectedSkills.filter((skill) => alreadyInstalled.has(skill.name));
    if (conflicting.length > 0) {
      logger.warn(
        `${conflicting.length} selected skill(s) already exist and will be skipped by default. Re-run with --force to overwrite or --skip-existing to suppress this notice.`,
      );
    }
  }

  logger.plain("");
  logger.info("Installing...");

  const { results } = await installSkills({
    skills: selectedSkills,
    targetDirectory,
    conflictStrategy,
    packageVersion,
  });

  logger.plain("");
  let installedCount = 0;
  for (const result of results) {
    if (result.resolution === "install") {
      logger.success(result.skillName);
      installedCount += 1;
    } else if (result.resolution === "overwrite") {
      logger.success(`${result.skillName} (overwritten)`);
      installedCount += 1;
    } else if (result.resolution === "skip") {
      logger.skip(`${result.skillName} (already exists, skipped)`);
    }
  }

  logger.plain("");
  logger.info(`Installed ${installedCount} skill${installedCount === 1 ? "" : "s"} into .agents/skills`);
}
