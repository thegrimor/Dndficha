import type { DndEdition } from "@dndficha/rules";
import { desc, eq } from "drizzle-orm";

import type { Db } from "../../../main/db";
import { DomainError } from "../../../shared-kernel/domain-error";
import type { Character, CharacterData, CharacterRepository } from "../domain/character";
import { characters } from "./schema";

type Row = typeof characters.$inferSelect;

const toDomain = (f: Row): Character => ({ ...f, edition: f.edition as DndEdition });

export class DrizzleCharacterRepository implements CharacterRepository {
  constructor(private db: Db) {}

  async findById(id: string) {
    const [row] = await this.db.select().from(characters).where(eq(characters.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }

  async listByOwner(ownerId: string) {
    const rows = await this.db
      .select()
      .from(characters)
      .where(eq(characters.ownerId, ownerId))
      .orderBy(desc(characters.updatedAt));
    return rows.map(toDomain);
  }

  async insert(data: CharacterData) {
    const [row] = await this.db.insert(characters).values(data).returning();
    return toDomain(row!);
  }

  async update(id: string, changes: Partial<Omit<CharacterData, "ownerId" | "edition">>) {
    const [row] = await this.db
      .update(characters)
      .set({ ...changes, updatedAt: new Date() })
      .where(eq(characters.id, id))
      .returning();
    if (!row) throw new DomainError("not_found", "Personaje no encontrado", "character_not_found");
    return toDomain(row);
  }

  async delete(id: string) {
    await this.db.delete(characters).where(eq(characters.id, id));
  }
}
