import type { SolicitudWizard } from "../../domain/character-builder";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { usuarioActual, type RequireAuth } from "../../../../main/http/auth";
import type { CreateCharacterFromWizard } from "../../application/create-character-from-wizard";

const car = z.enum(["str", "dex", "con", "int", "wis", "cha"]);

const solicitudSchema = z.object({
  edicion: z.enum(["2014", "2024"]),
  nombre: z.string().max(100),
  razaId: z.string().nullable(),
  claseId: z.string().nullable(),
  trasfondoId: z.string().nullable(),
  eleccionesCaracteristicaRaza: z.array(car).max(6),
  habilidadesClaseElegidas: z.array(z.string()).max(18),
  idiomasTrasfondoElegidos: z.array(z.string()).max(10),
  bonificadorTrasfondo: z.object({
    modo: z.enum(["reparto", "parejo"]),
    mas2: car.nullable(),
    mas1: car.nullable(),
  }),
  doteOrigen: z.object({
    modo: z.enum(["catalogo", "manual"]),
    doteElegida: z.object({ nombre: z.string(), descripcion: z.string() }).nullable(),
    manualNombre: z.string(),
    manualDescripcion: z.string(),
  }),
  metodoPuntuaciones: z.enum(["array", "manual"]),
  puntuacionesBase: z.object({ str: z.number(), dex: z.number(), con: z.number(), int: z.number(), wis: z.number(), cha: z.number() }),
});

export function rutasCharacterCreation(creation: CreateCharacterFromWizard, requireAuth: RequireAuth) {
  return async (app: FastifyInstance) => {
    const r = app.withTypeProvider<ZodTypeProvider>();

    r.post("/character-creation", { preHandler: requireAuth, schema: { body: solicitudSchema } }, async (request, reply) =>
      reply.status(201).send({ character: await creation.ejecutar(usuarioActual(request).id, request.body as SolicitudWizard) })
    );
  };
}
