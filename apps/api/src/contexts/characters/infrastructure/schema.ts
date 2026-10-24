import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import type { CharacterCore } from "../domain/character";

export const characters = pgTable(
  "characters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Id del usuario (contexto Identity). Sin FK a propósito: los contextos solo se referencian por id. */
    ownerId: uuid("owner_id").notNull(),
    name: text("name").notNull(),
    race: text("race"),
    class: text("class"),
    level: integer("level").notNull().default(1),
    background: text("background"),
    alignment: text("alignment"),
    imageUrl: text("image_url"),
    edition: text("edition").notNull().default("2014"),
    /** Núcleo de la ficha: puntuaciones, competencias, combate, ataques y rasgos. */
    core: jsonb("core").$type<CharacterCore>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("characters_owner_id_idx").on(t.ownerId)]
);
