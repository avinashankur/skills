export type ConflictStrategy = "skip" | "overwrite" | "error" | "prompt";

export type ConflictResolution = "install" | "skip" | "overwrite" | "error";

/**
 * Pure decision function: given whether a skill already exists on disk and
 * the configured strategy, decide what the installer should do. Kept free
 * of filesystem/IO so it's trivial to unit test exhaustively.
 */
export function resolveConflict(exists: boolean, strategy: ConflictStrategy): ConflictResolution {
  if (!exists) {
    return "install";
  }

  switch (strategy) {
    case "skip":
      return "skip";
    case "overwrite":
      return "overwrite";
    case "error":
      return "error";
    case "prompt":
      // Caller is responsible for prompting interactively before calling this
      // with a resolved strategy; "prompt" alone must never reach the installer.
      throw new Error("resolveConflict received 'prompt' strategy without prior resolution");
    default: {
      const exhaustiveCheck: never = strategy;
      throw new Error(`Unknown conflict strategy: ${String(exhaustiveCheck)}`);
    }
  }
}
