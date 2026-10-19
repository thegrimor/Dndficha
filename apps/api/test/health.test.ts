import { afterEach, describe, expect, it } from "vitest";

import { buildApp, type Database } from "../src/main/app.js";
import { cargarConfig } from "../src/main/config.js";

const config = cargarConfig({ NODE_ENV: "test", DATABASE_URL: "postgres://x" });

describe("GET /health", () => {
  let cerrar: (() => Promise<unknown>) | undefined;
  afterEach(async () => cerrar?.());

  async function levantar(db: Database) {
    const app = await buildApp(config, db);
    cerrar = () => app.close();
    return app;
  }

  it("responde 200 si la base responde", async () => {
    const app = await levantar({ ping: async () => {} });
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });

  it("responde 503 si la base falla", async () => {
    const app = await levantar({ ping: async () => { throw new Error("caída"); } });
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(503);
  });
});
