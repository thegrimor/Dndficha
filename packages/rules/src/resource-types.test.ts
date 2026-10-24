import { describe, expect, it } from "vitest";

import {
  backgroundBonusAbilities,
  backgroundFeatureDescription,
  backgroundSkills,
  backgroundTools,
  backgroundLanguageChoiceCount,
  skillIdsFromText,
  backgroundFeatName,
  backgroundFeatureName,
  type Open5eBackground,
} from "./resource-types";

/** Real srd-2024 background (Acolyte), as confirmed live by Open5e v2. */
const ACOLYTE_2024: Open5eBackground = {
  key: "srd-2024_acolyte",
  name: "Acolyte",
  desc: "",
  benefits: [
    { name: "Ability Scores", desc: "Intelligence, Wisdom, Charisma", type: "ability_score" },
    {
      name: "Equipment",
      desc: "Choose A or B: (A) Calligrapher's Supplies, Book (prayers), Holy Symbol, Parchment (10 sheets), Robe, 8 GP; or (B) 50 GP",
      type: "equipment",
    },
    { name: "Feat", desc: "Magic Initiate (Cleric)", type: "feat" },
    { name: "Skill Proficiencies", desc: "Insight and Religion", type: "skill_proficiency" },
    { name: "Tool Proficiency", desc: "Calligrapher's Supplies", type: "tool_proficiency" },
  ],
};

describe("skillIdsFromText", () => {
  it("recognizes a comma-separated list", () => {
    expect(skillIdsFromText("Insight, Religion")).toEqual(["insight", "religion"]);
  });

  it("recognizes 'and' and two-word skills", () => {
    expect(skillIdsFromText("Sleight of Hand and Animal Handling")).toEqual([
      "sleight_of_hand",
      "animal_handling",
    ]);
  });

  it("ignores unrecognized names instead of breaking", () => {
    expect(skillIdsFromText("Insight, Algo Inventado")).toEqual(["insight"]);
  });

  it("returns empty if there is no text", () => {
    expect(skillIdsFromText(undefined)).toEqual([]);
  });
});

describe("backgroundSkills / tools / languages (real benefits[] schema)", () => {
  it("reads the skill and tool proficiencies of a real background (Acolyte 2024)", () => {
    expect(backgroundSkills(ACOLYTE_2024)).toEqual(["insight", "religion"]);
    expect(backgroundTools(ACOLYTE_2024)).toEqual(["Calligrapher's Supplies"]);
  });

  it("the 2024 SRD grants no languages from backgrounds (no benefit of that type)", () => {
    expect(backgroundLanguageChoiceCount(ACOLYTE_2024)).toBe(0);
  });

  it("recognizes a language benefit if it existed (e.g. 2014 SRD)", () => {
    const bg: Open5eBackground = {
      name: "Acolyte 2014",
      benefits: [{ name: "Languages", desc: "Two of your choice", type: "language" }],
    };
    expect(backgroundLanguageChoiceCount(bg)).toBe(2);
  });

  it("does not break if benefits are missing", () => {
    const bg: Open5eBackground = { name: "Misterioso" };
    expect(backgroundSkills(bg)).toEqual([]);
    expect(backgroundTools(bg)).toEqual([]);
    expect(backgroundLanguageChoiceCount(bg)).toBe(0);
  });
});

describe("backgroundFeatName", () => {
  it("reads the origin feat from the type: feat benefit", () => {
    expect(backgroundFeatName(ACOLYTE_2024)).toBe("Magic Initiate (Cleric)");
  });

  it("undefined if there is no feat benefit", () => {
    expect(backgroundFeatName({ name: "Misterioso" })).toBeUndefined();
  });
});

describe("backgroundBonusAbilities", () => {
  it("interprets the real trio of a 2024 background", () => {
    expect(backgroundBonusAbilities(ACOLYTE_2024)).toEqual(["int", "wis", "cha"]);
  });

  it("undefined if there is no ability_score benefit or exactly 3 are not recognized", () => {
    expect(backgroundBonusAbilities({ name: "Misterioso" })).toBeUndefined();
  });
});

describe("backgroundFeatureName / backgroundFeatureDescription", () => {
  it("the 2024 SRD has no feature of its own: the name is the background's, the description is the equipment", () => {
    expect(backgroundFeatureName(ACOLYTE_2024)).toBe("Acolyte");
    expect(backgroundFeatureDescription(ACOLYTE_2024)).toContain("Calligrapher's Supplies");
  });
});
