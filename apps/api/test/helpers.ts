import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { FastifyInstance } from "fastify";

import type { Open5eGateway } from "../src/contexts/catalog/domain/catalog";
import type { PasswordHasher } from "../src/contexts/identity/domain/user";
import { buildApp } from "../src/main/app";
import { loadConfig } from "../src/main/config";
import { createContainer } from "../src/main/container";
import type { Db } from "../src/main/db";

/** Real srd-2024 background (Acolyte), as returned by Open5e v2. */
export const ACOLYTE_2024 = {
  key: "srd-2024_acolyte",
  name: "Acolyte",
  desc: "",
  benefits: [
    { name: "Ability Scores", desc: "Intelligence, Wisdom, Charisma", type: "ability_score" },
    { name: "Equipment", desc: "Choose A or B: (A) Holy Symbol, 8 GP; or (B) 50 GP", type: "equipment" },
    { name: "Feat", desc: "Magic Initiate (Cleric)", type: "feat" },
    { name: "Skill Proficiencies", desc: "Insight and Religion", type: "skill_proficiency" },
    { name: "Tool Proficiency", desc: "Calligrapher's Supplies", type: "tool_proficiency" },
  ],
};

export function fakeGateway(data: Partial<Record<string, unknown[]>> = {}): Open5eGateway & { calls: number } {
  const gateway = {
    calls: 0,
    async listAll(resource: string, edition: string) {
      gateway.calls++;
      return data[`${resource}:${edition}`] ?? data[resource] ?? [];
    },
    async searchMonsters() {
      return { count: 0, next: null, previous: null, results: [] };
    },
  };
  return gateway;
}

/** Cheap hasher: the identity tests do not need argon2's real cost. */
const fastHasher: PasswordHasher = {
  hash: async (plain) => `hash:${plain}`,
  verify: async (hash, plain) => hash === `hash:${plain}`,
};

export async function createApp(options: { gateway?: Open5eGateway; env?: Record<string, string> } = {}) {
  const hp = new PGlite();
  const db = drizzle(hp) as unknown as Db;
  await migrate(drizzle(hp), { migrationsFolder: "drizzle" });

  const config = loadConfig({ NODE_ENV: "test", DATABASE_URL: "postgres://x", AUTH_RATE_LIMIT_MAX: "1000", ...options.env });
  const container = createContainer(db, { gateway: options.gateway ?? fakeGateway(), hasher: fastHasher });
  const app = await buildApp(config, db, container);
  return { app, container, close: async () => { await app.close(); await hp.close(); } };
}

let counter = 0;

/** Registers a new user and returns its Bearer token, ready for `inject`. */
export async function registerUser(app: FastifyInstance) {
  const n = ++counter;
  const res = await app.inject({
    method: "POST",
    url: "/auth/register",
    payload: { email: `user${n}@example.com`, username: `user${n}`, password: "secure-password-1" },
  });
  const { token, user } = res.json() as { token: string; user: { id: string } };
  return { token, userId: user.id, auth: { authorization: `Bearer ${token}` } };
}
