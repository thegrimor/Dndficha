import { randomBytes } from "node:crypto";

export interface ShareLink {
  characterId: string;
  slug: string;
  enabled: boolean;
}

export interface ShareLinkRepository {
  findByCharacter(characterId: string): Promise<ShareLink | null>;
  findBySlug(slug: string): Promise<ShareLink | null>;
  findMany(characterIds: string[]): Promise<ShareLink[]>;
  /** Devuelve `false` si el slug ya existía (colisión). */
  insert(link: ShareLink): Promise<boolean>;
  setEnabled(characterId: string, enabled: boolean): Promise<void>;
  delete(characterId: string): Promise<void>;
}

/** Slug corto, URL-safe y no adivinable (48 bits de entropía). */
export function generarSlug(): string {
  return randomBytes(6).toString("base64url");
}
