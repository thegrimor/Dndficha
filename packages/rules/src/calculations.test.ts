import { describe, expect, it } from "vitest";

import {
  proficiencyBonus,
  spellAttackBonus,
  bonusWithProficiency,
  spellSaveDc,
  armorClass,
  initiative,
  modifier,
  signedModifier,
  initialHitPoints,
} from "./calculations";

describe("modifier", () => {
  it("calcula floor((score-10)/2)", () => {
    expect(modifier(10)).toBe(0);
    expect(modifier(11)).toBe(0);
    expect(modifier(12)).toBe(1);
    expect(modifier(8)).toBe(-1);
    expect(modifier(20)).toBe(5);
    expect(modifier(1)).toBe(-5);
  });

  it("formats with a sign", () => {
    expect(signedModifier(16)).toBe("+3");
    expect(signedModifier(8)).toBe("-1");
    expect(signedModifier(10)).toBe("+0");
  });
});

describe("proficiencyBonus", () => {
  it("follows the PHB progression table", () => {
    expect(proficiencyBonus(1)).toBe(2);
    expect(proficiencyBonus(4)).toBe(2);
    expect(proficiencyBonus(5)).toBe(3);
    expect(proficiencyBonus(9)).toBe(4);
    expect(proficiencyBonus(13)).toBe(5);
    expect(proficiencyBonus(17)).toBe(6);
    expect(proficiencyBonus(20)).toBe(6);
  });
});

describe("bonusWithProficiency", () => {
  it("without proficiency only the modifier applies", () => {
    expect(bonusWithProficiency(14, 1, false)).toBe(2);
  });

  it("with proficiency adds the proficiency bonus", () => {
    expect(bonusWithProficiency(14, 1, true)).toBe(4);
  });

  it("with expertise doubles the proficiency bonus", () => {
    expect(bonusWithProficiency(14, 5, true, true)).toBe(2 + 3 * 2);
  });
});

describe("initiative and AC", () => {
  it("initiative is the DEX mod", () => {
    expect(initiative(14)).toBe(2);
  });

  it("AC without armor is 10 + DEX mod", () => {
    expect(armorClass(14)).toBe(12);
  });

  it("AC with armor and shield adds both bonuses", () => {
    expect(armorClass(14, 14, 2)).toBe(18);
  });
});

describe("spells", () => {
  it("save DC = 8 + proficiency + ability mod", () => {
    expect(spellSaveDc(5, 3)).toBe(8 + 3 + 3);
  });

  it("attack bonus = proficiency + ability mod", () => {
    expect(spellAttackBonus(5, 3)).toBe(3 + 3);
  });
});

describe("initialHitPoints", () => {
  it("is the maximum hit die + CON mod", () => {
    expect(initialHitPoints(8, 14)).toBe(10);
  });
});
