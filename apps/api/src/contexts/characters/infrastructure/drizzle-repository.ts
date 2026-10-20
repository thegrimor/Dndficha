import type { EdicionDnD } from "@dndficha/rules";
import { desc, eq } from "drizzle-orm";

import type { Db } from "../../../main/db";
import { DomainError } from "../../../shared-kernel/domain-error";
import type { Character, CharacterData, CharacterRepository } from "../domain/character";
import { characters } from "./schema";

type Fila = typeof characters.$inferSelect;

const aDominio = (f: Fila): Character => ({ ...f, edition: f.edition as EdicionDnD });

export class DrizzleCharacterRepository implements CharacterRepository {
  constructor(private db: Db) {}

  async findById(id: string) {
    const [fila] = await this.db.select().from(characters).where(eq(characters.id, id)).limit(1);
    return fila ? aDominio(fila) : null;
  }

  async listByOwner(ownerId: string) {
    const filas = await this.db
      .select()
      .from(characters)
      .where(eq(characters.ownerId, ownerId))
      .orderBy(desc(characters.updatedAt));
    return filas.map(aDominio);
  }

  async insert(data: CharacterData) {
    const [fila] = await this.db.insert(characters).values(data).returning();
    return aDominio(fila!);
  }

  async update(id: string, cambios: Partial<Omit<CharacterData, "ownerId" | "edition">>) {
    const [fila] = await this.db
      .update(characters)
      .set({ ...cambios, updatedAt: new Date() })
      .where(eq(characters.id, id))
      .returning();
    if (!fila) throw new DomainError("not_found", "Personaje no encontrado", "character_not_found");
    return aDominio(fila);
  }

  async delete(id: string) {
    await this.db.delete(characters).where(eq(characters.id, id));
  }
}
