import { describe, it, expect } from "vitest";
import { resolveConflict } from "../src/core/conflicts.js";

describe("resolveConflict", () => {
  it("always installs when the skill does not exist, regardless of strategy", () => {
    expect(resolveConflict(false, "skip")).toBe("install");
    expect(resolveConflict(false, "overwrite")).toBe("install");
    expect(resolveConflict(false, "error")).toBe("install");
  });

  it("skips when the skill exists and strategy is 'skip'", () => {
    expect(resolveConflict(true, "skip")).toBe("skip");
  });

  it("overwrites when the skill exists and strategy is 'overwrite'", () => {
    expect(resolveConflict(true, "overwrite")).toBe("overwrite");
  });

  it("errors when the skill exists and strategy is 'error'", () => {
    expect(resolveConflict(true, "error")).toBe("error");
  });

  it("throws if given 'prompt' directly, since callers must resolve prompts first", () => {
    expect(() => resolveConflict(true, "prompt")).toThrow();
  });
});
