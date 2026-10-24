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

  /** Replaces the whole inventory; used when the full sheet is edited. */
  async replace(characterId: string, items: unknown[]): Promise<void> {
    const valid = z.array(itemSchema).max(MAX_ITEMS).parse(items);
    await this.repo.replace(characterId, valid);
  }

  async list(userId: string, characterId: string): Promise<InventoryItem[]> {
    await this.access.assertOwner(userId, characterId);
    return (await this.repo.listMany([characterId])).get(characterId) ?? [];
  }

  async add(userId: string, characterId: string, item: unknown): Promise<InventoryItem[]> {
    await this.access.assertOwner(userId, characterId);
    const incoming = itemSchema.parse(item);
    const existing = (await this.repo.listMany([characterId])).get(characterId) ?? [];
    if (existing.some((i) => i.slug === incoming.slug)) {
      throw new DomainError("conflict", "Ese objeto ya está en la ficha", "item_already_present");
    }
    if (existing.length >= MAX_ITEMS) {
      throw new DomainError("validation", "El inventario está lleno", "inventory_full");
    }
    const all = [...existing, incoming];
    await this.repo.replace(characterId, all);
    return all;
  }

  async remove(userId: string, characterId: string, slug: string): Promise<void> {
    await this.access.assertOwner(userId, characterId);
    const existing = (await this.repo.listMany([characterId])).get(characterId) ?? [];
    await this.repo.replace(characterId, existing.filter((i) => i.slug !== slug));
  }

  deleteFor(characterId: string) {
    return this.repo.deleteAll(characterId);
  }
}
