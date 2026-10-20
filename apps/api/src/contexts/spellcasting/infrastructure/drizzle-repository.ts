import { asc, eq, inArray } from "drizzle-orm";

import type { Db } from "../../../main/db";
import type { KnownSpell, SpellBook, SpellBookRepository } from "../domain/spellbook";
import { knownSpells, spellBooks } from "./schema";

export class DrizzleSpellBookRepository implements SpellBookRepository {
  constructor(private db: Db) {}

  async getMany(characterIds: string[]) {
    const mapa = new Map<string, SpellBook>();
    if (characterIds.length === 0) return mapa;

    const [libros, conocidos] = await Promise.all([
      this.db.select().from(spellBooks).where(inArray(spellBooks.characterId, characterIds)),
      this.db.select().from(knownSpells).where(inArray(knownSpells.characterId, characterIds)).orderBy(asc(knownSpells.position)),
    ]);

    for (const l of libros) mapa.set(l.characterId, { slots: l.slots, known: [] });
    for (const c of conocidos) {
      const libro = mapa.get(c.characterId) ?? { slots: {}, known: [] };
      const spell: KnownSpell = {
        slug: c.slug,
        nombre: c.name,
        nivel: c.level,
        fuente: c.source as KnownSpell["fuente"],
        datos: c.data ?? undefined,
        prepared: c.prepared,
      };
      libro.known.push(spell);
      mapa.set(c.characterId, libro);
    }
    return mapa;
  }

  async replace(characterId: string, book: SpellBook) {
    await this.db.transaction(async (tx) => {
      await tx
        .insert(spellBooks)
        .values({ characterId, slots: book.slots })
        .onConflictDoUpdate({ target: spellBooks.characterId, set: { slots: book.slots } });
      await tx.delete(knownSpells).where(eq(knownSpells.characterId, characterId));
      if (book.known.length === 0) return;
      await tx.insert(knownSpells).values(
        book.known.map((s, position) => ({
          characterId,
          slug: s.slug,
          name: s.nombre,
          level: s.nivel,
          source: s.fuente,
          data: s.datos ?? null,
          prepared: s.prepared ?? false,
          position,
        }))
      );
    });
  }

  async deleteAll(characterId: string) {
    await this.db.transaction(async (tx) => {
      await tx.delete(knownSpells).where(eq(knownSpells.characterId, characterId));
      await tx.delete(spellBooks).where(eq(spellBooks.characterId, characterId));
    });
  }
}
