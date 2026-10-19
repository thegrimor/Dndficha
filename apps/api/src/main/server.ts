import pg from "pg";

import { buildApp } from "./app.js";
import { cargarConfig } from "./config.js";

const config = cargarConfig();
const pool = new pg.Pool({ connectionString: config.DATABASE_URL, max: 10 });

const app = await buildApp(config, {
  async ping() {
    await pool.query("select 1");
  },
});

const apagar = async () => {
  await app.close();
  await pool.end();
  process.exit(0);
};
process.on("SIGTERM", apagar);
process.on("SIGINT", apagar);

await app.listen({ port: config.PORT, host: "0.0.0.0" });
