import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { usuarioActual, type RequireAuth } from "../../../../main/http/auth";
import type { SpellcastingService } from "../../application/spellcasting-service";

export function rutasSpellcasting(spellcasting: SpellcastingService, requireAuth: RequireAuth) {
  return async (app: FastifyInstance) => {
    const r = app.withTypeProvider<ZodTypeProvider>();
    app.addHook("preHandler", requireAuth);
    const params = z.object({ id: z.uuid() });

    r.get("/characters/:id/spellbook", { schema: { params } }, async (request) => ({
      spellbook: await spellcasting.obtener(usuarioActual(request).id, request.params.id),
    }));

    r.post(
      "/characters/:id/spellbook/spells",
      { schema: { params, body: z.object({ spell: z.unknown() }) } },
      async (request, reply) =>
        reply.status(201).send({
          spellbook: await spellcasting.agregarHechizo(usuarioActual(request).id, request.params.id, request.body.spell),
        })
    );

    r.delete(
      "/characters/:id/spellbook/spells/:slug",
      { schema: { params: params.extend({ slug: z.string().min(1) }) } },
      async (request, reply) => {
        await spellcasting.quitarHechizo(usuarioActual(request).id, request.params.id, request.params.slug);
        return reply.status(204).send();
      }
    );

    r.post(
      "/characters/:id/spellbook/slots/:nivel/use",
      { schema: { params: params.extend({ nivel: z.coerce.number().int().min(1).max(9) }) } },
      async (request) => ({
        spellbook: await spellcasting.gastarEspacio(usuarioActual(request).id, request.params.id, request.params.nivel),
      })
    );

    r.post("/characters/:id/spellbook/long-rest", { schema: { params } }, async (request) => ({
      spellbook: await spellcasting.descansoLargo(usuarioActual(request).id, request.params.id),
    }));
  };
}
