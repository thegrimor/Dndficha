import { asc, eq, inArray } from "drizzle-orm";

import type { Db } from "../../../main/db";
import type { InventoryItem, InventoryRepository } from "../domain/inventory";
import { inventoryItems } from "./schema";

export class DrizzleInventoryRepository implements InventoryRepository {
  constructor(private db: Db) {}

  async listMany(characterIds: string[]) {
    const map = new Map<string, InventoryItem[]>();
    if (characterIds.length === 0) return map;
    const rows = await this.db
      .select()
      .from(inventoryItems)
      .where(inArray(inventoryItems.characterId, characterIds))
      .orderBy(asc(inventoryItems.position));
    for (const f of rows) {
      const list = map.get(f.characterId) ?? [];
      list.push({
        slug: f.slug,
        name: f.name,
        type: f.type,
        source: f.source as InventoryItem["source"],
        data: f.data ?? undefined,
        quantity: f.quantity,
        equipped: f.equipped,
      });
      map.set(f.characterId, list);
    }
    return map;
  }

  async replace(characterId: string, items: InventoryItem[]) {
    await this.db.transaction(async (tx) => {
      await tx.delete(inventoryItems).where(eq(inventoryItems.characterId, characterId));
      if (items.length === 0) return;
      await tx.insert(inventoryItems).values(
        items.map((i, position) => ({
          characterId,
          slug: i.slug,
          name: i.name,
          type: i.type,
          source: i.source,
          data: i.data ?? null,
          quantity: i.quantity,
          equipped: i.equipped,
          position,
        }))
      );
    });
  }

  async deleteAll(characterId: string) {
    await this.db.delete(inventoryItems).where(eq(inventoryItems.characterId, characterId));
  }
}
