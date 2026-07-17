import { getManifestPath } from "./paths.js";
import { readJsonFile, writeJsonFile } from "../utils/filesystem.js";

export const MANIFEST_SCHEMA_VERSION = 1;

export type ManifestEntry = {
  version: string;
};

export type Manifest = {
  version: number;
  packageVersion: string;
  installedSkills: Record<string, ManifestEntry>;
};

function emptyManifest(packageVersion: string): Manifest {
  return {
    version: MANIFEST_SCHEMA_VERSION,
    packageVersion,
    installedSkills: {},
  };
}

export async function readManifest(targetDirectory: string, packageVersion: string): Promise<Manifest> {
  const manifestPath = getManifestPath(targetDirectory);
  const existing = await readJsonFile<Manifest>(manifestPath);

  if (!existing) {
    return emptyManifest(packageVersion);
  }

  // Defensive defaults in case of a partially-written or older manifest.
  return {
    version: existing.version ?? MANIFEST_SCHEMA_VERSION,
    packageVersion: existing.packageVersion ?? packageVersion,
    installedSkills: existing.installedSkills ?? {},
  };
}

export async function writeManifest(targetDirectory: string, manifest: Manifest): Promise<void> {
  await writeJsonFile(getManifestPath(targetDirectory), manifest);
}

export function markSkillInstalled(manifest: Manifest, skillName: string, packageVersion: string): Manifest {
  return {
    ...manifest,
    packageVersion,
    installedSkills: {
      ...manifest.installedSkills,
      [skillName]: { version: packageVersion },
    },
  };
}

export function isManagedByManifest(manifest: Manifest, skillName: string): boolean {
  return Object.prototype.hasOwnProperty.call(manifest.installedSkills, skillName);
}
