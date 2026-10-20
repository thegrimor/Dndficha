import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import type { RequireAuth } from "../../../../main/http/auth";
import type { CatalogService } from "../../application/catalog-service";
import { RECURSOS_CATALOGO } from "../../domain/catalog";

const CACHE_CONTROL = "public, max-age=3600, stale-while-revalidate=86400";

export function rutasCatalog(catalog: CatalogService, requireAuth: RequireAuth) {
  return async (app: FastifyInstance) => {
    const r = app.withTypeProvider<ZodTypeProvider>();
    // El catálogo es contenido público del SRD, pero se protege igualmente: es el único
    // modo de limitar el uso de la API como proxy abierto hacia Open5e.
    app.addHook("preHandler", requireAuth);

    r.get(
      "/catalog/monsters",
      {
        schema: {
          querystring: z.object({
            search: z.string().optional(),
            type: z.string().optional(),
            cr: z.string().optional(),
            limit: z.coerce.number().int().min(1).max(100).optional(),
            offset: z.coerce.number().int().min(0).optional(),
          }),
        },
      },
      async (request, reply) => {
        reply.header("Cache-Control", CACHE_CONTROL);
        return catalog.buscarMonstruos(request.query);
      }
    );

    r.get(
      "/catalog/:recurso",
      {
        schema: {
          params: z.object({ recurso: z.enum(RECURSOS_CATALOGO as [string, ...string[]]) }),
          querystring: z.object({ edicion: z.enum(["2014", "2024"]).default("2014") }),
        },
      },
      async (request, reply) => {
        reply.header("Cache-Control", CACHE_CONTROL);
        const results = await catalog.listar(request.params.recurso as (typeof RECURSOS_CATALOGO)[number], request.query.edicion);
        return { results };
      }
    );
  };
}
