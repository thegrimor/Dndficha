import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { currentUser, type RequireAuth } from "../../../../main/http/auth";
import type { SpellcastingService } from "../../application/spellcasting-service";

export function spellcastingRoutes(spellcasting: SpellcastingService, requireAuth: RequireAuth) {
  return async (app: FastifyInstance) => {
    const r = app.withTypeProvider<ZodTypeProvider>();
    app.addHook("preHandler", requireAuth);
    const params = z.object({ id: z.uuid() });

    r.get("/characters/:id/spellbook", { schema: { params } }, async (request) => ({
      spellbook: await spellcasting.get(currentUser(request).id, request.params.id),
    }));

    r.post(
      "/characters/:id/spellbook/spells",
      { schema: { params, body: z.object({ spell: z.unknown() }) } },
      async (request, reply) =>
        reply.status(201).send({
          spellbook: await spellcasting.addSpell(currentUser(request).id, request.params.id, request.body.spell),
        })
    );

    r.delete(
      "/characters/:id/spellbook/spells/:slug",
      { schema: { params: params.extend({ slug: z.string().min(1) }) } },
      async (request, reply) => {
        await spellcasting.removeSpell(currentUser(request).id, request.params.id, request.params.slug);
        return reply.status(204).send();
      }
    );

    r.post(
      "/characters/:id/spellbook/slots/:level/use",
      { schema: { params: params.extend({ level: z.coerce.number().int().min(1).max(9) }) } },
      async (request) => ({
        spellbook: await spellcasting.spendSlot(currentUser(request).id, request.params.id, request.params.level),
      })
    );

    r.post("/characters/:id/spellbook/long-rest", { schema: { params } }, async (request) => ({
      spellbook: await spellcasting.longRest(currentUser(request).id, request.params.id),
    }));
  };
}
