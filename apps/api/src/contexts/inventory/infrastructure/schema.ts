import { boolean, index, integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    characterId: uuid("character_id").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    source: text("source").notNull(),
    data: jsonb("data"),
    quantity: integer("quantity").notNull().default(1),
    equipped: boolean("equipped").notNull().default(false),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("inventory_items_character_id_idx").on(t.characterId)]
);
