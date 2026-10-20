import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

import { cargarConfig } from "./config";

// Se ejecuta como pre-deploy command en Railway: `node dist/migrate.js`.
const config = cargarConfig();
const pool = new pg.Pool({ connectionString: config.DATABASE_URL, max: 1 });

try {
  await migrate(drizzle(pool), { migrationsFolder: process.env.MIGRATIONS_DIR ?? "drizzle" });
  console.log("Migraciones aplicadas");
} finally {
  await pool.end();
}
