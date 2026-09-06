import { describe, it, expect, beforeEach, afterEach } from "vitest";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { readManifest, writeManifest, markSkillInstalled, isManagedByManifest } from "../src/core/manifest.js";
import { getManifestPath } from "../src/core/paths.js";
import { pathExists } from "../src/utils/filesystem.js";

describe("manifest", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "skills-test-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("returns an empty manifest when no file exists", async () => {
    const manifest = await readManifest(tmpDir, "1.0.0");
    expect(manifest.version).toBe(1);
    expect(manifest.packageVersion).toBe("1.0.0");
    expect(manifest.installedSkills).toEqual({});
  });

  it("writes and reads skills-lock.json in .agents", async () => {
    let manifest = await readManifest(tmpDir, "1.0.0");
    manifest = markSkillInstalled(manifest, "code-review", "1.0.0");

    await writeManifest(tmpDir, manifest);

    const lockPath = getManifestPath(tmpDir);
    expect(lockPath.endsWith(path.join(".agents", "skills-lock.json"))).toBe(true);
    expect(await pathExists(lockPath)).toBe(true);

    const reloaded = await readManifest(tmpDir, "1.0.0");
    expect(reloaded.packageVersion).toBe("1.0.0");
    expect(isManagedByManifest(reloaded, "code-review")).toBe(true);
  });

  it("reads legacy agent-skills.json and migrates to skills-lock.json upon write", async () => {
    const agentsDir = path.join(tmpDir, ".agents");
    await fs.mkdir(agentsDir, { recursive: true });

    const legacyPath = path.join(agentsDir, "agent-skills.json");
    const legacyData = {
      version: 1,
      packageVersion: "0.9.0",
      installedSkills: {
        "git-commit": { version: "0.9.0" },
      },
    };
    await fs.writeFile(legacyPath, JSON.stringify(legacyData, null, 2), "utf-8");

    // Should read from legacy path
    const loaded = await readManifest(tmpDir, "1.0.0");
    expect(loaded.packageVersion).toBe("0.9.0");
    expect(isManagedByManifest(loaded, "git-commit")).toBe(true);

    // Write updated manifest
    const updated = markSkillInstalled(loaded, "code-review", "1.0.0");
    await writeManifest(tmpDir, updated);

    // New skills-lock.json should exist
    const newLockPath = getManifestPath(tmpDir);
    expect(await pathExists(newLockPath)).toBe(true);

    // Old legacy file should be cleaned up
    expect(await pathExists(legacyPath)).toBe(false);

    // Reloading reads from new lockfile
    const finalManifest = await readManifest(tmpDir, "1.0.0");
    expect(isManagedByManifest(finalManifest, "git-commit")).toBe(true);
    expect(isManagedByManifest(finalManifest, "code-review")).toBe(true);
  });
});
