import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { currentUser, type RequireAuth } from "../../../../main/http/auth";
import type { InventoryService } from "../../application/inventory-service";

export function inventoryRoutes(inventory: InventoryService, requireAuth: RequireAuth) {
  return async (app: FastifyInstance) => {
    const r = app.withTypeProvider<ZodTypeProvider>();
    app.addHook("preHandler", requireAuth);
    const params = z.object({ id: z.uuid() });

    r.get("/characters/:id/inventory", { schema: { params } }, async (request) => ({
      items: await inventory.list(currentUser(request).id, request.params.id),
    }));

    r.post(
      "/characters/:id/inventory",
      { schema: { params, body: z.object({ item: z.unknown() }) } },
      async (request, reply) =>
        reply.status(201).send({ items: await inventory.add(currentUser(request).id, request.params.id, request.body.item) })
    );

    r.delete(
      "/characters/:id/inventory/:slug",
      { schema: { params: params.extend({ slug: z.string().min(1) }) } },
      async (request, reply) => {
        await inventory.remove(currentUser(request).id, request.params.id, request.params.slug);
        return reply.status(204).send();
      }
    );
  };
}
