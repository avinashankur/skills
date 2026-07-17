import { describe, it, expect } from "vitest";
import { discoverAvailableSkills, findAvailableSkill, suggestClosestSkillName } from "../src/core/skills.js";

describe("discoverAvailableSkills", () => {
  it("finds all bundled skills with a SKILL.md", async () => {
    const skills = await discoverAvailableSkills();
    const names = skills.map((s) => s.name).sort();
    expect(names).toEqual(["code-review", "create-issue", "debugging"]);
  });
});

describe("findAvailableSkill", () => {
  it("returns the matching skill", async () => {
    const skill = await findAvailableSkill("code-review");
    expect(skill?.name).toBe("code-review");
  });

  it("returns null for an unknown skill", async () => {
    const skill = await findAvailableSkill("does-not-exist");
    expect(skill).toBeNull();
  });
});

describe("suggestClosestSkillName", () => {
  it("suggests the closest match for a typo", () => {
    const suggestion = suggestClosestSkillName("code-reveiw", ["code-review", "create-issue", "debugging"]);
    expect(suggestion).toBe("code-review");
  });

  it("returns null when nothing is close enough", () => {
    const suggestion = suggestClosestSkillName("totally-unrelated-xyz", ["code-review", "create-issue"]);
    expect(suggestion).toBeNull();
  });
});
