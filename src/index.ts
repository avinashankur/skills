export { discoverAvailableSkills, findAvailableSkill } from "./core/skills.js";
export { installSkill, installSkills, listInstalledSkillNames } from "./core/installer.js";
export { readManifest, writeManifest, isManagedByManifest } from "./core/manifest.js";
export { resolveConflict } from "./core/conflicts.js";
export type { AvailableSkill } from "./core/skills.js";
export type { Manifest, ManifestEntry } from "./core/manifest.js";
export type { ConflictStrategy, ConflictResolution } from "./core/conflicts.js";
