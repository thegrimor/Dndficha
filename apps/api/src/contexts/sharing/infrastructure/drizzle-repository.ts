import { eq, inArray } from "drizzle-orm";

import type { Db } from "../../../main/db";
import type { ShareLink, ShareLinkRepository } from "../domain/share-link";
import { shareLinks } from "./schema";

const toDomain = (f: typeof shareLinks.$inferSelect): ShareLink => ({
  characterId: f.characterId,
  slug: f.slug,
  enabled: f.enabled,
});

export class DrizzleShareLinkRepository implements ShareLinkRepository {
  constructor(private db: Db) {}

  async findByCharacter(characterId: string) {
    const [f] = await this.db.select().from(shareLinks).where(eq(shareLinks.characterId, characterId)).limit(1);
    return f ? toDomain(f) : null;
  }

  async findBySlug(slug: string) {
    const [f] = await this.db.select().from(shareLinks).where(eq(shareLinks.slug, slug)).limit(1);
    return f ? toDomain(f) : null;
  }

  async findMany(characterIds: string[]) {
    if (characterIds.length === 0) return [];
    const rows = await this.db.select().from(shareLinks).where(inArray(shareLinks.characterId, characterIds));
    return rows.map(toDomain);
  }

  async insert(link: ShareLink) {
    const inserted = await this.db.insert(shareLinks).values(link).onConflictDoNothing().returning();
    return inserted.length > 0;
  }

  async setEnabled(characterId: string, enabled: boolean) {
    await this.db.update(shareLinks).set({ enabled }).where(eq(shareLinks.characterId, characterId));
  }

  async delete(characterId: string) {
    await this.db.delete(shareLinks).where(eq(shareLinks.characterId, characterId));
  }
}
