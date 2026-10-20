import type { FichaPersonaje } from "@dndficha/rules";

/** Puertos de lectura/escritura hacia los contextos que aportan secciones de la ficha. */
export interface InventoryPort {
  listMany(characterIds: string[]): Promise<Map<string, FichaPersonaje["inventory"]>>;
  replace(characterId: string, items: FichaPersonaje["inventory"]): Promise<void>;
}

export interface SpellbookPort {
  getMany(characterIds: string[]): Promise<Map<string, FichaPersonaje["spells"]>>;
  replace(characterId: string, spells: FichaPersonaje["spells"]): Promise<void>;
}

export interface SharingStatus {
  isPublic: boolean;
  shareSlug: string | null;
}

export interface SharingPort {
  statusMany(characterIds: string[]): Promise<Map<string, SharingStatus>>;
}
