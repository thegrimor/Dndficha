import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Caché persistente de los catálogos de Open5e (una fila por recurso/edición). */
export const catalogCache = pgTable("catalog_cache", {
  key: text("key").primaryKey(),
  payload: jsonb("payload").notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
});
