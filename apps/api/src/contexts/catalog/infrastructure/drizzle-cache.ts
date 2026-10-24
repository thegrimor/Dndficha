import { eq } from "drizzle-orm";

import type { Db } from "../../../main/db";
import type { CatalogCache } from "../domain/catalog";
import { catalogCache } from "./schema";

export class DrizzleCatalogCache implements CatalogCache {
  constructor(private db: Db) {}

  async get(key: string) {
    const [row] = await this.db.select().from(catalogCache).where(eq(catalogCache.key, key)).limit(1);
    return row ? { payload: row.payload as unknown[], fetchedAt: row.fetchedAt } : null;
  }

  async set(key: string, payload: unknown[], fetchedAt: Date) {
    await this.db
      .insert(catalogCache)
      .values({ key, payload, fetchedAt })
      .onConflictDoUpdate({ target: catalogCache.key, set: { payload, fetchedAt } });
  }
}
