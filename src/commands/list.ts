import { discoverAvailableSkills } from "../core/skills.js";
import { listInstalledSkillNames } from "../core/installer.js";
import { logger } from "../utils/logger.js";

export type ListOptions = {
  cwd?: string;
};

export async function runList(options: ListOptions): Promise<void> {
  const targetDirectory = options.cwd ?? process.cwd();
  const available = await discoverAvailableSkills();

  if (available.length === 0) {
    logger.warn("No skills found in the package.");
    return;
  }

  const installed = new Set(await listInstalledSkillNames(targetDirectory));

  logger.title("Available skills");
  for (const skill of available) {
    if (installed.has(skill.name)) {
      logger.success(`${skill.name}\tinstalled`);
    } else {
      logger.skip(`${skill.name}\tnot installed`);
    }
  }
  logger.plain("");
}
