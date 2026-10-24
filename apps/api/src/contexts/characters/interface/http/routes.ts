import { type CharacterSheet } from "@dndficha/rules";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { currentUser, type RequireAuth } from "../../../../main/http/auth";
import type { CharacterService } from "../../application/character-service";

const idParams = z.object({ id: z.uuid() });

// Deep validation of the sheet lives in each context's domain (zod in
// `coreSchema`, Inventory and Spellcasting); here only the rough shape is checked.
const sheetSchema = z.custom<CharacterSheet>((v) => typeof v === "object" && v !== null, "Ficha inválida");

const nullable = (max: number) => z.string().max(max).nullable().optional();

export function characterRoutes(characters: CharacterService, requireAuth: RequireAuth) {
  return async (app: FastifyInstance) => {
    const r = app.withTypeProvider<ZodTypeProvider>();
    app.addHook("preHandler", requireAuth);

    r.get("/characters", async (request) => ({ characters: await characters.list(currentUser(request).id) }));

    r.get("/characters/:id", { schema: { params: idParams } }, async (request) => ({
      character: await characters.get(currentUser(request).id, request.params.id),
    }));

    r.post(
      "/characters",
      { schema: { body: z.object({ name: z.string().max(100).default("Nuevo personaje") }) } },
      async (request, reply) =>
        reply.status(201).send({ character: await characters.createBlank(currentUser(request).id, request.body.name) })
    );

    r.patch(
      "/characters/:id",
      {
        schema: {
          params: idParams,
          body: z.object({
            name: z.string().max(100).optional(),
            race: nullable(100),
            class: nullable(100),
            level: z.number().int().optional(),
            background: nullable(100),
            alignment: nullable(100),
            imageUrl: nullable(2000),
            sheet: sheetSchema.optional(),
          }),
        },
      },
      async (request) => ({
        character: await characters.update(currentUser(request).id, request.params.id, request.body),
      })
    );

    r.delete("/characters/:id", { schema: { params: idParams } }, async (request, reply) => {
      await characters.delete(currentUser(request).id, request.params.id);
      return reply.status(204).send();
    });
  };
}
