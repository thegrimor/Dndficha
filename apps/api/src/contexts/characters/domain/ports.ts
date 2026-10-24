import type { CharacterSheet } from "@dndficha/rules";

/** Read/write ports towards the contexts that provide sections of the sheet. */
export interface InventoryPort {
  listMany(characterIds: string[]): Promise<Map<string, CharacterSheet["inventory"]>>;
  replace(characterId: string, items: CharacterSheet["inventory"]): Promise<void>;
}

export interface SpellbookPort {
  getMany(characterIds: string[]): Promise<Map<string, CharacterSheet["spells"]>>;
  replace(characterId: string, spells: CharacterSheet["spells"]): Promise<void>;
}

export interface SharingStatus {
  isPublic: boolean;
  shareSlug: string | null;
}

export interface SharingPort {
  statusMany(characterIds: string[]): Promise<Map<string, SharingStatus>>;
}
