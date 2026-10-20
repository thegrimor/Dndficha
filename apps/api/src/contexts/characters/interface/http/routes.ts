import { type FichaPersonaje } from "@dndficha/rules";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { usuarioActual, type RequireAuth } from "../../../../main/http/auth";
import type { CharacterService } from "../../application/character-service";

const idParams = z.object({ id: z.uuid() });

// La validación profunda de la ficha vive en el dominio de cada contexto (zod en
// `coreSchema`, Inventory y Spellcasting); aquí solo se comprueba la forma gruesa.
const sheetSchema = z.custom<FichaPersonaje>((v) => typeof v === "object" && v !== null, "Ficha inválida");

const nulable = (max: number) => z.string().max(max).nullable().optional();

export function rutasCharacters(characters: CharacterService, requireAuth: RequireAuth) {
  return async (app: FastifyInstance) => {
    const r = app.withTypeProvider<ZodTypeProvider>();
    app.addHook("preHandler", requireAuth);

    r.get("/characters", async (request) => ({ characters: await characters.listar(usuarioActual(request).id) }));

    r.get("/characters/:id", { schema: { params: idParams } }, async (request) => ({
      character: await characters.obtener(usuarioActual(request).id, request.params.id),
    }));

    r.post(
      "/characters",
      { schema: { body: z.object({ name: z.string().max(100).default("Nuevo personaje") }) } },
      async (request, reply) =>
        reply.status(201).send({ character: await characters.crearEnBlanco(usuarioActual(request).id, request.body.name) })
    );

    r.patch(
      "/characters/:id",
      {
        schema: {
          params: idParams,
          body: z.object({
            name: z.string().max(100).optional(),
            race: nulable(100),
            class: nulable(100),
            level: z.number().int().optional(),
            background: nulable(100),
            alignment: nulable(100),
            imageUrl: nulable(2000),
            sheet: sheetSchema.optional(),
          }),
        },
      },
      async (request) => ({
        character: await characters.actualizar(usuarioActual(request).id, request.params.id, request.body),
      })
    );

    r.delete("/characters/:id", { schema: { params: idParams } }, async (request, reply) => {
      await characters.eliminar(usuarioActual(request).id, request.params.id);
      return reply.status(204).send();
    });
  };
}
