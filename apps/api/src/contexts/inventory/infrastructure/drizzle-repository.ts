import { asc, eq, inArray } from "drizzle-orm";

import type { Db } from "../../../main/db";
import type { InventoryItem, InventoryRepository } from "../domain/inventory";
import { inventoryItems } from "./schema";

export class DrizzleInventoryRepository implements InventoryRepository {
  constructor(private db: Db) {}

  async listMany(characterIds: string[]) {
    const mapa = new Map<string, InventoryItem[]>();
    if (characterIds.length === 0) return mapa;
    const filas = await this.db
      .select()
      .from(inventoryItems)
      .where(inArray(inventoryItems.characterId, characterIds))
      .orderBy(asc(inventoryItems.position));
    for (const f of filas) {
      const lista = mapa.get(f.characterId) ?? [];
      lista.push({
        slug: f.slug,
        nombre: f.name,
        tipo: f.type,
        fuente: f.source as InventoryItem["fuente"],
        datos: f.data ?? undefined,
        cantidad: f.quantity,
        equipado: f.equipped,
      });
      mapa.set(f.characterId, lista);
    }
    return mapa;
  }

  async replace(characterId: string, items: InventoryItem[]) {
    await this.db.transaction(async (tx) => {
      await tx.delete(inventoryItems).where(eq(inventoryItems.characterId, characterId));
      if (items.length === 0) return;
      await tx.insert(inventoryItems).values(
        items.map((i, position) => ({
          characterId,
          slug: i.slug,
          name: i.nombre,
          type: i.tipo,
          source: i.fuente,
          data: i.datos ?? null,
          quantity: i.cantidad,
          equipped: i.equipado,
          position,
        }))
      );
    });
  }

  async deleteAll(characterId: string) {
    await this.db.delete(inventoryItems).where(eq(inventoryItems.characterId, characterId));
  }
}
