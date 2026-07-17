import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { installSkills, listInstalledSkillNames } from "../src/core/installer.js";
import { discoverAvailableSkills } from "../src/core/skills.js";
import { readManifest } from "../src/core/manifest.js";
import { getTargetSkillsDirectory } from "../src/core/paths.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-skills-test-"));
});

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
});

describe("installSkills", () => {
  it("installs into a fresh project with no .agents directory", async () => {
    const available = await discoverAvailableSkills();
    expect(available.length).toBeGreaterThan(0);

    await installSkills({
      skills: available,
      targetDirectory: tempDir,
      conflictStrategy: "skip",
      packageVersion: "1.0.0",
    });

    const installed = await listInstalledSkillNames(tempDir);
    expect(installed.sort()).toEqual(available.map((s) => s.name).sort());
  });

  it("copies nested skill directories recursively", async () => {
    const available = await discoverAvailableSkills();
    const debugging = available.find((s) => s.name === "debugging");
    expect(debugging).toBeDefined();

    await installSkills({
      skills: [debugging!],
      targetDirectory: tempDir,
      conflictStrategy: "skip",
      packageVersion: "1.0.0",
    });

    const nestedFile = path.join(
      getTargetSkillsDirectory(tempDir),
      "debugging",
      "references",
      "debugging-guide.md",
    );
    const exists = await fs
      .access(nestedFile)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);
  });

  it("preserves an existing .agents directory with unrelated content", async () => {
    const agentsDir = path.join(tempDir, ".agents");
    const rulesDir = path.join(agentsDir, "rules");
    await fs.mkdir(rulesDir, { recursive: true });
    await fs.writeFile(path.join(rulesDir, "custom.md"), "custom rule content");

    const available = await discoverAvailableSkills();
    await installSkills({
      skills: available,
      targetDirectory: tempDir,
      conflictStrategy: "skip",
      packageVersion: "1.0.0",
    });

    const ruleContent = await fs.readFile(path.join(rulesDir, "custom.md"), "utf-8");
    expect(ruleContent).toBe("custom rule content");
  });

  it("preserves a project-specific custom skill directory that isn't in the package", async () => {
    const customSkillDir = path.join(getTargetSkillsDirectory(tempDir), "project-deployment");
    await fs.mkdir(customSkillDir, { recursive: true });
    await fs.writeFile(path.join(customSkillDir, "SKILL.md"), "custom deployment skill");

    const available = await discoverAvailableSkills();
    await installSkills({
      skills: available,
      targetDirectory: tempDir,
      conflictStrategy: "skip",
      packageVersion: "1.0.0",
    });

    const content = await fs.readFile(path.join(customSkillDir, "SKILL.md"), "utf-8");
    expect(content).toBe("custom deployment skill");

    const manifest = await readManifest(tempDir, "1.0.0");
    expect(manifest.installedSkills["project-deployment"]).toBeUndefined();
  });

  it("is idempotent: running twice with skip does not duplicate or error", async () => {
    const available = await discoverAvailableSkills();

    await installSkills({
      skills: available,
      targetDirectory: tempDir,
      conflictStrategy: "skip",
      packageVersion: "1.0.0",
    });
    await installSkills({
      skills: available,
      targetDirectory: tempDir,
      conflictStrategy: "skip",
      packageVersion: "1.0.0",
    });

    const installed = await listInstalledSkillNames(tempDir);
    expect(installed.sort()).toEqual(available.map((s) => s.name).sort());
  });

  it("writes a manifest tracking only CLI-managed skills", async () => {
    const available = await discoverAvailableSkills();
    await installSkills({
      skills: available,
      targetDirectory: tempDir,
      conflictStrategy: "skip",
      packageVersion: "1.2.3",
    });

    const manifest = await readManifest(tempDir, "1.2.3");
    expect(manifest.packageVersion).toBe("1.2.3");
    for (const skill of available) {
      expect(manifest.installedSkills[skill.name]).toEqual({ version: "1.2.3" });
    }
  });
});
