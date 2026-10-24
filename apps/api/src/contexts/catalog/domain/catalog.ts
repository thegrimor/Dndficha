import type { DndEdition } from "@dndficha/rules";

/** Resources Open5e serves per edition (v2: separates SRD 2014 and SRD 2024). */
export const EDITION_RESOURCES = ["spells", "magicitems", "backgrounds"] as const;
/** Resources that only exist in the 2014 SRD (v1). */
export const NON_EDITION_RESOURCES = ["weapons", "armor", "races", "classes", "feats"] as const;

export type EditionResource = (typeof EDITION_RESOURCES)[number];
export type NonEditionResource = (typeof NON_EDITION_RESOURCES)[number];
export type CatalogResource = EditionResource | NonEditionResource;

export const CATALOG_RESOURCES: readonly CatalogResource[] = [...EDITION_RESOURCES, ...NON_EDITION_RESOURCES];

export const isEditionResource = (r: CatalogResource): r is EditionResource =>
  (EDITION_RESOURCES as readonly string[]).includes(r);

export interface MonsterSearchParams {
  search?: string;
  limit?: number;
  offset?: number;
  type?: string;
  cr?: string;
}

export interface Open5ePage {
  count: number;
  next: string | null;
  previous: string | null;
  results: unknown[];
}

/** Port to the external source (Open5e). Throws an `unavailable` `DomainError` if it does not respond. */
export interface Open5eGateway {
  listAll(resource: CatalogResource, edition: DndEdition): Promise<unknown[]>;
  searchMonsters(query: MonsterSearchParams): Promise<Open5ePage>;
}

export interface CatalogCache {
  get(key: string): Promise<{ payload: unknown[]; fetchedAt: Date } | null>;
  set(key: string, payload: unknown[], fetchedAt: Date): Promise<void>;
}
