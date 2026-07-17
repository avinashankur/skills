import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { installSkills } from "../src/core/installer.js";
import { discoverAvailableSkills } from "../src/core/skills.js";
import { runUpdate } from "../src/commands/update.js";
import { getTargetSkillsDirectory } from "../src/core/paths.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-skills-update-test-"));
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("runUpdate", () => {
  it("refreshes CLI-managed skills and leaves custom skills untouched", async () => {
    const available = await discoverAvailableSkills();
    await installSkills({
      skills: available,
      targetDirectory: tempDir,
      conflictStrategy: "skip",
      packageVersion: "1.0.0",
    });

    // Simulate local modification of a managed skill (should be overwritten by update)
    const codeReviewFile = path.join(getTargetSkillsDirectory(tempDir), "code-review", "SKILL.md");
    await fs.writeFile(codeReviewFile, "locally modified content");

    // Add a custom, unmanaged skill (should never be touched)
    const customSkillDir = path.join(getTargetSkillsDirectory(tempDir), "project-deployment");
    await fs.mkdir(customSkillDir, { recursive: true });
    await fs.writeFile(path.join(customSkillDir, "SKILL.md"), "custom deployment skill");

    await runUpdate({ cwd: tempDir });

    const refreshedContent = await fs.readFile(codeReviewFile, "utf-8");
    expect(refreshedContent).not.toBe("locally modified content");
    expect(refreshedContent).toContain("Code Review");

    const customContent = await fs.readFile(path.join(customSkillDir, "SKILL.md"), "utf-8");
    expect(customContent).toBe("custom deployment skill");
  });

  it("does nothing when no CLI-managed skills are installed", async () => {
    await expect(runUpdate({ cwd: tempDir })).resolves.not.toThrow();
  });
});
