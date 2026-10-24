import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import type { RequireAuth } from "../../../../main/http/auth";
import type { CatalogService } from "../../application/catalog-service";
import { CATALOG_RESOURCES } from "../../domain/catalog";

const CACHE_CONTROL = "public, max-age=3600, stale-while-revalidate=86400";

export function catalogRoutes(catalog: CatalogService, requireAuth: RequireAuth) {
  return async (app: FastifyInstance) => {
    const r = app.withTypeProvider<ZodTypeProvider>();
    // The catalog is public SRD content, but it is protected anyway: it is the only
    // way to keep the API from being used as an open proxy to Open5e.
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
        return catalog.searchMonsters(request.query);
      }
    );

    r.get(
      "/catalog/:resource",
      {
        schema: {
          params: z.object({ resource: z.enum(CATALOG_RESOURCES as [string, ...string[]]) }),
          querystring: z.object({ edition: z.enum(["2014", "2024"]).default("2014") }),
        },
      },
      async (request, reply) => {
        reply.header("Cache-Control", CACHE_CONTROL);
        const results = await catalog.list(request.params.resource as (typeof CATALOG_RESOURCES)[number], request.query.edition);
        return { results };
      }
    );
  };
}
