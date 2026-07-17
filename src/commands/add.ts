import { discoverAvailableSkills, suggestClosestSkillName } from "../core/skills.js";
import { installSkills } from "../core/installer.js";
import { getPackageVersion } from "../core/version.js";
import { logger } from "../utils/logger.js";
import type { ConflictStrategy } from "../core/conflicts.js";

export type AddOptions = {
  force?: boolean;
  cwd?: string;
};

export async function runAdd(skillNames: string[], options: AddOptions): Promise<void> {
  if (skillNames.length === 0) {
    logger.error("Specify at least one skill name, e.g. `agent-skills add code-review`");
    process.exitCode = 1;
    return;
  }

  const targetDirectory = options.cwd ?? process.cwd();
  const available = await discoverAvailableSkills();
  const availableNames = available.map((skill) => skill.name);

  const unknown = skillNames.filter((name) => !availableNames.includes(name));
  if (unknown.length > 0) {
    for (const name of unknown) {
      logger.error(`Unknown skill: ${name}`);
      const suggestion = suggestClosestSkillName(name, availableNames);
      if (suggestion) {
        logger.plain(`  Did you mean?\n    ${suggestion}`);
      }
    }
    process.exitCode = 1;
    return;
  }

  const selectedSkills = available.filter((skill) => skillNames.includes(skill.name));
  const packageVersion = await getPackageVersion();
  const conflictStrategy: ConflictStrategy = options.force ? "overwrite" : "skip";

  const { results } = await installSkills({
    skills: selectedSkills,
    targetDirectory,
    conflictStrategy,
    packageVersion,
  });

  for (const result of results) {
    if (result.resolution === "install") {
      logger.success(result.skillName);
    } else if (result.resolution === "overwrite") {
      logger.success(`${result.skillName} (overwritten)`);
    } else if (result.resolution === "skip") {
      logger.skip(`${result.skillName} (already exists, skipped — use --force to overwrite)`);
    }
  }
}
