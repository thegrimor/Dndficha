import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const shareLinks = pgTable("share_links", {
  characterId: uuid("character_id").primaryKey(),
  slug: text("slug").notNull().unique(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
