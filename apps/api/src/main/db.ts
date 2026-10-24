import { sql } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = PgDatabase<any, any>;

export async function ping(db: Db): Promise<void> {
  await db.execute(sql`select 1`);
}
