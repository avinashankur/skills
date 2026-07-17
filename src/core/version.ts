import path from "node:path";
import { readJsonFile } from "../utils/filesystem.js";
import { getPackageRoot } from "./paths.js";

type PackageJson = { version: string };

let cachedVersion: string | null = null;

export async function getPackageVersion(): Promise<string> {
  if (cachedVersion) {
    return cachedVersion;
  }
  const pkgJsonPath = path.join(getPackageRoot(), "package.json");
  const pkg = await readJsonFile<PackageJson>(pkgJsonPath);
  cachedVersion = pkg?.version ?? "0.0.0";
  return cachedVersion;
}
