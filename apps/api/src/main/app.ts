import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { serializerCompiler, validatorCompiler, hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";

import { DomainError, STATUS_POR_TIPO } from "../shared-kernel/domain-error.js";
import type { Config } from "./config.js";

/** Lo mínimo que la app necesita de la base: permite sustituirla en tests. */
export interface Database {
  ping(): Promise<void>;
}

export async function buildApp(config: Config, db: Database) {
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
      await db.ping();
      return { status: "ok" };
    } catch (error) {
      app.log.error(error, "healthcheck: la base de datos no responde");
      return reply.status(503).send({ status: "unavailable" });
    }
  });

  return app;
}
