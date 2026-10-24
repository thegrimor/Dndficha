import {
  aggregateProficiencies,
  STANDARD_ARRAY,
  ABILITIES,
  CLASSES_SRD,
  RACES_SRD,
  computeFinalScores,
  armorClass,
  emptySheet,
  initiative,
  initialHitPoints,
  type WizardData,
  type ChosenFeat,
  type CharacterSheet,
  type BackgroundSrd,
} from "@dndficha/rules";

import { DomainError } from "../../../shared-kernel/domain-error";

/** What the wizard sends: same as `WizardData`, but the background is resolved on the server. */
export type WizardRequest = Omit<WizardData, "backgroundData">;

export interface NewCharacter {
  name: string;
  race: string;
  class: string;
  level: 1;
  background: string;
  edition: CharacterSheet["edition"];
  sheet: CharacterSheet;
}

const invalid = (message: string, code: string) => new DomainError("validation", message, code);

/**
 * Domain service: validates the wizard's choices against the SRD rules and
 * builds the level 1 sheet. It does no I/O: the background and the feat
 * arrive already resolved by the use case.
 */
export function buildCharacter(
  input: WizardRequest,
  background: BackgroundSrd,
  feat: ChosenFeat | null
): NewCharacter {
  const name = input.name.trim();
  if (!name) throw invalid("Falta el nombre del personaje", "name_required");

  const race = RACES_SRD.find((r) => r.id === input.raceId);
  const characterClass = CLASSES_SRD.find((c) => c.id === input.classId);
  if (!race) throw invalid("Raza no válida", "invalid_race");
  if (!characterClass) throw invalid("Clase no válida", "invalid_class");

  if (
    input.edition === "2014" &&
    race.freeChoice &&
    new Set(input.raceAbilityChoices).size !== race.freeChoice.count
  ) {
    throw invalid("Elecciones de característica de la raza incompletas", "invalid_race_choices");
  }

  const chosenSkills = input.chosenClassSkills;
  if (
    new Set(chosenSkills).size !== characterClass.skillChoiceCount ||
    chosenSkills.length !== characterClass.skillChoiceCount ||
    chosenSkills.some((h) => !characterClass.availableSkills.includes(h))
  ) {
    throw invalid("Habilidades de clase no válidas", "invalid_class_skills");
  }

  if (input.chosenBackgroundLanguages.length !== background.languageChoiceCount) {
    throw invalid("Idiomas del trasfondo no válidos", "invalid_languages");
  }

  validateScores(input);

  if (input.edition === "2024") {
    const { mode, plus2, plus1 } = input.backgroundBonus;
    const options = background.abilityBonusOptions ?? [];
    if (mode === "split" && (!plus2 || !plus1 || plus2 === plus1 || !options.includes(plus2) || !options.includes(plus1))) {
      throw invalid("Reparto del bonificador del trasfondo no válido", "invalid_background_bonus");
    }
    if (!feat) throw invalid("Falta la dote de origen", "origin_feat_required");
  }

  const abilityScores = computeFinalScores({
    edition: input.edition,
    race,
    background,
    baseScores: input.baseScores,
    raceAbilityChoices: input.raceAbilityChoices,
    backgroundBonus: input.backgroundBonus,
  });

  const { skills, savingThrows, languages, proficiencies } = aggregateProficiencies({
    race,
    characterClass,
    background,
    chosenClassSkills: chosenSkills,
    chosenBackgroundLanguages: input.chosenBackgroundLanguages,
  });

  const maxHp = Math.max(1, initialHitPoints(characterClass.hitDie, abilityScores.con));
  const sheet: CharacterSheet = {
    ...emptySheet(),
    edition: input.edition,
    abilityScores,
    savingThrows,
    skills,
    languages,
    proficiencies,
    features: [...race.features, ...characterClass.level1Features, background.feature, ...(input.edition === "2024" && feat ? [feat] : [])],
    combat: {
      ac: armorClass(abilityScores.dex),
      initiative: initiative(abilityScores.dex),
      speed: race.speed,
      hp: { current: maxHp, max: maxHp, temp: 0 },
      hitDice: `1d${characterClass.hitDie}`,
    },
  };

  return { name: name, race: race.name, class: characterClass.name, level: 1, background: background.name, edition: input.edition, sheet };
}

function validateScores({ scoreMethod, baseScores }: WizardRequest): void {
  const values = ABILITIES.map((c) => baseScores[c]);
  if (scoreMethod === "array") {
    const expected = [...STANDARD_ARRAY].sort((a, b) => a - b).join(",");
    if ([...values].sort((a, b) => a - b).join(",") !== expected) {
      throw invalid("Las puntuaciones deben ser una asignación del array estándar", "invalid_scores");
    }
    return;
  }
  if (!values.every((v) => Number.isInteger(v) && v >= 1 && v <= 30)) {
    throw invalid("Las puntuaciones deben estar entre 1 y 30", "invalid_scores");
  }
}
