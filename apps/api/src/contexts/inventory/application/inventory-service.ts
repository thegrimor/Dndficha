import { z } from "zod";

import type { CharacterAccess } from "../../../shared-kernel/auth";
import { DomainError } from "../../../shared-kernel/domain-error";
import { itemSchema, MAX_ITEMS, type InventoryItem, type InventoryRepository } from "../domain/inventory";

export class InventoryService {
  constructor(
    private repo: InventoryRepository,
    private access: CharacterAccess
  ) {}

  async listMany(characterIds: string[]) {
    return this.repo.listMany(characterIds);
  }

  /** Sustituye todo el inventario; lo usa la edición completa de la ficha. */
  async replace(characterId: string, items: unknown[]): Promise<void> {
    const validos = z.array(itemSchema).max(MAX_ITEMS).parse(items);
    await this.repo.replace(characterId, validos);
  }

  async listar(userId: string, characterId: string): Promise<InventoryItem[]> {
    await this.access.assertOwner(userId, characterId);
    return (await this.repo.listMany([characterId])).get(characterId) ?? [];
  }

  async agregar(userId: string, characterId: string, item: unknown): Promise<InventoryItem[]> {
    await this.access.assertOwner(userId, characterId);
    const nuevo = itemSchema.parse(item);
    const actuales = (await this.repo.listMany([characterId])).get(characterId) ?? [];
    if (actuales.some((i) => i.slug === nuevo.slug)) {
      throw new DomainError("conflict", "Ese objeto ya está en la ficha", "item_already_present");
    }
    if (actuales.length >= MAX_ITEMS) {
      throw new DomainError("validation", "El inventario está lleno", "inventory_full");
    }
    const todos = [...actuales, nuevo];
    await this.repo.replace(characterId, todos);
    return todos;
  }

  async quitar(userId: string, characterId: string, slug: string): Promise<void> {
    await this.access.assertOwner(userId, characterId);
    const actuales = (await this.repo.listMany([characterId])).get(characterId) ?? [];
    await this.repo.replace(characterId, actuales.filter((i) => i.slug !== slug));
  }

  eliminarDe(characterId: string) {
    return this.repo.deleteAll(characterId);
  }
}
