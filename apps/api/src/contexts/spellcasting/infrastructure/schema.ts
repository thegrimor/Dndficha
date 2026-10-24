import { boolean, index, integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const spellBooks = pgTable("spell_books", {
  characterId: uuid("character_id").primaryKey(),
  /** spell level -> { total, used } */
  slots: jsonb("slots").$type<Record<string, { total: number; used: number }>>().notNull().default({}),
});

export const knownSpells = pgTable(
  "known_spells",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    characterId: uuid("character_id").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    level: integer("level").notNull(),
    source: text("source").notNull(),
    data: jsonb("data"),
    prepared: boolean("prepared").notNull().default(false),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("known_spells_character_id_idx").on(t.characterId)]
);
