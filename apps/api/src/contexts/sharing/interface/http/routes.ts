import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { currentUser, type RequireAuth } from "../../../../main/http/auth";
import type { CharacterService } from "../../../characters/application/character-service";
import type { SharingService } from "../../application/sharing-service";

export function sharingRoutes(sharing: SharingService, characters: CharacterService, requireAuth: RequireAuth) {
  return async (app: FastifyInstance) => {
    const r = app.withTypeProvider<ZodTypeProvider>();
    const params = z.object({ id: z.uuid() });

    r.put("/characters/:id/share", { preHandler: requireAuth, schema: { params } }, async (request) =>
      sharing.enable(currentUser(request).id, request.params.id)
    );

    r.delete("/characters/:id/share", { preHandler: requireAuth, schema: { params } }, async (request, reply) => {
      await sharing.disable(currentUser(request).id, request.params.id);
      return reply.status(204).send();
    });

    // No authentication: this is the public sheet. It does not expose the owner id.
    r.get(
      "/public/characters/:slug",
      { schema: { params: z.object({ slug: z.string().min(1).max(64) }) } },
      async (request) => {
        const characterId = await sharing.characterIdFromSlug(request.params.slug);
        const character = (await characters.getUnchecked(characterId))!;
        return { character: { ...character, owner_id: "" } };
      }
    );
  };
}
