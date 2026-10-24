import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Persistent cache of the Open5e catalogs (one row per resource/edition). */
export const catalogCache = pgTable("catalog_cache", {
  key: text("key").primaryKey(),
  payload: jsonb("payload").notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
});
