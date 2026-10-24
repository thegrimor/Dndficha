import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

import { loadConfig } from "./config";

// Runs as a pre-deploy command on Railway: `node dist/migrate.js`.
const config = loadConfig();
const pool = new pg.Pool({ connectionString: config.DATABASE_URL, max: 1 });

try {
  await migrate(drizzle(pool), { migrationsFolder: process.env.MIGRATIONS_DIR ?? "drizzle" });
  console.log("Migraciones aplicadas");
} finally {
  await pool.end();
}
