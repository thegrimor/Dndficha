import type { Ability } from "./constants";
import type { ClassSrd, RaceSrd, BackgroundSrd } from "./srd-data";
import type { DndEdition } from "./editions";
import type { CharacterSheet } from "./character-sheet";

export type BackgroundBonusMode = "split" | "even";

/**
 * Player's choice for the background's ability score bonus in the 2024
 * edition: "split" gives +2 to one ability and +1 to another (among the
 * three tied to the background); "even" gives +1 to all three.
 */
export interface ChosenBackgroundBonus {
  mode: BackgroundBonusMode;
  plus2: Ability | null;
  plus1: Ability | null;
}

export interface AggregatedProficiencies {
  skills: CharacterSheet["skills"];
  savingThrows: CharacterSheet["savingThrows"];
  languages: string[];
  proficiencies: CharacterSheet["proficiencies"];
}

/**
 * Aggregates the skill/saving throw/language proficiencies granted by
 * race + class + background in the shape CharacterSheet expects.
 */
export function aggregateProficiencies(data: {
  race: RaceSrd;
  characterClass: ClassSrd;
  background: BackgroundSrd;
  chosenClassSkills: string[];
  chosenBackgroundLanguages: string[];
}): AggregatedProficiencies {
  const { race, characterClass, background, chosenClassSkills, chosenBackgroundLanguages } = data;

  const proficientSkillIds = new Set([
    ...(race.skillProficiencies ?? []),
    ...chosenClassSkills,
    ...background.skillProficiencies,
  ]);

  const skills: CharacterSheet["skills"] = {};
  for (const id of proficientSkillIds) {
    skills[id] = { proficient: true };
  }

  const savingThrows: CharacterSheet["savingThrows"] = {};
  for (const ability of characterClass.savingThrowProficiencies as Ability[]) {
    savingThrows[ability] = { proficient: true };
  }

  const languages = Array.from(new Set([...race.languages, ...chosenBackgroundLanguages]));

  const proficiencies: CharacterSheet["proficiencies"] = {
    armor: [...characterClass.armorProficiencies],
    weapons: [...characterClass.weaponProficiencies],
    tools: Array.from(new Set([...characterClass.toolProficiencies, ...background.toolProficiencies])),
  };

  return { skills, savingThrows, languages, proficiencies };
}

/**
 * Applies the ability score bonus to the base scores. The source of the
 * bonus depends on the edition: in 2014 it comes from the race (fixed +
 * free choice); in 2024 it comes from the background (split or even among
 * its three associated abilities).
 */
export function computeFinalScores(data: {
  edition: DndEdition;
  race: RaceSrd;
  background: BackgroundSrd;
  baseScores: Record<Ability, number>;
  raceAbilityChoices: Ability[];
  backgroundBonus: ChosenBackgroundBonus;
}): Record<Ability, number> {
  const finalScores = { ...data.baseScores };

  if (data.edition === "2014") {
    for (const [ability, bonus] of Object.entries(data.race.fixedBonus)) {
      const key = ability as Ability;
      finalScores[key] += bonus ?? 0;
    }
    for (const ability of data.raceAbilityChoices) {
      finalScores[ability] += data.race.freeChoice?.value ?? 0;
    }
    return finalScores;
  }

  const options = data.background.abilityBonusOptions ?? [];
  if (data.backgroundBonus.mode === "even") {
    for (const ability of options) {
      finalScores[ability] += 1;
    }
  } else {
    if (data.backgroundBonus.plus2) finalScores[data.backgroundBonus.plus2] += 2;
    if (data.backgroundBonus.plus1) finalScores[data.backgroundBonus.plus1] += 1;
  }
  return finalScores;
}
