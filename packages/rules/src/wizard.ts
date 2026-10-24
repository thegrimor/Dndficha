import type { Ability } from "./constants";
import type { ChosenBackgroundBonus } from "./proficiencies";
import type { BackgroundSrd } from "./srd-data";
import type { DndEdition } from "./editions";

export type ScoreMethod = "array" | "manual";

/** Resolved feat (name + description), whether from the live Open5e catalog or typed by hand. */
export interface ChosenFeat {
  name: string;
  description: string;
}

/**
 * Origin feat granted by the background (2024 edition only): "catalog"
 * picks a feat from the live Open5e catalog (see /api/open5e/feats),
 * "manual" lets the user type name and description freely for feats that
 * do not appear there.
 */
export interface ChosenOriginFeat {
  mode: "catalog" | "manual";
  chosenFeat: ChosenFeat | null;
  manualName: string;
  manualDescription: string;
}

/** Resolves the origin feat chosen in the wizard (catalog or manual) to a displayable feature. */
export function resolveOriginFeat(originFeat: ChosenOriginFeat): ChosenFeat | null {
  if (originFeat.mode === "manual") {
    if (!originFeat.manualName.trim()) return null;
    return { name: originFeat.manualName.trim(), description: originFeat.manualDescription.trim() };
  }
  return originFeat.chosenFeat;
}

/** State accumulated by the wizard across its steps. */
export interface WizardData {
  /** Rules edition (2014 or 2024/"5.5"); set once and kept on the character. */
  edition: DndEdition;
  name: string;
  raceId: string | null;
  classId: string | null;
  backgroundId: string | null;
  /** Chosen background, already normalized from Open5e (see open5e-backgrounds.ts). */
  backgroundData: BackgroundSrd | null;
  /** Abilities chosen for the racial free-choice bonus (e.g. half-elf). */
  raceAbilityChoices: Ability[];
  /** Skill ids (from SKILLS) chosen as class proficiencies. */
  chosenClassSkills: string[];
  /** Languages chosen by the background (in addition to the race's fixed ones). */
  chosenBackgroundLanguages: string[];
  /** Only relevant in the 2024 edition: split of the background's ability bonus. */
  backgroundBonus: ChosenBackgroundBonus;
  /** Only relevant in the 2024 edition: origin feat granted by the background. */
  originFeat: ChosenOriginFeat;
  scoreMethod: ScoreMethod;
  /** Base scores (before the racial bonus), one per ability. */
  baseScores: Record<Ability, number>;
}

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

export function initialWizardData(): WizardData {
  return {
    edition: "2014",
    name: "",
    raceId: null,
    classId: null,
    backgroundId: null,
    backgroundData: null,
    raceAbilityChoices: [],
    chosenClassSkills: [],
    chosenBackgroundLanguages: [],
    backgroundBonus: { mode: "split", plus2: null, plus1: null },
    originFeat: { mode: "catalog", chosenFeat: null, manualName: "", manualDescription: "" },
    scoreMethod: "array",
    baseScores: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
  };
}
