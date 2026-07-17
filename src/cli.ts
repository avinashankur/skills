import { Command } from "commander";
import { runInit } from "./commands/init.js";
import { runList } from "./commands/list.js";
import { runAdd } from "./commands/add.js";
import { runUpdate } from "./commands/update.js";
import { getPackageVersion } from "./core/version.js";
import { logger } from "./utils/logger.js";

async function main(): Promise<void> {
  const program = new Command();
  const version = await getPackageVersion();

  program
    .name("agent-skills")
    .description("Maintain one canonical collection of agent skills and install them into any project.")
    .version(version);

  program
    .command("init")
    .description("Install skills into the current project (interactive by default)")
    .option("--all", "install every available skill without prompting")
    .option("--force", "overwrite skills that already exist")
    .option("--skip-existing", "never overwrite skills that already exist (default)")
    .action(async (opts) => {
      await runInit({ all: opts.all, force: opts.force, skipExisting: opts.skipExisting });
    });
  program.command("i").description("Alias for init").action(async () => runInit({}));

  program
    .command("list")
    .description("List available skills and whether they're installed in this project")
    .action(async () => {
      await runList({});
    });
  program.command("ls").description("Alias for list").action(async () => runList({}));

  program
    .command("add <skills...>")
    .description("Install one or more specific skills by name")
    .option("--force", "overwrite the skill(s) if they already exist")
    .action(async (skills: string[], opts) => {
      await runAdd(skills, { force: opts.force });
    });

  program
    .command("update")
    .description("Update all CLI-managed skills to the current package version; custom skills are untouched")
    .action(async () => {
      await runUpdate({});
    });

  program.showHelpAfterError(true);

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

main();
