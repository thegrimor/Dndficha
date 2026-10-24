import type { CharacterSheet } from "@dndficha/rules";
import { emptySheet } from "@dndficha/rules";

import type { CharacterAccess } from "../../../shared-kernel/auth";
import { DomainError } from "../../../shared-kernel/domain-error";
import type { EventBus } from "../../../shared-kernel/domain-event";
import {
  coreSchema,
  extractCore,
  validateIdentity,
  type Character,
  type CharacterCreated,
  type CharacterData,
  type CharacterDeleted,
  type CharacterRepository,
} from "../domain/character";
import type { InventoryPort, SharingPort, SpellbookPort } from "../domain/ports";

/** Full sheet as consumed by the front end (same shape as `CharacterDto` in @dndficha/rules). */
export interface CharacterDto {
  id: string;
  owner_id: string;
  name: string;
  race: string | null;
  class: string | null;
  level: number;
  background: string | null;
  alignment: string | null;
  image_url: string | null;
  is_public: boolean;
  share_slug: string | null;
  sheet: CharacterSheet;
  created_at: string;
  updated_at: string;
}

export interface CharacterChanges {
  name?: string;
  race?: string | null;
  class?: string | null;
  level?: number;
  background?: string | null;
  alignment?: string | null;
  imageUrl?: string | null;
  sheet?: CharacterSheet;
}

export class CharacterService implements CharacterAccess {
  constructor(
    private repo: CharacterRepository,
    private inventory: InventoryPort,
    private spellbook: SpellbookPort,
    private sharing: SharingPort,
    private events: EventBus,
    private now: () => Date = () => new Date()
  ) {}

  async assertOwner(userId: string, characterId: string): Promise<void> {
    await this.loadOwned(userId, characterId);
  }

  async list(userId: string): Promise<CharacterDto[]> {
    return this.assemble(await this.repo.listByOwner(userId));
  }

  async get(userId: string, id: string): Promise<CharacterDto> {
    const character = await this.loadOwned(userId, id);
    return (await this.assemble([character]))[0]!;
  }

  /** Read without checking ownership: only for use cases that already validated access (e.g. public link). */
  async getUnchecked(id: string): Promise<CharacterDto | null> {
    const character = await this.repo.findById(id);
    return character ? (await this.assemble([character]))[0]! : null;
  }

  async create(
    ownerId: string,
    data: Omit<CharacterData, "ownerId"> & { inventory?: CharacterSheet["inventory"]; spells?: CharacterSheet["spells"] }
  ): Promise<CharacterDto> {
    validateIdentity(data);
    const { inventory, spells, ...rest } = data;
    const character = await this.repo.insert({ ...rest, core: coreSchema.parse(rest.core), ownerId });
    if (inventory?.length) await this.inventory.replace(character.id, inventory);
    if (spells) await this.spellbook.replace(character.id, spells);

    const event: CharacterCreated = {
      name: "CharacterCreated",
      occurredAt: this.now(),
      characterId: character.id,
      ownerId,
    };
    await this.events.publish([event]);
    return (await this.assemble([character]))[0]!;
  }

  async createBlank(ownerId: string, name: string): Promise<CharacterDto> {
    const { edition, inventory: _inventory, spells: _spells, ...core } = emptySheet();
    return this.create(ownerId, {
      name: name.trim() || "Nuevo personaje",
      race: null,
      class: null,
      level: 1,
      background: null,
      alignment: null,
      imageUrl: null,
      edition: edition,
      core: coreSchema.parse(core),
    });
  }

  async update(userId: string, id: string, changes: CharacterChanges): Promise<CharacterDto> {
    const current = await this.loadOwned(userId, id);
    const { sheet, ...identity } = changes;
    validateIdentity(identity);

    if (sheet && sheet.edition !== current.edition) {
      throw new DomainError("validation", "La edición de reglas no se puede cambiar", "edition_immutable");
    }

    const updated = await this.repo.update(id, {
      ...identity,
      ...(sheet ? { core: extractCore(sheet) } : {}),
    });
    if (sheet) {
      await this.inventory.replace(id, sheet.inventory);
      await this.spellbook.replace(id, sheet.spells);
    }
    return (await this.assemble([updated]))[0]!;
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.loadOwned(userId, id);
    await this.repo.delete(id);
    const event: CharacterDeleted = { name: "CharacterDeleted", occurredAt: this.now(), characterId: id };
    await this.events.publish([event]);
  }

  private async loadOwned(userId: string, id: string): Promise<Character> {
    const character = await this.repo.findById(id);
    // 404 also for other users' sheets: their existence is not revealed.
    if (!character || character.ownerId !== userId) {
      throw new DomainError("not_found", "Personaje no encontrado", "character_not_found");
    }
    return character;
  }

  private async assemble(characters: Character[]): Promise<CharacterDto[]> {
    const ids = characters.map((c) => c.id);
    const [inventories, books, sharingStatus] = await Promise.all([
      this.inventory.listMany(ids),
      this.spellbook.getMany(ids),
      this.sharing.statusMany(ids),
    ]);

    return characters.map((c) => {
      const state = sharingStatus.get(c.id);
      return {
        id: c.id,
        owner_id: c.ownerId,
        name: c.name,
        race: c.race,
        class: c.class,
        level: c.level,
        background: c.background,
        alignment: c.alignment,
        image_url: c.imageUrl,
        is_public: state?.isPublic ?? false,
        share_slug: state?.shareSlug ?? null,
        sheet: {
          edition: c.edition,
          ...c.core,
          inventory: inventories.get(c.id) ?? [],
          spells: books.get(c.id) ?? { slots: {}, known: [] },
        },
        created_at: c.createdAt.toISOString(),
        updated_at: c.updatedAt.toISOString(),
      };
    });
  }
}
