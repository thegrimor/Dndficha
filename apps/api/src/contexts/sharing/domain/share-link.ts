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
  /** Returns `false` if the slug already existed (collision). */
  insert(link: ShareLink): Promise<boolean>;
  setEnabled(characterId: string, enabled: boolean): Promise<void>;
  delete(characterId: string): Promise<void>;
}

/** Short, URL-safe, unguessable slug (48 bits of entropy). */
export function generateSlug(): string {
  return randomBytes(6).toString("base64url");
}
