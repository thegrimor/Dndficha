import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { ZodError } from "zod";
import { serializerCompiler, validatorCompiler, hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";

import { rutasCatalog } from "../contexts/catalog/interface/http/routes";
import { rutasCharacterCreation } from "../contexts/character-creation/interface/http/routes";
import { rutasCharacters } from "../contexts/characters/interface/http/routes";
import { rutasIdentity } from "../contexts/identity/interface/http/routes";
import { rutasInventory } from "../contexts/inventory/interface/http/routes";
import { rutasSharing } from "../contexts/sharing/interface/http/routes";
import { rutasSpellcasting } from "../contexts/spellcasting/interface/http/routes";
import { DomainError, STATUS_POR_TIPO } from "../shared-kernel/domain-error";
import type { Config } from "./config";
import { crearContainer, type Container } from "./container";
import { ping, type Db } from "./db";
import { crearRequireAuth } from "./http/auth";

export async function buildApp(config: Config, db: Db, container: Container = crearContainer(db)) {
  const app = Fastify({
    logger: config.NODE_ENV === "test" ? false : { level: config.LOG_LEVEL },
    trustProxy: true, // detrás del proxy de Railway
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(helmet);
  await app.register(cookie);
  await app.register(rateLimit, { max: 300, timeWindow: "1 minute" });
  const origenes = config.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean);
  if (origenes.length > 0) await app.register(cors, { origin: origenes, credentials: true });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof DomainError) {
      return reply.status(STATUS_POR_TIPO[error.kind]).send({ error: error.code ?? error.kind, message: error.message });
    }
    // Invariantes de dominio expresadas con zod (ficha, inventario, hechizos).
    if (error instanceof ZodError) {
      return reply.status(422).send({
        error: "validation_error",
        message: error.issues[0]?.message ?? "Datos inválidos",
        issues: error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({ error: "bad_request", message: "Petición inválida", issues: error.validation });
    }
    app.log.error(error);
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    return reply.status(status).send({
      error: status === 500 ? "internal_error" : "error",
      message: status === 500 ? "Error interno" : (error as Error).message,
    });
  });

  app.get("/health", async (_request, reply) => {
    try {
      await ping(db);
      return { status: "ok" };
    } catch (error) {
      app.log.error(error, "healthcheck: la base de datos no responde");
      return reply.status(503).send({ status: "unavailable" });
    }
  });

  const requireAuth = crearRequireAuth(container.auth);
  await app.register(rutasIdentity(container.auth, requireAuth, {
      produccion: config.NODE_ENV === "production",
      intentosPorMinuto: config.AUTH_RATE_LIMIT_MAX,
    }));
  await app.register(rutasCatalog(container.catalog, requireAuth));
  await app.register(rutasCharacters(container.characters, requireAuth));
  await app.register(rutasCharacterCreation(container.creation, requireAuth));
  await app.register(rutasInventory(container.inventory, requireAuth));
  await app.register(rutasSpellcasting(container.spellcasting, requireAuth));
  await app.register(rutasSharing(container.sharing, container.characters, requireAuth));

  return app;
}
