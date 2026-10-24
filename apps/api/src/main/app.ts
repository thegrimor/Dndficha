import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { ZodError } from "zod";
import { serializerCompiler, validatorCompiler, hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";

import { catalogRoutes } from "../contexts/catalog/interface/http/routes";
import { characterCreationRoutes } from "../contexts/character-creation/interface/http/routes";
import { characterRoutes } from "../contexts/characters/interface/http/routes";
import { identityRoutes } from "../contexts/identity/interface/http/routes";
import { inventoryRoutes } from "../contexts/inventory/interface/http/routes";
import { sharingRoutes } from "../contexts/sharing/interface/http/routes";
import { spellcastingRoutes } from "../contexts/spellcasting/interface/http/routes";
import { DomainError, STATUS_BY_KIND } from "../shared-kernel/domain-error";
import type { Config } from "./config";
import { createContainer, type Container } from "./container";
import { ping, type Db } from "./db";
import { createRequireAuth } from "./http/auth";

export async function buildApp(config: Config, db: Db, container: Container = createContainer(db)) {
  const app = Fastify({
    logger: config.NODE_ENV === "test" ? false : { level: config.LOG_LEVEL },
    trustProxy: true, // behind Railway's proxy
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(helmet);
  await app.register(cookie);
  await app.register(rateLimit, { max: 300, timeWindow: "1 minute" });
  const origins = config.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean);
  if (origins.length > 0) await app.register(cors, { origin: origins, credentials: true });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof DomainError) {
      return reply.status(STATUS_BY_KIND[error.kind]).send({ error: error.code ?? error.kind, message: error.message });
    }
    // Domain invariants expressed with zod (sheet, inventory, spells).
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
      app.log.error(error, "healthcheck: the database is not responding");
      return reply.status(503).send({ status: "unavailable" });
    }
  });

  const requireAuth = createRequireAuth(container.auth);
  await app.register(identityRoutes(container.auth, requireAuth, {
      production: config.NODE_ENV === "production",
      attemptsPerMinute: config.AUTH_RATE_LIMIT_MAX,
      adminToken: config.ADMIN_TOKEN,
      webUrl: config.WEB_URL,
    }));
  await app.register(catalogRoutes(container.catalog, requireAuth));
  await app.register(characterRoutes(container.characters, requireAuth));
  await app.register(characterCreationRoutes(container.creation, requireAuth));
  await app.register(inventoryRoutes(container.inventory, requireAuth));
  await app.register(spellcastingRoutes(container.spellcasting, requireAuth));
  await app.register(sharingRoutes(container.sharing, container.characters, requireAuth));

  return app;
}
