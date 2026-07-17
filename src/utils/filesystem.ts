import fs from "node:fs/promises";
import path from "node:path";

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function isDirectory(targetPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(targetPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export async function ensureDirectory(targetPath: string): Promise<void> {
  await fs.mkdir(targetPath, { recursive: true });
}

/** List immediate subdirectory names of a directory. Returns [] if the directory doesn't exist. */
export async function listSubdirectories(targetPath: string): Promise<string[]> {
  if (!(await pathExists(targetPath))) {
    return [];
  }
  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

/** Recursively copy a directory. Requires Node 18+ (fs.cp). */
export async function copyDirectoryRecursive(source: string, destination: string): Promise<void> {
  await fs.cp(source, destination, { recursive: true, force: true });
}

/** Recursively remove a directory if it exists. Used only for managed-skill overwrite/update, never for unknown directories. */
export async function removeDirectoryRecursive(targetPath: string): Promise<void> {
  if (await pathExists(targetPath)) {
    await fs.rm(targetPath, { recursive: true, force: true });
  }
}

export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  if (!(await pathExists(filePath))) {
    return null;
  }
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await ensureDirectory(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}
