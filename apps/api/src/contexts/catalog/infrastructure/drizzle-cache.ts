import { eq } from "drizzle-orm";

import type { Db } from "../../../main/db";
import type { CatalogCache } from "../domain/catalog";
import { catalogCache } from "./schema";

export class DrizzleCatalogCache implements CatalogCache {
  constructor(private db: Db) {}

  async get(key: string) {
    const [fila] = await this.db.select().from(catalogCache).where(eq(catalogCache.key, key)).limit(1);
    return fila ? { payload: fila.payload as unknown[], fetchedAt: fila.fetchedAt } : null;
  }

  async set(key: string, payload: unknown[], fetchedAt: Date) {
    await this.db
      .insert(catalogCache)
      .values({ key, payload, fetchedAt })
      .onConflictDoUpdate({ target: catalogCache.key, set: { payload, fetchedAt } });
  }
}
