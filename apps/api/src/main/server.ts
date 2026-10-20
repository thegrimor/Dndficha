import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import { buildApp } from "./app";
import { cargarConfig } from "./config";

const config = cargarConfig();
const pool = new pg.Pool({ connectionString: config.DATABASE_URL, max: 10 });
const app = await buildApp(config, drizzle(pool));

const apagar = async () => {
  await app.close();
  await pool.end();
  process.exit(0);
};
process.on("SIGTERM", apagar);
process.on("SIGINT", apagar);

await app.listen({ port: config.PORT, host: "0.0.0.0" });
