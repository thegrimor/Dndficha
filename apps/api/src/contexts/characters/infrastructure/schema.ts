import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import type { CharacterCore } from "../domain/character";

export const characters = pgTable(
  "characters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** User id (Identity context). No FK on purpose: contexts only reference each other by id. */
    ownerId: uuid("owner_id").notNull(),
    name: text("name").notNull(),
    race: text("race"),
    class: text("class"),
    level: integer("level").notNull().default(1),
    background: text("background"),
    alignment: text("alignment"),
    imageUrl: text("image_url"),
    edition: text("edition").notNull().default("2014"),
    /** Core of the sheet: scores, proficiencies, combat, attacks and features. */
    core: jsonb("core").$type<CharacterCore>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("characters_owner_id_idx").on(t.ownerId)]
);
