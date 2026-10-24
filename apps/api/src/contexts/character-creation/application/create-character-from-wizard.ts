import { FEATS_SRD, backgroundFromOpen5e, type ChosenFeat } from "@dndficha/rules";

import { DomainError } from "../../../shared-kernel/domain-error";
import type { CatalogService } from "../../catalog/application/catalog-service";
import type { CharacterService, CharacterDto } from "../../characters/application/character-service";
import { extractCore } from "../../characters/domain/character";
import { buildCharacter, type WizardRequest } from "../domain/character-builder";

export class CreateCharacterFromWizard {
  constructor(
    private catalog: CatalogService,
    private characters: CharacterService
  ) {}

  async execute(userId: string, input: WizardRequest): Promise<CharacterDto> {
    if (!input.backgroundId) throw new DomainError("validation", "Falta el trasfondo", "background_required");

    // The background is taken from the catalog, never from what the client sends.
    const background = backgroundFromOpen5e(await this.catalog.getBackground(input.edition, input.backgroundId));
    const incoming = buildCharacter(input, background, resolveFeat(input));

    const { edition, inventory, spells, ...core } = incoming.sheet;
    return this.characters.create(userId, {
      name: incoming.name,
      race: incoming.race,
      class: incoming.class,
      level: incoming.level,
      background: incoming.background,
      alignment: null,
      imageUrl: null,
      edition: edition,
      core: extractCore({ edition, inventory, spells, ...core }),
      inventory,
      spells,
    });
  }
}

function resolveFeat({ originFeat, edition }: WizardRequest): ChosenFeat | null {
  if (edition !== "2024") return null;
  if (originFeat.mode === "manual") {
    const name = originFeat.manualName.trim();
    if (!name) return null;
    return { name: name.slice(0, 200), description: originFeat.manualDescription.trim().slice(0, 5000) };
  }
  // From the catalog: the server's official description is used, not the one sent by the client.
  const feat = FEATS_SRD.find((d) => d.name === originFeat.chosenFeat?.name);
  return feat ? { name: feat.name, description: feat.description } : null;
}
