import { proficiencyBonusByLevel } from "./constants";

/** Modifier of an ability score: floor((score-10)/2). */
export function modifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/** Signed modifier to display on the sheet, e.g. "+3" or "-1". */
export function signedModifier(score: number): string {
  const mod = modifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function proficiencyBonus(level: number): number {
  return proficiencyBonusByLevel(level);
}

/** Bonus of a saving throw or skill: modifier + proficiency (if applicable). */
export function bonusWithProficiency(
  abilityScore: number,
  level: number,
  isProficient: boolean,
  isExpert = false
): number {
  const base = modifier(abilityScore);
  if (!isProficient) return base;
  const multiplier = isExpert ? 2 : 1;
  return base + proficiencyBonus(level) * multiplier;
}

export function initiative(dexterity: number): number {
  return modifier(dexterity);
}

/** AC without armor: 10 + DEX mod. If armor is equipped, its base AC is passed in. */
export function armorClass(dexterity: number, baseArmorAc = 10, shieldBonus = 0): number {
  return baseArmorAc + modifier(dexterity) + shieldBonus;
}

/** Spell save DC: 8 + proficiency + spellcasting ability modifier. */
export function spellSaveDc(
  level: number,
  spellcastingAbilityMod: number
): number {
  return 8 + proficiencyBonus(level) + spellcastingAbilityMod;
}

/** Spell attack bonus: proficiency + spellcasting ability modifier. */
export function spellAttackBonus(
  level: number,
  spellcastingAbilityMod: number
): number {
  return proficiencyBonus(level) + spellcastingAbilityMod;
}

/** Initial hit points at level 1: maximum hit die + CON mod. */
export function initialHitPoints(hitDie: number, constitution: number): number {
  return hitDie + modifier(constitution);
}
