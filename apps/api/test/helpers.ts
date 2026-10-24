import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { FastifyInstance } from "fastify";

import type { Open5eGateway } from "../src/contexts/catalog/domain/catalog";
import type { PasswordHasher } from "../src/contexts/identity/domain/user";
import { buildApp } from "../src/main/app";
import { cargarConfig } from "../src/main/config";
import { crearContainer } from "../src/main/container";
import type { Db } from "../src/main/db";

/** Trasfondo real de srd-2024 (Acolyte), tal como lo devuelve Open5e v2. */
export const ACOLITO_2024 = {
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

export function gatewayFalso(datos: Partial<Record<string, unknown[]>> = {}): Open5eGateway & { llamadas: number } {
  const gateway = {
    llamadas: 0,
    async listarCompleto(recurso: string, edicion: string) {
      gateway.llamadas++;
      return datos[`${recurso}:${edicion}`] ?? datos[recurso] ?? [];
    },
    async buscarMonstruos() {
      return { count: 0, next: null, previous: null, results: [] };
    },
  };
  return gateway;
}

/** Hasher barato: los tests de identidad no necesitan el coste real de argon2. */
const hasherRapido: PasswordHasher = {
  hash: async (plain) => `hash:${plain}`,
  verify: async (hash, plain) => hash === `hash:${plain}`,
};

export async function crearApp(opciones: { gateway?: Open5eGateway; env?: Record<string, string> } = {}) {
  const pg = new PGlite();
  const db = drizzle(pg) as unknown as Db;
  await migrate(drizzle(pg), { migrationsFolder: "drizzle" });

  const config = cargarConfig({ NODE_ENV: "test", DATABASE_URL: "postgres://x", AUTH_RATE_LIMIT_MAX: "1000", ...opciones.env });
  const container = crearContainer(db, { gateway: opciones.gateway ?? gatewayFalso(), hasher: hasherRapido });
  const app = await buildApp(config, db, container);
  return { app, container, cerrar: async () => { await app.close(); await pg.close(); } };
}

let contador = 0;

/** Registra un usuario nuevo y devuelve su token Bearer ya preparado para `inject`. */
export async function registrar(app: FastifyInstance) {
  const n = ++contador;
  const res = await app.inject({
    method: "POST",
    url: "/auth/register",
    payload: { email: `user${n}@example.com`, username: `user${n}`, password: "contraseña-segura" },
  });
  const { token, user } = res.json() as { token: string; user: { id: string } };
  return { token, userId: user.id, auth: { authorization: `Bearer ${token}` } };
}
