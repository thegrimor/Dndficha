import { ABILITIES } from "./constants";
import type { BackgroundSrd } from "./srd-data";
import {
  backgroundBonusAbilities,
  backgroundFeatureDescription,
  backgroundSkills,
  backgroundTools,
  backgroundLanguageChoiceCount,
  backgroundFeatureName,
  type Open5eBackground,
} from "./resource-types";

/**
 * Adapts a background as returned by Open5e to the internal
 * `BackgroundSrd` shape that the rest of the wizard already consumes
 * (proficiencies.ts, summary-step, actions/wizard.ts...), so those places do
 * not need to change.
 *
 * The trio of abilities for the 2024 bonus comes confirmed live inside the
 * background itself (`type: "ability_score"` benefit); if for some reason it
 * cannot be interpreted, all six are offered so the player can split the
 * +2/+1 (or +1/+1/+1) freely instead of getting blocked.
 */
export function backgroundFromOpen5e(bg: Open5eBackground): BackgroundSrd {
  return {
    id: bg.slug ?? bg.key ?? bg.name,
    name: bg.name,
    skillProficiencies: backgroundSkills(bg),
    languageChoiceCount: backgroundLanguageChoiceCount(bg),
    toolProficiencies: backgroundTools(bg),
    abilityBonusOptions: backgroundBonusAbilities(bg) ?? [...ABILITIES],
    feature: {
      name: backgroundFeatureName(bg),
      description: backgroundFeatureDescription(bg),
    },
  };
}
