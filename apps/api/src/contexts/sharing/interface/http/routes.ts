import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { usuarioActual, type RequireAuth } from "../../../../main/http/auth";
import type { CharacterService } from "../../../characters/application/character-service";
import type { SharingService } from "../../application/sharing-service";

export function rutasSharing(sharing: SharingService, characters: CharacterService, requireAuth: RequireAuth) {
  return async (app: FastifyInstance) => {
    const r = app.withTypeProvider<ZodTypeProvider>();
    const params = z.object({ id: z.uuid() });

    r.put("/characters/:id/share", { preHandler: requireAuth, schema: { params } }, async (request) =>
      sharing.activar(usuarioActual(request).id, request.params.id)
    );

    r.delete("/characters/:id/share", { preHandler: requireAuth, schema: { params } }, async (request, reply) => {
      await sharing.desactivar(usuarioActual(request).id, request.params.id);
      return reply.status(204).send();
    });

    // Sin autenticación: es la ficha pública. No expone el id del propietario.
    r.get(
      "/public/characters/:slug",
      { schema: { params: z.object({ slug: z.string().min(1).max(64) }) } },
      async (request) => {
        const characterId = await sharing.personajeDeSlug(request.params.slug);
        const personaje = (await characters.obtenerSinComprobar(characterId))!;
        return { character: { ...personaje, owner_id: "" } };
      }
    );
  };
}
